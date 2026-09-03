import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]",
  {
    variants: {
      tone: {
        default: "border border-border text-muted",
        student: "border border-student/40 bg-student/10 text-student",
        teacher: "border border-teacher/40 bg-teacher/10 text-teacher",
        ok: "border border-ok/40 bg-ok/10 text-ok",
        warn: "border border-warn/40 bg-warn/10 text-warn",
        fail: "border border-fail/40 bg-fail/10 text-fail",
        live: "border border-accent/40 bg-accent/10 text-accent",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
