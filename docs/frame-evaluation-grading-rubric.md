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
5. **Some damage accumulation is allowed inside a laboratory pass.*