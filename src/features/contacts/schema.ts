import { z } from "zod";

// Error messages come from the copy deck in docs/UX_BRIEF.md (form.error.*, details.notes.error.*).

export const CONTACT_STATUSES = ["lead", "active", "closed"] as const;
export const MATTER_TYPES = [
  "family",
  "immigration",
  "corporate",
  "employment",
  "property",
  "criminal",
] as const;
export const SOURCES = ["referral", "website", "phone", "walk_in"] as const;
export const CONFLICT_CHECKS = ["pending", "cleared", "flagged"] as const;

// No auth and no attorney management, so the firm's three attorneys are a fixed list.
export const ATTORNEYS = ["Daniel Okafor", "Priya Raman", "Helen Marsh"] as const;

export const NOTE_MAX_LENGTH = 1000;

export const contactStatusSchema = z.enum(CONTACT_STATUSES, { error: "Choose a status." });
export const matterTypeSchema = z.enum(MATTER_TYPES, { error: "Choose a matter type." });
export const sourceSchema = z.enum(SOURCES, { error: "Choose how the inquiry came in." });
export const conflictCheckSchema = z.enum(CONFLICT_CHECKS);
export const attorneySchema = z.enum(ATTORNEYS);

const PHONE_LENGTH_MESSAGE = "Phone number needs 7 to 20 characters.";

/** What a person types into the contact form. The repository validates with it too. */
export const contactInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    // abort stops the later checks, so an empty field shows only the "required" message.
    .min(1, { error: "Enter the prospective client's full name.", abort: true })
    .min(2, { error: "Full name needs at least 2 characters." })
    .max(80, { error: "Full name can be up to 80 characters." }),
  // pipe() stops at the first schema, so an empty field shows "required", not "invalid".
  email: z
    .string()
    .trim()
    .min(1, { error: "Enter an email address." })
    .pipe(z.email({ error: "Enter an email like name@firm.com." })),
  phone: z
    .string()
    .trim()
    .min(1, { error: "Enter a phone number.", abort: true })
    .regex(/^[\d\s+\-()]+$/, { error: "Use only digits, spaces, +, - and brackets." })
    .min(7, { error: PHONE_LENGTH_MESSAGE })
    .max(20, { error: PHONE_LENGTH_MESSAGE }),
  status: contactStatusSchema,
  matterType: matterTypeSchema,
  source: sourceSchema,
  assignedTo: attorneySchema.nullable().default(null),
  conflictCheck: conflictCheckSchema.default("pending"),
});

// Stored records use plain strings for name, email and phone. Tightening a form rule later
// must not make existing data unreadable (which would reseed and lose it).
export const contactSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  status: contactStatusSchema,
  matterType: matterTypeSchema,
  source: sourceSchema,
  assignedTo: attorneySchema.nullable(),
  conflictCheck: conflictCheckSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  lastActivityAt: z.iso.datetime(),
});

export const noteBodySchema = z
  .string()
  .trim()
  .min(1, { error: "Write a note first." })
  .max(NOTE_MAX_LENGTH, {
    error: (issue) => {
      const count = typeof issue.input === "string" ? issue.input.length : NOTE_MAX_LENGTH;
      return `Notes can be up to ${NOTE_MAX_LENGTH} characters. This one has ${count}.`;
    },
  });

export const noteSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  body: z.string(),
  createdAt: z.iso.datetime(),
});

/** Field names an "edited" activity can list. */
export const editableFieldSchema = contactInputSchema.keyof();

const activityBase = {
  id: z.string(),
  contactId: z.string(),
  createdAt: z.iso.datetime(),
};

// One shape per type, so a status change always has from/to and an edit always has fields.
export const activitySchema = z.discriminatedUnion("type", [
  z.object({ ...activityBase, type: z.literal("created") }),
  z.object({
    ...activityBase,
    type: z.literal("edited"),
    meta: z.object({ fields: z.array(editableFieldSchema) }),
  }),
  z.object({
    ...activityBase,
    type: z.literal("status_changed"),
    meta: z.object({ from: contactStatusSchema, to: contactStatusSchema }),
  }),
  z.object({ ...activityBase, type: z.literal("note_added") }),
]);

/** Everything the app keeps under one storage key. */
export const databaseSchema = z.object({
  contacts: z.array(contactSchema),
  notes: z.array(noteSchema),
  activities: z.array(activitySchema),
});

export type ContactStatus = z.infer<typeof contactStatusSchema>;
export type MatterType = z.infer<typeof matterTypeSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type ConflictCheck = z.infer<typeof conflictCheckSchema>;
export type Attorney = z.infer<typeof attorneySchema>;
export type EditableField = z.infer<typeof editableFieldSchema>;

/** Form values before defaults are applied (assignedTo and conflictCheck may be missing). */
export type ContactFormValues = z.input<typeof contactInputSchema>;
/** Validated input, with defaults applied. */
export type ContactInput = z.output<typeof contactInputSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Note = z.infer<typeof noteSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type ActivityType = Activity["type"];
export type Database = z.infer<typeof databaseSchema>;
