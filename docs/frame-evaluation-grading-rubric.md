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
- Corrosion at the BB shell, under a steel bolt, or inside a seat tube can perforate. Perforation is a hard fail. Surface oxidation under chipped paint is cosmetic plus a small structural deduction only when it is truly surface.

### 6.3 Steel

Steel is the material most likely to be both dented and still repairable.

- A smooth dent is a deduction, not a fail, if there is no crease and no crack at the lug or weld.
- Rust is the usual end of life. Surface rust at dropouts is a deduction. Scale inside the seat tube, a perforated chainstay, or bubbling that has lifted a lug is a hard fail (`TUBE_PERFORATION` or `CRACK`).
- A qualified framebuilder can replace a tube or rebraze a lug. Until that work is done and the frame is aligned, letter is `F` with disposition `repair_hold` and structural floor 6, not 0.
- A completed, documented steel repair with alignment checked uses the ordinary deduction `documented_metal_repair_aligned` (4 points), not a hard fail. Disposition stays `disclose`. Letter cannot be S.
- Fillet-brazed and lugged joints need the loupe at the edge of the lug, where cracks hide under paint.

### 6.4 Titanium

Titanium does not rust in the steel sense. It still cracks at contaminated welds, and it dents.

- Weld color is not a pass/fail by itself. Straw, blue, or white welds are a prompt to look closer and to record photos, not an automatic deduction.
- Seatpost seizure is common and can damage the seat-tube bore. Galling or a torn bore is a structural deduction; a stuck post that has not damaged the tube is a service note.
- A crack in titanium is a specialist weld repair with internal purge, or it is scrap. Same floor rules as steel, but only if the shop has a named titanium builder. Otherwise disposition `reject`.
- Unknown no-name titanium is a market and standards problem (weld quality, serial, warranty), not an automatic structural fail. Inspect the welds as if they were suspect: loupe every tube junction.

### 6.5 Material entry rules

```text
material = "carbon" | "aluminum" | "steel" | "titanium" | "magnesium" | "mixed" | "unknown"
```

- `unknown` caps structural at 26 and letter at B until the material is identified. A magnet separates steel (sticks) from aluminum, titanium, and carbon (do not stick). It does not separate aluminum from titanium. Mixed carbon/aluminum frames are `mixed`, and the carbon rules apply to every composite part, including the fork and the dropouts if they are bonded.
- Magnesium exists on a few production frames. Treat cracks and corrosion as aluminum-severe: any crack is `reject`. Do not improvise a repair score.

---

## 7. Workshop intake checklist

Every item is a field the inspector sets. The score is a function of those fields. Free text does not change the score unless it is also a code.

### 7.1 Identity, before any judgment

| id | Record | Fail or cap if skipped |
| --- | --- | --- |
| `id_brand_model` | Brand, model, model year if known, size label | Standards identity points drop |
| `id_serial` | Exact characters and a photo of the serial | Identity points drop from 2 to 1. Do not invent a counterfeit from “serial not where I expected”; formats differ |
| `id_material` | Material, confirmed or still `unknown` | Cap in §6.5 if unknown |
| `id_use_class` | Shop class in §8 | Geometry cannot be “verified” |
| `id_recall` | Search CPSC recalls and EU Safety Gate by brand, model, year; record “none found” or the recall id | Skipped search caps letter at B |
| `id_stolen` | Bike Index or equivalent serial search | A hit sets `sale_blocked`, disposition `hold` |
| `id_sticker_photos` | Photos of UCI sticker, warning labels, and any sticker that covers a joint, **before** removal | Missing pre-removal photo plus a peeled sticker is an evidence gap |

Recall rule: an open recall that matches model and serial range, with no documented remedy, is hard fail `RECALL_OPEN`. Example of why the lookup is mandatory: the 2016 CPSC recall of Focus Spine mountain bikes for a seatstay/linkage that could let the frame collapse. The engine stores the result of the search. It does not ship with a frozen recall list.

Counterfeit signs, any two of which set `counterfeit_suspected`: serial format contradicted by the brand’s public format, logo or font that does not match the claimed year, UCI sticker not on the list, decals that belong to a different model, weight wildly off a known frameset with no repair explanation, molded-in size that does not match the catalog. One sign is a finding, not a block.

### 7.2 Zones that must be seen

A zone not inspected sets `inspection_incomplete` and the structural cap of 26. Zones:

1. Head tube and all junctions with top tube and down tube.
2. Down tube, including the outer face that sees rocks and the BB end.
3. Top tube.
4. Seat tube, seat cluster, and clamp slot.
5. Chainstays, bridge, and tire-side faces.
6. Seatstays.
7. Bottom-bracket shell, threads or bores.
8. Rear dropouts, hanger, and axle threads.
9. Brake mounts or rim-brake bosses, front and rear.
10. Fork blades, crown, and dropouts.
11. Steerer, including the stem-clamp band and the crown-race seat. Drop the stem.
12. Suspension pivots, yokes, and shock mounts, if any.

**Stickers.** Factory decals stay, but the inspector flexes them and looks along their edges for a crack running underneath. Non-factory stickers on a junction, the down tube, a chainstay, the crown, or the BB come off during intake. If the owner refuses, set `stickers_not_lifted` (structural cap 28) and do not award letter S or A.

**Repaint.** A non-original finish that covers joints sets `repaint_hiding_joints` (structural cap 24) until the joints are stripped or otherwise cleared. A high-quality respray that still allows inspection is a cosmetic deduction only, plus disclosure.

### 7.3 Visual findings

