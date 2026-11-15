-- Triggers that checks cannot express: version supersession, sample rows,
-- append-only audit, locked history, and the HOLD/PASS sync onto frames.
-- Each statement autocommits in the app, so these stay valid after one statement.

create or replace function touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function prevent_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception '% rows are kept; archive instead of deleting', tg_table_name;
end;
$$;

create or replace function audit_events_append_only()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'audit_events are append-only';
end;
$$;

create trigger audit_events_no_change
  before update or delete on audit_events
  for each row execute function audit_events_append_only();

create or replace function audit_row_change()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_actor text;
  v_action text;
  v_id text;
begin
  begin
    v_actor := nullif(current_setting('bicii.actor_sub', true), '');
  exception
    when others then
      v_actor := null;
  end;

  if tg_op = 'INSERT' then
    v_id := new.id::text;
    insert into audit_events (actor_sub, entity_type, entity_id, action, after_summary)
    values (v_actor, tg_table_name, v_id, 'insert', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    if to_jsonb(old) = to_jsonb(new) then
      return new;
    end if;
    v_action := 'update';
    -- Compare through jsonb. This trigger is shared, and a missing column
    -- on OLD raises even inside a branch that does not apply to the table.
    if tg_table_name = 'frames'
      and (
        (to_jsonb(old) ->> 'current_status')
          is distinct from (to_jsonb(new) ->> 'current_status')
        or (to_jsonb(old) ->> 'inspection_status')
          is distinct from (to_jsonb(new) ->> 'inspection_status')
      ) then
      v_action := 'status_change';
    elsif tg_table_name in ('pricing_versions', 'inspections')
      and (to_jsonb(old) ->> 'approved_at') is null
      and (to_jsonb(new) ->> 'approved_at') is not null then
      v_action := 'approve';
    end if;
    v_id := new.id::text;
    insert into audit_events (
      actor_sub, entity_type, entity_id, action, before_summary, after_summary
    ) values (
      v_actor, tg_table_name, v_id, v_action, to_jsonb(old), to_jsonb(new)
    );
    return new;
  else
    v_id := old.id::text;
    insert into audit_events (actor_sub, entity_type, entity_id, action, before_summary)
    values (v_actor, tg_table_name, v_id, 'delete', to_jsonb(old));
    return old;
  end if;
end;
$$;

create or replace function config_version_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception '% versions are kept', tg_table_name;
  end if;
  if (to_jsonb(new) - 'is_current') is distinct from (to_jsonb(old) - 'is_current') then
    raise exception '% versions are immutable; insert a new version', tg_table_name;
  end if;
  if old.is_current = false or new.is_current then
    raise exception 'only the current % row can be retired, by setting is_current false', tg_table_name;
  end if;
  return new;
end;
$$;

create trigger app_config_version_guard
  before update or delete on app_config
  for each row execute function config_version_guard();

create trigger settings_version_guard
  before update or delete on settings
  for each row execute function config_version_guard();

create trigger app_config_audit
  after insert or update on app_config
  for each row execute function audit_row_change();

create trigger settings_audit
  after insert or update on settings
  for each row execute function audit_row_change();

create trigger staff_profiles_touch
  before update on staff_profiles
  for each row execute function touch_updated_at();

create trigger staff_profiles_audit
  after insert or update on staff_profiles
  for each row execute function audit_row_change();

create or replace function frames_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.frame_code is distinct from old.frame_code then
      raise exception 'frame_code is immutable';
    end if;
    if old.sample_tag and not new.sample_tag then
      raise exception 'sample_tag cannot be cleared';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger frames_before_write
  before insert or update on frames
  for each row execute function frames_before_write();

create trigger frames_no_delete
  before delete on frames
  for each row execute function prevent_delete();

create trigger frames_audit
  after insert or update on frames
  for each row execute function audit_row_change();

create or replace function frame_photos_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sample boolean;
begin
  if new.photo_category = 'serial' then
    new.contains_serial := true;
    if new.visibility = 'public' then
      raise exception 'serial photos stay internal';
    end if;
  end if;
  select sample_tag into v_sample from frames where id = new.frame_id;
  if v_sample and (new.caption is null or new.caption not like 'SAMPLE:%') then
    raise exception 'photos on sample frames need a caption starting with SAMPLE:';
  end if;
  return new;
end;
$$;

create trigger frame_photos_before_write
  before insert or update on frame_photos
  for each row execute function frame_photos_before_write();

create trigger frame_photos_touch
  before update on frame_photos
  for each row execute function touch_updated_at();

create trigger frame_photos_audit
  after insert or update or delete on frame_photos
  for each row execute function audit_row_change();

create or replace function frame_measurements_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from measurement_types
    where code = new.measurement_type
      and new.unit = any (allowed_units)
  ) then
    raise exception 'unit % is not allowed for measurement %', new.unit, new.measurement_type;
  end if;
  return new;
