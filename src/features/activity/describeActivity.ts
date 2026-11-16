import type { Activity, EditableField } from "@/features/contacts/schema";
import { STATUS_LABELS } from "@/features/contacts/labels";

// Sentences from the copy deck (activity.*). Field names are lower case because they sit
// mid-sentence: "Updated email and phone."
const FIELD_LABELS: Record<EditableField, string> = {
  fullName: "full name",
  email: "email",
  phone: "phone",
  matterType: "matter type",
  source: "source",
  status: "status",
  assignedTo: "assigned attorney",
  conflictCheck: "conflict check",
};

/** "a", "a and b", "a, b and c": commas between all but the last pair. */
export function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** One timeline entry as a plain sentence. */
export function describeActivity(activity: Activity): string {
  switch (activity.type) {
    case "created":
      return "Contact added.";
    case "edited": {
      const fields = activity.meta.fields.map((field) => FIELD_LABELS[field]);
      return fields.length === 0 ? "Details updated." : `Updated ${joinWithAnd(fields)}.`;
    }
    case "status_changed":
      return `Status changed from ${STATUS_LABELS[activity.meta.from]} to ${STATUS_LABELS[activity.meta.to]}.`;
    case "note_added":
      return "Note added.";
  }
}
