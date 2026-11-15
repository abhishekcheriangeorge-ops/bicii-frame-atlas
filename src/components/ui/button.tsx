import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] px-4 text-center text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-charcoal text-paper hover:bg-charcoal-deep",
        secondary:
          "border border-steel-line bg-paper-raised text-ink hover:bg-steel-wash",
        brass: "bg-brass-deep text-paper hover:bg-brass",
        danger: "bg-hold text-paper hover:bg-[#73261f]",
        ghost: "bg-transparent text-ink hover:bg-steel-wash",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    href?: string;
  };

export function Button({
  variant,
  className,
  href,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant }), className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export { buttonVariants };