| Look for | Code if present | Severity |
| --- | --- | --- |
| Crack in a tube, weld, lug, bond, or insert, any length | `CRACK` | Hard fail |
| Spiderweb or crazed paint at an impact, carbon | `CARBON_IMPACT_UNRESOLVED` | Hard fail until cleared |
| Dull tap versus the adjacent laminate on the same tube | `CARBON_IMPACT_UNRESOLVED` | Hard fail until cleared |
| Exposed, frayed, or powdered fiber | `FIBER_EXPOSED` | Hard fail |
| Crushed or soft laminate | `DELAM_CONFIRMED` | Hard fail |
| Confirmed delamination from a specialist | `DELAM_CONFIRMED` | Hard fail |
| Paint crack following a metal weld, dye penetrant not done | `PAINT_CRACK_AT_JOINT` | Deduction 6, and it stays a review item |
| Dye penetrant confirms no crack | clear `PAINT_CRACK_AT_JOINT` | No structural deduction |
| Smooth dent, steel or titanium, no crease | `DENT_SMOOTH_STEEL_TI` | Deduction 2 |
| Smooth dent, aluminum, mid-tube, no crease | `DENT_SMOOTH_AL` | Deduction 3 |
| Creased dent or dent at a joint, no crack proven | `DENT_CREASE` | Deduction 10. Aluminum also flags manual review |
| Surface rust, no perforation | `RUST_SURFACE` | Deduction 3 |
| Perforated tube or rusted-through lug | `TUBE_PERFORATION` | Hard fail |
| Undocumented structural repair | `REPAIR_UNDOCUMENTED` | Deduction 12. Carbon: hard fail instead |
| Documented metal repair, aligned | `REPAIR_METAL_DOCUMENTED` | Deduction 4, disclose, letter max A |
| Documented carbon repair with written NDT or specialist report | `REPAIR_CARBON_DOCUMENTED` | Deduction 8, disclose, letter max A |
| Documented carbon repair without that report | `REPAIR_CARBON_UNDOCUMENTED` | Hard fail |

Tap-test procedure to show on the inspection screen, adapted from Trek’s composite note:

1. Clean the area.
2. Tap a known-good section of the **same** tube first.
3. Tap the suspect area in a small grid.
4. Record “consistent” or “duller than adjacent.”
5. The button label is “Screen,” never “NDT passed.”

### 7.4 Functional findings

| Check | How | Code |
| --- | --- | --- |
| Bottom bracket | Install the intended spindle or the existing crank to torque. Rock the crank laterally | `BB_BEARING_PLAY` is service, structural 0. Movement of the shell or a visible crack is `BB_SHELL_DAMAGE` (deduction 8) or `CRACK` |
| BB threads or bores | Chase-and-face judgment, or a no-go on a press fit | `BB_THREADS_CHASEABLE` −1, or `BB_THREADS_UNSERVICEABLE` −6. Oval press-fit bore is `BB_SHELL_DAMAGE` |
| Headset | Stem installed, front brake on, rock the bike | Bearing play is service. Cup or bearing-seat damage is `HEADSET_SEAT_DAMAGE` −3 |
| Steerer | Stem off. Straightedge or roll the steerer. Loupe the clamp band | `STEERER_SCORE` −2 if round and uncracked. `STEERER_BENT` or `STEERER_CRACK` hard fail |
| Dropouts | Axle threads in by hand, faces parallel, wheel centers | Light face marks `DROPOUT_SCORE` −1. Will not retain an axle, cracked, or insert pulling out: hard fail `DROPOUT_WONT_RETAIN` or `CRACK` |
| Hanger | Alignment gauge | Replaceable bent hanger `HANGER_BENT_REPLACEABLE` −1. Integral bent hanger `HANGER_INTEGRAL_BENT` −5 |
| Brake mounts | Bolts to spec, no paint split at the root of the tab | Repairable threads −3 `BRAKE_THREADS_REPAIRABLE`. Cracked tab hard fail |
| Alignment | String or alignment gauge. Record asymmetry in mm | Correctable steel/ti `ALIGNMENT_CORRECTABLE` −3. Asymmetry over 3 mm `ALIGNMENT_OVER_3MM` −5. Aluminum or carbon that cannot be cold-set safely: hard fail `ALIGNMENT_UNCORRECTABLE` |
| Fork match | Axle-to-crown and offset versus the frame’s design, if known | Mismatch over 10 mm axle-to-crown, or unknown fork on a carbon frame, `FORK_SPEC_UNKNOWN` −2 and geometry consistency fails |
| Pivots | Wheel out, flex the rear end laterally; cycle the suspension | Play from bearings is service. Play from an elongated pivot or a cracked yoke: −2 per pivot, max −4, code `PIVOT_PLAY`. A cracked yoke is `CRACK` |
| Seatpost | Insert to minimum and clamp to torque | Bore damage `SEAT_BORE_DAMAGE` −3. A normal slip is service |

Functional checks require the frame in the stand. `inspection_mode = "photos_only"` cannot create these codes except as “not seen,” and it applies the photos cap.

### 7.5 Evidence caps

Apply after deductions, and after hard-fail floors. A cap never raises a score.

| Condition | Structural cap | Other effect |
| --- | --- | --- |
| `inspection_mode = photos_only` | 22 | Letter max B. Interface points in standards cannot exceed 1 each |
| `stickers_not_lifted` | 28 | Letter max B |
| `repaint_hiding_joints` | 24 | Letter max B |
| `inspection_incomplete` | 26 | Letter max B |
| `recall_search_skipped` | none | Letter max B |
| `material = unknown` | 26 | Letter max B |

### 7.6 When to stop and send it out

Send the frameset to a composite specialist, and set disposition `quarantine`, if any of these is true: disclosed crash, dull tap, spiderweb paint, fiber show, previous carbon repair without a report, or a high-value carbon frame the shop intends to warrant and the history is unknown. Do not “clear” it in software to win the argument.

Send metal to dye penetrant when paint is cracked at a weld. Until that happens, keep `PAINT_CRACK_AT_JOINT`.

---

## 8. Geometry fit-for-use

### 8.1 Definitions

Measurements are millimeters and degrees. Head angle is the shop-chart convention: degrees of the steering axis **above the horizontal**. 73° is a steep road head tube. 64° is a slack mountain head tube.

- **Stack:** vertical distance from the bottom-bracket center to the top of the head tube, at the head-tube centerline.
- **Reach:** horizontal distance from the bottom-bracket center to that same point.
- **STR:** `stack / reach`. Size-independent enough to classify a frame. Absolute stack and reach are not, because they mostly encode size.
- **Fork offset (rake):** perpendicular distance from the steering axis to the front-axle center.
- **Trail:** horizontal distance, at the ground, from the steering-axis intersection back to the tire contact. ISO 4210-2 has an informative steering-geometry annex; it is not a pass/fail test. Use the ordinary mechanical-trail formula, and store the radius you used:

```text
trail_mm = (radius_mm * cos(head_angle) - offset_mm) / sin(head_angle)
```

with `head_angle` converted to radians. Worked check: 73°, offset 45 mm, radius 340 mm → trail 56.9 mm.

`radius_mm` is the loaded wheel’s rolling radius, not the bead-seat radius. The inspector may override it. Starting values if they do not:

| Wheel and tire | Starting radius |
| --- | ---: |
| 700 × 25 | 335 mm |
| 700 × 28 | 340 mm |
| 700 × 32 | 344 mm |
| 650b × 47 | 345 mm |
| 26 × 2.2 | 340 mm |
| 27.5 × 2.4 | 348 mm |
| 29 × 2.4 | 372 mm |

**STR+** (TOUR’s hand position, including stem and bar, lowest spacer) is optional and is **not** compared to the bands below. If both exist, store both.

### 8.2 Shop use classes

`shop_use_class` is what the frameset is being graded **as**. It is not always the decal on the down tube. If the measured geometry fits a neighbor class better, the engine fills `suggested_class` and still scores against the declared class, so a race frame mislabeled as endurance loses geometry points until someone corrects the declaration.

| `shop_use_class` | ISO type it may correspond to | Notes |
| --- | --- | --- |
| `road_race` | racing | Includes modern aero race bikes |
| `tt` | racing | Fit is aggressive; UCI list applies if it will be raced under UCI TT rules |
| `endurance_road` | racing | Still usually tested as a racing bicycle, despite the taller front end |
| `cyclocross` | racing | UCI applicable |
| `gravel` | none | Maker may have tested it as racing or as city/trekking. Do not invent which |
| `touring` | city_trekking | |
| `city` | city_trekking | |
| `xc` | mountain | |
| `trail` | mountain | |
| `enduro` | mountain, sometimes out of scope | If the maker sold it as a race enduro / park bike, set `iso_scope = out_of_scope` |
| `dh` | out of scope | ISO 4210 excludes this use |
| `dirt_jump` | out of scope | |
| `bmx` | out of scope | |

Adjacent classes, used only when STR or head angle misses the declared band:

```text
road_race:      endurance_road, tt, cyclocross
tt:             road_race
endurance_road: road_race, gravel, touring
gravel:         endurance_road, touring, cyclocross
touring:        gravel, endurance_road, city
city:           touring
cyclocross:     road_race, gravel
xc:             trail
trail:          xc, enduro
enduro:         trail, dh
dh:             enduro
dirt_jump:      xc
bmx:            dirt_jump
```

### 8.3 Bands (`geometry_bands_v1`)

These bands are configuration for this schema, not an ISO limit and not a fit calculator. They were set so that published “typical medium” ranges sit inside them, and so that a competition bike TOUR measured at STR 1.48 (Factor Ostro VAM, January 2025 test) still falls inside `road_race`. Overlap is intentional: a frame inside two bands is acceptable for either declared class.

STR, head angle, and trail are the scored dimensions. Trail bands assume the starting radii above.

| Class | STR | Head angle (°) | Trail (mm) |
| --- | --- | --- | --- |
| `road_race` | 1.35–1.50 | 72.0–74.0 | 52–64 |
| `tt` | 1.20–1.40 | 72.0–74.5 | 50–64 |
| `endurance_road` | 1.45–1.60 | 71.0–73.5 | 54–68 |
| `cyclocross` | 1.40–1.55 | 71.0–73.5 | 55–70 |
| `gravel` | 1.45–1.62 | 69.5–72.5 | 60–82 |
| `touring` | 1.55–1.75 | 70.0–73.0 | 55–80 |
| `city` | 1.55–1.80 | 69.5–72.5 | 55–85 |
| `xc` | 1.28–1.45 | 66.5–70.0 | 85–115 |
| `trail` | 1.22–1.40 | 64.0–67.5 | 110–140 |
| `enduro` | 1.18–1.36 | 62.5–65.5 | 125–155 |
| `dh` | 1.15–1.32 | 62.0–64.5 | 130–165 |
| `dirt_jump` | 1.20–1.45 | 68.0–72.0 | 70–110 |
| `bmx` | not scored | not scored | not scored |

`bmx` sets geometry confidence to `not_applicable`, geometry score 5, and does not fail consistency for short reach.

Plausibility window, outside of which consistency fails:

- Head angle, if present: 60.0–80.0 inclusive.
- Reach, if present: 330–530 mm, except `tt` which may be 330–500 and `dh` / `enduro` / `trail` which may be 380–530. BMX skips this window.
- Stack, if present: 450–750 mm.
- STR, if present: 1.10–1.90.
- Offset, if present: 30–70 mm.
- Wheel family versus class: road, tt, endurance, cyclocross use 700c or 650b; gravel and touring may also use 650b or 700c; mountain classes use 26, 27.5, or 29. A mismatch fails consistency.
- Manufacturer chart, if the shop loaded one: measured reach differs by more than 15 mm, or axle-to-crown differs by more than 10 mm.

### 8.4 Geometry points (0–10)

Let `str_pts` be 4 if STR is inside the declared band, 2 if it is inside an adjacent class band **or** within 0.05 of the declared band, else 0.

Let `ha_pts` be 3 if head angle is inside the band, 2 if within 0.5° of an edge, 1 if within 1.5°, else 0.

Let `trail_pts` be 2 if trail is inside the band, 1 if within 5 mm of an edge, else 0. If trail is under 15 mm or over 200 mm, set `trail_pts = 0`, fail consistency, and add finding `GEOMETRY_DATA_ERROR`.

`consistency_pts` is 1 if every plausibility check passes, else 0.

```text
if class == "bmx" or measured axes == 0:
    geometry = 5
    confidence = "not_applicable" if class == "bmx" else "unknown"
else if STR is known and head angle is known and trail is known:
    geometry = str_pts + ha_pts + trail_pts + consistency_pts
    confidence = "verified"
else:
    geometry = (str_pts if STR known else 2)
             + (ha_pts if head angle known else 1)
             + (trail_pts if trail known else 1)
             + consistency_pts
    confidence = "partial"
```

Measured axes: the STR pair counts as one, head angle counts as one. Trail needs head angle, offset, and radius.

`confidence != "verified"` caps the letter at A. `unknown` also uses geometry score 5, so a missing tape measure neither rewards nor destroys the frame.

This category is not a rider fit. A 52 cm frame with correct race geometry scores 10 for a rider who needed a 56. Store rider fit somewhere else.

---

## 9. Scoring model

### 9.1 Structural integrity (0–40)

Start at 40. Apply at most one deduction for each code that is present. Then apply caps. Then, if a hard fail is present, replace the result with the floor if the floor is lower.

Ordinary deductions:

