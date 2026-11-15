-- BICII Frame Atlas schema
-- Three separate axes: inspection_status, preservation_class, value_class
-- Note: no pgcrypto — PGlite and modern Postgres provide gen_random_uuid() in core.

create table if not exists staff_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_sub text not null unique,
  email text not null,
  display_name text not null,
  role text not null check (role in ('admin', 'reviewer', 'mechanic', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_settings (
  id text primary key default 'default',
  labour_rate_cents integer not null default 2500,
  target_gross_margin numeric(5,4) not null default 0.4000,
  selling_fee_rate numeric(5,4) not null default 0,
  allocated_overhead_cents integer not null default 2000,
  gst_registered boolean not null default false,
  gst_inclusive_display boolean not null default true,
  desirability_thresholds jsonb not null default '{"F1":[0,19],"F2":[20,39],"F3":[40,59],"F4":[60,79],"F5":[80,100]}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into app_settings (id) values ('default')
on conflict (id) do nothing;

create table if not exists frames (
  id uuid primary key default gen_random_uuid(),
  frame_code text not null unique,
  brand_text text,
  model_text text,
  maker_text text,
  estimated_year_from integer,
  estimated_year_to integer,
  year_confidence text not null default 'unknown'
    check (year_confidence in ('confirmed', 'likely', 'provisional', 'unknown')),
  material text not null default 'unknown'
    check (material in ('steel', 'aluminium', 'carbon', 'titanium', 'other', 'unknown')),
  material_confidence text not null default 'unknown'
    check (material_confidence in ('confirmed', 'likely', 'provisional', 'unknown')),
  tubing_claim text,
  tubing_evidence text,
  frame_size_label text,
  serial_text text,
  serial_location text,
  frame_only_or_frameset text not null default 'frame_only'
    check (frame_only_or_frameset in ('frame_only', 'frameset')),
  fork_included boolean not null default false,
  fork_originality text
    check (fork_originality is null or fork_originality in ('original', 'replacement', 'unknown', 'not_applicable')),
  fork_notes text,
  acquisition_source_type text
    check (acquisition_source_type is null or acquisition_source_type in (
      'collector', 'online_listing', 'trade_in', 'donation', 'consignment', 'other', 'sample_seed'
    )),
  acquisition_source_notes_internal text,
  seller_name_internal text,
  seller_contact_internal text,
  acquisition_date date,
  acquisition_cost_cents integer not null default 0,
  acquisition_currency text not null default 'SGD',
  ownership_status text not null default 'owned'
    check (ownership_status in ('owned', 'consigned', 'customer_owned')),
  cosmetic_condition text not null default 'unknown'
    check (cosmetic_condition in (
      'original_excellent', 'original_worn_patina', 'original_heavy_cosmetic_wear',
      'retouched_conserved', 'repainted_refinished', 'unknown'
    )),
  current_status text not null default 'intake_draft'
    check (current_status in (
      'intake_draft', 'identified', 'inspection_pending', 'hold', 'rejected',
      'inspection_passed', 'preparation_planned', 'preparation_in_progress',
      'ready_for_pricing', 'pricing_review', 'approved', 'listed', 'reserved',
      'allocated_to_build', 'sold', 'archived'
    )),
  inspection_status text not null default 'DRAFT'
    check (inspection_status in ('DRAFT', 'PASS_VISUAL', 'HOLD', 'REJECT')),
  preservation_class text
    check (preservation_class is null or preservation_class in ('P1', 'P2', 'P3', 'P4')),
  value_class text
    check (value_class is null or value_class in ('F1', 'F2', 'F3', 'F4', 'F5')),
  current_approved_price_cents integer,
  public_story text,
  sample_tag boolean not null default false,
  listing_eligible boolean not null default false,
  available_for_build boolean not null default false,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists frames_status_idx on frames (current_status);
create index if not exists frames_brand_idx on frames (brand_text);
create index if not exists frames_value_class_idx on frames (value_class);
create index if not exists frames_inspection_status_idx on frames (inspection_status);

create table if not exists frame_photos (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  storage_path text not null,
  photo_category text not null default 'other'
    check (photo_category in (
      'drive_side', 'non_drive_side', 'head_tube', 'bottom_bracket', 'seat_cluster',
      'rear_dropouts', 'serial', 'fork', 'damage', 'before', 'after', 'other'
    )),
  before_after text check (before_after is null or before_after in ('before', 'after', 'n/a')),
  caption text,
  visibility text not null default 'internal' check (visibility in ('internal', 'public')),
  taken_at timestamptz not null default now(),
  taken_by text,
  checksum text
);

create table if not exists frame_measurements (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  measurement_type text not null,
  value_numeric numeric,
  unit text not null default 'mm',
  method text,
  observed_by text,
  observed_at timestamptz not null default now(),
  uncertainty_notes text
);

create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  version integer not null default 1,
  inspection_method text not null default 'visual_mechanical',
  inspector_sub text not null,
  inspector_name text not null,
  performed_at timestamptz not null default now(),
  outcome text not null check (outcome in ('DRAFT', 'PASS_VISUAL', 'HOLD', 'REJECT')),
  notes text,
  critical_flags jsonb not null default '[]'::jsonb,
  superseded_by uuid references inspections(id),
  created_at timestamptz not null default now(),
  unique (frame_id, version)
);

create table if not exists inspection_items (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references inspections(id) on delete cascade,
  category text not null,
  check_id text not null,
  label text not null,
  result text not null check (result in ('pass', 'concern', 'not_applicable', 'not_inspected')),
  is_structural boolean not null default false,
  is_mandatory boolean not null default false,
  notes text,
  evidence_photo_ids jsonb not null default '[]'::jsonb,
  unique (inspection_id, check_id)
);

create table if not exists preservation_work_orders (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'completed', 'blocked')),
  planning_p_class text check (planning_p_class in ('P1', 'P2', 'P3', 'P4')),
  released_for_pricing boolean not null default false,
  released_by text,
  released_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists preservation_tasks (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references preservation_work_orders(id) on delete cascade,
  task_type text not null,
  description text,
  estimated_hours numeric(6,2) not null default 0,
  actual_hours numeric(6,2),
  labour_rate_cents integer not null default 2500,
  material_cost_cents integer not null default 0,
  operator_sub text,
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'done', 'skipped')),
  is_structural_repair boolean not null default false,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists cost_items (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  category text not null check (category in (
    'acquisition', 'freight', 'labor', 'materials', 'overhead', 'external'
  )),
  amount_cents integer not null,
  currency text not null default 'SGD',
  source text,
  related_task_id uuid references preservation_tasks(id),
  transaction_date date not null default current_date,
  include_in_cost_basis boolean not null default true,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists desirability_assessments (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  scoring_version text not null default 'v1',
  calculated_total integer,
  incomplete boolean not null default false,
  proposed_class text check (proposed_class is null or proposed_class in ('F1','F2','F3','F4','F5')),
  approved_class text check (approved_class is null or approved_class in ('F1','F2','F3','F4','F5')),
  override_reason text,
  assessor_sub text,
  reviewer_sub text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists assessment_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references desirability_assessments(id) on delete cascade,
  dimension text not null check (dimension in (
    'maker_provenance', 'model_relevance', 'construction_interest',
    'scarcity', 'buyer_demand', 'provenance_completeness'
  )),
  max_points integer not null,
  points integer,
  confidence text not null default 'unknown'
    check (confidence in ('confirmed', 'likely', 'provisional', 'unknown')),
  insufficient_evidence boolean not null default false,
  evidence text,
  unique (assessment_id, dimension)
);

create table if not exists market_comps (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  maker_model text not null,
  material text,
  era text,
  fork_included boolean,
  condition_notes text,
  platform text,
  source_url text,
  listing_or_sold text not null check (listing_or_sold in ('asking', 'sold')),
  currency text not null default 'SGD',
  amount_cents integer not null,
  observed_date date,
  comparability_score integer check (comparability_score is null or (comparability_score between 1 and 5)),
  like_for_like boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists pricing_versions (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames(id) on delete cascade,
  version integer not null default 1,
  inputs_snapshot jsonb not null default '{}'::jsonb,
  prepared_cost_cents integer not null,
  cost_floor_cents integer not null,
  target_margin numeric(5,4) not null,
  selling_fee_rate numeric(5,4) not null default 0,
  suggested_class text,
  class_band_min_cents integer,
  class_band_max_cents integer,
  market_range_min_cents integer,
  market_range_max_cents integer,
  suggested_price_cents integer,
  approved_price_cents integer,
  pricing_conflict boolean not null default false,
  conflict_notes text,
  override_rationale text,
  approved_by text,
  approved_at timestamptz,
  supersedes_id uuid references pricing_versions(id),
  created_at timestamptz not null default now(),
  unique (frame_id, version)
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_sub text,
  actor_name text,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  before_summary jsonb,
  after_summary jsonb,
  correlation_id text,
  created_at timestamptz not null default now()
);

create index if not exists audit_entity_idx on audit_events (entity_type, entity_id);

create table if not exists frame_code_seq (
  id integer primary key default 1 check (id = 1),
  next_value integer not null default 1
);

insert into frame_code_seq (id, next_value) values (1, 1)
on conflict (id) do nothing;
