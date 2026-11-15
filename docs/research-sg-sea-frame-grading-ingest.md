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

### A.2 Brand cards (concrete cues + bands)

Bands below are **bare / near-bare frameset asking ranges** observed or triangulated for Singapore unless noted. Cleared prices often run ~10–25% under sticky asks (`docs/sg-frameset-market-notes.md`). Prefer attaching sold comps per dossier.

#### Mainstream volume (high SG liquidity)

| Brand | Era cues | Materials | Serial / badge tells | F tendency | SG frameset band (SGD) | Notes / sources |
| --- | --- | ---: | --- | --- | --- | --- |
| **Giant** | 90s chromoly MTB; 2010s rim Advanced; 2018+ disc TCR/Propel/Revolt | steel, Al, carbon | Advanced vs Advanced SL = composite tier; BB86 common; Tay Junction receipts | F2–F4 by model/year | Rim Advanced ~400–800; disc TCR/Propel FS ~800–1,500; TT Trinity outliers much higher | Carousell: Propel Advanced Pro FS ask **S$800**; TCR Advanced Pro Size S **S$1,100** (related listing text Nov 2026). Channel: Tay Junction. `[CONFIRMED]` asks |
| **Liv** | Langma / Avail / Devote generations | Al, carbon | Giant engineering; women’s geometry ≠ value class | F2–F4 | Similar to Giant peer models | Do not discount solely as “women’s bike”. `[LIKELY]` |
| **Trek** | OCLV gen; BB90 → T47; Knock Block; IsoSpeed; Madone seatmast | Al, carbon, steel | OCLV 500/700/800 process names; missing aero post collapses price | F2–F5 | Madone SL FS ~1,200–1,500; Émonda SLR FS ~2,000–2,500; Checkpoint SL FS ~700–950 | Carousell: Madone SL FS **S$1,500**; Checkpoint SL7 FS **S$950**; Émonda SLR9 2021 FS **S$2,500**. Channel: Treknology3 / Speedon5. `[CONFIRMED]` asks |
| **Specialized** | SL4–SL8; FACT 10r/12r; Allez Sprint alloy | steel, Al, carbon | FACT sticker ≠ safety; SL6 OSBB vs SL7/8 BSA; counterfeit stickers | F2–F5 | Allez Sprint FS ~500–1,200; Tarmac disc everyday ~1,100–2,200; S-Works / SL8 higher | Carousell: Allez Sprint Sz49 heavily used **S$500**; 2018 Sz56 FS **S$800**. Channel: specialized.com/sg. `[CONFIRMED]` asks |
| **Merida** | Reacto / Scultura / Silex CF tiers | Al, carbon | CF3 etc. are kit tiers | F2–F3 | Often below Giant/Trek peers | Channel: Hup Leong. `[PROVISIONAL]` bare-FS liquidity |
| **Cannondale** | CAAD alloy; SuperSix Hi-MOD BB30A/PF30A → Gen4 BSA | Al, carbon | Measure BB bore; LAB71 halo | F2–F4 | Hi-Mod disc used FS ~1,000–1,700 (seed band) | BB standard mismatch is liquidity trap. `[LIKELY]` |
| **Scott** | HMF/HMX; Scale/Spark local MTB | Al, carbon | Often PF BB; pre-UDH | F2–F4 | Carbon HT Scale used ~700–1,400 | Channel: KH Cycle / Bike Haus. `[LIKELY]` |
| **Canyon** | Direct grey common; proprietary cockpits | Al, carbon | canyon.com/en-sg completes; FS still exceptional | F2–F4 | Aeroad CFR ~1,200–1,900; Grail CF SL ~900–1,600 | No SG warranty on grey. `[LIKELY]` from seed + market notes |

#### Prestige Italian / race halo (high counterfeit risk)

