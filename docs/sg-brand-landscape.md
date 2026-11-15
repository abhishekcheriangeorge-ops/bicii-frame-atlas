# Singapore brand landscape notes (BICII)

Research assist for Frame Atlas identification. **A brand badge does not move a cracked frame out of do-not-ride, and mint paint does not make open-mold carbon a Colnago.**

Product mapping:

| Research concept | Frame Atlas axis |
| --- | --- |
| Brand / model / material / standards identity | Intake + Brands assist — never auto-writes safety |
| Structural fail caps (crack, soft carbon, hinge fail) | Inspection `HOLD` / `REJECT` |
| Cosmetic / finish | Preservation effort `P1`–`P4` + listing disclosure |
| Brand tier / desirability hints | Inputs to value class `F1`–`F5` only after evidence |
| TOUR / magazine lab scores | Optional dossier notes — not letter or F-class |

## Channel map (confirm before seeding dealer links)

| Channel | Typical brands |
| --- | --- |
| Treknology3 / Speedon5 | Trek |
| Tay Junction | Giant, Liv, Cadex |
| specialized.com/sg | Specialized |
| canyon.com/en-sg | Canyon (direct completes) |
| Rodalink | Polygon, Marin |
| Hup Leong | Merida |
| Cycleworx | Pinarello |
| BYX | Bianchi, Wilier, Basso |
| Entro Cycles | Cipollini, Ridley, Pegoretti, Eddy Merckx, 3T |
| Bikes n Bites | Cervélo, Moots, Passoni |
| JanjiRide | Ibis, Santa Cruz, Cervélo, Intense, Yeti, Polygon |
| Fishtail | Dosnoventa |
| Winspace SG / Bike Station / Ride In Style | Winspace, Elves, SEKA, Quick Pro |
| Decathlon | Van Rysel, Triban, Rockrider, Elops |

Bike Guru–style dealer lists drift — recheck the floor before promising warranty.

## Origin corrections

- **Dosnoventa** — Barcelona, not Singapore (Fishtail is the SG dealer).
- **Engine11** — Los Angeles.
- **Seaboard / Tsunami** — Chinese steel/alloy; local riding mix ≠ local brand.
- **All-City** — QBP wind-down after MY2024; used market only.

## Price band enums (new frameset / complete)

Store actual ask beside the band: `utility` · `budget` · `value` · `performance` · `high` · `prestige` · `custom`. Folding is almost never a bare frameset — grade the hinge with the frame.

See also `src/data/brands.ts`, `src/data/sg-market-comps.ts`, `docs/sg-frameset-market-notes.md`, `docs/grading-guardrails.md`, and the ingest pack `docs/research-sg-sea-frame-grading-ingest.md`.

## Seed rules

- Seed model years, not just brands.
- Keep HQ and manufacture regions apart.
- UCI approved and ISO 4210 claimed are booleans + codes — never quality ranks.
- Do not copy lookalike geometry onto Twitter / unbadged frames.
- Missing serial + prestige sticker → stop (theft / counterfeit flag).
- F (parts/reject) is not a discount code.
