import { describe, expect, it } from "vitest";
import {
  planningLabourCents,
  PRESERVATION_COST_SEED,
} from "./preservation-costs";

describe("preservation cost seed", () => {
  it("keeps P-class as effort bands with citations", () => {
    expect(PRESERVATION_COST_SEED.classes.P1.hours).toEqual([1, 2]);
    expect(PRESERVATION_COST_SEED.classes.P4.hours).toBeNull();
    expect(PRESERVATION_COST_SEED.citations.length).toBeGreaterThanOrEqual(3);
  });

  it("plans labour cents from hours × rate without inventing P4 hours", () => {
    const p2 = planningLabourCents("P2", 4_500);
    expect(p2).toEqual({ lowCents: 9_000, highCents: 18_000 });
    expect(planningLabourCents("P4")).toBeNull();
  });
});