end;
$$;

create trigger frame_measurements_before_write
  before insert or update on frame_measurements
  for each row execute function frame_measurements_before_write();

create trigger frame_measurements_audit
  after insert or update or delete on frame_measurements
  for each row execute function audit_row_change();

create or replace function inspections_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sample boolean;
begin
  select sample_tag into v_sample from frames where id = new.frame_id;
  if v_sample and new.outcome in ('PASS_VISUAL', 'REJECT') then
    raise exception
      'sample frames cannot record %; that would invent a safety certification',
      new.outcome;
  end if;
  if v_sample and new.inspection_method is distinct from 'visual_mechanical' then
    raise exception 'sample frames cannot record a specialist or laboratory method';
  end if;
  if v_sample and new.approved_at is not null then
    raise exception 'sample frames cannot carry an inspection approval';
  end if;
  if v_sample and (new.notes is null or new.notes not like 'SAMPLE:%') then
    raise exception 'sample inspections need notes starting with SAMPLE:';
  end if;

  if tg_op = 'UPDATE' and old.locked then
    if (
      to_jsonb(new)
        - 'updated_at'
        - 'is_current'
        - 'superseded_by'
        - 'approved_at'
        - 'approved_by'
        - 'approval_rationale'
    ) is distinct from (
      to_jsonb(old)
        - 'updated_at'
        - 'is_current'
        - 'superseded_by'
        - 'approved_at'
        - 'approved_by'
        - 'approval_rationale'
    ) then
      raise exception 'locked inspection % cannot be edited; create a new version', old.id;
    end if;
    if new.approved_at is distinct from old.approved_at
      or new.approved_by is distinct from old.approved_by
      or new.approval_rationale is distinct from old.approval_rationale then
      if old.approved_at is not null then
        raise exception 'inspection approval is already recorded';
      end if;
      if new.outcome <> 'PASS_VISUAL'
        or new.approved_by is null
        or new.approval_rationale is null
        or length(btrim(new.approval_rationale)) < 3 then
        raise exception 'only PASS_VISUAL can be signed, with a reviewer and a rationale';
      end if;
    end if;
  end if;

  if tg_op = 'INSERT' then
    update inspections
      set is_current = false
      where frame_id = new.frame_id
        and is_current;
    new.is_current := true;
    if new.outcome = 'PASS_VISUAL' then
      new.locked := true;
    end if;
  end if;

  return new;
end;
$$;

create or replace function inspections_after_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update inspections
      set superseded_by = new.id
      where frame_id = new.frame_id
        and id <> new.id
        and not is_current
        and superseded_by is null
        and version = new.version - 1;
  end if;

  if not new.is_current then
    return new;
  end if;

  if new.outcome = 'HOLD' then
    update frames
      set inspection_status = 'HOLD',
          current_status = case
            when current_status = 'archived' then 'archived'::lifecycle_status
            else 'hold'::lifecycle_status
          end,
          listing_eligible = false,
          available_for_build = false,
          current_approved_price_cents = null
      where id = new.frame_id
        and (
          inspection_status is distinct from 'HOLD'
          or (
            current_status is distinct from 'hold'
            and current_status is distinct from 'archived'
          )
          or listing_eligible
          or available_for_build
          or current_approved_price_cents is not null
        );
  elsif new.outcome = 'REJECT' then
    update frames
      set inspection_status = 'REJECT',
          current_status = 'rejected',
          listing_eligible = false,
          available_for_build = false,
          current_approved_price_cents = null
      where id = new.frame_id
        and (
          inspection_status is distinct from 'REJECT'
          or current_status is distinct from 'rejected'
          or listing_eligible
          or available_for_build
          or current_approved_price_cents is not null
        );
  elsif new.outcome = 'PASS_VISUAL' then
    update frames
      set inspection_status = 'PASS_VISUAL',
          current_status = case
            when current_status in (
              'intake_draft',
              'identified',
              'inspection_pending',
              'hold'
            ) then 'inspection_passed'::lifecycle_status
            else current_status
          end
      where id = new.frame_id
        and (
          inspection_status is distinct from 'PASS_VISUAL'
          or current_status in (
            'intake_draft',
            'identified',
            'inspection_pending',
            'hold'
          )
        );
  elsif new.outcome = 'DRAFT' then
    update frames
      set inspection_status = 'DRAFT',
          current_status = case
            when current_status in (
              'hold',
              'rejected',
              'inspection_passed',
              'preparation_planned',
              'preparation_in_progress',
              'ready_for_pricing',
              'pricing_review',
              'approved',
              'listed',
              'reserved',
              'allocated_to_build',
              'sold'
            ) then 'inspection_pending'::lifecycle_status
            else current_status
          end,
          listing_eligible = false,
          available_for_build = false,
          current_approved_price_cents = case
            when current_status in (
              'approved',
              'listed',
              'reserved',
              'allocated_to_build',
              'sold',
              'pricing_review',
              'ready_for_pricing'
            ) then null
            else current_approved_price_cents
          end
      where id = new.frame_id
        and (
          inspection_status is distinct from 'DRAFT'
          or current_status in (
            'hold',
            'rejected',
            'inspection_passed',
            'preparation_planned',
            'preparation_in_progress',
            'ready_for_pricing',
            'pricing_review',
            'approved',
            'listed',
            'reserved',
            'allocated_to_build',
            'sold'
          )
          or listing_eligible
          or available_for_build
        );
  end if;

  return new;
