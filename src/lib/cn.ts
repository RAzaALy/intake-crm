import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's default scale. Without this it reads
// "text-body" as a colour and drops "text-on-primary" next to it.
// Keep in sync with the @theme tokens in globals.css.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["meta", "secondary", "body", "base", "card-title", "title", "title-lg"],
      radius: ["control", "panel"],
      shadow: ["float"],
    },
  },
});

/** Joins class names and lets later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
