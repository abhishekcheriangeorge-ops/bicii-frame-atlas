import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  hold: {
    box: "border-hold bg-hold-wash",
    title: "text-hold",
    role: "alert" as const,
  },
  note: {
    box: "border-steel bg-steel-wash",
    title: "text-ink",
    role: undefined,
  },
  brass: {
    box: "border-brass-deep bg-brass-wash",
    title: "text-brass-deep",
    role: undefined,
  },
};

export function Banner({
  tone = "note",
  title,
  children,
}: {
  tone?: keyof typeof tones;
  title: string;
  children: ReactNode;
}) {
  const style = tones[tone];
  return (
    <div role={style.role} className={cn("border-l-4 px-4 py-3", style.box)}>
      <p className={cn("text-base font-semibold", style.title)}>{title}</p>
      <div className="mt-1 text-sm leading-relaxed text-ink">{children}</div>
    </div>
  );
}
