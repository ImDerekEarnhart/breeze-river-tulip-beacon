import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[44px] w-full resize-none rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 py-2.5 text-sm text-fg placeholder:text-subtle outline-none transition-colors duration-150 focus:border-border-strong focus:ring-2 focus:ring-accent/30",
        className,
      )}
      {...props}
      suppressHydrationWarning
    />
  );
});
Textarea.displayName = "Textarea";