| Brand | Era cues | Materials | Tells | F tendency | SG frameset band | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| **Colnago** | Steel C-series heritage; V3/V3Rs/V4Rs/V5Rs carbon | steel, carbon | Made-in-Italy claims vary by model; Art Decor paint; serial + dealer papers | F3–F5 (hypothesis) | V3 FS ask **S$1,400**; V5Rs FS **S$5,500**; C60 complete **S$3,880** (not bare FS) | Carousell Nov 2026 listings. Counterfeit risk **high**. `[CONFIRMED]` asks / `[PROVISIONAL]` cleared |
| **Pinarello** | Dogma F / F12; Italian BB; MOST Talon | carbon, steel | Onda fork authenticity; Spin Axis / Cycleworx papers | F4–F5 | Dogma F FS **S$5,200** (w/ MOST bar, Spin Axis); Bolide TT FS **S$3,500** | Carousell. Channel: Cycleworx. `[CONFIRMED]` asks |
| **Bianchi** | Celeste eras; Specialissima / Oltre | steel, Al, carbon | Celeste shade ≠ year alone; BYX channel | F3–F5 | Specialissima FS+wheels **S$3,500**; vintage Specialissima Sante FS ask **S$4,600** (collector ask, aged listing) | Carousell. `[CONFIRMED]` ask / `[PROVISIONAL]` cleared |
| **Cervélo** | S5/R5/Áspero; BBright; proprietary axles | carbon | Missing aero axles/post = discount | F3–F5 | S5 used FS seed 3,200–4,800; Áspero used 1,600–2,600 | Seed comps + BnB channel. `[LIKELY]` |
| **Wilier / Look / Factor** | Model-year geometry + proprietary posts | carbon | Dealer papers | F3–F5 | Thin local FS volume — do not invent bands | `[UNKNOWN]` thin sample |

#### Japanese vintage / steel (collector + touring)

| Brand | Era cues | Materials | Serial / badge tells | F tendency | SG frameset band | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| **Miyata** | 1970s–90s road/touring; Triple Butted chromoly eras | steel, Al | BB serial: 1972–84 letter+6 digits (A=1972…M=1984); 1985–89 letter+fortnight+5 digits (N=1985…S=1990); Taiwan Dodsun = two-line `DS…` | F2–F4 | Rare public SG bare FS; often complete ~400–1,200 depending | classicjapanesebicycles.com/miyata-serial-numbers `[CONFIRMED]` serial method; SG prices `[PROVISIONAL]` |
| **Bridgestone / Anchor** | 80s–90s sport; Anchor continues | steel, Al, carbon | Letter+number or number+letter; Asahi vs Ageo factory formats; tubing decals | F2–F4 | Sparse SG FS listings | classicjapanesebicycles.com/bridgestone-serial-numbers `[CONFIRMED]` method |
| **Panasonic** | 70s–90s; often OEM white-label quality | steel | Head-tube or BB: e.g. `7K` ≈ Nov 1987; formats changed often | F2–F3 | Construction can outrank badge | panasonicbikemuseum.info/faq `[CONFIRMED]` method |
| **3Rensho / NJS keirin** | Track / keirin | steel | NJS stamp ≠ worldwide quality medal; respray drops collector value | F4–F5 when verified | Thin SG; authenticity gate | Rubric + brand seed. `[PROVISIONAL]` |

#### French / UK / US vintage & city

| Brand | Era cues | Materials | Tells | F tendency | SG band | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| **Peugeot** | 50s–90s; mixed factory quality | steel | PX / PY era; Carbolite vs Reynolds | F1–F3 | Often F1–F2 as bare FS unless tubing proven | Mixed quality by factory. `[PROVISIONAL]` |
| **Raleigh** | 80s–90s imports common in SG | steel, Al | Factory/era verification mandatory | F1–F2 | Utility–budget unless Reynolds/531 proven | `[PROVISIONAL]` |
| **Schwinn** | Varsity/Continental electro-forge; later Asia | steel | Badge spans many factories — record era | F1–F2 typical; select Paramount eras higher | Utility vintage | `[LIKELY]` |
| **Nishiki / Centurion / Univega** | 70s–80s Japan-built import badges | steel | Serial + tubing decal = ID; not one maker | F2–F3 | Evidence-driven | `[LIKELY]` |
| **Motobecane** | Classic French; later MBK | steel | Tubing + model evidence | F2–F3 | `[PROVISIONAL]` |

#### SEA / Indonesia / China volume

