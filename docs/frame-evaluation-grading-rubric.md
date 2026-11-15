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

| ISO type | Forward force | Rearward force | Cycles |
| --- | ---: | ---: | ---: |
| City and trekking | 450 N | 450 N | 100 000 |
| Young adult | 450 N | 450 N | 100 000 |
| Mountain | 1 200 N | 600 N | 50 000 |
| Racing | 600 N | 600 N | 100 000 |

A racing-category report published against the same clause used 600 N / 600 N for 100 000 cycles and passed with no cracks. Mountain frames see a much higher forward load and fewer cycles.

Shop meaning: this is the head-tube, down-tube, and fork-dropout load path for bumps and braking. It is not a stiffness score.

**Vertical fatigue (ISO 4210-6:2023, 4.5).** A repeated vertical force simulates rider weight and road shock. The same published load comparison gives:

| ISO type | Vertical force |
| --- | ---: |
| City and trekking | 1 000 N |
| Young adult | 500 N |
| Mountain | 1 200 N |
| Racing | 1 200 N |

The racing-category report applied 1 200 N for 50 000 cycles. Acceptance is again no crack, no suspension separation, and the 20% composite displacement limit (ISO 4210-2:2015, 4.8.6).

Shop meaning: seat-tube clusters, seatstays, and seat-clamp areas. A seatpost that slips is not a frame defect. A crack at the seat-tube/top-tube junction is.

**Rear brake mounts (ISO 4210-6:2023, 4.6, required by ISO 4210-2:2023, 4.8.7).** This block was added in the 2023 edition. The racing report cited static loads of 700 N rearward and 300 N forward, held 1 minute, and a fatigue block of 500 N rearward and 50 N forward for 20 000 cycles. Treat those newtons as that report’s applied values, not as a complete reprint of every category’s table.

Shop meaning: a cracked, stripped, or peeling disc-brake tab is a primary structural item, including on metal frames. Rim-brake bosses that are the only brake interface get the same severity.

### 2.4 Fork tests, in shop language

ISO 4210-2:2015, 4.9, applies the strength tests to all fork types. Suspension forks are tested at unloaded length unless the method says otherwise.

| Test | What a pass means in the 2015 requirements text | Shop translation |
| --- | --- | --- |
| Axle location | Wheel sits centered when the axle is fully in the slots | A wheel that will not center, or a dropout the axle will not seat in, fails intake |
| Suspension tire clearance | Tire does not hit the crown; parts do not separate | Look for crown rub and for legs that pull out of the casting |
| Tensile | Sliders and legs do not separate | Any dropout insert pullout or leg separation is a fail |
| Static bending | No crack; permanent axle-to-steerer deflection ≤ 10 mm | A fork that is visibly bent has already exceeded what the lab allows a new fork after this test. Bent fork = fail |
| Rearward impact, all-metal | First impact: fail if cracked **or** if permanent set exceeds 45 mm. Then a second impact with no fracture. Then a third check: no movement between steerer and crown | Do not adopt 45 mm as an allowable used-fork bend. Any steerer/crown shift is a fail |
| Rearward impact, any composite content | No fracture and permanent set ≤ 45 mm, then the steerer/crown check | Composite forks do not get the “bend but survive” path. No fracture is the rule |
| Bending fatigue plus rearward impact | No fracture; permanent set ≤ 45 mm. Composite running displacement ≤ +20% (rigid) or ≤ +40% (suspension) | A fork that has been crashed is not cleared by a static look at the blades alone |
| Hub or disc brake | Static torque, plus extra provisions for composite disc forks | Cracked disc tab or a tab that has started to peel from a carbon blade is a fail |
| Steerer fatigue (2023, 4.9.9 / method 5.7) | Steerer and stem clamp region survives cyclic bending | Scoring under a stem is a watch item; a crack or a bend in the steerer is a fail |

Fork static-bending forces are category-specific. Secondary summaries of the method quote on the order of 1 000 N (city and young adult), 1 500 N (mountain), and 1 200 N (racing). Those forces stay in the lab.

### 2.5 How ISO enters the software

