# Product spec: Intake CRM

## Who uses it
**Intake coordinators** at a law firm. They answer calls and web inquiries, record who the prospective client is and what kind of matter they have, run a conflict check, and pass the person to an attorney. They are busy, switch tasks often, and need to answer three questions fast:
1. Who is waiting on us right now?
2. What is the latest on this person?
3. What do I need to do next?

Design every screen around those questions.

## Statuses
| Status | Meaning in intake |
|---|---|
| Lead | Inquiry received, not yet engaged |
| Active | Engaged client, matter open |
| Closed | Not proceeding, or matter finished |

## Data model
```ts
type ContactStatus = 'lead' | 'active' | 'closed';
type MatterType = 'family' | 'immigration' | 'corporate' | 'employment' | 'property' | 'criminal';
type Source = 'referral' | 'website' | 'phone' | 'walk_in';
type ConflictCheck = 'pending' | 'cleared' | 'flagged';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: ContactStatus;
  matterType: MatterType;
  source: Source;
  assignedTo: string | null;   // attorney name
  conflictCheck: ConflictCheck;
  createdAt: string;           // ISO
  updatedAt: string;
  lastActivityAt: string;
}

interface Note { id: string; contactId: string; body: string; createdAt: string; }

type ActivityType = 'created' | 'edited' | 'status_changed' | 'note_added';
interface Activity {
  id: string; contactId: string; type: ActivityType; createdAt: string;
  meta?: { from?: ContactStatus; to?: ContactStatus; fields?: string[] };
}
```

## Seed data
- About 18 contacts: roughly 8 Lead, 6 Active, 4 Closed. Mixed matter types, sources and attorneys (3 attorneys).
- Realistic, varied names and believable notes. No "John Doe", no "Lorem ipsum", no `test@test.com`.
- Dates spread over the last 6 weeks, so relative times look real ("3 days ago").
- 2 or 3 contacts with conflict check `flagged`, several `pending`.
- Each contact has a believable history: created, maybe edited, status changes, 0 to 3 notes.

## Features and acceptance criteria

### 1. Contacts list (`/contacts`) (priority 1)
- Search matches name, email and phone, is case-insensitive, and is debounced about 250 ms.
- Status filter: All, Lead, Active, Closed, each showing a count.
- Sort: Last activity (default, newest first), Name A to Z, Date added (newest first).
- Search, filter and sort live in the URL and survive refresh.
- Desktop: table with name + email, status, matter type, conflict check, assigned attorney, last activity. Whole row opens the contact (it is a real link).
- Mobile (< 768px): cards with the same key facts.
- Empty, no data at all: one sentence and a "New contact" button.
- Empty, no matches: says what was searched and offers "Clear filters".
- Loading: skeleton rows. Error: message plus Retry.

### 2. Contact details (`/contacts/[id]`) (priority 1)
- Header: name, status badge, matter type, conflict check badge, Edit button, status change menu.
- Details: email (mailto), phone (tel), source, assigned attorney, added and last activity dates.
- Notes: add a note (required, max 1000 chars), newest first, optimistic insert.
- Timeline: activities newest first, human sentences ("Status changed from Lead to Active").
- Unknown id: a "Contact not found" state with a link back to the list.

### 3. Create and edit (`/contacts/new`, `/contacts/[id]/edit`) (priority 1)
- One shared `ContactForm`.
- Validation (Zod): full name required, 2 to 80 chars; email required, valid, and unique (ignoring the current contact when editing); phone required, digits, spaces, `+`, `-` and brackets, 7 to 20 chars; matter type, source and status required; assigned attorney and conflict check optional with defaults.
- Errors show on blur and on submit. On submit with errors, focus moves to the first invalid field.
- Error messages say what to fix ("Enter an email like name@firm.com"), not just "Invalid".
- Save button shows progress and prevents double submit. Success shows a toast and goes to the contact page.
- Leaving with unsaved changes: `beforeunload` on refresh or tab close, and a confirm on Cancel.

### 4. Pipeline (`/pipeline`) (priority 2)
- Three columns (Lead, Active, Closed) with counts.
- Move a contact by drag and drop, or by the "Move to" menu on each card (keyboard and mobile path).
- Move is optimistic. On failure: roll back and show an error toast.
- After a successful move: toast with **Undo**.
- Moving a contact with conflict check `flagged` to Active shows a warning in the toast (does not block).
- Mobile: columns scroll horizontally with snap; the menu is the main way to move.

### 5. Application states (required on every screen)
| Screen | Loading | Empty | Error |
|---|---|---|---|
| List | Skeleton rows / cards | No contacts; no matches | Message + Retry |
| Details | Skeleton header + panels | No notes yet; no activity | Not found; load failed + Retry |
| Form (edit) | Skeleton fields | n/a | Load failed + Retry; save failed inline |
| Pipeline | Skeleton columns | Empty column hint | Message + Retry; move failed toast |

### 6. Demo controls (priority 2)
- A small "Simulate API failure" switch in the footer or settings popover, stored in localStorage.
- When on, every repository call fails, so reviewers can see error states. Mention it in the README.

## Out of scope (say so in the README)
Authentication, multi-user sync, deleting contacts (closing is the archive), bulk actions, pagination (data is small), dark mode, analytics, i18n.

## Build order
Deploy shell → data layer → list → form → details → pipeline → polish (mobile, a11y, states) → tests → README.
