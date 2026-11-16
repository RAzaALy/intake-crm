import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ListParams } from "../filters";
import { STATUS_LABELS } from "../labels";

/** Says exactly what was searched, so "no results" never looks like "no data". */
export function noMatchMessage({ query, status }: Pick<ListParams, "query" | "status">): string {
  const trimmed = query.trim();
  const statusLabel = STATUS_LABELS[status];
  if (trimmed && status !== "all") return `No contacts match "${trimmed}" in ${statusLabel}.`;
  if (trimmed) return `No contacts match "${trimmed}".`;
  return `No contacts in ${statusLabel}.`;
}

type NoMatchesProps = {
  params: ListParams;
  onClear: () => void;
};

export function NoMatches({ params, onClear }: NoMatchesProps) {
  return (
    <EmptyState
      title="No matches"
      body={noMatchMessage(params)}
      hint={params.query.trim() ? "Check the spelling, or search by email or phone instead." : undefined}
      action={
        <Button variant="secondary" onClick={onClear}>
          Clear filters
        </Button>
      }
    />
  );
}