| Code | Points off |
| --- | ---: |
| `DENT_SMOOTH_STEEL_TI` | 2 |
| `DENT_SMOOTH_AL` | 3 |
| `DENT_CREASE` | 10 |
| `RUST_SURFACE` | 3 |
| `PAINT_CRACK_AT_JOINT` | 6 |
| `REPAIR_UNDOCUMENTED` | 12 |
| `REPAIR_METAL_DOCUMENTED` | 4 |
| `REPAIR_CARBON_DOCUMENTED` | 8 |
| `BB_SHELL_DAMAGE` | 8 |
| `BB_THREADS_CHASEABLE` | 1 |
| `BB_THREADS_UNSERVICEABLE` | 6 |
| `DROPOUT_SCORE` | 1 |
| `HANGER_BENT_REPLACEABLE` | 1 |
| `HANGER_INTEGRAL_BENT` | 5 |
| `BRAKE_THREADS_REPAIRABLE` | 3 |
| `HEADSET_SEAT_DAMAGE` | 3 |
| `STEERER_SCORE` | 2 |
| `SEAT_BORE_DAMAGE` | 3 |
| `ALIGNMENT_CORRECTABLE` | 3 |
| `ALIGNMENT_OVER_3MM` | 5 |
| `FORK_SPEC_UNKNOWN` | 2 |
| `PIVOT_PLAY` | 2 each, maximum 4 |

`BB_BEARING_PLAY` and headset bearing play deduct 0.

Hard fails and floors:

| Code | Floor | Disposition |
| --- | ---: | --- |
| `CRACK`, `DELAM_CONFIRMED`, `FIBER_EXPOSED`, `STEERER_BENT`, `STEERER_CRACK`, `DROPOUT_WONT_RETAIN`, `TUBE_PERFORATION`, `RECALL_OPEN`, `ALIGNMENT_UNCORRECTABLE` | 0 | `reject`, except `RECALL_OPEN` which is `hold` until the remedy is documented |
| `CRACK` or `DENT_CREASE` on steel or titanium, and a named builder has marked it repairable, work not done | 6 | `repair_hold` |
| `CARBON_IMPACT_UNRESOLVED` | 8 | `quarantine` |
| `REPAIR_CARBON_UNDOCUMENTED` | 0 | `reject` |

If several hard fails apply, use the lowest floor. A quarantine that a specialist later clears removes `CARBON_IMPACT_UNRESOLVED` and the frame is rescored. The software does not clear it by itself.

```text
structural = 40 - sum(deductions)
structural = max(0, structural)
structural = min(structural, each applicable evidence cap)
if hard_fail:
    structural = min(structural, floor)
```

### 9.2 Cosmetic condition (0–20)

Start at 20. Cosmetics never create a hard fail. A crack through the paint is structural, not cosmetic.

| Code | Points off |
| --- | ---: |
| `FINISH_LIGHT_SCUFF` | 1 |
| `FINISH_CLEARCOAT_SCRATCH` | 2 |
| `FINISH_CHIPS_FEW` | 3 |
| `FINISH_CHIPS_MANY_OR_TO_MATERIAL` | 6 |
| `FINISH_CHAINSTAY_RUB` | 3 |
| `FINISH_HEEL_RUB` | 1 |
| `FINISH_DECALS_WORN` | 2 |
| `FINISH_STICKER_RESIDUE` | 2 |
| `FINISH_STICKER_BOMB` | 3 |
| `FINISH_CORROSION_STAIN` | 4 |
| `FINISH_FADE` | 3 |
| `FINISH_RESPRAY_POOR` | 6 |
| `FINISH_RESPRAY_QUALITY` | 2 |
| `FINISH_DENT_VISIBLE` | 3 |

`FINISH_CHIPS_FEW` is 1 to 5 small chips to primer. More than that, or any chip that shows bare material as a finish issue, is `FINISH_CHIPS_MANY_OR_TO_MATERIAL`. Do not apply both chip codes. Do not apply both respray codes.

```text
cosmetic = max(0, 20 - sum(cosmetic deductions))
```

On `photos_only`, if the inspector did not mark any finish code, still apply `FINISH_CLEARCOAT_SCRATCH` once. Unseen finish is not scored as pristine.

### 9.3 Standards and compatibility (0–15)

Award each row independently.

| Item | 2 points | 1 point | 0 points |
| --- | --- | --- | --- |
| Identity | Brand, model, size, material, and serial all recorded | Serial missing, the other four present | Any of brand, model, size, or material missing |
| Use class | — | `shop_use_class` set | Unset |
| ISO evidence | `lab_report` or `manufacturer_document` for the claimed type. **Or** class is deliberately `out_of_scope` / `epac` / `cargo` / `iso_8098` and that flag is set | Reputable identifiable brand and `model_year >= 2015`, no void, no document | Unknown, contradicted, or voided |
| UCI | — | Not a UCI class, **or** list check `matched_model_and_size`, **or** year &lt; 2011 and no sticker is claimed | UCI class and the list was not matched, or not checked |
| Axles | Front and rear standards known, threads and faces serviceable, a wheel centers | Known, but a face or thread needs ordinary chase | Unknown, or `DROPOUT_WONT_RETAIN` |
| Brakes | Interface known and a bolt holds to torque | Known, `BRAKE_THREADS_REPAIRABLE` | Unknown or cracked mount |
| Headset and steerer | Standard known, steerer straight, enough clamp length | Standard known, only `STEERER_SCORE` | Unknown, bent, or cracked |
| Bottom bracket | Standard known and serviceable | Known, `BB_THREADS_CHASEABLE` | Unknown, unserviceable, or shell damaged |
| Small parts | — | Seatpost diameter or proprietary shape, hanger standard, wheel size, and a tire-clearance note are all recorded | Any of those missing |

Maximum is 2+1+2+1+2+2+2+2+1 = 15.

`photos_only`: each of axles, brakes, headset, and bottom bracket is capped at 1, and only if the standard is visible in a photo. Serviceability cannot be awarded from a photo.

A voided ISO claim (`isoVoided`, or `iso_record.voids` not empty) scores 0 in the ISO cell. It does not get the 2-point cell, and it does not get the reputable-year point either. Damage voids the inherited certificate; it does not, by itself, zero axles, brakes, headset, or bottom bracket.

### 9.4 Brand and market desirability (0–15)

This category is deliberately small. The shop maintains the brand table. The rubric fixes the criteria so two clerks use the same rung.

**Brand support (0–6)**

