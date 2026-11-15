"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListChecks,
  PackagePlus,
  Rows3,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const items: Item[] = [
  {
    href: "/frames",
    label: "Inventory",
    icon: Rows3,
    isActive: (pathname) =>
      pathname === "/frames" ||
      (pathname.startsWith("/frames/") && !pathname.startsWith("/frames/new")),
  },
  {
    href: "/frames/new",
    label: "Intake",
    icon: PackagePlus,
    isActive: (pathname) => pathname.startsWith("/frames/new"),
  },
  {
    href: "/review",
    label: "Review",
    icon: ListChecks,
    isActive: (pathname) => pathname.startsWith("/review"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: SlidersHorizontal,
    isActive: (pathname) => pathname.startsWith("/settings"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return <BottomNavBar pathname={pathname} />;
}

export function BottomNavFallback() {
  return <BottomNavBar pathname="" />;
}

function BottomNavBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Workshop"
      className="on-charcoal fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-charcoal-deep pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-5xl grid-cols-4">
        {items.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 border-t-2 px-1 text-xs font-medium",
                  active
                    ? "border-brass-light text-brass-light"
                    : "border-transparent text-paper",
                )}
              >
                <Icon aria-hidden className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
