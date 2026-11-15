-- SAMPLE / FICTIONAL seed data for BICII Frame Atlas demos.
-- Not real inspected frames. sample_tag = true on all rows.

insert into staff_profiles (auth_sub, email, display_name, role)
values
  ('user:dev', 'dev@example.com', 'Dev Viewer', 'admin'),
  ('user:mechanic', 'mechanic@bicii.local', 'Sample Mechanic', 'mechanic'),
  ('user:reviewer', 'reviewer@bicii.local', 'Sample Reviewer', 'reviewer')
on conflict (auth_sub) do nothing;

-- Frame 1: SAMPLE early-1990s Giant Yukon-style steel (PRD worked example)
insert into frames (
  id, frame_code, brand_text, model_text, maker_text,
  estimated_year_from, estimated_year_to, year_confidence,
  material, material_confidence, tubing_claim, tubing_evidence,
  frame_size_label, serial_text, serial_location,
  frame_only_or_frameset, fork_included, fork_originality,
  acquisition_source_type, acquisition_source_notes_internal,
  seller_name_internal, acquisition_date, acquisition_cost_cents,
  ownership_status, cosmetic_condition, current_status, inspection_status,
  preservation_class, value_class, current_approved_price_cents,
  public_story, sample_tag, listing_eligible, available_for_build, created_by
) values (
  '11111111-1111-1111-1111-111111111101',
  'BICII-F-000001',
  'Giant', 'Yukon', 'Giant',
  1992, 1994, 'provisional',
  'steel', 'likely', 'Chromoly (claimed)', 'Seat-tube decal partially readable — SAMPLE only',
  '18"', 'SAMPLE-YK-001', 'BB shell underside',
  'frameset', true, 'unknown',
  'sample_seed', 'FICTIONAL PRD worked example — not a real intake',
  'Sample Seller A', '2026-10-01', 8000,
  'owned', 'original_worn_patina', 'pricing_review', 'PASS_VISUAL',
  'P2', 'F2', null,
  'SAMPLE: Early-1990s Giant Yukon-style chromoly mountain frameset used for pricing demos. Not a real BICII inspection.',
  true, false, false, 'user:dev'
);

insert into cost_items (frame_id, category, amount_cents, source, include_in_cost_basis) values
  ('11111111-1111-1111-1111-111111111101', 'acquisition', 8000, 'seed', true),
  ('11111111-1111-1111-1111-111111111101', 'labor', 8750, '3.5h × S$25 SAMPLE', true),
  ('11111111-1111-1111-1111-111111111101', 'materials', 2500, 'seed treatments', true),
  ('11111111-1111-1111-1111-111111111101', 'overhead', 2000, 'allocated', true);

insert into inspections (id, frame_id, version, inspector_sub, inspector_name, outcome, notes, critical_flags)
values (
  '21111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111101',
  1, 'user:mechanic', 'Sample Mechanic', 'PASS_VISUAL',
  'SAMPLE visual/mechanical inspection only — not a safety certification.',
  '[]'::jsonb
);

-- Frame 2: SAMPLE overlooked aluminium white-label
insert into frames (
  id, frame_code, brand_text, model_text, maker_text,
  estimated_year_from, estimated_year_to, year_confidence,
  material, material_confidence, frame_size_label,
  frame_only_or_frameset, fork_included, fork_originality,
  acquisition_source_type, acquisition_source_notes_internal,
  acquisition_date, acquisition_cost_cents, ownership_status,
  cosmetic_condition, current_status, inspection_status,
  preservation_class, value_class, public_story, sample_tag,
  listing_eligible, available_for_build, created_by
) values (
  '11111111-1111-1111-1111-111111111102',
  'BICII-F-000002',
  'Unknown OEM', 'Unmarked aluminium road', null,
  1995, 1999, 'unknown',
  'aluminium', 'likely', '54 cm',
  'frame_only', false, 'not_applicable',
  'sample_seed', 'FICTIONAL white-label aluminium — PRD cost-floor example',
  '2026-10-05', 4000, 'owned',
  'original_heavy_cosmetic_wear', 'ready_for_pricing', 'PASS_VISUAL',
  'P1', 'F1',
  'SAMPLE: Unbadged aluminium road frame. Cheap ≠ unsafe. Identification remains unknown.',
  true, false, false, 'user:dev'
);

insert into cost_items (frame_id, category, amount_cents, source) values
  ('11111111-1111-1111-1111-111111111102', 'acquisition', 4000, 'seed'),
  ('11111111-1111-1111-1111-111111111102', 'labor', 5000, '2.0h × S$25'),
  ('11111111-1111-1111-1111-111111111102', 'materials', 1500, 'seed'),
  ('11111111-1111-1111-1111-111111111102', 'overhead', 1500, 'seed');

