import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  /** One sentence on what this screen is for, or why it is empty. */
  body: string;
  /** Optional second line, such as a tip for the next try. */
  hint?: string;
  /** One clear next step, usually a Button or a link styled as one. */
  action?: ReactNode;
};

export function EmptyState({ title, body, hint, action }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-start gap-3 rounded-panel border border-dashed border-line bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="max-w-[70ch] text-body text-ink-muted">{body}</p>
        {hint && <p className="max-w-[70ch] text-body text-ink-muted">{hint}</p>}
      </div>
      {action}
    </section>
  );
}
