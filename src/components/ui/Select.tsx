import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlStyles } from "./controlStyles";

/**
 * A styled native <select>. Phones get the OS picker, keyboard and screen
 * reader support come for free, and React Hook Form's register() just works.
 */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(controlStyles, "h-11 appearance-none pr-9 md:h-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}
