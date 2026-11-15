-- Frames, photos, and measurements.
-- inspection_status, preservation_class, and value_class are separate columns
-- with separate types. Cosmetic condition is a fourth, non-safety descriptor.

create table measurement_types (
  code text primary key,
  label text not null,
  default_unit text not null,
  allowed_units text[] not null,
  description text,
  constraint measurement_types_units_present check (cardinality(allowed_units) > 0)
);

create table frame_code_seq (
  id integer primary key default 1,
  next_value integer not null default 1,
  constraint frame_code_seq_singleton check (id = 1),
  constraint frame_code_seq_positive check (next_value >= 1)
);

comment on table frame_code_seq is
  'Allocates BICII-F-###### codes. The unique frame_code constraint is the concurrency backstop.';

insert into frame_code_seq (id, next_value) values (1, 1);

create table frames (
  id uuid primary key default gen_random_uuid(),
  frame_code text not null,
  brand_text text,
  model_text text,
  maker_text text,
  estimated_year_from integer,
  estimated_year_to integer,
  year_confidence confidence_level not null default 'unknown',
  material frame_material not null default 'unknown',
  material_confidence confidence_level not null default 'unknown',
  tubing_claim text,
  tubing_evidence text,
  frame_size_label text,
  serial_text text,
  serial_location text,
  serial_is_sensitive boolean not null default true,
  frame_only_or_frameset text not null default 'frame_only',
  fork_included boolean not null default false,
  fork_originality text,
  fork_notes text,
  included_parts_notes text,
  acquisition_source_type text,
  acquisition_source_notes_internal text,
  seller_name_internal text,
  seller_contact_internal text,
  acquisition_date date,
  acquisition_cost_cents integer not null default 0,
  acquisition_currency text not null default 'SGD',
  inbound_freight_cents integer not null default 0,
  import_fees_cents integer not null default 0,
  ownership_status text not null default 'owned',
  cosmetic_condition cosmetic_condition not null default 'unknown',
  cosmetic_notes text,
  current_status lifecycle_status not null default 'intake_draft',
  inspection_status inspection_status not null default 'DRAFT',
  preservation_class preservation_class,
  value_class value_class,
  current_approved_price_cents integer,
  public_story text,
  internal_notes text,
  unknowns_notes text,
  sample_tag boolean not null default false,
  listing_eligible boolean not null default false,
  available_for_build boolean not null default false,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint frames_frame_code_key unique (frame_code),
  constraint frames_frame_code_format check (frame_code ~ '^BICII-F-[0-9]{6}$'),
  constraint frames_year_order check (
    estimated_year_from is null
    or estimated_year_to is null
    or estimated_year_from <= estimated_year_to
  ),
  constraint frames_year_range check (
    (estimated_year_from is null or estimated_year_from between 1880 and 2100)
    and (estimated_year_to is null or estimated_year_to between 1880 and 2100)
  ),
  constraint frames_tubing_needs_evidence check (
    tubing_claim is null
    or (tubing_evidence is not null and length(btrim(tubing_evidence)) > 0)
  ),
  constraint frames_composition check (
    frame_only_or_frameset in ('frame_only', 'frameset')
  ),
  constraint frames_fork_shape check (
    (fork_included = false and frame_only_or_frameset = 'frame_only')
    or (fork_included = true and frame_only_or_frameset = 'frameset')
  ),
  constraint frames_fork_originality check (
    fork_originality is null
    or fork_originality in (
      'original',
      'period',
      'replacement',
      'unknown',
      'not_included',
      'not_applicable'
    )
  ),
  constraint frames_acquisition_source check (
    acquisition_source_type is null
    or acquisition_source_type in (
      'unknown',
      'collector',
      'online_listing',
      'trade_in',
      'donation',
      'consignment',
      'other',
      'sample_seed',
      'listing',
      'trade',
      'shop_stock',
      'customer_owned'
    )
  ),
  constraint frames_currency check (acquisition_currency ~ '^[A-Z]{3}$'),
  constraint frames_ownership check (
    ownership_status in ('owned', 'consigned', 'customer_owned')
  ),
  constraint frames_money_nonnegative check (
    acquisition_cost_cents >= 0
    and inbound_freight_cents >= 0
    and import_fees_cents >= 0
    and (current_approved_price_cents is null or current_approved_price_cents >= 0)
  ),
  -- Sample rows are exercises. They cannot carry a pass, a rejection that
  -- reads as a formal safety decision, a price approval, or a listing.
  constraint frames_sample_not_certified check (
    not sample_tag
    or (
      public_story is not null
      and public_story like 'SAMPLE:%'
      and inspection_status in ('DRAFT', 'HOLD')
      and current_status in (
        'intake_draft',
        'identified',
        'inspection_pending',
        'hold',
        'archived'
      )
      and listing_eligible = false
      and available_for_build = false
      and current_approved_price_cents is null
    )
  ),
  constraint frames_hold_blocks_sale check (
    inspection_status <> 'HOLD'
    or (
      current_status in (
        'hold',
        'inspection_pending',
        'intake_draft',
        'identified',
        'archived'
      )
      and listing_eligible = false
      and available_for_build = false
      and current_approved_price_cents is null
    )
  ),
  constraint frames_reject_blocks_sale check (
    inspection_status <> 'REJECT'
    or (
      current_status in ('rejected', 'archived')
      and listing_eligible = false
      and available_for_build = false
      and current_approved_price_cents is null
    )
  ),
  constraint frames_draft_not_commercial check (
    inspection_status <> 'DRAFT'
    or current_status in (
      'intake_draft',
      'identified',
      'inspection_pending',
      'archived'
    )
  ),
  constraint frames_pass_status check (
    inspection_status <> 'PASS_VISUAL'
    or current_status in (
      'inspection_passed',
      'preparation_planned',
      'preparation_in_progress',
      'ready_for_pricing',
      'pricing_review',
      'approved',
      'listed',
      'reserved',
      'allocated_to_build',
      'sold',
      'archived'
    )
  ),
  constraint frames_commercial_requires_pass check (
    current_status not in (
      'approved',
      'listed',
      'reserved',
      'allocated_to_build',
      'sold'
    )
    or (
      inspection_status = 'PASS_VISUAL'
      and current_approved_price_cents is not null
    )
  ),
  constraint frames_listing_gate check (
    listing_eligible = false
    or (
      inspection_status = 'PASS_VISUAL'
      and current_approved_price_cents is not null
      and current_status in ('approved', 'listed', 'reserved')
    )
  ),
  constraint frames_build_gate check (
    available_for_build = false
    or (
      inspection_status = 'PASS_VISUAL'
      and current_approved_price_cents is not null
      and current_status in (
        'approved',
        'listed',
        'reserved',
        'allocated_to_build'
      )
    )
  )
);

