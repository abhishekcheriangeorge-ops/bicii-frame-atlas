-- Costs, desirability, comparables, and versioned prices.
-- Prepared cost and prices are integer SGD cents.
-- cost_floor = round(prepared_cost / (1 - margin - fee)), and margin + fee < 1.
-- Asking comps and sold comps are different values of comp_price_kind.

create or replace function bicii_cost_floor_cents(
  prepared_cents integer,
  margin numeric,
  fee numeric
) returns integer
language sql
immutable
as $$
  select case
    when prepared_cents is null or margin is null or fee is null then null::integer
    when prepared_cents < 0 or margin < 0 or fee < 0 then null::integer
    when margin + fee >= 1 then null::integer
    else round(prepared_cents::numeric / (1 - margin - fee))::integer
  end
$$;

comment on function bicii_cost_floor_cents(integer, numeric, numeric) is
  'Minimum price in SGD cents from prepared cost, target gross margin, and an optional fee that is inside the margin. Half rounds away from zero. Returns null when the margin is impossible.';

create table cost_items (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  category cost_category not null,
  amount_cents integer not null,
  currency text not null default 'SGD',
  fx_rate numeric(18, 8),
  fx_rate_date date,
  fx_rate_source text,
  source text,
  related_task_id uuid references preservation_tasks (id) on delete restrict,
  transaction_date date not null default current_date,
  include_in_cost_basis boolean not null default true,
  is_estimate boolean not null default false,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cost_items_amount_nonnegative check (amount_cents >= 0),
  constraint cost_items_currency check (currency ~ '^[A-Z]{3}$'),
  constraint cost_items_fx_when_foreign check (
    currency = 'SGD'
    or (
      fx_rate is not null
      and fx_rate > 0
      and fx_rate_date is not null
      and fx_rate_source is not null
      and length(btrim(fx_rate_source)) > 0
    )
  ),
  constraint cost_items_estimate_is_labelled check (
    not is_estimate or (source is not null and length(btrim(source)) > 0)
  )
);

create index cost_items_frame_idx on cost_items (frame_id, category);
create index cost_items_basis_idx on cost_items (frame_id)
  where include_in_cost_basis;

create unique index cost_items_one_labor_per_task_idx
  on cost_items (related_task_id)
  where category = 'labor'
    and include_in_cost_basis
    and related_task_id is not null;

comment on table cost_items is
  'Ledger for the cost floor. amount_cents is integer minor units; SGD rows are SGD cents. Do not also add preservation_tasks.material_cost_cents for the same spend.';

create table desirability_assessments (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  config_id uuid references app_config (id) on delete restrict,
  version integer not null default 1,
  scoring_version text not null default 'v1',
  calculated_total integer,
  scored_points integer,
  scored_max_points integer,
  incomplete boolean not null default false,
  proposed_class value_class,
  approved_class value_class,
  hypothesis_only boolean not null default false,
  override_reason text,
  notes text,
  assessor_sub text,
  reviewer_sub text,
  reviewed_at timestamptz,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint desirability_assessments_version_key unique (frame_id, version),
  constraint desirability_assessments_version_positive check (version >= 1),
  constraint desirability_assessments_total_range check (
    calculated_total is null or calculated_total between 0 and 100
  ),
  constraint desirability_assessments_scored_range check (
    (scored_points is null or scored_points >= 0)
    and (scored_max_points is null or scored_max_points >= 0)
    and (
      scored_points is null
      or scored_max_points is null
      or scored_points <= scored_max_points
    )
  ),
  constraint desirability_assessments_incomplete_hides_total check (
    (incomplete and calculated_total is null)
    or (not incomplete and calculated_total is not null)
  ),
  constraint desirability_assessments_hypothesis check (
    not hypothesis_only or approved_class is null
  ),
  constraint desirability_assessments_approval check (
    approved_class is null
    or (
      reviewer_sub is not null
      and reviewed_at is not null
      and override_reason is not null
      and length(btrim(override_reason)) >= 3
    )
  ),
  constraint desirability_assessments_override_reason check (
    approved_class is null
    or proposed_class is null
    or approved_class = proposed_class
    or (
      override_reason is not null
      and length(btrim(override_reason)) >= 3
    )
  )
);

