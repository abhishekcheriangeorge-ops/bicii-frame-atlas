import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "min-h-12 w-full appearance-none rounded-[2px] border border-steel-line bg-paper-raised px-3 pr-10 text-base text-ink disabled:bg-steel-wash",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-steel"
      />
    </div>
  );
}
