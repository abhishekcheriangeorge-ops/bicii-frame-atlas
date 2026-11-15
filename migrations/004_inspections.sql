-- Versioned visual/mechanical inspections.
-- A new decision is a new version. Locked historical rows are not edited in place.
-- The default method is visual_mechanical. A laboratory method requires a
-- real service reference and is never the default.

create table inspection_checks (
  code text primary key,
  category text not null,
  label text not null,
  guidance text,
  applies_scope text not null default 'always',
  gate_required boolean not null default false,
  structural boolean not null default false,
  not_applicable_allowed boolean not null default false,
  sort_order integer not null,
  active boolean not null default true,
  constraint inspection_checks_category check (
    category in ('identification', 'structure', 'compatibility')
  ),
  constraint inspection_checks_scope check (
    applies_scope in ('always', 'fork_included', 'steel', 'aluminium', 'carbon')
  ),
  constraint inspection_checks_sort_key unique (sort_order)
);

comment on table inspection_checks is
  'Checklist catalogue. gate_required items block a pass when missed. Changing a flag does not rewrite an older inspection version.';

create table inspections (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  version integer not null default 1,
  inspection_method text not null default 'visual_mechanical',
  inspector_sub text not null,
  inspector_name text not null,
  performed_at timestamptz not null default now(),
  outcome inspection_status not null,
  notes text,
  limitations_notes text not null default
    'Visual/mechanical inspection cannot rule out hidden defects. A pass is a historical observation on the date recorded, not a guarantee and not a laboratory or imaging certificate.',
  critical_flags jsonb not null default '[]'::jsonb,
  external_service_reference text,
  approved_by text,
  approved_at timestamptz,
  approval_rationale text,
  superseded_by uuid references inspections (id),
  is_current boolean not null default true,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inspections_version_key unique (frame_id, version),
  constraint inspections_version_positive check (version >= 1),
  constraint inspections_method check (
    inspection_method in (
      'visual_mechanical',
      'specialist_review',
      'documented_external_ndt'
    )
  ),
  constraint inspections_ndt_needs_reference check (
    inspection_method <> 'documented_external_ndt'
    or (
      external_service_reference is not null
      and length(btrim(external_service_reference)) > 0
    )
  ),
  constraint inspections_limitations_present check (
    length(btrim(limitations_notes)) > 0
  ),
  constraint inspections_approval_pair check (
    (approved_at is null and approved_by is null and approval_rationale is null)
    or (
      approved_at is not null
      and approved_by is not null
      and approval_rationale is not null
      and length(btrim(approval_rationale)) >= 3
      and outcome = 'PASS_VISUAL'
    )
  )
);

create unique index inspections_one_current_idx
  on inspections (frame_id)
  where is_current;

create index inspections_frame_version_idx
  on inspections (frame_id, version desc);

comment on table inspections is
  'Versioned inspection. outcome uses inspection_status and is not a value class. visual_mechanical is the default. documented_external_ndt requires a service reference.';

comment on column inspections.critical_flags is
  'Unresolved structural check ids captured with the decision. A pass is not inferred from an empty list alone.';

comment on column inspections.limitations_notes is
  'Shown with the record. A visual pass is not an imaging or laboratory certificate.';

create table inspection_items (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references inspections (id) on delete restrict,
  category text not null,
  check_id text not null references inspection_checks (code),
  label text not null,
  result inspection_item_result not null,
  is_structural boolean not null default false,
  is_mandatory boolean not null default false,
  notes text,
  evidence_photo_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint inspection_items_check_key unique (inspection_id, check_id),
  constraint inspection_items_category check (
    category in ('identification', 'structure', 'compatibility')
  )
);

create index inspection_items_inspection_idx on inspection_items (inspection_id);

comment on table inspection_items is
  'One checklist result per version. concern / not_inspected / not_applicable stay distinct. Evidence photo ids point at frame_photos.';
