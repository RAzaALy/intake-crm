import { Badge } from "@/components/ui/Badge";
import type { ContactStatus } from "../schema";
import { STATUS_LABELS } from "../labels";

export function StatusBadge({ status }: { status: ContactStatus }) {
  return <Badge tone={status}>{STATUS_LABELS[status]}</Badge>;
}
