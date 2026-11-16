import type { DefaultValues } from "react-hook-form";
import type { Contact, ContactFormValues } from "./schema";

/**
 * A new inquiry starts as a Lead with no attorney and the conflict check pending.
 * Matter type and source stay empty on purpose: a guessed default would be saved unnoticed.
 */
export const NEW_CONTACT_VALUES: DefaultValues<ContactFormValues> = {
  fullName: "",
  email: "",
  phone: "",
  status: "lead",
  assignedTo: null,
  conflictCheck: "pending",
};

/** The editable part of a stored contact, so the form never sees id or timestamps. */
export function toFormValues(contact: Contact): ContactFormValues {
  return {
    fullName: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    status: contact.status,
    matterType: contact.matterType,
    source: contact.source,
    assignedTo: contact.assignedTo,
    conflictCheck: contact.conflictCheck,
  };
}
