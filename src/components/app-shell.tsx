import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { BottomNav, BottomNavFallback } from "@/components/bottom-nav";

export function AppShell({
  children,
  staffName,
}: {
  children: ReactNode;
  staffName?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to the bench
      </a>
      <header className="on-charcoal sticky top-0 z-30 border-b border-black/40 bg-charcoal text-paper">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <Link
            href="/"
            className="flex min-h-12 items-center gap-3 rounded-[2px]"
          >
            <FrameMark />
            <span className="leading-none">
              <span className="block font-mono text-[0.65rem] tracking-[0.18em] text-brass-light uppercase">
                BICII
              </span>
              <span className="mt-1 block font-display text-[1.45rem] text-paper">
                Frame Atlas
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {staffName ? (
              <span className="hidden font-mono text-xs text-[#d7d0c6] sm:inline">
                {staffName}
              </span>
            ) : null}
            <Link
              href="/review"
              className="link-brass inline-flex min-h-12 items-center gap-2 border border-brass-light/50 px-3 text-sm font-medium"
            >
              <span className="size-2 shrink-0 bg-hold" aria-hidden />
              HOLD queue
            </Link>
          </div>
        </div>
        <p className="border-t border-white/10 px-4 py-1.5 text-center font-mono text-[0.65rem] tracking-[0.14em] text-brass-light uppercase">
          Inspection · Preservation · Value class
        </p>
      </header>
      <main
        id="main"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 pb-28"
      >
        {children}
      </main>
      <Suspense fallback={<BottomNavFallback />}>
        <BottomNav />
      </Suspense>
    </div>
  );
}

function FrameMark() {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden
      className="size-9 shrink-0 text-brass-light"
    >
      <rect
        x="1.5"
        y="1.5"
        width="33"
        height="33"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M8 24 L18 8 L28 24 L18 29 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      <path d="M18 8 L18 29" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
