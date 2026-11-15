import type { Metadata } from "next";
import Link from "next/link";
import {
  CATEGORY_BANDS_SGD,
  CATEGORY_LABELS,
  SG_GRADING_LEAD_CHECKS,
  SG_MARKET_COMPS,
  type MarketCategory,
} from "@/data/sg-market-comps";

export const metadata: Metadata = { title: "SG market comps" };

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const category = (sp.category as MarketCategory | undefined) ?? undefined;
  const cats = Object.keys(CATEGORY_LABELS) as MarketCategory[];
  const rows = category
    ? SG_MARKET_COMPS.filter((c) => c.category === category)
    : SG_MARKET_COMPS;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">SG market comps</h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          SAMPLE reference bands for Singapore used framesets (cleared-price
          estimates, Nov 2026 research pass). Asking prices are sticky; cleared
          often lands ~10–25% under ask. Not a live feed and not a buy offer.
        </p>
      </div>

      <section className="rounded-lg border border-[var(--steel)]/35 bg-[var(--paper)]/90 p-4">
        <h3 className="font-display text-lg">Lead checks before price</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {SG_GRADING_LEAD_CHECKS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Rim-brake carbon, odd BB standards, L/XL, and missing proprietary
          post/cockpit should land in the weak liquidity column even with a
          famous decal.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/market" active={!category} label="All" />
        {cats.map((c) => (
          <FilterChip
            key={c}
            href={`/market?category=${c}`}
            active={category === c}
            label={CATEGORY_LABELS[c]}
          />
        ))}
      </div>

      {category ? (
        <div className="rounded-lg border border-[var(--brass)]/40 bg-[var(--paper-2)]/60 p-4 text-sm">
          <div className="font-medium">{CATEGORY_LABELS[category]} bands</div>
          <dl className="mt-2 grid gap-1 sm:grid-cols-2">
            {(
              Object.entries(CATEGORY_BANDS_SGD[category]) as [string, string][]
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  {k}
                </dt>
                <dd>S${v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-[var(--steel)]/35">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--paper-2)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Frame</th>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Cleared band</th>
              <th className="px-3 py-2">Liquidity</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-[var(--steel)]/25 align-top"
              >
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {r.brand} {r.model}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {CATEGORY_LABELS[r.category]} · {r.material}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2">{r.year}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  S${r.estimatedMarketSgdLow.toLocaleString()}–
                  {r.estimatedMarketSgdHigh.toLocaleString()}
                </td>
                <td className="px-3 py-2 capitalize">{r.liquidity}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Channels: authorized retail clearance caps used; Carousell / Togoparts /
        grey import set peer prices. Provenance (“1st owner, local receipt”) is
        a real premium. See{" "}
        <Link
          href="/brands"
          className="text-[var(--brass-deep)] underline-offset-2 hover:underline"
        >
          Brands
        </Link>{" "}
        for identification assist. Notes:{" "}
        <code className="text-[0.8em]">docs/sg-frameset-market-notes.md</code>.
      </p>
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-1.5 text-sm ${
        active
          ? "border-[var(--brass)] bg-[var(--brass)]/15"
          : "border-[var(--steel)]/40 bg-[var(--paper-2)]/70 hover:border-[var(--brass)]"
      }`}
    >
      {label}
    </Link>
  );
}
