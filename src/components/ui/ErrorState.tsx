import { CircleAlert } from "lucide-react";
import { Button } from "./Button";

type ErrorStateProps = {
  title: string;
  /** What happened and what to do next. */
  body: string;
  retryLabel: string;
  onRetry: () => void;
  /** Extra line, such as the "Simulate API failure is on" hint. */
  note?: string;
  /** True while a retry runs. The panel stays put, so keyboard focus stays on the button. */
  retrying?: boolean;
};

export function ErrorState({ title, body, retryLabel, onRetry, note, retrying = false }: ErrorStateProps) {
  return (
    <section className="flex flex-col items-start gap-3 rounded-panel border border-line bg-surface p-6">
      <div className="flex items-start gap-2">
        <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
        {/* Only the message is announced, not the Retry button with it. */}
        <div role="alert" className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="max-w-[70ch] text-body text-ink-muted">{body}</p>
          {note && <p className="max-w-[70ch] text-body text-ink-muted">{note}</p>}
        </div>
      </div>
      <Button variant="secondary" onClick={onRetry} loading={retrying}>
        {retrying ? "Loading…" : retryLabel}
      </Button>
    </section>
  );
}
