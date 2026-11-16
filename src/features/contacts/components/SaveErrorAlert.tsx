import { CircleAlert } from "lucide-react";

/** Shown above the actions when a save fails. The form keeps every value, and says so. */
export function SaveErrorAlert() {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-panel border border-danger bg-danger-soft p-4">
      <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
      <div className="flex flex-col gap-1">
        <p className="text-body font-semibold text-ink">Not saved</p>
        <p className="text-body text-ink">
          We couldn&apos;t save this contact. Your changes are still here. Try again.
        </p>
      </div>
    </div>
  );
}
