import { describe, expect, it } from "vitest";
import { BRAND_SEED_POLICY, BRANDS } from "./brands";

const REQUIRED = [
  "Giant",
  "Trek",
  "Specialized",
  "Bridgestone",
  "Miyata",
  "Panasonic",
  "Peugeot",
  "Raleigh",
  "Colnago",
  "Bianchi",
  "Cannondale",
  "Merida",
  "Polygon",
  "Dahon",
  "Tern",
  "Surly",
  "Salsa",
];

describe("brand identification seed", () => {
  it("lists at least 40 real brands and does not auto-grade", () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(40);
    expect(BRAND_SEED_POLICY.autoGrading).toBe(false);
    expect(BRAND_SEED_POLICY.autoSafety).toBe(false);
    expect(BRAND_SEED_POLICY.autoValueClass).toBe(false);
    expect(BRAND_SEED_POLICY.purpose).toBe("identification_assist");
  });

  it("includes the SG and vintage names used at intake", () => {
    const names = BRANDS.map((brand) => brand.name.toLowerCase());
    for (const required of REQUIRED) {
      expect(names.some((name) => name.includes(required.toLowerCase()))).toBe(
        true,
      );
    }
  });

  it("carries era and material notes and no safety or value-class field", () => {
    const seen = new Set<string>();
    for (const brand of BRANDS) {
      expect(brand.name.trim().length).toBeGreaterThan(0);
      expect(seen.has(brand.name)).toBe(false);
      seen.add(brand.name);
      expect(brand.eras.trim().length).toBeGreaterThan(0);
      expect(brand.materials.length).toBeGreaterThan(0);
      expect(brand.notes.trim().length).toBeGreaterThan(0);
      expect(brand).not.toHaveProperty("valueClass");
      expect(brand).not.toHaveProperty("inspectionOutcome");
      expect(brand).not.toHaveProperty("preservationClass");
    }
  });
});