end;
$$;

create trigger inspections_before_write
  before insert or update on inspections
  for each row execute function inspections_before_write();

create trigger inspections_touch
  before update on inspections
  for each row execute function touch_updated_at();

create trigger inspections_after_write
  after insert or update on inspections
  for each row execute function inspections_after_write();

create trigger inspections_no_delete
  before delete on inspections
  for each row execute function prevent_delete();

create trigger inspections_audit
  after insert or update on inspections
  for each row execute function audit_row_change();

create trigger inspection_items_audit
  after insert or update or delete on inspection_items
  for each row execute function audit_row_change();

create or replace function preservation_work_orders_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sample boolean;
begin
  select sample_tag into v_sample from frames where id = new.frame_id;
  if v_sample and (new.notes is null or new.notes not like 'SAMPLE:%') then
    raise exception 'sample work orders need notes starting with SAMPLE:';
  end if;
  return new;
end;
$$;

create trigger preservation_work_orders_before_write
  before insert or update on preservation_work_orders
  for each row execute function preservation_work_orders_before_write();

create trigger preservation_work_orders_touch
  before update on preservation_work_orders
  for each row execute function touch_updated_at();

create trigger preservation_work_orders_audit
  after insert or update on preservation_work_orders
  for each row execute function audit_row_change();

create trigger preservation_tasks_touch
  before update on preservation_tasks
  for each row execute function touch_updated_at();

create trigger preservation_tasks_audit
  after insert or update or delete on preservation_tasks
  for each row execute function audit_row_change();

create or replace function cost_items_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sample boolean;
  v_task_frame uuid;
begin
  select sample_tag into v_sample from frames where id = new.frame_id;
  if v_sample and (new.source is null or new.source not like 'SAMPLE:%') then
    raise exception 'sample cost items need a source starting with SAMPLE:';
  end if;
  if new.related_task_id is not null then
    select w.frame_id
      into v_task_frame
      from preservation_tasks t
      join preservation_work_orders w on w.id = t.work_order_id
      where t.id = new.related_task_id;
    if v_task_frame is distinct from new.frame_id then
      raise exception 'cost item task belongs to a different frame';
    end if;
  end if;
  return new;
end;
$$;

create trigger cost_items_before_write
  before insert or update on cost_items
  for each row execute function cost_items_before_write();

create trigger cost_items_touch
  before update on cost_items
  for each row execute function touch_updated_at();

create trigger cost_items_audit
  after insert or update or delete on cost_items
  for each row execute function audit_row_change();

create or replace function desirability_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sample boolean;
begin
  select sample_tag into v_sample from frames where id = new.frame_id;
  if v_sample and (new.notes is null or new.notes not like 'SAMPLE:%') then
    raise exception 'sample desirability notes must start with SAMPLE:';
  end if;
  if tg_op = 'INSERT' then
    update desirability_assessments
      set is_current = false
      where frame_id = new.frame_id
        and is_current;
    new.is_current := true;
  end if;
  return new;