| Brand | Era cues | Materials | Tells | F tendency | SG frameset band | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| **Polygon** | Rodalink value MTB/road; Xtrada / Siskiu / Helios | Al, carbon, steel | PT Insera Sena (Indonesia); Boost 148 modern HT | F1–F2 typical; carbon FS higher | Xtrada frame **S$180** (L Boost); Xtrada 7 frame+bits **S$300** | Carousell. Channel: Rodalink. `[CONFIRMED]` asks |
| **United** | SEA mass city/kids/BMX | steel, Al | Not a performance FS brand | F1 | Parts / utility | `[LIKELY]` |
| **Pacific Cycles** | Taiwan OEM; AL7005 pioneer; Birdy manufacturer | Al | **Not** Tern; Birdy/Reach/IFMove/CarryMe; SG dist. Mighty Velo | F2–F4 (Birdy) | Folding is hinge-product, not bare FS | birdybicycle.com history; pacific-cycles.com SG dealer. `[CONFIRMED]` corporate |
| **Tern** | 2011+; Hon family from Dahon lineage | Al, steel | Verge/BYB/Eclipse; OCL joint / Physis; **separate from Pacific** | F1–F3 | Damaged Verge P9 frame **S$80**; completes much higher | ternbicycles.com about + launch release; Carousell. `[CONFIRMED]` |
| **Dahon** | 80s–present folders | Al, steel | Grade the hinge; model variance huge | F1–F2 | Bare frame weak | `[LIKELY]` |
| **Brompton** | C / P / T lines; HDB liquidity | steel, Ti | Hinge slop; triangles not freely interchangeable | F3–F5 | C Line used FS ~700–1,200; G-line new FS from **S$2,800**; T-line FS **S$4,300** | Carousell Brompton FS listing. `[CONFIRMED]` asks |
| **Seaboard / Tsunami / Weapon** | Modern chromoly gravel | steel | Local riding mix ≠ SG brand | F1–F2 | New CX03 ~550–750 | Mr Bicycles / Carousell. `[LIKELY]` |
| **Chinese OEM / Twitter / SAVA / open-mold** | 2010s+ carbon | carbon, Al | Highest counterfeit/QC variance; UCI stickers are claims | F1–F2 | Seka/Elves/Winspace value carbon ~700–2,500 used/new FS | High risk. `[LIKELY]` |
| **Trinx / Java / Phoenix / Forever** | Utility / entry | steel, Al | Volume city/MTB/folder | F1 | Java folder bare ~100–250 | `[LIKELY]` |

#### Missing / strengthen in `brands.ts`

- Add explicit **Pacific Cycles** row (distinct from Tern/Birdy).
- Enrich Miyata / Bridgestone / Panasonic with serial formats above (cite Classic Japanese Bicycles + Panasonic Museum).
- Split **Decathlon** house lines already noted (Van Rysel / Triban / Rockrider / Elops) — keep as separate `houseLine` field.
- Add `fClassHypothesis` + `sgBareFramesetBandSgd` optional fields — do **not** auto-assign.

---

## B. Inspection checklist — steel vs aluminium vs carbon

Map to existing `CHECKLIST` IDs in `src/lib/engine/inspection.ts`. Outcome language must stay visual/mechanical only.

### B.1 Universal zones (every material)

| Zone | Fail → `REJECT` / hard fail | Hold → `HOLD` | Pass notes |
| --- | --- | --- | --- |
| Head tube / DT / TT junctions | Crack, crease at joint, steerer bent/cracked | Paint crack at weld pending dye; stickers hiding joints | Loupe + rake lighting |
| BB shell | Crack, perforation, oval press-fit that won’t retain cups | Threads chaseable but rough; creak unexplained | Install test spindle; rock crank — bearing play ≠ frame fail |
| Dropouts / hanger | Won’t retain axle; cracked dropout; insert pulling | Bent replaceable hanger; light face marks | Axle threads by hand; wheel centers |
| Alignment | Al/carbon uncorrectable asymmetry | Steel/ti correctable cold-set candidate | String/gauge; record mm |
| Brake mounts | Cracked tab / peeled carbon mount | Repairable threads | ISO 4210-2:2023 treats rear brake mounts as structural |
| Fork / steerer | Bent/cracked steerer; crown shift | Score marks under stem only | Drop stem |

**Sources:** ISO 4210-2/6 shop translation in `docs/frame-evaluation-grading-rubric.md`; Velopedia used-frame guide; Shop Shepherd frame inspection KB; Trek composite note (tap is screen, not NDT pass).

### B.2 Steel-specific

| Finding | Guidance |
| --- | --- |
| Smooth mid-tube dent, no crease/crack | Usually **PASS** with disclosure → feeds **P** (cosmetic), not FAIL |
| Surface rust / staining, no perforation | **PASS** or **HOLD** if internal risk unknown; P2–P3 rust work |
| Deep pits / bubbling at lug / scale in seat tube / perforation | **REJECT** or repair_hold only with named builder plan |
| Paint crack at lug/weld edge | **HOLD** until dye penetrant or written clear |
| Fillet / lug edge cracks under paint | Highest risk site — loupe mandatory |
| Seized Al post in steel tube | Service/P-class issue; may become structural if bore torn |