create unique index desirability_one_current_idx
  on desirability_assessments (frame_id)
  where is_current;

comment on table desirability_assessments is
  'Market-axis scoring. proposed_class and approved_class are value_class values, not inspection outcomes. An incomplete score has no calculated total.';

comment on column desirability_assessments.hypothesis_only is
  'A working class while evidence is incomplete. It is not an approval and does not change inspection_status.';

create table assessment_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references desirability_assessments (id) on delete restrict,
  dimension desirability_dimension not null,
  max_points integer not null,
  points integer,
  confidence confidence_level not null default 'unknown',
  insufficient_evidence boolean not null default false,
  guessed boolean not null default false,
  evidence text,
  constraint assessment_scores_dimension_key unique (assessment_id, dimension),
  constraint assessment_scores_max_positive check (max_points > 0),
  constraint assessment_scores_points_in_range check (
    points is null or (points >= 0 and points <= max_points)
  ),
  constraint assessment_scores_no_points_without_evidence check (
    coalesce(points, 0) = 0
    or (evidence is not null and length(btrim(evidence)) > 0)
  ),
  -- Unknown, a guess, or insufficient evidence cannot contribute points.
  constraint assessment_scores_no_guessed_points check (
    coalesce(points, 0) = 0
    or (
      confidence <> 'unknown'
      and not insufficient_evidence
      and not guessed
    )
  )
);

create index assessment_scores_assessment_idx
  on assessment_scores (assessment_id);

comment on table assessment_scores is
  'Per-dimension evidence. Positive points require a non-unknown confidence, sufficient evidence, and a written note. Provenance is not awarded for a guess.';

create table market_comps (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  maker_model text not null,
  maker_text text,
  model_text text,
  material text,
  era text,
  fork_included boolean,
  condition_notes text,
  platform text,
  source_url text,
  listing_or_sold comp_price_kind not null,
  currency text not null default 'SGD',
  amount_cents integer not null,
  amount_sgd_cents integer,
  fx_rate numeric(18, 8),
  fx_rate_date date,
  fx_rate_source text,
  observed_date date,
  comparability_score integer,
  like_for_like boolean not null default false,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  constraint market_comps_amount_nonnegative check (amount_cents >= 0),
  constraint market_comps_sgd_nonnegative check (
    amount_sgd_cents is null or amount_sgd_cents >= 0
  ),
  constraint market_comps_currency check (currency ~ '^[A-Z]{3}$'),
  constraint market_comps_sgd_amount_matches check (
    currency <> 'SGD' or amount_sgd_cents is null or amount_sgd_cents = amount_cents
  ),
  constraint market_comps_fx_when_converted check (
    currency = 'SGD'
    or amount_sgd_cents is null
    or (
      fx_rate is not null
      and fx_rate > 0
      and fx_rate_date is not null
      and fx_rate_source is not null
    )
  ),
  constraint market_comps_score_scale check (
    comparability_score is null or comparability_score between 1 and 5
  )
);

create index market_comps_frame_idx
  on market_comps (frame_id, listing_or_sold, observed_date desc);

comment on column market_comps.listing_or_sold is
  'asking and sold are different facts. An asking row is never treated as a completed sale.';

comment on column market_comps.like_for_like is
  'False when fork inclusion or specification does not match the frame being priced.';

