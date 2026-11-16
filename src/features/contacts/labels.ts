import type { SortKey, StatusFilter } from "./filters";
import type { ConflictCheck, MatterType, Source } from "./schema";

// Display text for stored values, from the copy deck (status.*, matter.*, source.*, conflict.*).

export const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  lead: "Lead",
  active: "Active",
  closed: "Closed",
};

export const MATTER_LABELS: Record<MatterType, string> = {
  family: "Family",
  immigration: "Immigration",
  corporate: "Corporate",
  employment: "Employment",
  property: "Property",
  criminal: "Criminal",
};

export const SOURCE_LABELS: Record<Source, string> = {
  referral: "Referral",
  website: "Website",
  phone: "Phone",
  walk_in: "Walk-in",
};

/** Option text in the form's conflict check select (conflict.*). */
export const CONFLICT_LABELS: Record<ConflictCheck, string> = {
  pending: "Pending",
  cleared: "Cleared",
  flagged: "Flagged",
};

/** Badge text says what it is about, so "Pending" alone is never ambiguous in a row. */
export const CONFLICT_BADGE_LABELS: Record<ConflictCheck, string> = {
  pending: "Conflict check pending",
  cleared: "Conflict cleared",
  flagged: "Conflict flagged",
};

export const SORT_LABELS: Record<SortKey, string> = {
  activity: "Last activity",
  name: "Name A to Z",
  added: "Date added",
};

export const UNASSIGNED_LABEL = "Unassigned";
