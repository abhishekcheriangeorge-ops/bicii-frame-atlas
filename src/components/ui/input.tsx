import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-[2px] border border-steel-line bg-paper-raised px-3 text-base text-ink placeholder:text-steel disabled:bg-steel-wash disabled:text-muted",
        className,
      )}
      {...props}
    />
  );
}