Store this record. Do not reduce it to a boolean.

```text
iso_record = {
  standard_family: "iso_4210" | "iso_8098" | "epac" | "cargo" | "out_of_scope" | "unknown",
  iso_type_claimed: "city_trekking" | "young_adult" | "mountain" | "racing" | null,
  evidence: "lab_report" | "manufacturer_document" | "reputable_model_year" | "none",
  model_year: number | null,
  voids: string[]          // modification and damage codes that cancel inheritance
}
```

Scoring uses `evidence` only through the standards category. Structural scoring does not read it.

Taiwan’s TBIS 4210 editions add a second, higher pedalling-fatigue stage (stage 1 at the ISO forces for 120 000 cycles, stage 2 at +100 N for another 100 000). That is a national industry standard, not ISO 4210. Store it as `other_lab: "tbis"`. Set `isoEvidence` to `lab_report` only when the certificate names the ISO 4210 clauses and the category tested.

---

## 3. UCI frameset approval

### 3.1 What the procedure does

The UCI approval procedure has applied since 1 January 2011 under article 1.3.001bis. From 1 January 2021 it also covers the seatpost and the frame parts between the handlebar stem and the head tube. The protocol covers equipment for **road, track, and cyclo-cross** events. It is not a mountain-bike, gravel, or city approval.

The UCI’s own description of the sticker:

- The sticker means the model meets the UCI technical regulations and the commercial-availability rule, so it may be used in UCI-calendar events, including UCI Gran Fondo events.
- The **oval** sticker (2011, later split into frame and fork stickers) is shape compliance.
- The **round** sticker (2019) adds a safety-and-quality attestation. In nearly all cases that means an ISO certification supplied by the manufacturer. The protocol says the manufacturer must attest that the material was tested and meets the security norms in force, per article 1.3.002. The clarification guide tells mechanics that, from 2019, submitted framesets must include certification of ISO 4210 compliance, and it states that the UCI is not liable for defects in the equipment a rider chooses.
- The **rectangular** sticker (2021) adds the seatpost and the spacer/cockpit parts between stem and head tube.

Approval is a **model and size** decision. The public list carries manufacturer, model, sizes checked, date, and an identification code. It is not a serial-number inspection of the frame in the stand.

Two procedures:

- **One-piece / molded** frames (in practice, carbon) submit drawings and a sample. Tube profiles are checked against the equipment rules (article 1.3.020 and the clarification guide). The UCI FAQ names EPFL as a measuring partner for three-dimensional checks. The UCI does not run the ISO destructive tests; the manufacturer attests those.
- **Tubular** frames (welded, brazed, or otherwise not a polymer mold), which is the path for aluminum, steel, and titanium, use a simplified file: application, drawings of each size, labeling, and the signed security-compliance form.

Cycling Weekly reported in October 2024 that the fee was 5 000 CHF plus VAT per size for carbon and 3 500 CHF plus VAT for metal, limited to eight sizes, and that labels are applied at manufacture, typically under clearcoat. The same article reports a Continental team applying stickers to frames that had not been approved. A sticker is a claim. The list is the record.

### 3.2 What it does not say

| Claim heard in a shop | What is actually true |
| --- | --- |
| “UCI approved” means safer than a non-approved frame | No. Approval requires a manufacturer ISO attestation plus a shape check. A non-listed frame can have the same or a harder in-house test. Cycling Weekly’s conclusion is the one to encode: UCI approval is not a consumer safety ranking. |
| No sticker means unsafe | No. Most of the world’s frames are outside the procedure, including every honest mountain bike and most gravel bikes. The UCI says there is no restriction on riding a non-approved bike. |
| The sticker grades stiffness, weight, or comfort | No. Those are not protocol criteria. |
| The sticker proves this used frame is sound | No. It says nothing about crash damage, repairs, counterfeit molds, or a recalled batch. |
| A round or rectangular sticker proves the UCI broke the frame on a test rig | No. ISO compliance is attested by the manufacturer. |
| Any road frame from 2011 onward must be listed | Only if someone will start it in a UCI road, track, or cyclo-cross event that requires the current protocol. A shop sale does not. |

