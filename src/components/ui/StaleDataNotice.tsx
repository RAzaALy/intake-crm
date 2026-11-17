import { CircleAlert } from "lucide-react";
import { Button } from "./Button";

type StaleDataNoticeProps = {
  /** True when the demo switch caused the failure, so the copy doesn't blame the connection. */
  failureSimulated: boolean;
  onRetry: () => void;
  retrying: boolean;
};

/**
 * A reload failed but the screen still has the last good data. Keep showing it and say so,
 * instead of replacing a working screen with a full error page.
 */
export function StaleDataNotice({ failureSimulated, onRetry, retrying }: StaleDataNoticeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-panel border border-danger bg-danger-soft p-3">
      <CircleAlert size={16} aria-hidden="true" className="shrink-0 text-danger" />
      <p role="alert" className="min-w-0 flex-1 text-body text-ink">
        <span className="font-semibold">Couldn&apos;t refresh.</span>{" "}
        {failureSimulated
          ? "Simulate API failure is on. Showing what was last loaded."
          : "Showing what was last loaded."}
      </p>
      <Button variant="secondary" onClick={onRetry} loading={retrying}>
        {retrying ? "Loading…" : "Try again"}
      </Button>
    </div>
  );
}
