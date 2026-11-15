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

PLACEHOLDER_REST_OF_008