| Points | Criterion |
| --- | --- |
| 6 | Manufacturer identified, and either still supports the model or the model is a known catalog bike with a normal parts market |
| 4 | Identified and discontinued, but tubes and interfaces are ordinary standards a shop can buy |
| 2 | Identified department-store or house brand, or a boutique frame with no paperwork |
| 0 | Cannot identify the maker, **or** `counterfeit_suspected` |

**Generation (0–5)**, judged for the declared class:

| Points | Criterion |
| --- | --- |
| 5 | Current common wheel, axle, brake, and headset, no frame modification |
| 3 | Buildable with the previous common generation: quick-release, straight 1-1/8 steerer, rim brake or early disc, threaded external bottom bracket |
| 1 | Only obsolete or scarce parts: 1 inch threaded steerer, 126 mm spacing, freewheel-only, 26 inch as the only possible wheel, or a proprietary suspension mount with no spares |
| 0 | Cannot be assembled into a safe bicycle without modifying the structure |

**Weight (0–2)**

| Points | Criterion |
| --- | --- |
| 2 | Shop scale, and the frameset is inside or under the shop’s band for this material, class, and size |
| 1 | Not weighed, or no band loaded. This is the default |
| 0 | Heavier than the band by the shop’s own margin, and the class is not touring, city, or cargo |

**Demand (0–2)**

| Points | Criterion |
| --- | --- |
| 2 | Shop demand table says this model/size is a fast seller |
| 1 | No table entry. Default |
| 0 | Table says slow, or the frame is a dead proprietary ecosystem |

```text
market = brand_support + generation + weight + demand    # 0..15
```

Missing data must land on 0 / 3 / 1 / 1 only when those rows say so. Do not award 6 or 5 or 2 from optimism. An unidentified modern-looking carbon frame is brand 0, generation 5 if the interfaces are current, weight 1, demand 1.

### 9.5 Geometry

Computed only by §8.4. Range 0–10, or exactly 5 when unknown or not applicable.

### 9.6 Fork absent

If no fork is present and the frame does not have an integrated fork:

- Structural cap 24, in addition to any lower cap.
- Front axle and fork-related headset points follow the 0 column unless the head tube itself was inspected and the steerer standard is known from the head tube (integrated headset cup standard can still score the headset cell on the frame side).
- Letter maximum C.
- Disposition at best `service` until a fork is chosen and `FORK_SPEC_UNKNOWN` is either cleared or accepted.

---

## 10. Letter grades and gates

### 10.1 Bands on the point total

| Points | `raw_letter` |
| --- | --- |
| 95–100 | S |
| 85–94 | A |
| 75–84 | B |
| 65–74 | C |
| 50–64 | D |
| 0–49 | F |

### 10.2 Gates

Apply in this order. Each gate sets a maximum letter. The final letter is the lower of `raw_letter` and every maximum.

| # | Condition | Maximum letter |
| --- | --- | --- |
| 1 | Any hard fail whose floor is 0, or `counterfeit_suspected` | F |
| 2 | `CARBON_IMPACT_UNRESOLVED` or repairable-metal floor 6 | F |
| 3 | `structural < 18` | F |
| 4 | `structural < 26` | D |
| 5 | `structural < 30` | C |
| 6 | `structural < 34` | B |
| 7 | `photos_only`, `stickers_not_lifted`, `repaint_hiding_joints`, `inspection_incomplete`, `recall_search_skipped`, or `material = unknown` | B |
| 8 | Fork absent | C |
| 9 | Geometry confidence `unknown` or `partial` | A |
| 10 | Any documented repair code | A |
| 11 | Letter would be S, but structural &lt; 38, or cosmetic &lt; 16, or geometry confidence is not `verified`, or inspection is not in person | A |

Gate 11 is an extra S rule: S requires structural at least 38, cosmetic at least 16, verified geometry, and a complete in-person inspection, even if the point total is 95 or more.

`counterfeit_suspected` forces F and `sale_blocked`. The points are still stored so a later identity correction can rescore.

### 10.3 Disposition

Disposition is how the shop handles the object. It is not a second grade.

| Situation | Disposition |
| --- | --- |
| Letter S, A, or B, no repair code, no open service deduction that the shop marked “must fix before sale” | `ride` |
| Letter C, structural ≥ 30, no hard fail | `disclose` |
| Letter C and structural &lt; 30, or letter D | `service` |
| Documented repair, otherwise rideable | `disclose` (never silent `ride`) |
| Steel/titanium repair not yet done | `repair_hold` |
| `CARBON_IMPACT_UNRESOLVED` | `quarantine` |
| Hard fail floor 0, not a recall | `reject` |
| Open recall, stolen hit, or counterfeit | `hold` |

Service deductions the shop may mark “must fix before sale”: unserviceable threads, integral bent hanger, alignment over 3 mm, unknown fork spec. If any of those is marked blocking, disposition is at best `service` even when the letter is B.

### 10.4 What each letter means on the floor

| Letter | Retail meaning |
| --- | --- |
| S | In-person inspection, no meaningful structural deduction, finish mostly clean, interfaces current or fully known, geometry matches the declared class. Uncommon on purpose. |
| A | Sound frameset a shop can sell without a structural disclaimer. Finish wear or a missing ISO PDF keeps it out of S. |
| B | Sound and honest. Visible use, previous-generation parts, or a small structural deduction such as a light dropout mark or a smooth steel dent. |
| C | Rideable only with disclosure: heavier wear, a documented repair, obsolete-but-buildable standards, or geometry that does not match the sticker. |
| D | Do not put it on the floor. Photos-only carbon, incomplete inspection, or several real deductions. |
| F | Do not sell as a bicycle frameset. Project, quarantine, warranty return, or scrap. |

---

## 11. Worked examples

Numbers below are inputs. The arithmetic is the rubric, not a second opinion. Market “demand” uses the default 1 unless noted. ISO “reputable” is the 1-point cell.

### 11.1 S — 2020 carbon race frameset, in person

Declared `road_race`. Full zones. No impact history. Tap consistent with adjacent laminate. UCI list matched for model and size. Manufacturer test statement on file for racing. Serial recorded.

Stack 527, reach 380, STR 1.387, head angle 72.5°, offset 45 mm, radius 340 mm. Trail = (340 × cos 72.5° − 45) / sin 72.5° = 60.0 mm. STR, head angle, and trail are all inside `road_race`. Consistency passes.

