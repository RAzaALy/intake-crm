import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ConflictCheck } from "../schema";
import { CONFLICT_BADGE_LABELS } from "../labels";

/** Flagged is the only red on the list, so a risky contact stands out without reading every row. */
export function ConflictBadge({ check }: { check: ConflictCheck }) {
  return (
    <Badge
      tone={check}
      icon={check === "cleared" ? <Check size={14} aria-hidden="true" /> : undefined}
    >
      {CONFLICT_BADGE_LABELS[check]}
    </Badge>
  );
}
