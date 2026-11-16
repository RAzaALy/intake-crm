import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { controlStyles } from "./controlStyles";

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea rows={rows} className={cn(controlStyles, "min-h-24 py-2", className)} {...props} />
  );
}
