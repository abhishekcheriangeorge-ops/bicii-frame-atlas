-- BICII Frame Atlas
-- Three axes use different types so a preservation code cannot be stored as a
-- value class, and neither can be stored as an inspection outcome.
-- Standard Postgres (PGlite). No extensions. No row-level security.

create type inspection_status as enum ('DRAFT', 'PASS_VISUAL', 'HOLD', 'REJECT');

create type preservation_class as enum ('P1', 'P2', 'P3', 'P4');

create type value_class as enum ('F1', 'F2', 'F3', 'F4', 'F5');

create type lifecycle_status as enum (
  'intake_draft',
  'identified',
  'inspection_pending',
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
  'sold',
  'archived'
);

create type staff_role as enum ('admin', 'reviewer', 'mechanic', 'viewer');

create type frame_material as enum (
  'steel',
  'aluminium',
  'carbon',
  'titanium',
  'other',
  'unknown'
);

create type confidence_level as enum ('confirmed', 'likely', 'provisional', 'unknown');

create type cosmetic_condition as enum (
  'original_excellent',
  'original_worn_patina',
  'original_heavy_cosmetic_wear',
  'retouched_conserved',
  'repainted_refinished',
  'unknown'
);

create type cost_category as enum (
  'acquisition',
  'freight',
  'labor',
  'materials',
  'overhead',
  'external'
);

-- Asking prices and completed sales stay distinct.
create type comp_price_kind as enum ('asking', 'sold');

create type inspection_item_result as enum (
  'pass',
  'concern',
  'not_applicable',
  'not_inspected'
);

create type desirability_dimension as enum (
  'maker_provenance',
  'model_relevance',
  'construction_interest',
  'scarcity',
  'buyer_demand',
  'provenance_completeness'
);

comment on type inspection_status is
  'Structural/functional axis from a documented visual/mechanical inspection. Not preservation effort and not market position.';

comment on type preservation_class is
  'Preservation effort axis P1-P4. Plans and measures work. Not a safety result and not a value class.';

comment on type value_class is
  'Market/desirability axis F1-F5 (Found Gems through Collector). Not quality, strength, or safety.';

comment on type lifecycle_status is
  'Workshop lifecycle. approved/listed/reserved/allocated_to_build/sold still require inspection_status PASS_VISUAL.';
