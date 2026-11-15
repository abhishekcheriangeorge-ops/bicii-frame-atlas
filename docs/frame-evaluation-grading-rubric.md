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

| Category | Points 