-- Frame 3: SAMPLE HOLD — structural concern
insert into frames (
  id, frame_code, brand_text, model_text,
  estimated_year_from, estimated_year_to, year_confidence,
  material, material_confidence, frame_size_label,
  frame_only_or_frameset, fork_included,
  acquisition_source_type, acquisition_cost_cents,
  cosmetic_condition, current_status, inspection_status,
  public_story, sample_tag, listing_eligible, available_for_build, created_by
) values (
  '11111111-1111-1111-1111-111111111103',
  'BICII-F-000003',
  'Peugeot', 'PX-10 style (unverified)',
  1978, 1984, 'provisional',
  'steel', 'likely', '57 cm',
  'frameset', true,
  'sample_seed', 12000,
  'original_worn_patina', 'hold', 'HOLD',
  'SAMPLE: Held for suspected crack at drive-side chainstay junction. Not approved for build.',
  true, false, false, 'user:dev'
);

insert into inspections (id, frame_id, version, inspector_sub, inspector_name, outcome, notes, critical_flags)
values (
  '21111111-1111-1111-1111-111111111103',
  '11111111-1111-1111-1111-111111111103',
  1, 'user:mechanic', 'Sample Mechanic', 'HOLD',
  'SAMPLE: Concern at chainstay/BB junction — specialist review required.',
  '["st_joints"]'::jsonb
);

insert into inspection_items (inspection_id, category, check_id, label, result, is_structural, is_mandatory, notes)
values (
  '21111111-1111-1111-1111-111111111103',
  'structure', 'st_joints',
  'Visible joints / welds / lugs / brazes — no cracks or suspect lines',
  'concern', true, true,
  'Hairline suspect mark at DS chainstay — SAMPLE'
);

-- Frame 4: SAMPLE collector candidate (still needs full process)
insert into frames (
  id, frame_code, brand_text, model_text, maker_text,
  estimated_year_from, estimated_year_to, year_confidence,
  material, material_confidence, tubing_claim,
  frame_size_label, frame_only_or_frameset, fork_included, fork_originality,
  acquisition_source_type, acquisition_cost_cents,
  cosmetic_condition, current_status, inspection_status,
  preservation_class, value_class,
  public_story, sample_tag, listing_eligible, available_for_build, created_by
) values (
  '11111111-1111-1111-1111-111111111104',
  'BICII-F-000004',
  'Colnago', 'Super (era unverified)', 'Colnago',
  1982, 1988, 'provisional',
  'steel', 'likely', 'Columbus SL (claimed — unverified)',
  '56 cm', 'frameset', true, 'unknown',
  'sample_seed', 45000,
  'original_worn_patina', 'inspection_pending', 'DRAFT',
  null, null,
  'SAMPLE: Prestige badge alone does not create F5 or PASS. Awaiting full inspection.',
  true, false, false, 'user:dev'
);

-- SAMPLE market comps (asking/sold research notes for pricing demos)
insert into market_comps (
  id, frame_id, maker_model, material, era, fork_included, condition_notes,
  platform, listing_or_sold, currency, amount_cents, observed_date,
  comparability_score, like_for_like, notes
) values
  (
    '31111111-1111-1111-1111-111111111101',
    '11111111-1111-1111-1111-111111111101',
    'Giant Yukon / chromoly MTB (era peer)',
    'steel', 'early 1990s', true,
    'original worn patina; sample research band',
    'Carousell / Togoparts peers', 'asking', 'SGD', 45000, '2026-11-12',
    3, false,
    'SAMPLE: peer steel MTB asks; not a sold Yukon. Cleared often 10–25% under ask.'
  ),
  (
    '31111111-1111-1111-1111-111111111102',
    '11111111-1111-1111-1111-111111111101',
    'Weapon Seaboard CX03 new chromoly frameset',
    'steel', '2024', true,
    'brand new shop stock',
    'Mr Bicycles / Carousell', 'asking', 'SGD', 69000, '2026-11-12',
    2, false,
    'SAMPLE: new local chromoly ceiling for similar utility steel builds.'
  ),
  (
    '31111111-1111-1111-1111-111111111103',
    '11111111-1111-1111-1111-111111111102',
    'Unbadged / OEM aluminium road frameset',
    'aluminium', 'late 1990s', false,
    'heavy cosmetic wear; frame only',
    'workshop research', 'asking', 'SGD', 18000, '2026-11-12',
    2, true,
    'SAMPLE: white-label aluminium often clears under F1–F2; construction ≠ badge.'
  ),
  (
    '31111111-1111-1111-1111-111111111104',
    '11111111-1111-1111-1111-111111111102',
    'Marin Gestalt alloy gravel (liquidity peer)',
    'aluminium', '2021', true,
    'well used commuter',
    'SG market comps catalog', 'asking', 'SGD', 35000, '2026-11-12',
    2, false,
    'SAMPLE: named alloy still sits as cheap build platform vs unbadged.'
  );

update frame_code_seq set next_value = 5 where id = 1;
