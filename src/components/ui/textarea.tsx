import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-[2px] border border-steel-line bg-paper-raised px-3 py-3 text-base leading-relaxed text-ink placeholder:text-steel disabled:bg-steel-wash",
        className,
      )}
      {...props}
    />
  );
}
