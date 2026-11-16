import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  /** The section's h2. It also names the region for screen readers. */
  title: string;
  children: ReactNode;
  className?: string;
};

/** A bordered white section with an h2, used for Notes, Details and Activity. */
export function Panel({ title, children, className }: PanelProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-4 rounded-panel border border-line bg-surface p-4 md:p-6", className)}
    >
      <h2 id={headingId} className="text-base font-semibold text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}
