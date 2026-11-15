# BICII Frame Atlas — Product requirements

Canonical source: owner-supplied `BICII_frame_grading_system_Cursor_PRD.md` (16 November 2026).

## Non-negotiable product rules

1. **Three separate axes** — never merge into one “quality” grade:
   - **A. Structural readiness** — `DRAFT` / `PASS_VISUAL` / `HOLD` / `REJECT`
   - **B. Preservation effort** — `P1`–`P4` (work planning, not collectibility)
   - **C. Market/value class** — `F1`–`F5` (price band guide only)

2. Visual/mechanical inspection is **not** X-ray, ultrasound, or a permanent safety guarantee.
3. Unresolved structural concerns block `approved` / `listing_eligible`.
4. Pricing is decision support; humans approve with rationale.
5. Money stored as integer **SGD cents**. Sample frames in seed data are fiction, clearly tagged.

See the full PRD in the chat uploads for checklist groups, pricing formulas, lifecycle, and acceptance tests.
