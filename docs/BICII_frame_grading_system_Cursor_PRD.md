# BICII Frame Atlas
## Frame intake, inspection, preservation, grading and pricing

**Product requirements and build brief for Cursor**  
**Version:** 1.0, 16 November 2026  
**Status:** Specification only; this is a separate application and has not been implemented.

---

## 0. Copy-paste prompt for Cursor

> Build a standalone, mobile-first internal web application named **BICII Frame Atlas** for a small bicycle workshop in Singapore. Its job is to intake and identify old bicycle frames, document condition with photographs, support an honest professional visual inspection, plan and record preservation work, classify historical/market desirability, calculate actual prepared cost, recommend a defensible retail price, and generate a customer-facing frame history and specification sheet.
>
> **Crucial design constraints:** A frame’s **safety status**, **preservation-work level**, and **retail/desirability class** must be three different things. Never convert a price grade or cosmetic condition into a statement of structural soundness. Any frame with unresolved safety concerns must be blocked from an “approved for build / ready to sell” status. The application must not claim X-ray, ultrasound or any other non-destructive testing unless it was actually done and documented. A visual inspection cannot rule out all hidden defects. All suggested prices require human approval.
>
> Use **Next.js App Router, TypeScript, PostgreSQL via Supabase**, a responsive utility-first UI, photo storage, row-level security and auditable history. This is a *new*, separate repository: do not modify the existing BICII site or workshop system. Integrations and storefront synchronisation are future phases. Implement clear migrations, seed/test data, documented environment variables, validation, role-based permissions, tests and deployment instructions. Start with the MVP below. If the workspace already contains a compatible scaffold, inspect it before installing or replacing anything. Do not invent product inventory or safety test results. Ask only about credentials or deployment choices that cannot safely be assumed; otherwise use well-documented local defaults.
>
> Deliver an actual runnable application and README, not only mockups or a plan. Work incrementally: schema → auth → intake → inspection → preparation → grading/pricing → approvals → printable/exportable record → tests.

---

## 1. Why BICII needs this

BICII is a workshop and cycling community that sources vintage/second-hand bicycle frames from collectors, online listings, old bikes and other channels. The underlying frame is the primary product. Each frame may become the basis of a dependable Basic build or a high-end custom build; its age or collectibility is not equivalent to its mechanical suitability.

BICII wants to preserve the frame’s story, not erase it. Work often includes a complete strip-down, degreasing, visual inspection, removal or treatment of surface corrosion, steel-tube internal corrosion protection where appropriate, and preserving/touching up original paint. More elaborate polishing, cosmetic patina treatment or kintsugi-inspired work is optional and separate. Typical *initial* work is estimated at 3–4 hours per frame, but the system must use actual recorded work, not assume every frame takes the same time.

The user problem is inconsistent pricing. A name-brand 1990s chromoly frame may be worth S$500–600 to BICII after preservation, while an unrecognised but well-made aluminium frame could start around S$200. Prices must reflect both marketplace desirability and BICII’s actual work/cost—not simply acquisition price, material, or a subjective sticker grade.

## 2. Outcomes

1. A standard frame-intake record in under 10 minutes, photos included.
2. A reproducible inspection with a mandatory safety decision and evidence.
3. A documented preparation plan, time estimate, actual hours, consumables and external services.
4. A transparent classification for historical/commercial desirability with confidence and rationale.
5. A suggested retail price based on cost floor, comparables, frame class, completeness and human judgement.
6. A reviewer-approved listing dossier customers can understand.
7. Searchable inventory history and an audit trail for every change.

**Out of scope for MVP:** automatic structural certification, AI crack detection, auto valuation from image recognition, automated scraping of Carousell, guaranteed market pricing, online retail checkout, parts inventory integration, a full service/work-order system, real-time Shopify sync or financial accounting. Build extension points, not fake features.

## 3. Product principles

- **Three separate axes, always:** (A) structural readiness, (B) preservation effort/condition, (C) historical/commercial desirability. Never combine into one “quality” grade.
- **Evidence over assumption:** unknown is an allowed and expected value. Do not infer exact model/year/tubing from paint or serial alone.
- **Human approval:** scoring is decision support, not a market oracle. Staff can override with a written reason and review identity.
- **Repeatability:** staff using the same evidence should arrive at comparable recommendations.
- **Safety gate:** serious suspected issues cause **HOLD** or **REJECT**. Lower prices do not make an unsafe frame acceptable.
- **No fake measurements:** support both qualitative checks and measured mm/dimensions, with who measured and when.
- **Explainable pricing:** show how many SGD come from acquisition, time, materials, overhead, optional external services and target margin.
- **Customer clarity:** history, work done, what is included and inspection limitations travel with the frame.

---

## 4. A. Structural/functional assessment — separate from price

### Allowed outcomes

| Outcome | Meaning | What the system permits |
|---|---|---|
| `DRAFT` | Intake or inspection incomplete | No approval or publication |
| `PASS_VISUAL` | Trained staff completed the visual/mechanical checklist with no unresolved concerns | Can move to preparation and, after review, build-ready |
| `HOLD` | Question, suspected structural problem, inadequate evidence, measurements outstanding, or specialist review required | No build-ready/publish |
| `REJECT` | Unsafe, not economically/technically suitable, or explicitly rejected by a qualified reviewer | No build-ready/publish; archive for parts/display if applicable |