| Category | Computation | Score |
| --- | --- | ---: |
| Structural | No codes | 40 |
| Cosmetic | `FINISH_LIGHT_SCUFF` 1, `FINISH_HEEL_RUB` 1 | 18 |
| Standards | Identity 2, class 1, ISO document 2, UCI match 1, axles 2, brakes 2, headset 2, BB 2, small parts 1 | 15 |
| Market | Brand 6, generation 5, weighed in band 2, demand 1 | 14 |
| Geometry | 4+3+2+1, verified | 10 |
| **Total** | | **97** |

`raw_letter` S. Gate 11 passes (structural 40, cosmetic 18, verified, in person). Letter **S**, disposition **ride**. Listing phrase: inspected frameset, light heel rub and small scuffs. Not “new.”

### 11.2 A — 2016 aluminum endurance, rim brake, quick release

In person. `DROPOUT_SCORE` only. Chips to primer, five or fewer, plus clearcoat scratches. ISO cell is the reputable-brand point, not a PDF. Endurance geometry inside the band (STR 1.52, head angle 72°, trail 60).

| Category | Computation | Score |
| --- | --- | ---: |
| Structural | 40 − 1 | 39 |
| Cosmetic | 20 − 3 − 2 | 15 |
| Standards | 2+1+1+1+2+2+2+2+1 | 14 |
| Market | Brand 6, generation 3, weight default 1, demand 1 | 11 |
| Geometry | verified | 10 |
| **Total** | | **89** |

Letter **A**. Structural gate allows up to S; the total does not. Disposition **ride**. Say “very light dropout marks, rim brake, quick release.”

### 11.3 B — steel tourer, smooth dent, surface rust, no serial

`DENT_SMOOTH_STEEL_TI`, `RUST_SURFACE`, no perforation, lugs sound, alignment good. Cosmetic corrosion stain, a few primer chips, visible dent. Touring geometry inside the band. Identity missing serial only.

| Category | Computation | Score |
| --- | --- | ---: |
| Structural | 40 − 2 − 3 | 35 |
| Cosmetic | 20 − 4 − 3 − 3 | 10 |
| Standards | Identity 1, class 1, ISO reputable 1, UCI not applicable 1, axles 2, brakes 2, headset 2, BB 2, small parts 1 | 13 |
| Market | Brand 4, generation 3, weight 1, demand 1 | 9 |
| Geometry | verified | 10 |
| **Total** | | **77** |

Letter **B**, from the 77-point total. Structural 35 does not by itself cap the letter at B (that cap starts below 34); the finish, the missing serial, and the older parts generation are what keep it out of A. Disposition **ride**, with the dent and rust in the note. Not REI-trade-in-eligible under their published “no dents, no major rust” screen; the letter does not claim that it is.

### 11.4 F — carbon trail frame, dull tap after a disclosed crash

In person, full inspection, no fiber showing. `CARBON_IMPACT_UNRESOLVED`. Specialist not yet involved. Other categories are scored so a later clear can be recomputed: cosmetic 15 (scuff and a few chips), standards 14, market 13 (not weighed), geometry 10.

Structural floor 8. Point total 8+15+14+13+10 = **60**. Gates 2 and the floor force letter **F**. Disposition **quarantine**.

If the specialist reports no delamination and the scuff did not reach fiber, delete `CARBON_IMPACT_UNRESOLVED` and rescore. Structural returns to 40 unless another code remains. The letter can then be an A or a B. The crash disclosure stays in the note.

### 11.5 F — cracked aluminum chainstay

`CRACK`. Floor 0. Disposition **reject**. Cosmetic 12, standards 12 (axle cell is 0 because the dropout side of that stay is not serviceable), market 13, geometry 10. Point total **47**. Letter **F** by gate 1 and by the point band. Do not export as BBB Fair. Fair is for rusty, dented, still-intact bikes.

### 11.6 B with disclosure — steel frame after a documented tube repair

Repair done, builder named, alignment checked. Code `REPAIR_METAL_DOCUMENTED` only. Quality respray, joints still inspectable, light clearcoat scratches.

| Category | Computation | Score |
| --- | --- | ---: |
| Structural | 40 − 4 | 36 |
| Cosmetic | 20 − 2 − 2 | 16 |
| Standards | serial missing: 1+1+1+1+2+2+2+2+1 | 13 |
| Market | 4+3+1+1 | 9 |
| Geometry | verified | 10 |
| **Total** | | **84** |

`raw_letter` B. Repair gate caps at A, so the letter stays **B**. Disposition **disclose**, not `ride`. The listing must say a tube was replaced and name the builder.

### 11.7 D — photos only, stickers covering the joints, brand unknown

No crack is visible in the photos, so there is no hard fail. Material is visibly carbon, so the material cap does not apply, but brand and model are unknown. Caps: photos 22 and stickers 28, so structural 22. Unseen finish forces the clearcoat deduction: cosmetic 18. Standards under the photo cap: identity 0 (brand missing), class 1, ISO 0, UCI not applicable 1, each interface 1, small parts 0 → 6. Market: brand 0, generation 5, weight 1, demand 1 → 7. Geometry unknown → 5.

Point total 22+18+6+7+5 = **58**. Structural 22 limits the letter to **D** (the structural cap at D starts below 26). Disposition **service**. The correct next action is an in-person inspection, not a price.

---

## 12. Pseudocode

Normative for schema `frameset-grade/1.0`. This is the scoring procedure, not an application.