end;
$$;

create trigger desirability_before_write
  before insert or update on desirability_assessments
  for each row execute function desirability_before_write();

create trigger desirability_touch
  before update on desirability_assessments
  for each row execute function touch_updated_at();

create trigger desirability_no_delete
  before delete on desirability_assessments
  for each row execute function prevent_delete();

create trigger desirability_audit
  after insert or update on desirability_assessments
  for each row execute function audit_row_change();

create or replace function assessment_scores_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_config uuid;
  v_expected integer;
begin
  select config_id into v_config
    from desirability_assessments
    where id = new.assessment_id;
  if v_config is not null then
    select case new.dimension
      when 'maker_provenance' then weight_maker_provenance
      when 'model_relevance' then weight_model_relevance
      when 'construction_interest' then weight_construction_interest
      when 'scarcity' then weight_scarcity
      when 'buyer_demand' then weight_buyer_demand
      when 'provenance_completeness' then weight_provenance_completeness
    end
      into v_expected
      from app_config
      where id = v_config;
    if v_expected is not null and new.max_points is distinct from v_expected then
      raise exception
        'max_points for % must match the scoring config (%), not %',
        new.dimension, v_expected, new.max_points;
    end if;
  end if;
  return new;
end;
$$;

create trigger assessment_scores_before_write
  before insert or update on assessment_scores
  for each row execute function assessment_scores_before_write();

create trigger assessment_scores_no_delete
  before delete on assessment_scores
  for each row execute function prevent_delete();

create trigger assessment_scores_audit
  after insert or update on assessment_scores
  for each row execute function audit_row_change();

create or replace function market_comps_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sample boolean;
  v_fork boolean;
begin
  select sample_tag, fork_included
    into v_sample, v_fork
    from frames
    where id = new.frame_id;
  if v_sample and (new.notes is null or new.notes not like 'SAMPLE:%') then
    raise exception 'comps on sample frames need notes starting with SAMPLE:';
  end if;
  if new.like_for_like
    and new.fork_included is not null
    and new.fork_included is distinct from v_fork then
    raise exception 'fork inclusion differs from the frame; like_for_like must be false';
  end if;
  if new.currency = 'SGD' and new.amount_sgd_cents is null then
    new.amount_sgd_cents := new.amount_cents;
  end if;
  return new;
end;
$$;

create trigger market_comps_before_write
  before insert or update on market_comps
  for each row execute function market_comps_before_write();

create trigger market_comps_audit
  after insert or update or delete on market_comps
  for each row execute function audit_row_change();

create or replace function pricing_versions_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_sample boolean;
begin
  select sample_tag into v_sample from frames where id = new.frame_id;
  if v_sample and new.approved_at is not null then
    raise exception 'sample pricing cannot be approved as a real valuation';
  end if;
  if v_sample and (new.notes is null or new.notes not like 'SAMPLE:%') then
    raise exception 'sample pricing notes must start with SAMPLE:';
  end if;

  if tg_op = 'UPDATE' and (old.locked or old.approved_at is not null) then
    if (
      to_jsonb(new) - 'is_current' - 'supersedes_id'
    ) is distinct from (
      to_jsonb(old) - 'is_current' - 'supersedes_id'
    ) then
      raise exception 'approved pricing version % is locked; insert a new version', old.id;
    end if;
  end if;

  if tg_op = 'INSERT' then
    update pricing_versions
      set is_current = false
      where frame_id = new.frame_id
        and is_current;
    new.is_current := true;
    if new.approved_at is not null then
      new.locked := true;
    end if;
  end if;

  return new;
end;
$$;

create or replace function pricing_versions_after_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- The new row points at the previous version once both rows exist.
  update pricing_versions as newer
    set supersedes_id = previous.id
    from pricing_versions as previous
    where newer.id = new.id
      and newer.supersedes_id is null
      and previous.frame_id = new.frame_id
      and previous.id <> new.id
      and previous.version = new.version - 1;
  return new;
end;
$$;

create trigger pricing_versions_before_write
  before insert or update on pricing_versions
  for each row execute function pricing_versions_before_write();

create trigger pricing_versions_after_insert
  after insert on pricing_versions
  for each row execute function pricing_versions_after_insert();

create trigger pricing_versions_no_delete
  before delete on pricing_versions
  for each row execute function prevent_delete();

create trigger pricing_versions_audit
  after insert or update on pricing_versions
  for each row execute function audit_row_change();
