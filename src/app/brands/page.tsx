import type { Metadata } from "next";
import Link from "next/link";
import { BRANDS, type BrandTierHint } from "@/data/brands";

export const metadata: Metadata = { title: "Brand landscape" };

const TIER_LABEL: Record<BrandTierHint, string> = {
  utility: "Utility",
  budget: "Budget",
  value: "Value",
  mainstream: "Mainstream",
  performance: "Performance",
  prestige: "Prestige",
  custom: "Custom",
};

export default function BrandsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl">Brand landscape</h2>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Identification assist for SG / SE Asia used and vintage frames. A
          logo never auto-assigns value class or safety. Unknown OEM /
          white-label frames can still be assessed on construction evidence.
          Tier hints are model-year overridden (Marlin ≠ Madone SLR).
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/market"
            className="text-[var(--brass-deep)] underline-offset-2 hover:underline"
          >
            SG market comps →
          </Link>
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {BRANDS.map((b) => (
          <article
            key={b.name}
            className="rounded-lg border border-[var(--steel)]/30 bg-[var(--paper)]/90 p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg">{b.name}</h3>
              {b.tierHint ? (
                <span className="font-mono text-[0.65rem] uppercase tracking-wide text-[var(--brass-deep)]">
                  {TIER_LABEL[b.tierHint]}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-[var(--muted)]">
              HQ {b.origin}
              {b.made ? ` · made ${b.made}` : ""} · {b.eras}
            </p>
            {b.sgChannel ? (
              <p className="mt-1 text-xs text-[var(--brass-deep)]">
                SG: {b.sgChannel}
              </p>
            ) : null}
            <p className="mt-2 text-sm">{b.notes}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {b.materials.join(" · ")} · {b.categories.join(", ")}
              {b.counterfeitRisk === "high"
                ? " · high counterfeit risk"
                : b.counterfeitRisk === "medium"
                  ? " · medium counterfeit risk"
                  : ""}
            </p>
          </article>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Research notes:{" "}
        <code className="text-[0.8em]">docs/sg-brand-landscape.md</code>. Dealer
        lists drift — confirm the floor before promising warranty.
      </p>
    </div>
  );
}