SG humidity: seized posts, rusty bolts, internal condensation at cable ports — emphasize `st_corrosion` + drain holes.

### B.3 Aluminium-specific

| Finding | Guidance |
| --- | --- |
| Any crack at weld / HAZ | **REJECT** (default; Al has no true fatigue limit — Shop Shepherd) |
| Creased dent or dent at joint | **HOLD**/reject path; do not cold-set casually |
| Smooth shallow mid-tube dent | Deduction / disclosure; not auto-pass as “fine” |
| White oxide under steel bolt / BB / seat tube | Inspect for perforation |
| Paint delamination (e.g. Allez Sprint listing) | Cosmetic ≠ structural; still inspect under paint flakes; seller “shop said safe” is **not** `PASS_VISUAL` |

### B.4 Carbon-specific

| Finding | Guidance |
| --- | --- |
| Exposed/frayed fiber, soft/crushed laminate, confirmed delam | **REJECT** |
| Spiderweb/crazed paint at impact; dull tap vs adjacent laminate | **HOLD** / quarantine → specialist (`CARBON_IMPACT_UNRESOLVED`) |
| Clamp-zone scoring (steerer, seatpost, TA inserts) | HOLD until severity clear |
| Undocumented structural repair | **REJECT** |
| Documented specialist repair + report | May pass later with disclose; never silent ride |
| Clearcoat chip only | Can PASS with cosmetic note |
| Credible crash history even if visual clean | Do not clear on software optimism — Trek: damage can remain concealed |

Tap test UI label: **“Screen”**, never “NDT passed” (existing rubric).

### B.5 Suggested checklist help-text additions (by `checkId`)

| checkId | Add help |
| --- | --- |
| `st_joints` | Steel: lug edges. Al: HAZ hairlines. Carbon: bond lines / paint webs. |
| `st_corrosion` | SG: internal seat tube, cable ports, dropout faces. Perforation = fail. |
| `st_carbon` | Coin screen ≠ clearance. Crash history → specialist. |
| `st_dents` | Smooth steel ≠ crease Al. Measure ovality at head tube / BB if suspect. |
| `co_bb` | BSA ≠ BB86 ≠ BB90 ≠ BBright ≠ T47. Measure this shell. |
| `co_old` | QR vs 12×142 vs Boost 148; Super Boost 157 trap. |

---

## C. Preservation work drivers (P1–P4) + SGD cost ranges

PRD hours remain canonical (`P1` 1–2h, `P2` 2–4h, `P3` 4–7h, `P4` scoped). Map **drivers** and **local cost anchors**.

### C.1 Driver → class map

| Typical intake state | Class | Labour hours | Parts / materials (SGD) | External (SGD) |
| --- | --- | ---: | ---: | ---: |
| Clean, original paint, light scuffs, free posts/BB | **P1** | 1–2 | 10–40 (degreaser, wax, bolts) | 0 |
| Needs full strip, chase threads, light surface rust, seized minor fasteners | **P2** | 2–4 | 40–120 | 0–80 |
| Heavy surface rehab, seized post/BB, many fasteners, cosmetic conservation | **P3** | 4–7 | 80–250 | 50–200 |
| Full respray, carbon specialist NDT/repair, titanium weld, research/authentication | **P4** | Scoped | 100–800+ | See anchors |

**Invariant:** P-class ≠ structural quality ≠ F-class. A Colnago can be P1; a utility steel can be P3.

### C.2 Singapore cost anchors (citable)

| Service | Price (SGD) | Source | Maps to |
| --- | --- | ---: | --- |
| Wash & tune | 60–80 | Fixabike Carousell menu | below P1 (complete bike) |
| Maintenance / overhaul | 100–160 | Fixabike | adjacent to P2 labour on completes |
| Full strip-down service | 350 | Bike Hero Pro | P2–P3 labour proxy on completes |
| Half service (incl. rust treatment where applicable) | 240 | Bike Hero Pro | rust + clean proxy |
| Minor de-rust add-on | 30–100+ | DCBikes restoration listing | P2–P3 materials/labour |
| Frame repaint (disassembly+reassembly) | 400–500 | Fixabike | **P4** external |
| Frame+fork repaint from | 700 (+300 carbon premium) | Unspokin custom paint | **P4** |
| Frame-only repaint from | 600 | Unspokin | **P4** |
| Mechanic labour (shop planning rate) | Use shop `rateCentsPerHour` | Engine already supports | Convert hours × rate → labour cents |

