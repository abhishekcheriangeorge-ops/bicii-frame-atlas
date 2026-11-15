# BICII Frame Atlas — SG/SEA frame-grading research (ingest pack)

**Schema intent:** feed `src/data/brands.ts`, `src/data/sg-market-comps.ts`, inspection checklist help text, preservation cost planners, desirability dimension guides, and engine guardrails.  
**Date of research pass:** 2026-11-15  
**Axes (never conflate):**

| Axis | Codes | Means |
| --- | --- | --- |
| Inspection status | `DRAFT` / `PASS_VISUAL` / `HOLD` / `REJECT` | Safety/condition of **this** frame |
| Preservation class | `P1`–`P4` | Work effort to usable |
| Value class | `F1`–`F5` | Market desirability / collectability — **not** condition |

**Money:** integer SGD cents. Cost floor = `prepared_cost / (1 - margin - fee)`.

**Uncertainty legend:** `[CONFIRMED]` primary/official or directly observed listing; `[LIKELY]` reputable secondary synthesis; `[PROVISIONAL]` workshop hypothesis / thin sample; `[UNKNOWN]` needs local sold-comp capture.

---

## A. Brand landscape (SG / SEA used & vintage)

### A.1 How to store brand rows (ingest shape)

```ts
type BrandIngest = {
  name: string;
  origin: string;
  made?: string;
  eras: string;
  materials: string[];
  categories: string[];
  tierHint: "utility"|"budget"|"value"|"mainstream"|"performance"|"prestige"|"custom";
  /** F-class tendency ONLY — never auto-write valueClass */
  fClassHypothesis: "F1"|"F2"|"F3"|"F4"|"F5"|"spread";
  eraCues: string[];
  serialBadgeTells: string[];
  sgBareFramesetBandSgd?: { low: number; high: number; confidence: string; notes: string };
  sgChannel?: string;
  counterfeitRisk?: "low"|"medium"|"high";
  sources: { title: string; url: string; kind: "primary"|"secondary"|"marketplace" }[];
};
```

**Rule:** `tierHint` / `fClassHypothesis` are identification assists. They must never set `PASS_VISUAL`, `P*`, or approved `F*`.

See full ingest pack sections B–G in workspace file; truncated mid-push will be replaced.