create table pricing_versions (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references frames (id) on delete restrict,
  version integer not null default 1,
  config_id uuid references app_config (id) on delete restrict,
  inputs_snapshot jsonb not null default '{}'::jsonb,
  prepared_cost_cents integer not null,
  cost_floor_cents integer not null,
  target_margin numeric(5, 4) not null,
  selling_fee_rate numeric(5, 4) not null default 0,
  margin_basis text not null default 'gross_margin_before_sales_fees',
  suggested_class value_class,
  class_band_min_cents integer,
  class_band_max_cents integer,
  market_range_min_cents integer,
  market_range_max_cents integer,
  suggested_price_cents integer,
  approved_price_cents integer,
  pricing_conflict boolean not null default false,
  conflict_notes text,
  notes text,
  override_rationale text,
  approved_by text,
  approved_at timestamptz,
  supersedes_id uuid references pricing_versions (id),
  is_current boolean not null default true,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint pricing_versions_version_key unique (frame_id, version),
  constraint pricing_versions_version_positive check (version >= 1),
  constraint pricing_versions_money_nonnegative check (
    prepared_cost_cents >= 0
    and cost_floor_cents >= 0
    and (class_band_min_cents is null or class_band_min_cents >= 0)
    and (class_band_max_cents is null or class_band_max_cents >= 0)
    and (market_range_min_cents is null or market_range_min_cents >= 0)
    and (market_range_max_cents is null or market_range_max_cents >= 0)
    and (suggested_price_cents is null or suggested_price_cents >= 0)
    and (approved_price_cents is null or approved_price_cents >= 0)
  ),
  constraint pricing_versions_margin_possible check (
    target_margin >= 0
    and target_margin < 1
    and selling_fee_rate >= 0
    and selling_fee_rate < 1
    and target_margin + selling_fee_rate < 1
  ),
  constraint pricing_versions_margin_basis check (
    margin_basis in (
      'gross_margin_before_sales_fees',
      'gross_margin_after_sales_fees'
    )
  ),
  constraint pricing_versions_fee_matches_basis check (
    (
      margin_basis = 'gross_margin_before_sales_fees'
      and selling_fee_rate = 0
    )
    or margin_basis = 'gross_margin_after_sales_fees'
  ),
  constraint pricing_versions_floor_formula check (
    cost_floor_cents = bicii_cost_floor_cents(
      prepared_cost_cents,
      target_margin,
      selling_fee_rate
    )
  ),
  constraint pricing_versions_bands_ordered check (
    (
      class_band_min_cents is null
      or class_band_max_cents is null
      or class_band_min_cents <= class_band_max_cents
    )
    and (
      market_range_min_cents is null
      or market_range_max_cents is null
      or market_range_min_cents <= market_range_max_cents
    )
  ),
  constraint pricing_versions_conflict_when_floor_exceeds_band check (
    class_band_max_cents is null
    or cost_floor_cents <= class_band_max_cents
    or pricing_conflict
  ),
  constraint pricing_versions_approval_complete check (
    (
      approved_at is null
      and approved_by is null
      and approved_price_cents is null
    )
    or (
      approved_at is not null
      and approved_by is not null
      and approved_price_cents is not null
      and override_rationale is not null
      and length(btrim(override_rationale)) >= 3
    )
  ),
  constraint pricing_versions_below_floor_needs_reason check (
    approved_price_cents is null
    or approved_price_cents >= cost_floor_cents
    or (
      override_rationale is not null
      and length(btrim(override_rationale)) >= 3
    )
  )
);

create unique index pricing_versions_one_current_idx
  on pricing_versions (frame_id)
  where is_current;

create index pricing_versions_frame_idx
  on pricing_versions (frame_id, version desc);

comment on table pricing_versions is
  'Immutable once approved. A later labour rate creates a new version and does not rewrite cost_floor_cents here. suggested_class is a value class, not an inspection outcome.';

comment on column pricing_versions.cost_floor_cents is
  'round(prepared_cost_cents / (1 - target_margin - selling_fee_rate)) in SGD cents.';

comment on column pricing_versions.pricing_conflict is
  'True when the cost floor sits above the suggested value-class band. The value class is not raised to hide that.';
