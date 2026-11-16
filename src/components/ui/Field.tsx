import { useId, type ReactNode } from "react";

/** Props Field hands to its control so label, hint and error are wired for screen readers. */
export type FieldControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
};

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Shows "(optional)" after the label. Required fields are not starred. */
  optional?: boolean;
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({ label, hint, error, optional = false, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-ink-muted"> (optional)</span>}
      </label>
      {children({
        id,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {/* Error first, so it sits right under the red border and lines up across a grid row. */}
      {error && (
        <p id={errorId} className="text-meta font-medium text-danger">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-meta text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
