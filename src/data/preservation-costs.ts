/**
 * Planning seed for preservation labour/materials in SGD cents.
 * P-class is effort only — never a safety or value-class result.
 * Cite docs/research-sg-sea-frame-grading-ingest.md §C.
 */

export type PreservationClassId = "P1" | "P2" | "P3" | "P4";

export const PRESERVATION_COST_SEED = {
  currency: "SGD",
  /**
   * Planning labour rate only. Shop must override with actual rateCentsPerHour.
   * [PROVISIONAL] — not a published LBS standard rate.
   */
  labourRateHintCentsPerHour: 4_500,
  classes: {
    P1: {
      label: "Light",
      hours: [1, 2] as const,
      materialsCents: [1_000, 4_000] as const,
      externalCents: [0, 0] as const,
      drivers: [
        "Degrease and careful clean",
        "Minor touch-ups",
        "Free posts / BB / fasteners",
      ],
    },
    P2: {
      label: "Standard",
      hours: [2, 4] as const,
      materialsCents: [4_000, 12_000] as const,
      externalCents: [0, 8_000] as const,
      drivers: [
        "Full strip-down",
        "Light surface rust treatment",
        "Thread chase / minor seized fasteners",
        "Finish preservation",
      ],
    },
    P3: {
      label: "Extensive",
      hours: [4, 7] as const,
      materialsCents: [8_000, 25_000] as const,
      externalCents: [5_000, 20_000] as const,
      drivers: [
        "Seized post or BB",
        "Substantial surface rehab",
        "Detailed cosmetic conservation",
        "Many fastener replacements",
      ],
    },
    P4: {
      label: "Specialist",
      hours: null,
      materialsCents: null,
      /** Respray floors from Unspokin / Fixabike menus (frame-focused). */
      externalCents: [40_000, 100_000] as const,
      drivers: [
        "Full respray / refinish",
        "Carbon specialist NDT or repair",
        "Titanium specialist weld",
        "Authentication / research outsourcing",
      ],
    },
  },
  citations: [
    {
      title: "Bike Hero Pro — Half S$240 / Full strip-down S$350",
      url: "https://www.bikehero.sg/bike-hero-pro",
    },
    {
      title: "Unspokin — frame+fork repaint from S$700 (+S$300 carbon)",
      url: "https://unspokin.com/pages/custom-paint-jobs",
    },
    {
      title: "Fixabike — repaint S$400–500; overhaul S$100–160",
      url: "https://www.carousell.sg/p/professional-bicycle-services-by-certified-full-time-bike-mechanic-since-2017-1043729096/",
    },
    {
      title: "DCBikes — minor de-rust add-on S$30–100+",
      url: "https://dcbikes.com.sg/products/mountain-bike-restoration-spa-grooming-bicycle-servicing-de-rust-refurbishment",
    },
  ],
} as const;

export function planningLabourCents(
  preservationClass: PreservationClassId,
  rateCentsPerHour: number = PRESERVATION_COST_SEED.labourRateHintCentsPerHour,
): { lowCents: number; highCents: number } | null {
  const row = PRESERVATION_COST_SEED.classes[preservationClass];
  if (!row.hours) return null;
  const [lo, hi] = row.hours;
  return {
    lowCents: Math.round(lo * rateCentsPerHour),
    highCents: Math.round(hi * rateCentsPerHour),
  };
}
