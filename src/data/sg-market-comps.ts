/**
 * SAMPLE Singapore used-frameset comps for pricing assist.
 * Plausible cleared ranges anchored to Nov 2026 listing asks — not live quotes,
 * not buy offers. Prefer sold comps when available; treat these as starting bands.
 */

export type MarketCategory =
  | "road_carbon"
  | "gravel"
  | "mtb_hardtail"
  | "mtb_fs"
  | "steel_touring"
  | "folding";

export type SgMarketComp = {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: MarketCategory;
  material: string;
  conditionHints: string[];
  /** Plausible cleared frameset range in SGD (whole dollars). */
  estimatedMarketSgdLow: number;
  estimatedMarketSgdHigh: number;
  notes: string;
  liquidity: "weak" | "everyday" | "strong" | "flagship";
};

export const CATEGORY_LABELS: Record<MarketCategory, string> = {
  road_carbon: "Road carbon",
  gravel: "Gravel",
  mtb_hardtail: "MTB hardtail",
  mtb_fs: "MTB full suspension",
  steel_touring: "Steel touring",
  folding: "Folding",
};

/** Category-level cleared frameset bands (SGD) for quick workshop reference. */
export const CATEGORY_BANDS_SGD: Record<
  MarketCategory,
  { weak: string; everyday: string; strong: string; flagship: string }
> = {
  road_carbon: {
    weak: "250–800 (rim/QR/pre-2018)",
    everyday: "800–1,800 (disc TA 2018–21)",
    strong: "1,500–3,500 (2022–24 known brands)",
    flagship: "3,000–7,000 used superbike",
  },
  gravel: {
    weak: "150–400 as-is steel/alloy",
    everyday: "700–2,000 used carbon",
    strong: "1,800–3,500 recent carbon",
    flagship: "New Áspero-5 sale ~2,990; local chromoly 450–800",
  },
  mtb_hardtail: {
    weak: "80–250 as-is alloy",
    everyday: "200–500 modern alloy",
    strong: "600–2,200 carbon XC",
    flagship: "S-Works / Scale RC top of strong band",
  },
  mtb_fs: {
    weak: "200–500 as-is",
    everyday: "450–1,200 alloy + shock 2020+",
    strong: "1,000–3,200 carbon + shock",
    flagship: "Shop cash often ≤1,000 (e.g. DCBikes cap)",
  },
  steel_touring: {
    weak: "300–800 vintage / old 520",
    everyday: "700–1,300 Surly used",
    strong: "1,300–1,700 new Disc Trucker FS",
    flagship: "Moots display-case (~13k) — not consignment mainstream",
  },
  folding: {
    weak: "100–450 Java/Fnhon/Tern bare",
    everyday: "700–1,400 Brompton C frame; completes 1,400–2,800",
    strong: "1,500–2,400 P Line frameset; completes 3,000–5,000",
    flagship: "T Line completes 5,000–7,000",
  },
};

/**
 * Six checks that decide buildability / liquidity in Singapore humidity & rain.
 * Capture these before class or price.
 */
export const SG_GRADING_LEAD_CHECKS = [
  "Size (cm + rider height) — liquid band ~49–54 cm / XS–M",
  "Brake standard — rim vs flat-mount disc vs post-mount",
  "Axle / hub — QR vs 12×100/142 vs Boost 148 (Super Boost 157 trap)",
  "Bottom bracket family — BSA preferred; BB86/BB90/BBright/T47 variants do not share cups",
  "Tyre clearance — road sweet spot 28–32 mm; gravel 40–50 mm + mounts",
  "Proprietary post / cockpit / aero axles present in the box",
] as const;