### 3.3 How UCI enters the software

```text
uci_record = {
  applicable: boolean,          // true only for road_race, tt, track, cyclocross
  sticker_seen: "none" | "oval" | "round" | "rectangular" | "unreadable",
  list_check: "matched_model_and_size" | "matched_model_size_not_listed"
            | "not_listed" | "not_checked" | "not_applicable",
  year_of_frame: number | null
}
```

Points: see [standards](#93-standards-and-compatibility-0-15). A sticker that the list does not support raises finding `UCI_STICKER_UNVERIFIED`. That finding alone is not a structural fail. Combined with other counterfeit signs (wrong serial format, logo errors, decals that do not match a known model year) it sets `counterfeit_suspected`, which blocks the sale.

Missing UCI paperwork on a bike the customer will not race is worth at most the single point this rubric withholds. It must not move a sound frame from A to C.

---

## 4. Independent lab scores (TOUR, Zedler, EFBE)

These programs score **new complete bikes or new frames** under their own methods. Schema 1.0 may store their numbers. It must not mix them into structural integrity.

### 4.1 TOUR (road, and their gravel/endurance variants)

TOUR’s current road protocol was published on 12 January 2024. They state that old and new scores are not comparable, and that an overall grade of 1.0 is not achievable because the criteria conflict (weight against aero, stiffness against weight). Grades are the German school scale: 1.0 is the best mark they award, and larger numbers are worse. They cap stiffness so “stiffer” stops improving the grade once the bike is already stable.

Weights they published for the overall **bike** grade:

| Partial grade | Competition bike | Endurance and gravel |
| --- | ---: | ---: |
| Weight (complete bike, no pedals, lab scale, reference size) | 25% | 25% |
| Aerodynamics (GST wind tunnel) | 25% | not graded |
| Driving stability (frame **and** fork lateral stiffness) | 10% | 10% |
| Handlebar comfort | 5% | 10% |
| Saddle comfort | 10% | 20% |
| “Start” / bottom-bracket stiffness | 10% | 5% |
| Gears, brakes, tires (5% each) | 15% | 15% |
| Maintenance and adjustment | not graded | 10% |

Measurement definitions that matter if a parser ever ingests a TOUR table:

- **Front stiffness** is the frame and fork together, in N/mm, because modern forks are often not removable. They report the useful band as about 5 to 11 N/mm. At or above 9 N/mm they assign 1.0. At or below 5 N/mm they assign a poor mark. A direct conversion from the older head-tube torsion number (N·m/°) does not exist. Their January 2025 Ostro VAM test recorded 6.6 N/mm and grade 2.7, with an overall bike grade of 1.9. That bike was still a current competition bike. **6.6 N/mm is not a structural defect.**
- **Bottom-bracket stiffness** is N/mm under a pedalling-like fixture that lets the frame deform as it does on the road. Higher is better, then capped. The same Ostro test recorded 49 N/mm and grade 3.0. They treat that as a sprint-stiffness weakness, not as a safety failure.
- **Comfort** is vertical compliance. Lower N/mm is a better comfort grade. They assign 1.0 to handlebar values of 50 N/mm or less; suspension forks in that fixture can reach about 20 N/mm; 150 N/mm and above is poor. Saddle comfort is frame plus seatpost. Do not rank a high comfort N/mm as “stronger.”
- **Weight** is the complete bike in a standardized size (they use roughly 56–57 cm), not the bare frame. Their English pages sometimes say “complete wheel” for the German *Komplettrad*; the 6 860 g Ostro figure is the bike. They scale weight and aero so the two have comparable effect on speed for a reference ride of 1 000 m of climbing per 100 km, and they say aero optimization can offset up to almost 4 kg on that profile.
- **Aero** is a dynamic wind-tunnel pass: rider dummy, rotating wheels, moving legs, a range of yaw angles, reported in watts. It is not inferred from tube shape in a workshop.
- **Geometry** is measured on their own bench because manufacturer charts disagree. They invented the frame stack-to-reach quotient (STR) for “sporty versus upright,” and in 2024 added Stack+ / Reach+ / STR+ out to the hands on the hoods, at the lowest spacer position. They put STR+ roughly between 1.0 (very sporty) and 1.25 (very upright). The Ostro test lists frame STR 574/389 = 1.48 and STR+ 627/592 = 1.06. Frame STR and cockpit STR+ are different numbers. The engine must not compare them to the same band.

TOUR’s older articles also describe head-tube torsion in N·m/°, fork lateral stiffness separate from the frame, and a stiffness-to-weight conversation with the Zedler lab. Those series are retired for scoring purposes. If both an old N·m/° and a new N/mm are present, store them as different metrics.

### 4.2 Zedler

Zedler’s performance fixtures measure head-tube stiffness, bottom-bracket stiffness, fork stiffness, fork comfort, frame comfort, and a **stiffness-to-weight factor (STW)** on a frame weighed ready to assemble (hanger, clamp, cable guide). They warn that the number depends strongly on the mount and the measurement point, that they repeat mounts to get a value, and that magazine differences within ±2% are measurement scatter. Larger differences are size or design. Their safety lab tests to DIN EN ISO 4210, ISO 8098, ISO 11243, EN 15194, and DIN 79010.

STW is a design-efficiency figure for new high-end frames handled carefully. It is not a condition grade and not a safety grade.

### 4.3 EFBE TRI-TEST

EFBE’s TRI-TEST is a proprietary sequence: fatigue, a maximum static load with a permanent-set check, and an overload case, up to eight stages for a frame. It is deliberately stricter than ISO/EN and is scaled from a default total weight of 120 kg (130 kg EPAC, 135 kg S-pedelec), higher if the maker requests it. They prefer defined forces over drop tests because peak force also depends on the fixture. They also publish a non-destructive stiffness check as a way to see model variation and carbon damage.

A TRI-TEST seal on a **new** model is evidence for `iso_record.evidence = "lab_report"` only if the certificate also states the ISO clauses, or else it is stored as `other_lab: "efbe_tri_test"` and does not increase the ISO points beyond the reputable-brand point. It says nothing about the used frame’s crashes.

### 4.4 Rule for the engine

```text
lab_metrics = {
  source: "tour" | "zedler" | "efbe" | "other",
  bike_or_frame: "complete_bike" | "frameset",
  size_tested: string | null,
  values: { name: string, value: number, unit: string, grade: number | null }[]
}
```

Display `lab_metrics` beside the shop grade. Never add them into `structural`. Never convert a TOUR 2.7 into a letter. Never estimate aero from photos.

Weight measured **in the shop** is allowed to affect only the 0–2 market weight subscore, and only against the shop’s own band for that material, class, and size. An unscored weight stores the neutral point (1), not zero.

---

## 5. Used-market condition schemes

None of these is a structural standard. They are the language buyers already see. The mapping is for listing export, not for calculating the letter.

### 5.1 The Pro’s Closet

TPC’s published CPO process (their “Inside the Certified Pre-Owned process” and “Inspected. Tested. Trusted.” pages) is a gate plus a narrative grade:

- Multi-point inspection aimed at structural safety of frame and wheels. They state that heavy cosmetic damage and any structural damage do not reach the retail site.
- Worn consumables are replaced. The bike is test-ridden.
- Listings then describe cockpit, wheels, frame, drivetrain, and tires, with close-up photos of the blemishes they call out, plus measured geometry.
- Frame notes on actual listings are prose: “Excellent condition,” “light scratches on the down tube,” “moderate scratches on the chainstays,” together with axle, brake, and bottom-bracket standards.

TPC does not publish the numeric rubric behind that chart. Third-party writeups mention both a Fair / Good / Very Good / Excellent scale and a 7–10 scale on the theory that 1–6 never ships. Do not encode either unpublished scale. Encode only the public gate: **known structural damage is not a retail frameset**.

Their carbon article describes a coin/hammer tap as a screen, then a repair vendor (Broken Carbon) for frames they have already judged unsafe. A repaired carbon frame may be a legitimate object. In this schema it is a disclosed repair, letter-capped, never an S.

### 5.2 Pinkbike BuySell

Pinkbike is a private marketplace. The condition control on BuySell is selected by the seller for the **whole bike**:

| Pinkbike value | Meaning they assign |
| --- | --- |
| New - Unridden/With Tags | Unridden |
| Excellent - Lightly Ridden | Light use |
| Good - Used, Mechanically Sound | Used, claimed mechanically sound |
| Poor - Needs Servicing | Needs work |
| For Parts - Not Working / Unrideable | Not a bike to ride |

Nobody verifies it. Pinkbike’s own buyer guide tells the buyer to inspect the head tube, bottom bracket, chainstays, and down tube, to cycle suspension and feel for pivot play, and to have a shop look before paying. That guide is an inspection list, not a grade.

Export map, and only when the letter’s disposition is `ride` or `disclose`:

| Letter | Pinkbike export (frameset, not the whole bike) |
| --- | --- |
| S | Excellent - Lightly Ridden |
| A | Excellent - Lightly Ridden |
| B | Good - Used, Mechanically Sound |
| C | Good - Used, Mechanically Sound |
| D | Poor - Needs Servicing |
| F | For Parts - Not Working / Unrideable |

### 5.3 eBay

eBay’s condition names are marketplace item conditions, and they vary by category. They are not a bicycle inspection. Across the help page, the useful bins are:

| eBay condition | Definition they publish | Frameset export |
| --- | --- | --- |
| New / New with tags | Unused, undamaged | S and only if `mileage_claim = unridden` and cosmetic = 20 |
| New—open box / New without tags | Unused, may lack packaging | S with cosmetic ≥ 18 and a documented “built, unridden” note; otherwise do not use “new” |
| Used / Pre-owned - Excellent | Used, excellent, show the wear | A, or S if the listing text admits it is used |
| Pre-owned - Good | Gentle use, light scratches | B |
| Pre-owned - Fair | Significant wear, scratches, dents | C or D, and never if a dent was structural |
| Certified / Excellent / Very Good / Good - Refurbished | Refurbished by a qualified seller, warranty language | Only if the shop’s own warranty matches the eBay definition. A grade letter does not make a bike “refurbished” |
| For parts or not working | Does not function, missing essential parts, or needs repair | F, and any D that is not rideable yet |

eBay will accept a cracked frame in “Used” if the seller types that. This engine must not.

### 5.4 REI Re/Supply

REI does not publish an Excellent/Good/Fair rubric for used bikes. Re/Supply’s public trade-in terms are a **binary screen**, and they are useful as a cross-check:

- Bike trade-in is in store, by the original purchaser, within three years of purchase.
- The bike is complete and functional. Replaced parts must be of equivalent quality. Upgrades are not paid extra.
- Visible wear, scratches, scuffs, and stickers are allowed.
- **Not eligible:** dents, bends, or cracks in the frame, wheels, or any component; paint that is not the original paint; major rust, oxidation, or corrosion.

So REI’s buy threshold is close to “no structural deduction for dents, bends, cracks, or perforation, and no non-original paint.” Their screen is stricter on repaint than this rubric. This rubric will still **grade** a documented repaint; REI’s published trade-in terms say they will not **buy** it. Do not call a letter-B repaint “REI Re/Supply eligible.”

### 5.5 Bicycle Blue Book and local shops

There is no shared local-shop standard. Many shops collapse everything into the Bicycle Blue Book tiers, which BBB defines as:

| BBB tier | Their definition |
| --- | --- |
| Excellent | Light use, minimal wear, no cosmetic damage, nothing needs replacement |
| Very Good | Moderate use, light scuffs, mechanically sound, nothing needs replacement |
| Good | Regular use, visible wear; consumables may need replacement; still safe |
| Fair | Heavy use, significant wear, may have rust, dents, or faded paint; may need repair to be reliable |

BBB folds cosmetics, components, and structure into one tier, and the Fair tier explicitly allows dents. This schema must not. A dent that creases an aluminum tube can be BBB “Fair” and letter `F` here at the same time.

Local-shop practice this rubric replaces:

1. A safety decision: sell as a bike, sell as a project, or scrap.
2. A cosmetic sentence.
3. A compatibility note (axle, brake, BB) that is often missing from the price guide.

Suggested shop-counter language:

| Letter | Say this | Do not say this |
| --- | --- | --- |
| S | Inspected frameset, no structural findings, current interfaces, geometry checked | “ISO certified” or “UCI certified” unless those records exist |
| A | Structurally sound, minor finish wear | “Mint” if cosmetic is under 18 |
| B | Sound, normal use, see notes | “Perfect” |
| C | Rideable, disclosed wear or older standards | “No issues” |
| D | Not ready for the floor; needs the work listed | “Good condition” |
| F | Not for sale as a rideable frameset | Any rideable-bike adjective |

---

## 6. Material-specific evaluation

Score the defect, not the material’s reputation. The material changes what a defect looks like, whether it gives warning, and whether a repair can clear it.

### 6.1 Carbon (fiber-reinforced polymer)

Carbon can lose fibers internally while the paint still looks continuous. Trek’s composite inspection note is the right consumer warning: after a high load, look for scratches, gouges, loss of rigidity, and delamination, and listen for noises; if there is doubt, do not ride. Their tap-test instruction is: clean the part, tap the suspect area and a known-good area of a similar section with a coin, and stop riding if the sound is hollow or dead rather than a hard tap.

Limits of that test, which the software must show the inspector:

- A consistent ring does not prove the frame is sound. Deep delamination, damage under thick paint, and bonded joints ring oddly even when new.
- A local dull tap is a finding, not a diagnosis. It opens `CARBON_IMPACT_UNRESOLVED` until a qualified composite inspection clears it. Ultrasonic and instrumented tap hammers, as used by specialist repair shops, are outside a normal workstand.
- Exposed or frayed fiber, soft or crushed laminate, a wrinkle that was not in the mold line, or spiderwebbed paint over an impact is enough for a hard fail without waiting for a tap.

Other carbon-specific checks:

- Clamp zones: steerer under the stem, seatpost clamp, thru-axle and hanger inserts, bottle-boss areas that have been overtorqued.
- Ports and internal-routing holes: cracks radiating from a hole.
- Heat and abrasion: a chain that has sawn into a stay, or a tire that has abraded a stay, can reach fiber. Seven Cycles documents a muddy gravel race wearing through chainstay paint into carbon in one day. Fiber showing from abrasion is `FIBER_EXPOSED`, same as a crash gouge.
- Galvanic corrosion around aluminum inserts shows as white residue and a loose insert. A loose bonded insert is a structural finding.
- Repairs can be legitimate when a specialist scarfs out the damage and replaces the laminate. The shop grades the **documentation**, not the paint job. Undocumented carbon repair is a hard fail. Documented repair with a written report caps the letter (see gates) and forces disposition `disclose`.
- Forks after a front impact are a replacement, not a repair candidate, unless a composite specialist writes that the steerer and crown were cleared. Default is `FORK_STRUCTURAL`.

“Condition 1” in some owner’s manuals means a light performance frame with a short intended life and a real chance of crash damage. Record it as a warranty fact. Do not auto-fail the frame for being Condition 1.

### 6.2 Aluminum

Aluminum warns by bending, then cracks, usually at welds and the heat-affected zone: chainstay near the BB, dropout, head-tube gusset, brake boss.

- A smooth shallow dent in the middle of a tube is a deduction.
- A crease, a dent at a joint, or paint cracked along a weld is treated as a crack until dye penetrant says otherwise. If the shop cannot do that check, the unresolved paint-crack deduction and the evidence cap both apply.
- Do not plan on welding a heat-treated frame back to original strength in a bike shop. Default disposition for a cracked aluminum frame is `reject`. A framebuilder can override to `repair_hold` only with a written repair plan; the letter stays `F` until the repair is done and alignment is checked.
- Cold-setting alignment on aluminum is not routine. Measurable misalignment is `ALIGNMENT_UNCORRECTABLE` unless a builder accepts it in writing.