**Uncertainty:** Most published SG menus price **complete bikes**, not bare framesets. Frame-only prep is usually cheaper on strip labour but loses “tune” line items — treat table as planning floors, log actuals.

### C.3 Suggested `PRESERVATION_COST_SEED` (for planner)

```ts
export const PRESERVATION_COST_SEED = {
  currency: "SGD",
  labourRateHintCentsPerHour: 4500, // S$45/h planning — shop-configurable [PROVISIONAL]
  classes: {
    P1: { hours: [1, 2], materialsCents: [1000, 4000], externalCents: [0, 0] },
    P2: { hours: [2, 4], materialsCents: [4000, 12000], externalCents: [0, 8000] },
    P3: { hours: [4, 7], materialsCents: [8000, 25000], externalCents: [5000, 20000] },
    P4: { hours: null, materialsCents: null, externalCents: [40000, 100000] }, // respray floor
  },
  citations: [
    "https://www.bikehero.sg/bike-hero-pro",
    "https://unspokin.com/pages/custom-paint-jobs",
    "https://www.carousell.sg/p/professional-bicycle-services-by-certified-full-time-bike-mechanic-since-2017-1043729096/",
    "https://dcbikes.com.sg/products/mountain-bike-restoration-spa-grooming-bicycle-servicing-de-rust-refurbishment",
  ],
} as const;
```

---

## D. Desirability dimensions that predict F-class better

Existing six dimensions (`DIMENSION_MAX`) are sound. Enrich scoring **guides** and add **sub-signals** (stored as evidence strings, not new axes unless schema bumps).

| Dimension (max) | Predictive sub-signals for SG/SEA | Scoring traps |
| --- | ---: | --- |
| `maker_provenance` (15) | Verified serial + dealer receipt; white-label builder ID; OEM factory known (e.g. Giant OEM) | Logo alone; counterfeit stickers |
| `model_relevance` (20) | Era prestige (Dogma, S-Works, C60, Team Miyata); race/history with evidence; geometry still desirable (disc TA, modern BB) | Confusing model year generations (SL6 vs SL8) |
| `construction_interest` (20) | Verified tubing (Reynolds 531/753, Columbus SLX, Tange); fillet/lug quality; unusual design | “It’s steel so F3”; material bias |
| `scarcity` (15) | Size scarcity (49–54 cm liquid in SG); discontinued; original paint; matching fork | Rare + cracked still F for display but not build-ready |
| `buyer_demand` (20) | Local sold comps; Brompton/HDB liquid; Giant/Trek/Specialized everyday; rim-brake carbon weak | Using new retail as used cleared; bundling wheels/group into FS ask |
| `provenance_completeness` (10) | Original fork, papers, unmolested serial, period groupset match | Invented race stories |

### D.1 Extra signals worth encoding (optional schema fields)

1. `eraPrestige` — generation desirability (disc/TA/current BB) separate from brand fame.  
2. `geometryDesirability` — STR / use-class fit (rubric §8) as dossier note, **not** safety.  
3. `groupsetEraMatch` — period-correct vs frankenstein (affects F, not PASS).  
4. `localDemandSg` — enum `dead|slow|everyday|hot` from comps matcher.  
5. `raceHistoryEvidence` — documents only; no points without evidence.  
6. `counterfeitRisk` — if high and unresolved → block F assignment / sale.

### D.2 Calibration note vs live market

Current `VALUE_CLASS_BANDS_SGD` (F1 S$200–349 … F5 S$1,000+) are **heritage/workshop prepared-frame guides**. Live Carousell carbon FS asks routinely sit at S$800–5,500. **Do not silently map F5 to “any carbon over S$1k ask.”** Options for implementers:

1. Keep F bands as *prepared steel/heritage* guide and store `marketSegment: heritage|modern_performance|folding` with separate band tables; or  
2. Raise modern-performance band table and keep heritage bands for vintage steel programme.

Mark calibration as **required** after 15–20 real BICII sold comps (PRD already says this).

---

## E. Grading mistakes → engine guardrails

Encode as warnings / hard blocks (many already partially present — tighten copy + tests).