comment on table frames is
  'One frame or frameset. inspection_status (structural), preservation_class (P1-P4 effort), and value_class (F1-F5 market position) are independent. Cosmetic condition is not a safety score.';

comment on column frames.inspection_status is
  'Structural axis. PASS_VISUAL is a historical visual/mechanical observation, not a laboratory certificate.';

comment on column frames.preservation_class is
  'Effort axis. P3 does not mean less safe, and P1 does not mean more desirable.';

comment on column frames.value_class is
  'Market axis. Setting F5 does not clear HOLD and does not make a frame build-ready.';

comment on column frames.cosmetic_condition is
  'Finish descriptor only. Independent of inspection_status and value_class.';

comment on column frames.acquisition_cost_cents is
  'Integer SGD cents. Seller fields are internal; the app hides them from viewers and public export.';

comment on column frames.ownership_status is
  'owned = purchased into workshop stock. consigned and customer_owned stay distinct from owned.';

comment on column frames.sample_tag is
  'True for fictional exercises. Sample rows cannot be PASS_VISUAL, priced as approved, or listed.';

create index frames_status_idx on frames (current_status);
create index frames_brand_idx on frames (brand_text);
create index frames_model_idx on frames (model_text);
create index frames_value_class_idx on frames (value_class);
create index frames_preservation_class_idx on frames (preservation_class);
create index frames_inspection_status_idx on frames (inspection_status);
create index frames_material_idx on frames (material);
create index frames_size_idx on frames (frame_size_label);
create index frames_fork_idx on frames (fork_included);
create index frames_updated_idx on frames (updated_at desc);
create index frames_hold_idx on frames (updated_at desc)
  where inspection_status = 'HOLD';

create table frame_photos (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  storage_path text not null,
  photo_category text not null default 'other',
  before_after text,
  caption text,
  visibility text not null default 'internal',
  contains_serial boolean not null default false,
  contains_seller_pii boolean not null default false,
  taken_at timestamptz not null default now(),
  taken_by text,
  checksum text,
  version integer not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint frame_photos_category check (
    photo_category in (
      'drive_side',
      'non_drive_side',
      'head_tube',
      'bottom_bracket',
      'seat_cluster',
      'rear_dropouts',
      'serial',
      'fork',
      'damage',
      'damage_or_treatment',
      'before',
      'after',
      'other'
    )
  ),
  constraint frame_photos_before_after check (
    before_after is null or before_after in ('before', 'after', 'n/a')
  ),
  constraint frame_photos_visibility check (visibility in ('internal', 'public')),
  constraint frame_photos_public_is_redacted check (
    visibility <> 'public'
    or (contains_serial = false and contains_seller_pii = false)
  ),
  constraint frame_photos_version_positive check (version >= 1)
);

create index frame_photos_frame_idx on frame_photos (frame_id, sort_order);

comment on table frame_photos is
  'Photo metadata. Bytes stay in private storage. Public visibility cannot include a serial or seller identifiers.';

create table frame_measurements (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  measurement_type text not null references measurement_types (code),
  value_numeric numeric(12, 3),
  unit text not null,
  method text,
  observed_by text,
  observed_at timestamptz not null default now(),
  uncertainty_notes text,
  created_at timestamptz not null default now(),
  constraint frame_measurements_value_nonnegative check (
    value_numeric is null or value_numeric >= 0
  ),
  constraint frame_measurements_unknown_is_explicit check (
    value_numeric is not null or uncertainty_notes is not null
  ),
  constraint frame_measurements_observed check (
    value_numeric is null or observed_by is not null
  )
);

create index frame_measurements_frame_idx
  on frame_measurements (frame_id, measurement_type, observed_at desc);

comment on table frame_measurements is
  'Measured mm or degrees. Unknown is stored with a note. A catalogue value must not be written here as if it was measured.';