Use the user-facing phrase **“Passed BICII’s documented visual/mechanical inspection on [date]”**, never “crack-free guaranteed,” “certified safe,” or “X-rayed.” A pass is a historical observation, not a permanent guarantee. Reinspection may be required after new damage or long storage.

### Required checklist groups

**Identification and provenance**
- Manufacturer name, model, estimated era/year; how known and confidence: confirmed/likely/unknown.
- Material (steel/aluminium/carbon/titanium/other/unknown), how determined; tubing decal/source evidence.
- Serial or stamped markings, location, readable photo, privacy if customer supplied.
- Acquisition source and seller, purchase documentation where available.
- What is included: bare frame, matching fork, non-matching fork, headset, bottom bracket or other components.

**Frame structure, visually inspected**
- Cracks or suspect lines at visible joints, welds, lugs, brazes, head tube, down tube, seat cluster, bottom bracket and rear triangle.
- Dents, bends, kinks, deformation, tube damage and previous repairs.
- Fork steerer and crown/dropouts if a fork is included; distinguish unsupported fork assessment if not included.
- Dropouts, hanger alignment/condition where assessable, brake bosses/tabs, rack and bottle bosses.
- Corrosion, paint blistering, pitting, evidence of severe internal corrosion, seized interfaces.
- Aluminium-specific checks of weld zones, dents, corrosion and stressed interfaces.
- Steel-specific checks of tubing corrosion, brazed/lugged joints, threaded interfaces and accessible interior condition.
- Carbon-specific damage/debonding/impact concerns trigger specialist assessment; no assumption visual checks are sufficient.
- Changes from original construction including welded disc tabs or geometry/fork conversion; capture who performed them and whether they require specialist review.

**Compatibility and serviceability**
- Head tube/steerer headset standard and condition; actual measured diameters.
- Bottom bracket shell width, thread/press-fit type and condition.
- Rear dropout spacing (OLD), axle/QR/thru-axle compatibility and alignment when measured.
- Wheel diameter and tyre clearance, and brake reach/boss placement.
- Brake mount type, routing, derailleur hanger type; drivetrain limitations.
- Seat tube/seatpost internal diameter, minimum insertion issues, clamp condition.
- Frame size (seat tube, top tube etc.), standover/reach where measured.
- Rack/fender/other mounting options.
- All measurements may be unknown until checked; a generic frame model lookup never overrides physical measurements.

### Evidence requirements

At least photos of: full drive side, full non-drive side, head tube/front joints, bottom bracket area, seat cluster, rear dropouts, serial, damaged/treated areas and included fork. For inaccessible areas, record “not inspected” and why. Allow more photos and notes.

Each checklist item: `result = pass | concern | not_applicable | not_inspected`, notes, optional linked image IDs, inspector and timestamp. A `concern` on a structural item immediately places the record on HOLD unless reviewer explicitly resolves it with documented rationale. A `not_inspected` on mandatory item blocks approval.

**Safety implementation invariant:** `available_for_build` requires a completed PASS_VISUAL assessment by an authorised inspector, no unresolved critical flags, preparation release and reviewer approval.

---

## 5. B. Preservation work — not a collectible grade

Use codes to plan and measure effort, not to determine how “good” or “premium” a frame is.

| Code | Typical work | Initial planning range |
|---|---|---:|
| `P1` Light | Degrease, inspect, careful cleaning, very minor touch-ups | 1–2 hours |
| `P2` Standard | Full strip-down, thorough cleaning, corrosion assessment/protection, finish preservation | 2–4 hours |
| `P3` Extensive | Seized parts, substantial surface rehabilitation, detailed cosmetic conservation, extra interventions | 4–7 hours |
| `P4` Specialist | Unusual treatments, outsourced services, specialist finish or research | Individually scoped/quoted |

**P-levels are estimates**; actual time logs control costs. “P3” does not mean lower structural quality. Some collectible frames need P1; some common frames need P3. If treatment reveals an issue, return to HOLD and reinspect.

### Work operations

- Strip/disassemble, clean/degrease, remove old decals only when justified, remove accessible corrosion, rust converter where appropriate, exterior protection, internal steel protection where compatible and applied correctly, paint touch-up, polish, cosmetic kintsugi-inspired treatment, specialist services, reassembly/ready-to-build handoff, and other configurable tasks.
- Every operation records status, estimated hours, actual hours, person, material, cost, before/after photos, notes and date.
- **Cosmetic kintsugi-inspired work is never described as a structural repair.**
- Corrosion resistance differs by metal and finish; record actual procedure, product if used and any caveats rather than showing a misleading “rust-proof forever” badge.
- A frame may be retained with visible patina and still pass inspection. Cosmetic condition, original paint and patina are independent labels.

### Condition descriptor (separate field)

- `original_excellent`
- `original_worn_patina`
- `original_heavy_cosmetic_wear`
- `retouched_conserved`
- `repainted_refinished`
- `unknown`

