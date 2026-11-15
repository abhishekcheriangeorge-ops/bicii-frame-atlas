-- Staff directory and versioned workshop settings.
-- app_settings is a read-only view of the current app_config row so existing
-- screens keep working. Changing policy inserts a new version; it does not
-- rewrite historical pricing_versions.

create table staff_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_sub text not null unique,
  email text not null,
  display_name text not null,
  role staff_role not null,
  active boolean not null default true,
  labour_rate_cents_per_hour integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_profiles_name_present check (length(btrim(display_name)) > 0),
  constraint staff_profiles_email_shape check (
    email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint staff_profiles_rate_nonnegative check (
    labour_rate_cents_per_hour is null or labour_rate_cents_per_hour >= 0
  )
);

create unique index staff_profiles_email_lower_idx
  on staff_profiles (lower(email));

comment on table staff_profiles is
  'Workshop people. Invite-only auth is enforced in the app. No Supabase auth schema and no RLS.';

comment on column staff_profiles.labour_rate_cents_per_hour is
  'Optional override in integer SGD cents per hour. Null uses app_config.labour_rate_cents.';

create table app_config (
  id uuid primary key default gen_random_uuid(),
  version integer not null,
  is_current boolean not null default false,
  labour_rate_cents integer not null,
  target_gross_margin numeric(5, 4) not null,
  target_margin_bps integer not null,
  selling_fee_rate numeric(5, 4) not null default 0,
  selling_fee_bps integer not null default 0,
  allocated_overhead_cents integer not null,
  gst_registered boolean not null default false,
  gst_rate_bps integer not null default 900,
  gst_inclusive_display boolean not null default false,
  desirability_thresholds jsonb not null,
  f1_label text not null,
  f2_label text not null,
  f3_label text not null,
  f4_label text not null,
  f5_label text not null,
  f1_min_cents integer not null,
  f1_max_cents integer not null,
  f2_min_cents integer not null,
  f2_max_cents integer not null,
  f3_min_cents integer not null,
  f3_max_cents integer not null,
  f4_min_cents integer not null,
  f4_max_cents integer not null,
  f5_min_cents integer not null,
  f5_max_cents integer,
  score_f1_max integer not null,
  score_f2_max integer not null,
  score_f3_max integer not null,
  score_f4_max integer not null,
  weight_maker_provenance integer not null,
  weight_model_relevance integer not null,
  weight_construction_interest integer not null,
  weight_scarcity integer not null,
  weight_buyer_demand integer not null,
  weight_provenance_completeness integer not null,
  price_rounding_cents integer not null default 1000,
  currency text not null default 'SGD',
  notes text not null,
  created_at timestamptz not null default now(),
  created_by text,
  constraint app_config_version_key unique (version),
  constraint app_config_version_positive check (version >= 1),
  constraint app_config_labour_nonnegative check (labour_rate_cents >= 0),
  constraint app_config_overhead_nonnegative check (allocated_overhead_cents >= 0),
  constraint app_config_margin_range check (
    target_gross_margin >= 0
    and target_gross_margin < 1
    and selling_fee_rate >= 0
    and selling_fee_rate < 1
    and target_gross_margin + selling_fee_rate < 1
  ),
  constraint app_config_margin_bps_matches check (
    target_margin_bps = round(target_gross_margin * 10000)::integer
    and selling_fee_bps = round(selling_fee_rate * 10000)::integer
  ),
  constraint app_config_gst_rate check (gst_rate_bps >= 0 and gst_rate_bps < 10000),
  constraint app_config_currency_sgd check (currency = 'SGD'),
  constraint app_config_rounding_positive check (price_rounding_cents > 0),
  constraint app_config_labels_present check (
    length(btrim(f1_label)) > 0
    and length(btrim(f2_label)) > 0
    and length(btrim(f3_label)) > 0
    and length(btrim(f4_label)) > 0
    and length(btrim(f5_label)) > 0
  ),
  constraint app_config_bands_ordered check (
    f1_min_cents >= 0
    and f1_min_cents <= f1_max_cents
    and f2_min_cents > f1_max_cents
    and f2_min_cents <= f2_max_cents
    and f3_min_cents > f2_max_cents
    and f3_min_cents <= f3_max_cents
    and f4_min_cents > f3_max_cents
    and f4_min_cents <= f4_max_cents
    and f5_min_cents > f4_max_cents
    and (f5_max_cents is null or f5_max_cents >= f5_min_cents)
  ),
  constraint app_config_score_cutoffs check (
    score_f1_max >= 0
    and score_f1_max < score_f2_max
    and score_f2_max < score_f3_max
    and score_f3_max < score_f4_max
    and score_f4_max < 100
  ),
  constraint app_config_weights_sum check (
    weight_maker_provenance >= 0
    and weight_model_relevance >= 0
    and weight_construction_interest >= 0
    and weight_scarcity >= 0
    and weight_buyer_demand >= 0
    and weight_provenance_completeness >= 0
    and weight_maker_provenance
      + weight_model_relevance
      + weight_construction_interest
      + weight_scarcity
      + weight_buyer_demand
      + weight_provenance_completeness = 100
  )
);

create unique index app_config_one_current_idx
  on app_config (is_current)
  where is_current;

comment on table app_config is
  'Versioned pricing and scoring policy. Book money is integer SGD cents. Margin rates are exact numeric ratios, also stored as basis points. A new version does not rewrite pricing_versions.';

comment on column app_config.gst_registered is
  'False until BICII confirms registration. GST is outside margin math.';

comment on column app_config.gst_inclusive_display is
  'Customer-facing display flag. Independent of whether a frame passed inspection.';

comment on column app_config.f1_min_cents is
  'Guide band only. A cost floor above a band is a commercial conflict, not a reason to change value class or inspection_status.';

create table settings (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  version integer not null,
  value_json jsonb not null,
  is_current boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  created_by text,
  constraint settings_key_version_key unique (key, version),
  constraint settings_version_positive check (version >= 1),
  constraint settings_key_present check (length(btrim(key)) > 0)
);

create unique index settings_one_current_per_key_idx
  on settings (key)
  where is_current;

comment on table settings is
  'Versioned key/json settings that do not fit the numeric app_config snapshot. Historical rows stay put.';

-- Current policy, shaped for the settings screen.
create view app_settings as
select
  'default'::text as id,
  c.labour_rate_cents,
  c.target_gross_margin,
  c.selling_fee_rate,
  c.allocated_overhead_cents,
  c.gst_registered,
  c.gst_inclusive_display,
  c.desirability_thresholds,
  c.created_at as updated_at,
  c.created_by as updated_by
from app_config c
where c.is_current;

comment on view app_settings is
  'Read-only projection of the current app_config version. Insert a new app_config row to change policy.';
