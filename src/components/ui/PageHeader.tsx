import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  /** Page-level actions, right-aligned on desktop. */
  actions?: ReactNode;
};

/**
 * The page's only h1, in the serif. Below 768px it is visually hidden
 * because the top bar already shows the title; screen readers still get it.
 */
export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        // On phones the h1 is hidden, so an action-less header takes no space.
        !actions && "max-md:mb-0",
      )}
    >
      <h1 className="font-serif text-title font-semibold text-ink max-md:sr-only lg:text-title-lg">
        {title}
      </h1>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
