# Bicycle frameset grading rubric

**Schema:** `frameset-grade/1.0`  
**Date:** 2026-11-15  
**Unit of grading:** one frameset, meaning the frame plus the fork that will be sold or built with it. A bare frame is gradable, with the caps in [Fork absent](#fork-absent).  
**Output:** integer category scores, a 0–100 point total, a letter `S | A | B | C | D | F`, a disposition, and machine-readable finding codes.

This document is the scoring contract for a shop tool. It is not an ISO test procedure, a UCI homologation, or a prediction of remaining fatigue life. Customer-facing text must say so.

## Relationship to BICII Frame Atlas (product axes)

**Frame Atlas MVP implements the PRD’s three separate axes, not this letter grade as the customer-facing score.** Keep them unconflated:

| Research rubric (`frameset-grade/1.0`) | BICII Frame Atlas axis |
| --- | --- |
| Structural score + hard gates (crack, delamination, bent steerer, open recall → letter `F`) | **Inspection** `DRAFT` / `PASS_VISUAL` / `HOLD` / `REJECT` — visual/mechanical only |
| Cosmetic score | Feeds **preservation effort** `P1`–`P4` and listing disclosure — not value class |
| Standards / compatibility score | Intake + checklist compatibility fields; never a safety pass by itself |
| Brand / market desirability score | Inputs to **value class** `F1`–`F5` (price band guide). Letter `F` ≠ value class `F1` |
| Geometry fit-for-use | Identification / dossier notes; does not clear a HOLD |
| Disposition `ride` / `disclose` / `quarantine` / `reject` / `service` | Maps to lifecycle + listing eligibility; quarantine/reject block build-ready |

Use this rubric for calibration language (ISO/UCI limits, material rules, listing maps). Do **not** auto-write `F1`–`F5` from the letter, and do **not** treat an ISO model claim or UCI sticker as a structural pass of the frame on the stand.

Category weights are fixed for this schema. Retuning them is a new schema version, not a configuration tweak.

| Category | Points | Question it answers |
| --- | ---: | --- |
| Structural integrity | 0–40 | Is there a reason this frameset should not be ridden? |
| Cosmetic condition | 0–20 | What does an honest listing have to disclose about finish? |
| Standards and compatibility | 0–15 | Can it be identified, built, and braked with its stated parts? |
| Brand and market desirability | 0–15 | Will a buyer want this model once it is known to be sound? |
| Geometry fit-for-use | 0–10 | Do the measured numbers match the declared riding class? |

Point total = the five scores. Letter grades are **not** the point total alone. Gates in [Letter grades](#10-letter-grades-and-gates) can only lower the letter. A cracked frame with a famous logo is `F`.

```text
points_total = structural + cosmetic + standards + market + geometry   # 0..100
raw_letter   = band(points_total)                                     # S..F
letter       = apply_gates(raw_letter, structural, findings, inspection)
```

All category scores are integers. Deductions in this schema are integers, so the implementation does not round.

---

## 1. What belongs in the grade, and what does not

The tool grades the frameset that is in the workstand today.

In the grade:

- Cracks, delamination, crushed laminate, bent or cracked steerers, dropout and brake-mount damage, bottom-bracket shell damage, alignment, and pivot cracks.
- Finish, decals, and rust staining, scored separately from structure.
- Interface standards: axles, brakes, headset, bottom bracket, seatpost, hanger, wheel size.
- Whether a claimed ISO 4210 type or UCI approval is documented, absent, or contradicted.
- Whether stack, reach, head angle, and trail fit the declared use class.

Out of the grade, stored as other records if the shop cares:

- Drivetrain wear, wheel true, suspension service, and tire tread. Those are component grades.
- Laboratory stiffness, weight-as-performance, and wind-tunnel drag. Optional `lab_metrics` may be displayed. They do not change `letter` in schema 1.0. A comfortable endurance frame is allowed to be flexible.
- Price. Market desirability is parts support and generation, not a live quote.
- Stolen-bike status. A Bike Index hit sets `sale_blocked` and disposition `hold`. It does not rewrite the structural score. Pinkbike’s buyer guide recommends the serial check; it is an ownership check.

Do not build a shop rig that drops a mass on a fork or cycles a frame to ISO loads. Those tests damage the sample. The standard itself is a laboratory method for new samples.

---

## 2. ISO 4210, translated for a grading engine

### 2.1 What the standard is

ISO 4210 is a multi-part safety standard for bicycles. The parts a frameset grader needs:

| Part | Role |
| --- | --- |
| ISO 4210-1 | Vocabulary |
| ISO 4210-2:2023 | Safety **requirements** and pass/fail rules for city and trekking, young adult, mountain, and racing bicycles |
| ISO 4210-3 | Common test methods, including how running displacement is judged in fatigue |
| ISO 4210-6:2023 | Frame and fork **test methods** |

ISO 4210-2:2023 applies to young adult bicycles with a maximum saddle height of at least 635 mm and less than 750 mm, and to city and trekking, mountain, and racing bicycles with a maximum saddle height of at least 635 mm, including folding bicycles. It does **not** apply to delivery bicycles, recumbents, tandems, BMX, or bicycles designed for severe use such as sanctioned competition, stunting, or aerobatic maneuvers. Smaller children’s bicycles are pointed at ISO 8098 when maximum saddle height is greater than 435 mm and less than 635 mm. The introduction states that the scope is safety, and that the series deliberately does not standardize components.

EN ISO 4210 is the European adoption. Older EN 14764 (city), EN 14766 (mountain), and EN 14781 (racing) were superseded by EN ISO 4210. A pre-2015 “tested to EN 14781” claim is historical evidence, not evidence of the 2023 method.

ISO 4210 is not, by itself, the US consumer-product rule. In the United States, new bicycles fall under CPSC rules in 16 CFR Part 1512. In the UK, Cycling Weekly’s October 2024 explainer notes that a seller must put a safe product on the market, and that ISO 4210 is the usual way to show diligence rather than a statute that names the ISO number. Electrically power-assisted cycles are a different standard family (EN 15194) and are out of this schema. A motor or battery mount sets `standard_family = "epac"` and blocks an ISO 4210 “pass” claim.

### 2.2 It is a sample test of a new design, not a grade of the used frame

Implications that the software must encode:

1. **Pass/fail minimum, not a quality rank.** Two frames that pass can differ in stiffness, weight, repairability, and fatigue margin. ISO compliance must not add more than the 2 points specified in [standards](#93-standards-and-compatibility-0-15). It must never add structural points.
2. **The used frame inherits nothing automatically.** A model-level claim applies to this serial only if there is no crash, overload, modification, or unrepaired recall. Cut steerer tubes and replaced hangers are normal service, not modifications. The following void an inherited claim: cracked or dented structure, undocumented composite repair, spread or cold-set dropouts on aluminum or carbon, drilled holes, motor mounts, a fork whose axle-to-crown or offset is not the one the frame was designed around, and use in a more severe class than the tested type.
3. **Category loads are not interchangeable.** A racing-bicycle test does not qualify a frame as a mountain bicycle. Gravel has no ISO type. Store `iso_type_claimed` separately from `shop_use_class`.
4. **Downhill, freeride, dirt jump, trials, BMX, cargo, and EPACs are outside the scope sentence.** Missing ISO paperwork on those classes is not a defect when `iso_scope = "out_of_scope"` is set on purpose. Do not award a fake ISO point, and do not penalize the absence.
5. **Some damage accumulation is allowed inside a laboratory pass.** For composite frames, ISO 4210-2:2015 clauses 4.8.4–4.8.6 require that peak-to-peak running displacement during fatigue not increase by more than 20% of the initial value. Rigid composite forks use 20%; suspension forks use 40% (ISO 4210-2:2015, 4.9.6). Seven Cycles criticizes that allowance and reads it as accepted stiffness loss. EFBE likewise argues that a material-specific deflection rule does not match the failures they see, and runs its own force-based program. The shop rule is narrower than either argument: **the 20% figure is not a field measurement and is not a remaining-life score.** A tap-test cannot estimate it.
6. **Permanent set in the lab is not a bend allowance in the shop.** After the defined impact, a new sample may show a limited wheelbase change and still pass. That does not mean a used frame with a visible bend is acceptable. Any permanent bend found at intake is damage.
7. **“No visible crack” is the failure language, and the standard tells labs to make cracks visible.** ISO 4210-2:2023 clause 4.4 says standardized crack-detection methods should be used where a visible crack is the failure criterion, and points at dye-penetrant methods in the ISO 3452 series, plus white paint for composites. A shop loupe inspection is the same idea at lower sensitivity. It is not equivalent to a post-test laboratory inspection.
8. **2023 added failure modes that older certificates never saw.** The foreword to ISO 4210-2:2023 adds rear brake-mount requirements (4.8.7), a further disc-brake fork provision (4.9.8.3), and a steerer-tube fatigue requirement (4.9.9). The foreword to ISO 4210-6:2023 says the frame fatigue methods (4.3, 4.4, 4.5), the new brake-mount method (4.6), the fork impact method (5.4), the disc-brake fork method (5.6), and the steerer/stem fatigue method (5.7) were revised or added. A 2014 road frame can be honest, safe, and never tested for flat-mount fatigue. Do not treat “no 2023 certificate” as a crack. Do treat a cracked flat-mount as a crack.

### 2.3 Frame tests, in shop language

Methods below are from ISO 4210-6:2023. Acceptance limits quoted from ISO 4210-2:2015 clauses 4.8 and 4.9 are the ones those clauses state. The 2023 requirements foreword does not list 4.8.2–4.8.6 as rewritten. Confirm the purchased 2023 text before printing a newton value on a customer certificate. **None of these loads are shop acceptance limits.**

**Falling-mass impact (ISO 4210-6:2023, 4.1).** The frame is held by the rear axle, upright. A 22.5 kg striker drops onto a roller in the fork, against the rake direction. Drop heights in Table 1 of that edition:

| ISO type | Drop height |
| --- | ---: |
| City and trekking | 180 mm |
| Young adult | 180 mm |
| Mountain | 360 mm |
| Racing | 212 mm |

If the fork fails, the frame is retested on a dummy fork. The lab measures wheelbase before and after. ISO 4210-2:2015, 4.8.2: no visible crack or fracture. Permanent wheelbase change shall not exceed 30 mm when a real fork is fitted. With a dummy fork the limits in its Table 5 are 10 mm for city, young adult, and mountain, and 15 mm for racing.

Shop meaning: this is a frontal impact on the fork/head-tube load path. It is why a crashed fork is not “probably fine if the paint is intact,” and why a road frame is not cleared for mountain impacts by a racing test. Mountain drop height is much higher.

**Falling-frame impact (ISO 4210-6:2023, 4.2).** The frameset rotates about the rear axle and the fork strikes a steel anvil. Masses are fixed to the seatpost (center of gravity 75 mm from the insertion point), the steering head, and the bottom bracket. The drop is repeated, then wheelbase is remeasured. Table 2:

| ISO type | Seatpost mass | Head mass | Bottom-bracket mass | Drop height |
| --- | ---: | ---: | ---: | ---: |
| City and trekking | 50 kg | 10 kg | 30 kg | 200 mm |
| Young adult | 40 kg | 10 kg | 20 kg | 200 mm |
| Mountain | 30 kg | 10 kg | 50 kg | 300 mm |
| Racing | 30 kg | 10 kg | 50 kg | 200 mm |

ISO 4210-2:2015, 4.8.3: no visible cracks or fractures, and no separation of suspension parts after the second impact. Permanent wheelbase change shall not exceed 60 mm for city, young adult, and mountain, and 15 mm for racing.

Shop meaning: racing frames are held to a much tighter permanent set in this test than mountain frames. That is a design-category difference. It is still not permission for a used racing frame to be 15 mm out of alignment. Suspension frames have an extra requirement: if the spring or damper fails, the tire must not hit the frame and the rear-wheel assembly must not detach (ISO 4210-2:2015, 4.8.1). At intake, a cracked pivot yoke or a shock mount that can pull out is a structural fail even if the main tubes look good.

**Pedalling fatigue (ISO 4210-6:2023, 4.3).** Cranks are held 45° forward and down. A downward force is applied at each pedal, 150 mm from the frame centerline, inclined 7.5° from the fore-aft plane, alternating, for 100 000 cycles (one cycle is both pedals). If the built crank length is unknown, the method uses 175 mm. Published load tables for this clause, consistent across a manufacturer test report to ISO 4210-6:2023 and secondary summaries of the same table:

| ISO type | Pedal force |
| --- | ---: |
| City and trekking | 1 000 N |
| Young adult | 1 000 N |
| Mountain | 1 200 N |
| Racing | 1 100 N |

ISO 4210-2:2015, 4.8.4: no visible cracks or fractures and no suspension separation. Composite frames: running displacement must not grow by more than 20%.

Shop meaning: bottom-bracket shells, chainstay bridges, and down-tube/BB junctions are the fatigue sites this test is written around. Bearing play is not a frame failure. Shell ovality, a cracked lug, or a bond line opening at the BB is.

**Horizontal fatigue (ISO 4210-6:2023, 4.4).** Fully reversed horizontal forces are applied at the front axle while the rear axle is pivoted. The ISO text as exposed on the ISO catalog entry for the 2023 method standard gives:

| ISO type | Forward fo