# BICII Frame Atlas

Standalone, mobile-first workshop tool for **BICII** (Singapore): intake and identify used/vintage bicycle frames, run an honest **visual/mechanical** inspection, plan preservation work, assign a **value class** (market band), and approve a defensible retail price.

## Product rules (non-negotiable)

1. **Three separate axes** — never merge into one “quality” grade:
   - **Structural readiness** — `DRAFT` / `PASS_VISUAL` / `HOLD` / `REJECT`
   - **Preservation class** — `P1`–`P4` (effort, not collectibility)
   - **Value class** — `F1`–`F5` (price band guide only)
2. A visual pass is phrased as *“Passed BICII’s documented visual/mechanical inspection on [date]”* — never “X-ray cleared” or “certified crack-free.”
3. Unresolved structural concerns block approval / listing / build-ready.
4. Humans approve prices; the engine is decision support.
5. Money is stored as integer **SGD cents**.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- PostgreSQL via `DATABASE_URL` when published (Cursor Apps database)
- Local/dev: **PGlite** in-memory with `migrations/` + `scripts/seed.sql`
- Cursor app identity for private/team viewers (`cursor/identity.ts`)

## Run locally

```bash
npm install
env -u DATABASE_URL npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

```bash
npm test
npm run typecheck
npm run build
```

## Seed data

Sample frames are **fiction**, tagged `sample_tag = true`:

| Code | Scenario |
|------|----------|
| `BICII-F-000001` | Giant Yukon steel pricing worksheet (draft inspection, not a safety pass) |
| `BICII-F-000002` | Overlooked aluminium white-label (F1 cost-floor hypothesis) |
| `BICII-F-000003` | HOLD — unresolved fictional crack; not build-ready |
| `BICII-F-000004` | F4/F5 collector candidate; inspection still draft |

Sample rows are tagged `sample_tag` and are not safety certifications. A visual pass is never seeded.

## Main flows

1. **Dashboard / Inventory** — status, HOLD count, three-axis badges  
2. **Intake** — create `BICII-F-######` draft  
3. **Inspection** — checklist; concern → HOLD  
4. **Price worksheet** — prepared cost, 40% cost floor, value class band, conflict flags  
5. **Approve price** (reviewer/admin) — versions + audit  
6. **Export** — public-safe JSON (no seller PII / acquisition cost)  
7. **Brands** — identification assist landscape (not auto-grading)  
8. **Market** — SAMPLE SG used-frameset comps (cleared-price bands; not a live feed)

Pricing research notes: `docs/sg-frameset-market-notes.md`.

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Production Postgres (set by publish). Leave unset locally for PGlite. |
| `DATABASE_URL_UNPOOLED` | Optional direct URL for migrations |
| `CURSOR_APP_ID` / `CURSOR_APP_IDENTITY_ISSUER` | Set by Cursor publish — do not put in `.env` |

## Out of scope (MVP)

AI crack detection, Carousell scraping, Shopify sync, automatic structural certification, full work-order ERP. Extension points only.

## Spec

- Product contract: `docs/BICII_frame_grading_system_Cursor_PRD.md`
- Research rubric (letter S–F, ISO/UCI translation — **not** the Atlas value class): `docs/frame-evaluation-grading-rubric.md`
- SG market comps notes: `docs/sg-frameset-market-notes.md`
- SG brand landscape (channels, origin corrections, seed rules): `docs/sg-brand-landscape.md`