```text
const BANDS = { /* geometry_bands_v1 table */ }
const ADJACENT = { /* section 8.2 */ }

function gradeFrameset(input):
    findings = []

    structural = 40
    for code in input.structuralCodes:
        structural -= DEDUCTION[code]          # 0 if the code is a pure hard fail
    structural = clamp(structural, 0, 40)
    structural = applyEvidenceCaps(structural, input)

    floor = null
    if input.hardFails includes a zero-floor code:
        floor = 0
    if repairable steel/ti crack or crease, not yet repaired:
        floor = min(floor ?? 6, 6)
    if "CARBON_IMPACT_UNRESOLVED" in input.hardFails:
        floor = min(floor ?? 8, 8)
    if floor != null:
        structural = min(structural, floor)

    if input.forkPresent == false and frame has no integrated fork:
        structural = min(structural, 24)

    cosmetic = 20
    if input.inspectionMode == "photos_only" and input.cosmeticCodes is empty:
        cosmetic -= 2
    for code in unique(input.cosmeticCodes):
        cosmetic -= COSMETIC_DEDUCTION[code]
    # chip codes are mutually exclusive; respray codes are mutually exclusive
    cosmetic = clamp(cosmetic, 0, 20)

    standards = scoreStandards(input)          # section 9.3, photo caps inside
    market    = scoreMarket(input)             # section 9.4
    geometry, confidence, suggested = scoreGeometry(input)

    points = structural + cosmetic + standards + market + geometry
    raw = band(points)                         # section 10.1
    letter = applyGates(raw, structural, cosmetic, confidence, input)

    return {
        schema: "frameset-grade/1.0",
        structural, cosmetic, standards, market, geometry,
        geometryConfidence: confidence,
        suggestedClass: suggested,
        pointsTotal: points,
        rawLetter: raw,
        letter: letter,
        disposition: disposition(letter, structural, input),
        saleBlocked: input.stolenHit or input.counterfeitSuspected or input.recallOpen,
        findings: findings
    }

function scoreGeometry(input):
    if input.shopUseClass == "bmx" or not hasAnyMeasuredAxis(input):
        return 5, (input.shopUseClass == "bmx" ? "not_applicable" : "unknown"), null

    strPts = null
    if input.stack and input.reach:
        str = input.stack / input.reach
        strPts = strPoints(str, input.shopUseClass)    # 4, 2, or 0

    haPts = null
    if input.headAngle != null:
        haPts = haPoints(input.headAngle, input.shopUseClass)

    trailPts = null
    if input.headAngle != null and input.offset != null and input.radius != null:
        trail = (input.radius * cos(rad(input.headAngle)) - input.offset) / sin(rad(input.headAngle))
        if trail < 15 or trail > 200:
            trailPts = 0
            fail consistency
        else:
            trailPts = trailPoints(trail, input.shopUseClass)

    consistency = plausibility(input) ? 1 : 0          # section 8.3

    if strPts != null and haPts != null and trailPts != null:
        return strPts + haPts + trailPts + consistency, "verified", suggestedClass(input)
    return (strPts ?? 2) + (haPts ?? 1) + (trailPts ?? 1) + consistency,
           "partial", suggestedClass(input)

function band(points):
    if points >= 95: return "S"
    if points >= 85: return "A"
    if points >= 75: return "B"
    if points >= 65: return "C"
    if points >= 50: return "D"
    return "F"

function lowest(a, b):
    order = ["S", "A", "B", "C", "D", "F"]
    return order[max(index(order, a), index(order, b))]
```

`applyGates` implements the table in §10.2 in order, using `lowest`. `disposition` implements §10.3.

Suggested TypeScript shape for the input, so the procedure has a place to live. This is the contract, not a service:

```ts
type Letter = "S" | "A" | "B" | "C" | "D" | "F";

type ShopUseClass =
  | "road_race" | "tt" | "endurance_road" | "cyclocross"
  | "gravel" | "touring" | "city"
  | "xc" | "trail" | "enduro" | "dh" | "dirt_jump" | "bmx";

interface FramesetInspection {
  inspectionMode: "in_person" | "photos_only";
  material: "carbon" | "aluminum" | "steel" | "titanium" | "magnesium" | "mixed" | "unknown";
  shopUseClass: ShopUseClass | null;
  modelYear: number | null;
  identity: { brand: boolean; model: boolean; size: boolean; material: boolean; serial: boolean };
  zonesInspected: string[];                 // the 12 zone ids
  stickersNotLifted: boolean;
  repaintHidingJoints: boolean;
  recallSearch: "clear" | "open" | "skipped";
  stolenHit: boolean;
  counterfeitSuspected: boolean;
  forkPresent: boolean;
  structuralCodes: string[];
  hardFails: string[];
  repairableMetalAccepted: boolean;         // named builder, work not done
  cosmeticCodes: string[];
  isoEvidence: "lab_report" | "manufacturer_document" | "reputable_model_year" | "none";
  isoScope: "in_scope" | "out_of_scope" | "epac" | "cargo" | "iso_8098";
  isoVoided: boolean;
  uci: "not_applicable" | "matched" | "unmatched" | "not_checked";
  interfaces: {
    axles: 0 | 1 | 2;
    brakes: 0 | 1 | 2;
    headset: 0 | 1 | 2;
    bottomBracket: 0 | 1 | 2;
    smallParts: 0 | 1;
  };
  market: { brand: 0 | 2 | 4 | 6; generation: 0 | 1 | 3 | 5; weight: 0 | 1 | 2; demand: 0 | 1 | 2 };
  stackMm: number | null;
  reachMm: number | null;
  headAngleDeg: number | null;
  offsetMm: number | null;
  radiusMm: number | null;
  blockingService: boolean;
}
```

Interface cells are pre-bucketed to 0, 1, or 2 by the rules in §9.3 so the UI checklist and the scorer cannot drift. The scorer still enforces the photo cap and the ISO void.

---

## 13. Limits

- The newton tables that came from a manufacturer’s published ISO 4210-6:2023 report, rather than from the ISO text read directly, are marked that way in §2. Do not engrave them on a certificate without the purchased standard in front of you.
- Geometry bands will age. Replacing `geometry_bands_v1` is a schema bump.
- The brand-support rung is a judgment. The points are fixed; the shop’s list of who scores 6 is data.
- A letter A frame can still be the wrong size, the wrong bar, or the wrong tire. Those are not this grade.
- Nothing here authorizes a shop to stamp “ISO 4210 certified” or “UCI approved” on a used frame.

---

## 14. Sources

Primary or standards text read for this schema:

- ISO 4210-2:2023 preview. Scope, young-adult saddle-height limits, exclusions, clause 4.4 crack detection, and the 2023 foreword (new 4.8.7, 4.9.8.3, 4.9.9). https://cdn.standards.iteh.ai/samples/78077/7e7a9e3cceeb4c0c9bfa18d139de942b/ISO-4210-2-2023.pdf
- ISO 4210-6:2023 preview. Frame impact methods, Table 1 drop heights, Table 2 masses and drop heights, pedalling-fixture geometry. https://cdn.standards.iteh.ai/samples/78081/916de37247b1427f9a68021190fba522/ISO-4210-6-2023.pdf and the catalog entry that quotes the horizontal-force table: https://standards.iteh.ai/catalog/standards/iso/50799ea4-45e0-4601-acc4-043e499c1fa1/iso-4210-6-2023
- ISO 4210-2:2015 clauses 4.8 and 4.9 as published in excerpts of that edition: wheelbase permanent-set limits, “no visible crack” fatigue acceptance, composite +20% displacement, fork static bending ≤ 10 mm, rearward-impact 45 mm rules, fork fatigue +20% / +40%. https://previewnorm.com/iso/ISO%204210-2-2015%20PDF.pdf
- ISO catalog entries for the current editions: https://www.iso.org/standard/78077.html and https://www.iso.org/standard/78081.html