| Mistake | Guardrail |
| --- | --- |
| Pretty paint ⇒ `PASS_VISUAL` | Cosmetic codes never clear structural concerns; repaint hiding joints caps inspection |
| Rare brand ⇒ safe | Brand/tierHint cannot set inspection outcome |
| `P3` ⇒ low value / `F1` | Preserve independence; UI shows three badges; forbid single “grade” export |
| `F5` ⇒ rideable | `available_for_build` requires `PASS_VISUAL` + no unresolved critical flags |
| UCI sticker ⇒ structural pass | Store UCI as standards claim only (rubric) |
| ISO model claim ⇒ this serial OK | Void on crack/mod/undocumented repair |
| Tap test ring ⇒ carbon cleared | Label “Screen”; dull tap → HOLD |
| Seller “shop said OK” / marketplace condition | Ignored unless your inspector redoes checks |
| Complete-bike ask as bare-FS comp | Comp matcher requires `forkInclusion` + strips groupset/wheels |
| Rim-brake carbon priced like disc | Liquidity flag `rim_qr_weak_sg` |
| Missing proprietary post/cockpit ignored | Price discount / HOLD for incomplete FS |
| Al crack “weldable in house” | Default REJECT; builder override documented |
| Steel surface rust ⇒ REJECT | Only perforation / structural rust fails |
| Folder hinge damage ignored | Tern/Dahon/Brompton: hinge is structure |
| Grey Canyon/import warranty assumed | Channel flag `no_local_warranty` |
| Counterfeit prestige | Missing serial + prestige sticker → stop |
| Letter grade `F` confused with value `F1` | Naming collision — UI must say “value class F1” / “letter F reject” |

---

## F. Market comps seed (15–25 citable)

**Kind:** `asking` unless noted. **Observed:** research pass 2026-11-15.  
**Cleared estimate:** apply shop haircut 10–25% for pricing assist — label as estimate.

