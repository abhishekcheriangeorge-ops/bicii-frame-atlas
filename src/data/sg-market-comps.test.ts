import { describe, expect, it } from "vitest";
import {
  compsToMarketRangeCents,
  matchMarketComps,
  SG_MARKET_COMPS,
} from "./sg-market-comps";

describe("sg market comps", () => {
  it("ships forty SAMPLE comps", () => {
    expect(SG_MARKET_COMPS).toHaveLength(40);
  });

  it("matches Giant brand comps", () => {
    const hits = matchMarketComps({ brand: "Giant", limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((c) => c.brand === "Giant")).toBe(true);
  });

  it("converts matched comps to a cents band", () => {
    const hits = matchMarketComps({ brand: "Brompton", limit: 2 });
    const range = compsToMarketRangeCents(hits);
    expect(range).not.toBeNull();
    expect(range!.minCents).toBeLessThan(range!.maxCents);
    expect(range!.minCents % 100).toBe(0);
  });
});