export const SG_MARKET_COMPS: SgMarketComp[] = [
  {
    id: "fs-001",
    brand: "Specialized",
    model: "S-Works Tarmac SL4",
    year: 2015,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["well used", "rim brake", "clearcoat chips on chainstay"],
    estimatedMarketSgdLow: 300,
    estimatedMarketSgdHigh: 550,
    notes: "OSBB, QR, max tyre ~25–28 mm. Weak SG rain liquidity.",
    liquidity: "weak",
  },
  {
    id: "fs-002",
    brand: "Giant",
    model: "TCR Advanced Pro",
    year: 2017,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["well used", "local receipt", "rim brake"],
    estimatedMarketSgdLow: 400,
    estimatedMarketSgdHigh: 700,
    notes: "BB86, QR, rim. Common Tay Junction-era bike; grade BB for ovality.",
    liquidity: "weak",
  },
  {
    id: "fs-003",
    brand: "Trek",
    model: "Madone",
    year: 2016,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["lightly used", "proprietary seatmast", "rim brake"],
    estimatedMarketSgdLow: 450,
    estimatedMarketSgdHigh: 800,
    notes: "BB90, QR, rim. Missing seatmast collapses price.",
    liquidity: "weak",
  },
  {
    id: "fs-004",
    brand: "Canyon",
    model: "Aeroad CFR",
    year: 2021,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["well used", "cockpit included", "no SG warranty"],
    estimatedMarketSgdLow: 1200,
    estimatedMarketSgdHigh: 1900,
    notes: "PF86, flat-mount, 12×100/142. Grey import; CP cockpit proprietary.",
    liquidity: "everyday",
  },
  {
    id: "fs-005",
    brand: "Specialized",
    model: "Tarmac SL6 Expert",
    year: 2019,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["lightly used", "disc", "local purchase"],
    estimatedMarketSgdLow: 1100,
    estimatedMarketSgdHigh: 1800,
    notes: "OSBB, flat-mount, 12 mm TA. Last SL before threaded BB.",
    liquidity: "everyday",
  },
  {
    id: "fs-006",
    brand: "Giant",
    model: "TCR Advanced Pro Disc",
    year: 2021,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["lightly used", "size S", "disc"],
    estimatedMarketSgdLow: 850,
    estimatedMarketSgdHigh: 1400,
    notes: "BB86, flat-mount, 12×100/142. High liquidity for size S.",
    liquidity: "everyday",
  },
  {
    id: "fs-007",
    brand: "Trek",
    model: "Madone SL",
    year: 2022,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["lightly used", "aftermarket bar included"],
    estimatedMarketSgdLow: 900,
    estimatedMarketSgdHigh: 1500,
    notes: "T47 inboard (not BB90), flat-mount, aero post. Frame-only at low end.",
    liquidity: "everyday",
  },
  {
    id: "fs-008",
    brand: "Orbea",
    model: "Orca OMX",
    year: 2024,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["lightly used", "MyO paint", "Cannasia purchase"],
    estimatedMarketSgdLow: 1800,
    estimatedMarketSgdHigh: 2800,
    notes: "Strong small-size demand; confirm BB on sticker.",
    liquidity: "strong",
  },
  {
    id: "fs-009",
    brand: "Specialized",
    model: "Tarmac SL8",
    year: 2024,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["imported used", "cockpit not included", "FACT 10r"],
    estimatedMarketSgdLow: 2200,
    estimatedMarketSgdHigh: 3200,
    notes: "BSA 68, flat-mount. Non-S-Works unless serial says otherwise. Papers move price.",
    liquidity: "strong",
  },
  {
    id: "fs-010",
    brand: "Cervélo",
    model: "S5",
    year: 2023,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["lightly used", "cockpit included", "aero axles present"],
    estimatedMarketSgdLow: 3200,
    estimatedMarketSgdHigh: 4800,
    notes: "BBright press-fit; Cervélo QRA-AERO2 axles required. New sale ~S$5,690.",
    liquidity: "flagship",
  },
  {
    id: "fs-011",
    brand: "Pinarello",
    model: "Dogma F",
    year: 2022,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["excellent", "Most Talon bar not included"],
    estimatedMarketSgdLow: 4500,
    estimatedMarketSgdHigh: 7000,
    notes: "Italian BB 70 mm. Large sizes slower in SG.",
    liquidity: "flagship",
  },
  {
    id: "fs-012",
    brand: "Cannondale",
    model: "SuperSix Evo Hi-Mod",
    year: 2020,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["well used", "disc", "BB creak reported"],
    estimatedMarketSgdLow: 1000,
    estimatedMarketSgdHigh: 1700,
    notes: "BB30A/PF30A — measure bore before quoting BB. Gen 4 BSA is a different bike.",
    liquidity: "everyday",
  },
  {
    id: "fs-013",
    brand: "Seka",
    model: "Spear RDC",
    year: 2023,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["used import", "no papers"],
    estimatedMarketSgdLow: 700,
    estimatedMarketSgdHigh: 1400,
    notes: "Open-mold carbon; no local warranty. Do not use bar-bundled asks as bare-frame comps.",
    liquidity: "everyday",
  },
  {
    id: "fs-014",
    brand: "Specialized",
    model: "Aethos",
    year: 2022,
    category: "road_carbon",
    material: "carbon",
    conditionHints: ["lightly used", "round seatpost", "2x mechanical"],
    estimatedMarketSgdLow: 2200,
    estimatedMarketSgdHigh: 3600,
    notes: "BSA 68, easy build, high local demand. Condition drives the spread.",
    liquidity: "strong",
  },
  {
    id: "fs-015",
    brand: "Canyon",
    model: "Grail CF SL",
    year: 2020,
    category: "gravel",
    material: "carbon",
    conditionHints: ["well used", "hover bar included", "grey import"],
    estimatedMarketSgdLow: 900,
    estimatedMarketSgdHigh: 1600,
    notes: "PF86; hover bar proprietary and polarising.",
    liquidity: "everyday",
  },
  {
    id: "fs-016",
    brand: "Trek",
    model: "Checkpoint SL",
    year: 2021,
    category: "gravel",
    material: "carbon",
    conditionHints: ["well used", "fender mounts"],
    estimatedMarketSgdLow: 700,
    estimatedMarketSgdHigh: 1200,
    notes: "Gen 1 carbon BB90; Gen 3 T47 is a different frame.",
    liquidity: "everyday",
  },
  {
    id: "fs-017",
    brand: "Specialized",
    model: "Diverge Comp Carbon",
    year: 2022,
    category: "gravel",
    material: "carbon",
    conditionHints: ["lightly used", "Future Shock", "2x"],
    estimatedMarketSgdLow: 1300,
    estimatedMarketSgdHigh: 2200,
    notes: "BSA, ~47 mm clearance. Dead Future Shock cartridge is a discount. STR is dearer.",
    liquidity: "strong",
  },
  {
    id: "fs-018",
    brand: "Cervélo",
    model: "Áspero",
    year: 2022,
    category: "gravel",
    material: "carbon",
    conditionHints: ["lightly used", "1x", "no rack mounts"],
    estimatedMarketSgdLow: 1600,
    estimatedMarketSgdHigh: 2600,
    notes: "BBright. New Áspero-5 sale ~S$2,990 caps used non-5 asks.",
    liquidity: "strong",
  },
  {
    id: "fs-019",
    brand: "Giant",
    model: "Revolt Advanced",
    year: 2022,
    category: "gravel",
    material: "carbon",
    conditionHints: ["well used", "2x", "tyre rash"],
    estimatedMarketSgdLow: 900,
    estimatedMarketSgdHigh: 1600,
    notes: "BB86, flip-chip dropout gen; D-Fuse post should be present.",
    liquidity: "everyday",
  },
  {
    id: "fs-020",
    brand: "Specialized",
    model: "Crux",
    year: 2023,
    category: "gravel",
    material: "carbon",
    conditionHints: ["excellent", "1x only", "few mounts"],
    estimatedMarketSgdLow: 1800,
    estimatedMarketSgdHigh: 3000,
    notes: "Race gravel; smaller richer buyer pool than Diverge.",
    liquidity: "strong",
  },
  {
    id: "fs-021",
    brand: "Canyon",
    model: "Grizl CF",
    year: 2022,
    category: "gravel",
    material: "carbon",
    conditionHints: ["well used", "mounts present", "1x"],
    estimatedMarketSgdLow: 1100,
    estimatedMarketSgdHigh: 1900,
    notes: "Alloy Grizl completes ~S$1,250 cap tired carbon frames.",
    liquidity: "everyday",
  },
  {
    id: "fs-022",
    brand: "Marin",
    model: "Gestalt",
    year: 2021,
    category: "gravel",
    material: "alloy",
    conditionHints: ["well used", "commuter"],
    estimatedMarketSgdLow: 250,
    estimatedMarketSgdHigh: 500,
    notes: "Rodalink brand; cheap build platform. New Marin DSX ~S$999 ceiling.",
    liquidity: "everyday",
  },
  {
    id: "fs-023",
    brand: "Trek",
    model: "X-Caliber",
    year: 2018,
    category: "mtb_hardtail",
    material: "alloy",
    conditionHints: ["as-is", "scuffed"],
    estimatedMarketSgdLow: 80,
    estimatedMarketSgdHigh: 180,
    notes: "Confirm QR vs Boost. Near scrap unless named air fork included.",
    liquidity: "weak",
  },
  {
    id: "fs-024",
    brand: "Polygon",
    model: "Xtrada 7",
    year: 2022,
    category: "mtb_hardtail",
    material: "alloy",
    conditionHints: ["lightly used", "Boost", "29er"],
    estimatedMarketSgdLow: 200,
    estimatedMarketSgdHigh: 450,
    notes: "Boost 148, BSA 73. Frame-only is a project; completes S$700–1,100.",
    liquidity: "everyday",
  },
  {
    id: "fs-025",
    brand: "Scott",
    model: "Scale",
    year: 2021,
    category: "mtb_hardtail",
    material: "carbon",
    conditionHints: ["well used", "carbon", "Boost"],
    estimatedMarketSgdLow: 700,
    estimatedMarketSgdHigh: 1400,
    notes: "Often PF92; pre-UDH. Repaired chainstay kills value.",
    liquidity: "everyday",
  },
  {
    id: "fs-026",
    brand: "Specialized",
    model: "Epic HT",
    year: 2022,
    category: "mtb_hardtail",
    material: "carbon",
    conditionHints: ["lightly used", "threaded BB"],
    estimatedMarketSgdLow: 1400,
    estimatedMarketSgdHigh: 2400,
    notes: "Boost 148, BSA 73. Small sizes liquid.",
    liquidity: "strong",
  },
  {
    id: "fs-027",
    brand: "Trek",
    model: "Procaliber",
    year: 2021,
    category: "mtb_hardtail",
    material: "carbon",
    conditionHints: ["well used", "Knock Block", "IsoSpeed"],
    estimatedMarketSgdLow: 800,
    estimatedMarketSgdHigh: 1500,
    notes: "Knock Block stem/spacers mandatory; normal stem will not fit.",
    liquidity: "everyday",
  },
  {
    id: "fs-028",
    brand: "Polygon",
    model: "Siskiu T8",
    year: 2022,
    category: "mtb_fs",
    material: "alloy",
    conditionHints: ["well used", "shock included", "linkage due"],
    estimatedMarketSgdLow: 450,
    estimatedMarketSgdHigh: 900,
    notes: "Serviceable shock assumed. Dead shock → S$200–400 as-is band.",
    liquidity: "everyday",
  },
  {
    id: "fs-029",
    brand: "Giant",
    model: "Trance",
    year: 2021,
    category: "mtb_fs",
    material: "alloy",
    conditionHints: ["lightly used", "Maestro linkage", "shock included"],
    estimatedMarketSgdLow: 500,
    estimatedMarketSgdHigh: 1000,
    notes: "Maestro bearings are the grade. Stay under S$1,000 vs new clearance.",
    liquidity: "everyday",
  },
  {
    id: "fs-030",
    brand: "Canyon",
    model: "Neuron CF",
    year: 2021,
    category: "mtb_fs",
    material: "carbon",
    conditionHints: ["well used", "grey", "shock service due"],
    estimatedMarketSgdLow: 1100,
    estimatedMarketSgdHigh: 2000,
    notes: "No SG warranty. Shock service interval moves price more than paint.",
    liquidity: "strong",
  },
  {
    id: "fs-031",
    brand: "Specialized",
    model: "Stumpjumper",
    year: 2021,
    category: "mtb_fs",
    material: "carbon",
    conditionHints: ["lightly used", "SWAT door intact", "threaded BB"],
    estimatedMarketSgdLow: 1300,
    estimatedMarketSgdHigh: 2300,
    notes: "Pre-UDH. Small S-sizes sell; S5/S6 sit.",
    liquidity: "strong",
  },
  {
    id: "fs-032",
    brand: "Santa Cruz",
    model: "Hightower",
    year: 2019,
    category: "mtb_fs",
    material: "carbon",
    conditionHints: ["well used", "bearing play", "shock needs service"],
    estimatedMarketSgdLow: 1200,
    estimatedMarketSgdHigh: 2200,
    notes: "Brand premium thin in SG; notched VPP bearings → low end.",
    liquidity: "strong",
  },
  {
    id: "fs-033",
    brand: "Surly",
    model: "Disc Trucker",
    year: 2024,
    category: "steel_touring",
    material: "steel",
    conditionHints: ["as-new", "parallel import", "all mounts"],
    estimatedMarketSgdLow: 1300,
    estimatedMarketSgdHigh: 1700,
    notes: "42–56 cm = 26-inch; 56–64 = 700c. Straight 1-1/8 steerer.",
    liquidity: "strong",
  },
  {
    id: "fs-034",
    brand: "Surly",
    model: "Straggler",
    year: 2020,
    category: "steel_touring",
    material: "steel",
    conditionHints: ["lightly used", "650b", "horizontal dropouts"],
    estimatedMarketSgdLow: 700,
    estimatedMarketSgdHigh: 1100,
    notes: "QR 135 disc; singlespeed-capable dropouts are the point.",
    liquidity: "everyday",
  },
  {
    id: "fs-035",
    brand: "Trek",
    model: "520",
    year: 2015,
    category: "steel_touring",
    material: "steel",
    conditionHints: ["well used", "touring wear", "rack mounts"],
    estimatedMarketSgdLow: 350,
    estimatedMarketSgdHigh: 650,
    notes: "Steady small buyer pool. Confirm disc vs older rim.",
    liquidity: "weak",
  },
  {
    id: "fs-036",
    brand: "Weapon",
    model: "Seaboard CX03",
    year: 2024,
    category: "steel_touring",
    material: "steel",
    conditionHints: ["brand new", "shop stock", "chromoly"],
    estimatedMarketSgdLow: 550,
    estimatedMarketSgdHigh: 750,
    notes: "Local new chromoly (~S$690). Competes with used Surly on price.",
    liquidity: "everyday",
  },
  {
    id: "fs-037",
    brand: "Brompton",
    model: "C Line M-type",
    year: 2019,
    category: "folding",
    material: "steel",
    conditionHints: ["well used", "hinge play slight", "steel triangle"],
    estimatedMarketSgdLow: 700,
    estimatedMarketSgdHigh: 1200,
    notes: "Main frame + matching rear triangle. Hinge slop is the grade.",
    liquidity: "everyday",
  },
  {
    id: "fs-038",
    brand: "Brompton",
    model: "P Line",
    year: 2023,
    category: "folding",
    material: "titanium",
    conditionHints: ["lightly used", "titanium rear triangle", "4-speed"],
    estimatedMarketSgdLow: 1500,
    estimatedMarketSgdHigh: 2400,
    notes: "P/T triangles do not swap freely with C Line.",
    liquidity: "strong",
  },
  {
    id: "fs-039",
    brand: "Tern",
    model: "Verge",
    year: 2021,
    category: "folding",
    material: "alloy",
    conditionHints: ["well used", "OCL joint", "20-inch"],
    estimatedMarketSgdLow: 180,
    estimatedMarketSgdHigh: 400,
    notes: "Bare frame weak; joint/stem are the product. New Link A7 caps used.",
    liquidity: "weak",
  },
  {
    id: "fs-040",
    brand: "Java",
    model: "Neo",
    year: 2022,
    category: "folding",
    material: "alloy",
    conditionHints: ["as-is", "commodity folder"],
    estimatedMarketSgdLow: 100,
    estimatedMarketSgdHigh: 250,
    notes: "Frame-only is a parts donor. Do not grade on road-bike standards.",
    liquidity: "weak",
  },
];

