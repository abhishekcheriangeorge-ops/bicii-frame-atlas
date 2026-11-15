-- Catalogue and the first settings version.
-- Bands, weights, and the 40% margin are the brief's starting hypothesis,
-- not a calibrated shop policy. GST registration is not assumed.

insert into app_config (
  id, version, is_current,
  labour_rate_cents, target_gross_margin, target_margin_bps,
  selling_fee_rate, selling_fee_bps, allocated_overhead_cents,
  gst_registered, gst_rate_bps, gst_inclusive_display,
  desirability_thresholds,
  f1_label, f2_label, f3_label, f4_label, f5_label,
  f1_min_cents, f1_max_cents,
  f2_min_cents, f2_max_cents,
  f3_min_cents, f3_max_cents,
  f4_min_cents, f4_max_cents,
  f5_min_cents, f5_max_cents,
  score_f1_max, score_f2_max, score_f3_max, score_f4_max,
  weight_maker_provenance, weight_model_relevance, weight_construction_interest,
  weight_scarcity, weight_buyer_demand, weight_provenance_completeness,
  price_rounding_cents, currency, notes
) values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  1, true,
  2500, 0.4000, 4000,
  0, 0, 2000,
  false, 900, false,
  '{"F1":[0,19],"F2":[20,39],"F3":[40,59],"F4":[60,79],"F5":[80,100]}'::jsonb,
  'Found Gems', 'Everyday Classics', 'Heritage', 'Sought After', 'Collector',
  20000, 34900,
  35000, 49900,
  50000, 69900,
  70000, 99900,
  100000, null,
  19, 39, 59, 79,
  15, 20, 20,
  15, 20, 10,
  1000, 'SGD',
  'Bootstrap defaults from the Frame Atlas brief. Illustrative, not calibrated. Insert a new version to change them. GST registration is not assumed, and margin math excludes GST. Value-class bands are market guides, not safety grades.'
);

insert into settings (key, version, value_json, is_current, notes) values
  (
    'price_rounding',
    1,
    '{"step_cents":1000,"also_allowed_cents":[5000]}'::jsonb,
    true,
    'Reviewer-facing retail rounding: nearest S$10, with S$50 also allowed.'
  ),
  (
    'selling_channels',
    1,
    '{"default":{"code":"workshop","selling_fee_bps":0}}'::jsonb,
    true,
    'No channel fee until a channel is chosen. Fee inside the margin uses margin_basis gross_margin_after_sales_fees.'
  ),
  (
    'inspection_limitations',
    1,
    '{"method":"visual_mechanical","statement":"Visual/mechanical inspection cannot rule out hidden defects. A pass is a historical observation, not a laboratory or imaging certificate."}'::jsonb,
    true,
    'Copy that must travel with a pass. Do not describe a visual pass as certified or imaged.'
  );

insert into measurement_types (code, label, default_unit, allowed_units, description) values
  ('seat_tube_length', 'Seat tube length', 'mm', '{mm}', 'State centre-to-top or centre-to-centre in the method.'),
  ('top_tube_length', 'Top tube length', 'mm', '{mm}', 'Effective or actual, recorded in the method.'),
  ('head_tube_length', 'Head tube length', 'mm', '{mm}', null),
  ('head_tube_id_top', 'Head tube inside diameter, top', 'mm', '{mm}', null),
  ('head_tube_id_bottom', 'Head tube inside diameter, bottom', 'mm', '{mm}', null),
  ('bb_shell_width', 'Bottom bracket shell width', 'mm', '{mm}', null),
  ('seatpost_id', 'Seat tube inside diameter', 'mm', '{mm}', null),
  ('rear_spacing', 'Rear dropout spacing (OLD)', 'mm', '{mm}', null),
  ('chainstay_length', 'Chainstay length', 'mm', '{mm}', null),
  ('standover', 'Standover', 'mm', '{mm}', null),
  ('stack', 'Stack', 'mm', '{mm}', null),
  ('reach', 'Reach', 'mm', '{mm}', null),
  ('tyre_clearance', 'Tyre clearance', 'mm', '{mm}', null),
  ('brake_reach', 'Brake reach', 'mm', '{mm}', null),
  ('seat_tube_angle', 'Seat tube angle', 'deg', '{deg}', null),
  ('head_tube_angle', 'Head tube angle', 'deg', '{deg}', null);