ISO loads corroborated by a published test report, not by the ISO PDF itself:

- Mondince, “Carbon Bike Frame Testing to ISO 4210,” racing-category report listing pedalling 1 100 N / 100 000 cycles, horizontal 600 N / 600 N / 100 000 cycles, vertical 1 200 N / 50 000 cycles, and the four-category comparison table. https://www.mondincecycle.com/technology/testing-certifications

UCI:

- UCI, “Frameset approval: What’s in a sticker?” Sticker generations, ISO attestation from 2019, seatpost scope from 2021, commercial availability. https://www.uci.org/article/uci-frameset-approval-whats-in-a-sticker/5wPo5xaoH6uaJYAx6xQubP
- UCI, *Approval Protocol for Framesets*. One-piece versus tubular procedures, manufacturer security attestation, list contents. https://assets.ctfassets.net/761l7gh5x5an/2rAfC3xzdcO3k3KSUOTn6Q/df2d7f2f56f5cbc6da1fb004411f1568/APPROVAL_PROTOCOL_FOR_FRAMESETS.pdf
- UCI, *Clarification Guide of the Technical Regulation* (2021-10-05). Article 1.3.002 liability language and the ISO 4210 certification requirement for submitted framesets. https://assets.ctfassets.net/761l7gh5x5an/7s1ma6mVAVlFwi8rRgy0Iw/1bef531dd9e9f534c34ff016c68e3c72/Clarification_Guide_of_the_UCI_Technical_Regulation_-_20211005_-_ENG.pdf
- UCI frameset-approval FAQ. Purpose of the list, EPFL measurement checks. https://assets.ctfassets.net/761l7gh5x5an/5yIPFnCyc7OhSuJ0LxMKpc/7c35ba247799028beb09b71523adc38e/FAQ_EN.pdf
- Joe Baker, “What is a UCI approved frameset…,” *Cycling Weekly*, 18 October 2024. What approval does not prove; reported fees; falsified stickers; ISO is not a UK statute. https://www.cyclingweekly.com/products/what-is-a-uci-approved-frameset-are-they-safer-and-who-even-tests-them-anyway

Laboratory performance methods:

- TOUR, “How TOUR tests: Our new test procedure,” 12 January 2024. Weights, 5–11 N/mm band, comfort scale, STR+. https://www.tour-magazin.de/en/buying-advice/components/how-tour-tests/how-tour-tests-our-new-test-procedure/
- TOUR, Factor Ostro VAM test, 10 January 2025. 6.6 N/mm grade 2.7, BB 49 N/mm grade 3.0, comfort figures, STR 1.48, STR+ 1.06, overall 1.9, weight/aero weighting. https://www.tour-magazin.de/en/aero-road-bike/the-best-race-all-rounders-in-the-test-the-factor-ostro-vam/
- TOUR, “The TOUR road bike test in detail.” Geometry bench and the older head-tube method in N·m/°. https://www.tour-magazin.de/en/buying-advice/components/how-tour-tests/how-tour-tests-the-tour-road-bike-test-in-detail/
- Zedler, performance and safety test lists, STW definition and ±2% repeatability note. https://www.zedler-institut.de/en/performance/tests/ and https://www.zedler-institut.de/en/buying-testing-systems/
- EFBE, TRI-TEST description and the 120 kg basis. https://www.efbe.de/tri-test-en.html and https://www.efbe.de/service-en.html

Used-market language:

- The Pro’s Closet, CPO process. https://www.theproscloset.com/blogs/news/inside-the-certified-pre-owned-bike-process
- The Pro’s Closet, “Inspected. Tested. Trusted.” Structural damage does not reach the site. https://www.theproscloset.com/blogs/news/inspected-tested-trusted
- The Pro’s Closet, carbon tap-test and repair path. https://www.theproscloset.com/blogs/news/carbon-frame-repair-at-the-pro-s-closet-how-we-inspect-diagnose-and-restore-damaged-carbon-bikes
- Pinkbike Help, “A Guide to Buying a Second-Hand Bike,” and BuySell condition filter values (New / Excellent / Good / Poor / For Parts). https://help.pinkbike.com/hc/en-us/articles/35448659444759-A-Guide-to-Buying-a-Second-Hand-Bike
- eBay, “Item condition by category.” https://www.ebay.com/help/selling/listings/creating-managing-listings/item-conditions-category?id=4765
- REI Re/Supply trade-in terms, bicycle exclusions (dents, bends, cracks, non-original paint, major rust). https://www.rei.com/used/terms-and-conditions
- Bicycle Blue Book, “How Condition Affects Your Bike’s Value.” https://bicyclebluebooksupport.zendesk.com/hc/en-us/articles/46112493336467-How-Condition-Affects-Your-Bike-s-Value

Inspection practice:

- Trek, carbon-fiber composite inspection, including the coin tap. http://dump.antropoide.net/pub/trek/om/road/carbon_fiber.html
- Carbon Bike Doctor, visual, ultrasonic, and instrumented tap-hammer screening. https://carbonbikedoctor.com/inspection-diagnostics/
- CPSC, Focus Spine recall, 7 June 2016, as a worked example of a frame/linkage recall. https://www.cpsc.gov/Recalls/2016/Focus-Bicycles-Recalls-Spine-Bicycles
- Seven Cycles, “Carbon Stiffness Declines,” for the existence of the +20% laboratory criterion and a framebuilder’s objection to it. The fatigue-strength and “Condition 1” claims on that page are their argument, not inputs to this score. https://sevencycles.com/articles/carbon-stiffness-declines.php

Geometry calibration, not a standard:

- TOUR Ostro geometry cited above (STR 1.48 on a bike they classed as a competition all-rounder).
- Canyon, “Road bike geometry explained,” stack and reach versus rider position, and a published endurance-versus-race comparison. https://www.canyon.com/en-us/blog-content/road-cycling-news/road-bike-geometry-explained/b19102022.html
- BikeRatio and bike-size.com typical medium-bike tables, used only to check that `geometry_bands_v1` covers the usual range. https://bikeratio.com/bike-geometry-comparison/ and https://bike-size.com/calculators/geometry-comparison
