import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-line-input bg-surface text-ink hover:bg-sunken",
  ghost: "text-ink-muted hover:bg-sunken hover:text-ink",
  danger: "bg-danger text-on-primary hover:opacity-90",
};

// Phones always get 44px targets; the sizes only differ from 768px up.
const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-11 px-3 text-body md:h-8 md:px-2.5",
  md: "h-11 px-4 text-body md:h-9",
};

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/** Button look without the element, for links that should look like buttons. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap",
    "transition-colors duration-150 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-60",
    // A busy button keeps full colour: "Saving…" is the status the person is waiting on.
    "aria-busy:cursor-wait aria-busy:opacity-100",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the button and shows a spinner. Pass the in-progress label ("Saving…") as children. */
  loading?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading && (
        <LoaderCircle size={16} aria-hidden="true" className="motion-safe:animate-spin" />
      )}
      {children}
    </button>
  );
}