insert into inspection_checks (
  code, category, label, guidance, applies_scope, gate_required, structural,
  not_applicable_allowed, sort_order
) values
  ('id_maker', 'identification', 'Manufacturer / maker identified with confidence noted', null, 'always', true, false, false, 10),
  ('id_model_era', 'identification', 'Model and estimated era recorded (unknown allowed)', null, 'always', true, false, true, 20),
  ('id_material', 'identification', 'Material assessed with how-determined note', null, 'always', true, false, false, 30),
  ('id_serial', 'identification', 'Serial / stamp photographed or marked not present', null, 'always', true, false, true, 40),
  ('id_included', 'identification', 'Included parts documented (fork / headset / BB)', null, 'always', true, false, false, 50),
  ('st_joints', 'structure', 'Visible joints / welds / lugs / brazes — no cracks or suspect lines', 'A confirmed crack is HOLD or REJECT. Value class cannot clear it.', 'always', true, true, false, 60),
  ('st_head_dt', 'structure', 'Head tube and down tube junction visually sound', null, 'always', true, true, false, 70),
  ('st_seat_bb', 'structure', 'Seat cluster and bottom bracket shell visually sound', null, 'always', true, true, false, 80),
  ('st_rear', 'structure', 'Rear triangle / dropouts visually sound', null, 'always', true, true, false, 90),
  ('st_dents', 'structure', 'No concerning dents, bends, kinks or prior repairs left unresolved', null, 'always', true, true, false, 100),
  ('st_corrosion', 'structure', 'Corrosion / blistering assessed; no severe unresolved internal risk', null, 'always', true, true, false, 110),
  ('st_fork', 'structure', 'Fork steerer / crown / dropouts (or N/A if fork not included)', 'If a fork is included, the steerer is mandatory.', 'fork_included', true, true, true, 120),
  ('st_mods', 'structure', 'Non-original structural modifications reviewed', null, 'always', true, true, true, 130),
  ('st_carbon', 'structure', 'Carbon-specific damage check (or N/A for non-carbon)', 'Unresolved carbon damage needs a specialist. A visual pass does not clear hidden damage.', 'carbon', true, true, true, 140),
  ('co_headset', 'compatibility', 'Headset / steerer standard noted or measured', null, 'always', true, false, true, 150),
  ('co_bb', 'compatibility', 'Bottom bracket shell type / width noted or measured', null, 'always', true, false, true, 160),
  ('co_old', 'compatibility', 'Rear spacing (OLD) / axle standard noted or measured', null, 'always', true, false, true, 170),
  ('co_brakes', 'compatibility', 'Brake mount type and reach assessed', null, 'always', true, false, true, 180),
  ('co_seatpost', 'compatibility', 'Seatpost diameter / clamp condition assessed', null, 'always', true, false, true, 190),
  ('co_size', 'compatibility', 'Frame size label recorded (measured where available)', null, 'always', true, false, true, 200);

insert into preservation_task_types (code, label, is_cosmetic_only, description) values
  ('strip', 'Strip / disassemble', false, 'Take the frame down far enough to inspect and clean.'),
  ('clean_degrease', 'Clean / degrease', false, 'Remove grease and dirt. This does not change inspection_status.'),
  ('corrosion_removal', 'Remove accessible corrosion', false, 'Surface corrosion only. Severe internal corrosion returns the frame to HOLD.'),
  ('rust_converter', 'Rust converter', false, 'Record the product used and the metal it was applied to.'),
  ('exterior_protection', 'Exterior protection', false, 'Record the product. This is not a permanent rust-proof claim.'),
  ('internal_steel_protection', 'Internal steel protection', false, 'Only where the treatment is compatible and actually applied.'),
  ('paint_touch_up', 'Paint touch-up', false, 'Conservation of the existing finish.'),
  ('polish', 'Polish', false, 'Cosmetic.'),
  ('cosmetic_kintsugi', 'Cosmetic kintsugi-inspired treatment', true, 'Cosmetic surface work. Never a structural repair and never a safety certificate.'),
  ('specialist_service', 'Specialist service', false, 'Outsourced work. A service record is required before any method other than visual/mechanical is claimed.'),
  ('ready_to_build', 'Ready-to-build handoff', false, 'Handoff after preservation. Does not by itself set available_for_build.'),
  ('other', 'Other', false, 'Describe the operation in the task notes.');
