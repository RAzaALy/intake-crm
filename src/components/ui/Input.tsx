import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { controlStyles } from "./controlStyles";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return <input type={type} className={cn(controlStyles, "h-11 md:h-9", className)} {...props} />;
}