export function matchMarketComps(params: {
  brand?: string | null;
  model?: string | null;
  material?: string | null;
  limit?: number;
}): SgMarketComp[] {
  const brand = (params.brand ?? "").trim().toLowerCase();
  const model = (params.model ?? "").trim().toLowerCase();
  const material = (params.material ?? "").trim().toLowerCase();
  const scored = SG_MARKET_COMPS.map((c) => {
    let score = 0;
    if (brand && c.brand.toLowerCase().includes(brand)) score += 3;
    if (brand && brand.includes(c.brand.toLowerCase())) score += 2;
    if (model) {
      const m = c.model.toLowerCase();
      if (m.includes(model) || model.includes(m.split(" ")[0]!)) score += 3;
    }
    if (material) {
      const mat =
        material === "aluminium" || material === "aluminum"
          ? "alloy"
          : material;
      if (c.material === mat || c.material === material) score += 1;
    }
    return { c, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, params.limit ?? 6).map((x) => x.c);
}

export function compsToMarketRangeCents(comps: SgMarketComp[]): {
  minCents: number;
  maxCents: number;
} | null {
  if (!comps.length) return null;
  const low = Math.min(...comps.map((c) => c.estimatedMarketSgdLow));
  const high = Math.max(...comps.map((c) => c.estimatedMarketSgdHigh));
  return { minCents: low * 100, maxCents: high * 100 };
}