| # | Brand / model | Era | Material | Ask SGD | Source | Notes |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | Giant Propel Advanced Pro frameset | ~2010s–20s aero | carbon | 800 | [Carousell](https://www.carousell.sg/p/giant-propel-advanced-pro-frameset-1472203617/) | Size 52, well used, bar/stem; Di2-ready note |
| 2 | Giant TCR Advanced Pro FS Size S | recent disc era | carbon | 1,100 | Related Carousell ask text (Madone listing sidebar) | Lightly used; confirm generation on intake |
| 3 | Trek Madone SL frameset | recent | carbon | 1,500 | [Carousell](https://www.carousell.sg/p/trek-madone-sl-frameset-only-1463656237/) | Size 52, EXS bar included, 1st owner |
| 4 | Trek Checkpoint SL7 frameset | gravel | carbon | 950 | [Carousell](https://www.carousell.sg/p/trek-checkpoint-sl7-frameset-1464442439/) | Size M + cockpit; well used |
| 5 | Trek Émonda SLR9 2021 frameset | 2021 | carbon | 2,500 | [Carousell](https://www.carousell.sg/p/trek-emonda-slr9-2021-frameset-1460783122/) | Size 52; integrated bar; DA add-on separate |
| 6 | Specialized Allez Sprint FS | 2018 | alloy | 800 | [Carousell](https://www.carousell.sg/p/wts-wtt-specialized-allez-sprint-frameset-1461937331/) | Size 56, fork+post |
| 7 | Specialized Allez Sprint FS Sz49 | — | alloy | 500 | [Carousell](https://www.carousell.sg/p/specialized-allez-sprint-frameset-sz49-1461949245/) | Paint delam + stuck post; **do not treat as PASS** |
| 8 | Colnago V3 frameset | — | carbon | 1,400 | [Carousell](https://www.carousell.sg/p/colnago-v3-frameset-1461758638/) | Size 485; frame+fork |
| 9 | Colnago V5Rs frameset | recent | carbon | 5,500 | [Carousell](https://www.carousell.sg/p/colnago-v5rs-frameset-with-darimo-seatpost-1470458772/) | Size 455; Darimo post; authenticity diligence |
| 10 | Pinarello Dogma F frameset | 2023/24 colour | carbon | 5,200 | [Carousell](https://www.carousell.sg/p/pinarello-dogma-f-frameset-1455946378/) | Size 46.5; MOST bar; Spin Axis purchase claim |
| 11 | Pinarello Bolide TT frameset | — | carbon | 3,500 | [Carousell](https://www.carousell.sg/p/pinarello-bolide-tt-frameset-%E2%80%93-size-48-5-%E2%80%93-almost-new-1469111846/) | Size 48.5 |
| 12 | Bianchi Specialissima Disc CV FS+wheels | 2021 | carbon | 3,500 | [Carousell](https://www.carousell.sg/p/bianchi-specialissima-frameset-wheels-1467204015/) | Size 50; **wheels bundled** — strip for bare FS comps |
| 13 | Brompton G-line / T-line frameset | new | steel/Ti | 2,800 / 4,300 | [Carousell](https://www.carousell.sg/p/g-line-t-line-frameset-brompton-1468500723/) | Brand-new specialist listing |
| 14 | Polygon Xtrada frame 29" | modern Boost | alloy | 180 | [Carousell](https://www.carousell.sg/p/29-polygon-bicycle-frame-teal-yellow-xtrada-1462381503/) | Size L 148×12 |
| 15 | Polygon Xtrada 7 frame + crank/shifter | — | alloy | 300 | [Carousell](https://www.carousell.sg/p/polygon-xtrada-7-size-m-frame-with-shimano-deore-crankset-and-shifter-slightly-negotiable-1452688206/) | Size M; parts bundled |
| 16 | Tern Verge P9 frame (damaged pin) | — | alloy | 80 | [Carousell](https://www.carousell.sg/p/tern-verge-p9-take-note-with-one-damage-pin-folding-bike-frame-with-crankset-1468749123/) | Hinge damage → structure HOLD/REJECT |
| 17 | Giant Trinity frameset Size S | 2025 purchase claim | carbon | 4,600 | [Carousell](https://www.carousell.sg/p/giant-trinity-frameset-s-size-1455027472/) | Tay Junction Oct 2025; TT specialty |
| 18 | Vintage Bianchi Specialissima Sante FS | 1988 | steel | 4,600 | [Carousell](https://www.carousell.sg/p/vintage-bianchi-specialissima-sante-steel-road-bike-frameset-1290296532/) | Collector ask; aged listing; originality-driven |
| 19 | Surly Disc Trucker **complete** | — | steel | 4,500 | [Carousell](https://www.carousell.sg/p/surly-disc-trucker-touring-bicycle-1459216166/) | **Not** bare FS — use only as complete ceiling |
| 20 | Orbea Orca OMX frameset Size 53 | — | carbon | 2,200 | Related Carousell ask (Madone sidebar) | Brand new claim — verify |
| 21 | Cinelli Veltrix carbon FS | — | carbon | 599 | Related Colnago listing sidebar | Lightly used |
| 22 | Weapon/Seaboard CX03 new chromoly | 2024 | steel | ~690 | Seed / Mr Bicycles market notes | Local new chromoly floor |
| 23 | Specialized Tarmac SL9 FS (new) | current | carbon | 4,800–4,900 | Related Emonda listing sidebar | New retail-ish ask; not used cleared |
| 24 | Trek 930 retro steel frame | vintage | steel | 450 | Checkpoint listing sidebar | Lightly used claim |
| 25 | Colnago C60 Art Decor **complete** | anniversary | carbon | 3,880 | [Carousell](https://www.carousell.sg/p/colnago-c60-60th-anniversary-art-decor-carbon-road-bike-1456081512/) | Complete bike — FS-only inference weak |

All marketplace URLs are **asking** snapshots; listings expire. Store `observedAt`, `kind: "asking"`, and `url` on ingest.

---

## G. Specific codebase improvements

### G.1 `src/data/brands.ts`

1. Add optional fields: `fClassHypothesis`, `serialNotes`, `sgBandSgd?: {low,high,confidence}`, `sources?: string[]`.  
2. Insert **Pacific Cycles** (Taiwan; Birdy OEM; Mighty Velo SG) — clarify ≠ Tern.  
3. Expand Miyata / Bridgestone / Panasonic `notes` with serial formats + citations.  
4. Add `houseLines?: string[]` on Decathlon.  
5. Keep `BRAND_SEED_POLICY.autoValueClass = false` and add unit test that brand lookup never returns an inspection outcome.

### G.2 `src/data/sg-market-comps.ts`

1. Extend `SgMarketComp` with:

```ts
kind: "asking" | "sold";
observedAt: string; // ISO date
sourceUrl?: string;
sourceName?: string; // "Carousell SG" | "shop floor" | ...
forkInclusion: "bare_frame" | "matching_fork" | "unknown";
includesExtras?: string[]; // wheels, bar, group — for haircut logic
confidence: "confirmed" | "likely" | "provisional";
```

2. Ingest rows F1–F18 above as `CITED_SG_COMPS` (separate from illustrative SAMPLE bands if needed).  
3. `compsToMarketRangeCents` should prefer `sold` over `asking`, and down-weight bundled extras.  
4. Add categories: `road_alloy`, `track`, `vintage_steel`, `tt` (Trinity/Bolide).  
5. Tag liquidity traps: `rim_brake`, `bb90`, `missing_aero_post`, `no_sg_warranty`.

### G.3 `docs/*`

1. Keep this file as the ingest pack; link from `sg-brand-landscape.md` and `sg-frameset-market-notes.md`.  
2. Add short `docs/grading-guardrails.md` excerpting §E for mechanic training UI.  
3. In market notes: state explicitly that F-band table ≠ Carousell carbon asks (calibration debt).

### G.4 Engine — desirability / pricing

1. **Desirability:** dimension help text ← §D; require `buyer_demand` evidence to cite `comp.id` when points > 10.  
2. **Desirability:** if `counterfeitRisk=high` and serial confidence ≠ confirmed → force incomplete assessment.  
3. **Pricing:** when matching comps, filter same `forkInclusion`; apply `askingHaircutBps` (e.g. 1500 = 15%) configurable.  
4. **Pricing:** expose `prepared_cost / (1 - margin - fee)` already — add UI copy that F-class band is a **ceiling/guide**, floor is cost math.  
5. **Inspection:** material-specific help on structural checks (§B.5).  
6. **Preservation:** seed `PRESERVATION_COST_SEED` (§C.3); P4 auto-suggest when `external` respray flagged.  
7. **Tests:** guardrail tests — pretty cosmetic + structural concern ≠ PASS; brand prestige ≠ PASS; P≠F independence; bundled comp not used as bare FS without flag.

### G.5 Workshop intake UX (product)

Lead with existing `SG_GRADING_LEAD_CHECKS` (size, brake, axle, BB, tyre, proprietary bits) **before** F-class discussion. Show three-axis badges on every frame header (already intended in README).

---

## Sources (bibliography)

### Marketplace (asking snapshots, 2026-11)

- Carousell SG listings linked in §F (Giant, Trek, Specialized, Colnago, Pinarello, Bianchi, Brompton, Polygon, Tern, Trinity, etc.).

### Brand / serial primary-ish

- Classic Japanese Bicycles — Miyata serials: https://classicjapanesebicycles.com/miyata-serial-numbers/  
- Classic Japanese Bicycles — Bridgestone serials: https://classicjapanesebicycles.com/bridgestone-serial-numbers/  
- Panasonic Bicycles Virtual Museum FAQ: https://panasonicbikemuseum.info/faq/  
- Tern about / 2011 launch (Dahon lineage, distinct brand): https://www.ternbicycles.com/en/about  
- Pacific Cycles / Birdy history + Mighty Velo SG: https://www.birdybicycle.com/blogs/news/birdy-foldable-bikes-the-history-of-pacific-cycles  

### Inspection / standards

- In-repo rubric: `docs/frame-evaluation-grading-rubric.md` (ISO 4210-2/6, UCI, TPC, Pinkbike, Trek tap note citations).  
- Velopedia — Inspecting a used frame/fork: https://velopedia.com/guides/inspect-used-bike-frame-fork/  
- Shop Shepherd — Frame inspection procedures: https://shepherd.shopdawg.app/kb/repairs/frame/frame-inspection  

### SG workshop pricing

- Bike Hero Pro: https://www.bikehero.sg/bike-hero-pro  
- Unspokin custom paint: https://unspokin.com/pages/custom-paint-jobs  
- Fixabike service menu (Carousell): https://www.carousell.sg/p/professional-bicycle-services-by-certified-full-time-bike-mechanic-since-2017-1043729096/  
- DCBikes restoration / de-rust: https://dcbikes.com.sg/products/mountain-bike-restoration-spa-grooming-bicycle-servicing-de-rust-refurbishment  

### Product axes

- `docs/BICII_frame_grading_system_Cursor_PRD.md`  
- `docs/PRD.md`  
- `src/lib/domain/types.ts`

---

## Implementation priority (developer)

1. Schema fields on comps (`kind`, `sourceUrl`, `observedAt`, `forkInclusion`, `includesExtras`).  
2. Ingest §F comps + haircut logic.  
3. Brand serial notes + Pacific Cycles row.  
4. Checklist help text + guardrail tests.  
5. Preservation cost seed.  
6. F-band vs modern carbon calibration decision (product).  
7. Continuous sold-comp capture from Carousell/Togoparts/Facebook with reviewer confirmation.
