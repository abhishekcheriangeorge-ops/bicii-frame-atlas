-- Preservation work. P-class is effort, not a grade.
-- Cosmetic kintsugi cannot be flagged as a structural repair.
-- Hours are numeric. Money, when recorded on a task, is integer SGD cents.

create table preservation_task_types (
  code text primary key,
  label text not null,
  is_cosmetic_only boolean not null default false,
  description text,
  constraint preservation_task_types_kintsugi check (
    code <> 'cosmetic_kintsugi' or is_cosmetic_only
  )
);

comment on table preservation_task_types is
  'Allowed preservation operations. cosmetic_kintsugi is cosmetic only and is never a structural repair.';

create table preservation_work_orders (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  version integer not null default 1,
  status text not null default 'planned',
  planning_p_class preservation_class,
  released_for_pricing boolean not null default false,
  released_by text,
  released_at timestamptz,
  notes text,
  issues_discovered text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint preservation_work_orders_version_key unique (frame_id, version),
  constraint preservation_work_orders_version_positive check (version >= 1),
  constraint preservation_work_orders_status check (
    status in (
      'planned',
      'in_progress',
      'completed',
      'blocked',
      'paused_for_reinspection',
      'cancelled'
    )
  ),
  constraint preservation_work_orders_release_pair check (
    (released_at is null and released_by is null)
    or (
      released_at is not null
      and released_by is not null
      and released_for_pricing
      and status = 'completed'
    )
  ),
  constraint preservation_work_orders_issues_pause check (
    issues_discovered is null
    or length(btrim(issues_discovered)) = 0
    or status in ('paused_for_reinspection', 'blocked', 'cancelled')
  )
);

create index preservation_work_orders_frame_idx
  on preservation_work_orders (frame_id, created_at desc);

comment on column preservation_work_orders.planning_p_class is
  'Planning effort P1-P4. Not an inspection outcome and not a value class.';

comment on column preservation_work_orders.released_for_pricing is
  'Preparation release. available_for_build still also needs PASS_VISUAL and an approved price.';

create table preservation_tasks (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references preservation_work_orders (id) on delete restrict,
  task_type text not null references preservation_task_types (code),
  description text,
  estimated_hours numeric(6, 2) not null default 0,
  actual_hours numeric(6, 2),
  labour_rate_cents integer not null default 2500,
  material_cost_cents integer not null default 0,
  operator_sub text,
  status text not null default 'planned',
  is_structural_repair boolean not null default false,
  triggers_reinspection boolean not null default false,
  issues_discovered text,
  notes text,
  before_photo_id uuid references frame_photos (id) on delete restrict,
  after_photo_id uuid references frame_photos (id) on delete restrict,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint preservation_tasks_hours_nonnegative check (
    estimated_hours >= 0
    and (actual_hours is null or actual_hours >= 0)
  ),
  constraint preservation_tasks_money_nonnegative check (
    labour_rate_cents >= 0 and material_cost_cents >= 0
  ),
  constraint preservation_tasks_status check (
    status in ('planned', 'in_progress', 'done', 'skipped', 'blocked')
  ),
  constraint preservation_tasks_kintsugi_not_structural check (
    task_type <> 'cosmetic_kintsugi' or is_structural_repair = false
  ),
  constraint preservation_tasks_structural_reinspects check (
    is_structural_repair = false or triggers_reinspection
  ),
  constraint preservation_tasks_issues_reinspect check (
    issues_discovered is null
    or length(btrim(issues_discovered)) = 0
    or triggers_reinspection
  ),
  constraint preservation_tasks_done_has_actuals check (
    status <> 'done'
    or (completed_at is not null and actual_hours is not null)
  )
);

create index preservation_tasks_work_order_idx
  on preservation_tasks (work_order_id);

comment on column preservation_tasks.labour_rate_cents is
  'Integer SGD cents per hour. Actual labour that counts in the cost floor is a cost_items row, so task material_cost_cents is not added again on top of a materials cost item.';

comment on column preservation_tasks.is_structural_repair is
  'Preservation does not certify a repair. cosmetic_kintsugi cannot set this true. A true value requires triggers_reinspection and does not change inspection_status by itself.';
