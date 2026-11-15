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
- Laboratory stiffness, weight-as-performance, and wind-tunnel drag. Optional `lab_metrics` may be displayed. They do not change `letter` i