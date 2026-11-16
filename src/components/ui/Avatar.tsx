import { cn } from "@/lib/cn";

const TINTS = ["bg-avatar-1", "bg-avatar-2", "bg-avatar-3", "bg-avatar-4", "bg-avatar-5"] as const;

/** "Amna Siddiqui" -> "AS", "Cher" -> "C". First and last word only. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  // Array.from splits by character, not UTF-16 unit, so "Žofia" or "𝓐" stay whole.
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Same name, same tint, on every screen and every visit. */
export function getTintIndex(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997;
  }
  return hash % TINTS.length;
}

type AvatarProps = {
  name: string;
  size?: "sm" | "md";
  className?: string;
};

/** Decorative: the name is always written next to it, so screen readers skip it. */
export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink",
        size === "sm" ? "size-7 text-meta" : "size-9 text-body",
        TINTS[getTintIndex(name)],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
