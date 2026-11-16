# UX brief: Intake CRM

Written by the ux-researcher agent from `PRODUCT_SPEC.md` and `DESIGN_BRIEF.md`. Copy deck reviewed and approved by Raza. All UI text lives in the copy deck (section 3); screens reference it by key.

## 1. User and context

**Persona: the intake coordinator.** First voice a prospective client hears. Takes calls and web inquiries, logs who the person is and what kind of matter they have, runs the conflict check, and hands the person to an attorney. Not a lawyer, but careful: a wrong conflict status or a lost callback has real cost.

**Top 3 jobs**
1. Log a new inquiry while the person is still on the phone (name, contact details, matter type, source).
2. Find someone fast when they call back, and see the latest: status, conflict check, notes.
3. At the end of the day, see who has gone quiet and move people along (Lead to Active, or Closed).

**Context**
- Often on a call: one hand on the phone or headset, typing while listening. Keyboard paths matter more than hover.
- Interrupted constantly. Screens must show state at a glance and survive a refresh (URL holds filters, form warns before losing input).
- Follow-ups happen in a batch late in the day, sometimes from a phone. "Last activity" and the stale-lead hint are the to-do list.

## 2. Screens

### App shell
- **Desktop (1024px and up):** 224px left sidebar: `app.name`, nav (`nav.contacts`, `nav.pipeline`, current item uses `--color-primary-soft`), then a primary `nav.newContact` button. Sidebar footer: demo switch (`demo.switch.label` + `demo.switch.hint`). Content max 1200px, 32px padding.
- **Tablet (768 to 1023px):** same as mobile top bar, no bottom tabs; nav links sit in the top bar.
- **Mobile (under 768px):** top bar 56px: page title (aria-hidden copy of the h1) and `nav.newContact.short` button (accessible name `nav.newContact`). Bottom tab bar 56px: Contacts, Pipeline, each tab at least 44px tall. Demo switch sits in a small footer at the end of each page's content, above the tab bar. The page h1 is visually hidden below 768px so there is still exactly one h1.
- **Failure indicator:** when the demo switch is on, show `demo.indicator` as a small Lead-coloured badge beside `app.name` (desktop) or the top bar title (mobile), so nobody mistakes simulated errors for a broken build.
- **A11y:** first focusable element is `app.skipLink` to `<main id="main">`. Landmarks: `<nav aria-label={nav.label}>`, `<main>`, `<footer>` for the demo switch. Current nav item has `aria-current="page"`. The switch is a real `role="switch"` with `aria-checked` and its hint wired by `aria-describedby`. Toasts (sonner) announce politely.

### Contacts list (`/contacts`)
**Question:** Who is waiting on us, and where is the person I'm looking for?

**Hierarchy**
1. Search box: the most common action is "find the person who just called".
2. Rows: name (with email underneath), then status badge and conflict badge. The flagged conflict is the only red on the page, so it pops without effort.
3. Last activity and the stale-lead hint: end-of-day follow-up list. Matter and attorney are reference, so they sit in muted text.

**Desktop**
```
Contacts                                              (h1, serif 28)
[ Search contacts: Name, email or phone      / ]  Sort by [Last activity v]
[All 18] [Lead 8] [Active 6] [Closed 4]                         18 contacts
+---------------------------------------------------------------------------+
| Name               | Status | Matter   | Conflict check | Attorney | Last  |
| Amna Siddiqui      | Lead   | Family   | Flagged        | Unassig. | 9 days|
| amna@...           |        |          |                |          | No contact in 9 days
+---------------------------------------------------------------------------+
```
Rows 48px, hover `--color-sunken`. Whole row is clickable via a stretched link on the name, so each row is one tab stop.

**Mobile:** search full width (16px text), chips scroll horizontally in one row, sort select below. Cards (not table), four short lines so about four fit on screen: name + status badge; email; matter · attorney in muted 13px; conflict badge on the left and last activity (with the stale hint) on the right. The `list.card.*` labels are screen-reader only. Whole card is the link.

**Interactions**
- `/` focuses search, `n` opens New contact (both ignored while typing in a field).
- Search debounced about 250ms; search, status and sort written to the URL with `router.replace`.
- Chips are toggle buttons (`aria-pressed`); only one is pressed.
- Tab order: skip link, nav, search, chips, sort, rows. Enter on a row opens it.

**States**
- Loading: 8 skeleton rows matching column widths (cards on mobile); sr text `list.loading.sr`.
- Empty, no data: `list.empty.title`, `list.empty.body`, `list.empty.action`.
- Empty, no matches: `list.noMatch.queryStatus` / `list.noMatch.query` / `list.noMatch.status`, `list.noMatch.hint`, `list.noMatch.action`. Search box and chips stay visible.
- Error: `list.error.title`, `list.error.body`, `list.error.action`; add `common.error.demoHint` when the switch is on.

**A11y:** real `<table>` with `<caption class="sr-only">` (`list.table.caption`) and `<th scope="col">`. Search has a visible `<label>`. Result count is a `role="status"` region (`list.announce`), updated after the debounce, not per keystroke. Badges always carry their text label; relative times use `<time datetime>` with the exact date in `title`.

### Contact details (`/contacts/[id]`)
**Question:** What is the latest on this person, and what do I do next?

**Hierarchy**
1. Header: name (h1), status badge, conflict badge, matter. Answers "where are we" in one glance.
2. Notes: the add-note box sits at the top of the notes column, because during a call the coordinator writes, not reads.
3. Details (email, phone, attorney) and Activity: reference, scanned when needed.

**Desktop:** `details.back` link, then header row: h1 + badges on the left, `details.edit` (secondary) and `details.status.trigger` (secondary, dropdown) on the right. Below, two columns: left (about 2/3) Notes then Activity; right (about 1/3) Details panel as a `<dl>`.

**Mobile:** single column in this order: header, actions (two buttons side by side, full width), Notes, Details, Activity. Email and phone are tappable links (44px rows).

**Interactions**
- Status menu (Radix DropdownMenu): items `details.status.item` for the two statuses it is not in. Result toast `details.toast.status.*`. Focus returns to the trigger.
- Note: Ctrl+Enter or Cmd+Enter submits. Optimistic insert at the top with `details.notes.pending` until saved. On failure the note is removed from the list and the text is put back in the box.

**States**
- Loading: skeleton header (name bar + 2 badges), skeleton details panel (6 lines), 3 skeleton notes; sr `details.loading.sr`.
- Empty: `details.notes.empty`, `details.activity.empty`.
- Not found: `details.notFound.title`, `details.notFound.body`, `details.notFound.action`.
- Error: `details.error.title`, `details.error.body`, `details.error.action`.

**A11y:** h1 name; h2 for Notes, Details, Activity. Details is a `<dl>`. Timeline is an `<ol>` of `<li>` with `<time>`. Note counter: visible `details.notes.counter`; `details.notes.counter.sr` announced politely only when under 100 characters remain. Status trigger accessible name `details.status.trigger.sr`. Browser title is set client-side to `meta.contactDetails` once loaded (data lives in localStorage, so server metadata cannot know the name; static fallback `meta.contactDetails.static`).

### Create and edit form (`/contacts/new`, `/contacts/[id]/edit`)
**Question:** Have I captured this inquiry correctly?

**Hierarchy**
1. The person: full name, email, phone. Typed first, while on the call.
2. The matter: matter type, source, status. Required, quick selects.
3. Routing: assigned attorney and conflict check. Optional with defaults (Unassigned, Pending), often filled later.

**Layout:** single column, max 640px, two fieldsets (`form.section.person`, `form.section.matter`). Desktop: email and phone side by side; matter type and source side by side. Mobile: everything stacked, inputs 16px text, 44px tall. Actions at the bottom: primary submit then `form.cancel` (secondary). On mobile the action row is full width, submit first.

**Interactions**
- Errors appear on blur and on submit. On submit with errors, focus the first invalid field and announce `form.error.summary`.
- Submit shows `form.submit.creating` / `form.submit.saving`, is disabled while pending (no double submit). Success: toast, then go to the contact page.
- Cancel with changes opens the confirm dialog (`form.unsaved.*`); initial focus on `form.unsaved.stay`. Without changes, Cancel goes straight back. Refresh or tab close uses `beforeunload` (browser text, no copy).
- New: Cancel returns to `/contacts`. Edit: Cancel returns to the contact.

**States**
- Edit loading: skeleton fields in the same grid; sr `form.loading.sr`.
- Edit load failed: `form.error.load.*`. Edit unknown id: reuse `details.notFound.*`.
- Save failed: inline alert above the actions, `form.error.save.title` + `form.error.save.body`; the form keeps every value.

**A11y:** every input has a visible `<label>`; hints and errors linked via `aria-describedby`; `aria-invalid` on errors. Optional fields say so in the label (`form.optional`); required fields are not starred. Fieldsets have `<legend>`. Save-failed alert uses `role="alert"`. Dialog has `role="alertdialog"`, title and description wired.

### Pipeline (`/pipeline`)
**Question:** Where is everyone in intake, and who needs moving?

**Hierarchy**
1. Column headings with counts: the shape of the intake queue.
2. Cards: name, conflict badge if not cleared, stale hint on Leads.
3. Matter, attorney, last activity in muted text.

**Desktop:** three equal columns on `--color-sunken`, 8px radius, h2 + count at the top. Cards on `--color-surface` with a 1px line, no shadow until dragged. Each card: name (link to details), matter + attorney, last activity, and a small `pipeline.card.move` ghost button (bottom right). Cards in a column sort by last activity, newest first.

**Mobile:** columns 85% of viewport wide, horizontal scroll with snap so the next column peeks. Drag is disabled on touch (scroll wins); the Move menu is the way to move. Move button is 44px tall.

**Interactions**
- Drag and drop with dnd-kit (pointer and keyboard sensors). Drag handle is the whole card except the name link and Move button.
- Move menu: `pipeline.card.menu.item` for the two other statuses.
- Every move is optimistic, then toast `toast.move.moved` (or `toast.move.flagged` for flagged conflict to Active) with `toast.move.undo`. Failure rolls back and shows `toast.move.failed`.
- After a move by menu, focus goes to the moved card's Move button in its new column, so keyboard users are not dropped at the top of the page.

**States**
- Loading: 3 skeleton columns with 3, 2, 1 skeleton cards; sr `pipeline.loading.sr`.
- Empty column: `pipeline.column.empty.{status}` + `pipeline.column.empty.hint`, inside a dashed `--color-line` drop area.
- Error: `pipeline.error.*`. Move failed: toast.

**A11y:** h1 Pipeline, h2 per column with `pipeline.column.heading.sr`. Each column is a `<section aria-labelledby>`, cards in a `<ul>`. dnd-kit `accessibility.screenReaderInstructions` and `announcements` use the `pipeline.dnd.*` keys. Status is never shown by colour alone: column headings name the status.

### 404 page
**Question:** Where am I, and how do I get back? Inside the app shell: h1 `notFound.title`, `notFound.body`, link `notFound.action`. No illustration.

## 3. Copy deck

Conventions: sentence case; full stops on sentences, none on labels and buttons; `…` (single ellipsis character) for in-progress buttons; `{placeholders}` filled at runtime; enum labels (`status.*`, `matter.*`) are inserted as written.

| Key | Screen | String |
|---|---|---|
| app.name | Shell | Intake |
| app.skipLink | Shell | Skip to main content |
| nav.label | Shell | Main |
| nav.contacts | Shell | Contacts |
| nav.pipeline | Shell | Pipeline |
| nav.newContact | Shell | New contact |
| nav.newContact.short | Shell (mobile top bar) | New |
| meta.title.template | All | {page} · Intake |
| meta.description | All | Intake tracker for prospective clients, conflict checks and attorney handoffs. |
| meta.contacts | List | Contacts · Intake |
| meta.contactNew | Form | New contact · Intake |
| meta.contactDetails.static | Details | Contact · Intake |
| meta.contactDetails | Details | {name} · Intake |
| meta.contactEdit.static | Form | Edit contact · Intake |
| meta.contactEdit | Form | Edit {name} · Intake |
| meta.pipeline | Pipeline | Pipeline · Intake |
| meta.notFound | 404 | Page not found · Intake |
| status.lead | All | Lead |
| status.active | All | Active |
| status.closed | All | Closed |
| matter.family | All | Family |
| matter.immigration | All | Immigration |
| matter.corporate | All | Corporate |
| matter.employment | All | Employment |
| matter.property | All | Property |
| matter.criminal | All | Criminal |
| source.referral | All | Referral |
| source.website | All | Website |
| source.phone | All | Phone |
| source.walk_in | All | Walk-in |
| conflict.pending | Form | Pending |
| conflict.cleared | Form | Cleared |
| conflict.flagged | Form | Flagged |
| conflict.badge.pending | List, details, pipeline | Conflict check pending |
| conflict.badge.cleared | List, details, pipeline | Conflict cleared |
| conflict.badge.flagged | List, details, pipeline | Conflict flagged |
| common.unassigned | All | Unassigned |
| common.lastActivity.never | All | No activity yet |
| common.time.justNow | All | Just now |
| common.time.relative | All | {relative} (date-fns, e.g. "3 days ago") |
| common.time.exact | All (title tooltip) | {date} (e.g. "12 Nov 2026, 2:05 pm") |
| common.date.short | Details | {date} (e.g. "12 Nov 2026") |
| common.loading | All | Loading… |
| common.tryAgain | All | Try again |
| common.cancel | All | Cancel |
| common.error.demoHint | All error states | Simulate API failure is on, so every request fails. Turn it off to load data again. |
| list.title | List | Contacts |
| list.search.label | List | Search contacts |
| list.search.placeholder | List | Name, email or phone |
| list.search.shortcut | List | Press / to search |
| list.search.clear | List | Clear search |
| list.filter.label | List | Filter by status |
| list.filter.all | List | All |
| list.filter.chip | List | {status} {count} (count in muted tabular numerals) |
| list.filter.chip.sr | List | {status}, {count} contacts |
| list.filter.chip.sr.one | List | {status}, 1 contact |
| list.sort.label | List | Sort by |
| list.sort.lastActivity | List | Last activity |
| list.sort.name | List | Name A to Z |
| list.sort.added | List | Date added |
| list.table.caption | List | Contacts, sorted by {sort} |
| list.col.name | List | Name |
| list.col.status | List | Status |
| list.col.matter | List | Matter |
| list.col.conflict | List | Conflict check |
| list.col.attorney | List | Assigned attorney |
| list.col.lastActivity | List | Last activity |
| list.card.matter | List (mobile) | Matter |
| list.card.attorney | List (mobile) | Attorney |
| list.card.conflict | List (mobile) | Conflict check |
| list.card.lastActivity | List (mobile) | Last activity |
| list.count.one | List | 1 contact |
| list.count.other | List | {count} contacts |
| list.announce | List (live region) | {count} contacts found |
| list.announce.one | List (live region) | 1 contact found |
| list.announce.none | List (live region) | No contacts found |
| list.stale | List, pipeline | No contact in {n} days |
| list.empty.title | List | No contacts yet |
| list.empty.body | List | New inquiries you add will appear here. |
| list.empty.action | List | New contact |
| list.noMatch.title | List | No matches |
| list.noMatch.queryStatus | List | No contacts match "{query}" in {status}. |
| list.noMatch.query | List | No contacts match "{query}". |
| list.noMatch.status | List | No contacts in {status}. |
| list.noMatch.hint | List | Check the spelling, or search by email or phone instead. |
| list.noMatch.action | List | Clear filters |
| list.error.title | List | Contacts didn't load |
| list.error.body | List | We couldn't load contacts. Check your connection and try again. |
| list.error.action | List | Try again |
| list.loading.sr | List | Loading contacts… |
| details.back | Details | Back to contacts |
| details.header.matter | Details | {matter} matter |
| details.edit | Details | Edit |
| details.edit.sr | Details | Edit {name} |
| details.status.trigger | Details | Change status |
| details.status.trigger.sr | Details | Change status, currently {status} |
| details.status.item | Details | Move to {status} |
| details.toast.status.moved | Details | {name} moved to {status}. |
| details.toast.status.flagged | Details | {name} moved to Active. Conflict check is still flagged. |
| details.toast.status.failed | Details | Couldn't change the status. {name} is still {status}. Try again. |
| details.section.details | Details | Details |
| details.label.email | Details | Email |
| details.label.phone | Details | Phone |
| details.label.source | Details | Source |
| details.label.attorney | Details | Assigned attorney |
| details.label.added | Details | Added |
| details.label.lastActivity | Details | Last activity |
| details.notes.title | Details | Notes |
| details.notes.label | Details | Add a note |
| details.notes.placeholder | Details | What was discussed and what happens next |
| details.notes.counter | Details | {count} / 1000 |
| details.notes.counter.sr | Details (live region) | {remaining} characters left |
| details.notes.shortcut | Details | Ctrl+Enter or Cmd+Enter to add |
| details.notes.submit | Details | Add note |
| details.notes.submitting | Details | Adding… |
| details.notes.pending | Details | Saving… |
| details.notes.error.required | Details | Write a note first. |
| details.notes.error.tooLong | Details | Notes can be up to 1000 characters. This one has {count}. |
| details.notes.toast.saved | Details | Note added. |
| details.notes.toast.failed | Details | Note not saved. Your text is still in the box. Try again. |
| details.notes.empty | Details | No notes yet. Add what was discussed on the first call. |
| details.activity.title | Details | Activity |
| details.activity.empty | Details | No activity yet. |
| activity.created | Details | Contact added. |
| activity.edited | Details | Updated {fields}. |
| activity.edited.none | Details | Details updated. |
| activity.fields.two | Details | {a} and {b} |
| activity.fields.many | Details | {a}, {b} and {c} (commas between all but the last pair) |
| activity.field.fullName | Details | full name |
| activity.field.email | Details | email |
| activity.field.phone | Details | phone |
| activity.field.matterType | Details | matter type |
| activity.field.source | Details | source |
| activity.field.status | Details | status |
| activity.field.assignedTo | Details | assigned attorney |
| activity.field.conflictCheck | Details | conflict check |
| activity.status_changed | Details | Status changed from {from} to {to}. |
| activity.note_added | Details | Note added. |
| details.notFound.title | Details, edit | Contact not found |
| details.notFound.body | Details, edit | This contact doesn't exist. The link may be wrong or out of date. |
| details.notFound.action | Details, edit | Back to contacts |
| details.error.title | Details | This contact didn't load |
| details.error.body | Details | We couldn't load this contact. Check your connection and try again. |
| details.error.action | Details | Try again |
| details.loading.sr | Details | Loading contact… |
| form.new.title | Form | New contact |
| form.edit.title | Form | Edit {name} |
| form.section.person | Form | Prospective client |
| form.section.matter | Form | Matter and routing |
| form.label.fullName | Form | Full name |
| form.label.email | Form | Email |
| form.label.phone | Form | Phone |
| form.label.matterType | Form | Matter type |
| form.label.source | Form | Source |
| form.label.status | Form | Status |
| form.label.attorney | Form | Assigned attorney |
| form.label.conflict | Form | Conflict check |
| form.hint.fullName | Form | As the prospective client gives it. |
| form.hint.phone | Form | Digits, spaces, +, - and brackets are fine. |
| form.hint.source | Form | How the inquiry reached the firm. |
| form.hint.status | Form | New inquiries usually start as Lead. |
| form.hint.attorney | Form | Leave as Unassigned until an attorney takes the matter. |
| form.hint.conflict | Form | Leave as Pending until the check is run. |
| form.placeholder.email | Form | name@firm.com |
| form.placeholder.phone | Form | +1 555 010 4477 |
| form.placeholder.matterType | Form | Choose a matter type |
| form.placeholder.source | Form | Choose a source |
| form.placeholder.status | Form | Choose a status |
| form.option.unassigned | Form | Unassigned |
| form.optional | Form | (optional) |
| form.error.fullName.required | Form | Enter the prospective client's full name. |
| form.error.fullName.tooShort | Form | Full name needs at least 2 characters. |
| form.error.fullName.tooLong | Form | Full name can be up to 80 characters. |
| form.error.email.required | Form | Enter an email address. |
| form.error.email.invalid | Form | Enter an email like name@firm.com. |
| form.error.email.duplicate | Form | Another contact already uses this email. |
| form.error.phone.required | Form | Enter a phone number. |
| form.error.phone.invalid | Form | Use only digits, spaces, +, - and brackets. |
| form.error.phone.length | Form | Phone number needs 7 to 20 characters. |
| form.error.matterType.required | Form | Choose a matter type. |
| form.error.source.required | Form | Choose how the inquiry came in. |
| form.error.status.required | Form | Choose a status. |
| form.error.summary.one | Form (live region) | 1 field needs fixing before you can save. |
| form.error.summary | Form (live region) | {count} fields need fixing before you can save. |
| form.submit.create | Form | Create contact |
| form.submit.creating | Form | Creating… |
| form.submit.save | Form | Save contact |
| form.submit.saving | Form | Saving… |
| form.cancel | Form | Cancel |
| form.toast.created | Form | {name} added to contacts. |
| form.toast.updated | Form | Changes to {name} saved. |
| form.error.save.title | Form | Not saved |
| form.error.save.body | Form | We couldn't save this contact. Your changes are still here. Try again. |
| form.error.load.title | Form | This contact didn't load |
| form.error.load.body | Form | We couldn't load this contact for editing. Check your connection and try again. |
| form.error.load.action | Form | Try again |
| form.loading.sr | Form | Loading contact… |
| form.unsaved.title | Form | Leave without saving? |
| form.unsaved.body | Form | Your changes to this contact will be lost. |
| form.unsaved.leave | Form | Discard changes |
| form.unsaved.stay | Form | Keep editing |
| pipeline.title | Pipeline | Pipeline |
| pipeline.column.heading | Pipeline | {status} {count} |
| pipeline.column.heading.sr | Pipeline | {status}, {count} contacts |
| pipeline.column.empty.lead | Pipeline | No inquiries waiting. |
| pipeline.column.empty.active | Pipeline | No open matters. |
| pipeline.column.empty.closed | Pipeline | Nothing closed yet. |
| pipeline.column.empty.hint | Pipeline | Drag a card here, or use Move on any card. |
| pipeline.card.move | Pipeline | Move |
| pipeline.card.move.sr | Pipeline | Move {name} |
| pipeline.card.menu.label | Pipeline | Move to |
| pipeline.card.menu.item | Pipeline | Move to {status} |
| pipeline.card.drag.sr | Pipeline | Drag {name} |
| pipeline.dnd.instructions | Pipeline (sr) | To move a contact, press Space to pick it up, use the arrow keys to choose a column, then press Space to drop it. Press Escape to cancel. You can also use the Move button on each card. |
| pipeline.dnd.start | Pipeline (sr) | Picked up {name} from {status}. |
| pipeline.dnd.over | Pipeline (sr) | {name} is over {status}. |
| pipeline.dnd.overNone | Pipeline (sr) | {name} is not over a column. |
| pipeline.dnd.end | Pipeline (sr) | {name} dropped in {status}. |
| pipeline.dnd.endSame | Pipeline (sr) | {name} dropped back in {status}. No change. |
| pipeline.dnd.cancel | Pipeline (sr) | Move cancelled. {name} stays in {status}. |
| toast.move.moved | Pipeline | {name} moved to {status}. |
| toast.move.flagged | Pipeline | {name} moved to Active. Conflict check is still flagged. |
| toast.move.undo | Pipeline | Undo |
| toast.move.undone | Pipeline | Move undone. {name} is back in {status}. |
| toast.move.undoFailed | Pipeline | Couldn't undo the move. {name} is still in {status}. |
| toast.move.failed | Pipeline | Couldn't move {name}. The card is back in {status}. Try again. |
| pipeline.error.title | Pipeline | Pipeline didn't load |
| pipeline.error.body | Pipeline | We couldn't load the pipeline. Check your connection and try again. |
| pipeline.error.action | Pipeline | Try again |
| pipeline.loading.sr | Pipeline | Loading pipeline… |
| demo.switch.label | Shell | Simulate API failure |
| demo.switch.hint | Shell | For reviewers: makes every request fail, so you can see the error states. |
| demo.toast.on | Shell | Failure simulation on. Every request will fail until you turn it off. |
| demo.toast.off | Shell | Failure simulation off. |
| demo.indicator | Shell | Failure simulation on |
| notFound.title | 404 | Page not found |
| notFound.body | 404 | There's no page at this address. The link may be wrong or out of date. |
| notFound.action | 404 | Go to contacts |
| error.global.title | Global error | This page didn't load |
| error.global.body | Global error | This page hit an error and stopped. Try again, or reload the tab if it keeps happening. |
| error.global.action | Global error | Try again |

## 4. Small human touches
1. **Stale-lead hint.** Leads with no activity for 7+ days show `list.stale` in `--color-accent` under last activity (list and pipeline). It turns the list into the end-of-day call-back queue with one date comparison.
2. **Keyboard on a call.** `/` focuses search, `n` opens New contact, Ctrl/Cmd+Enter adds a note. The coordinator never has to let go of the phone to reach the mouse.
3. **Your words survive failure.** A failed note or save keeps the typed text in place and says so (`details.notes.toast.failed`, `form.error.save.body`). Retyping notes from a call is the thing people hate most.
4. **Failure simulation is visible.** `demo.indicator` in the shell, and `common.error.demoHint` inside error states, so a reviewer never mistakes the demo switch for a bug.
5. **Exact time on hover.** Relative times everywhere, with the exact date and time in `title`, because "when did they call?" sometimes needs the minute.

## 5. Cuts (not in 24 hours)
- **Delete, bulk actions, pagination:** out of scope in the spec; Closed is the archive, data is small.
- **Ordering within a pipeline column:** cards sort by last activity. Persisting a manual order adds a field and edge cases for no intake value.
- **"Assigned to you" and attorney management:** no auth, so no "you". Three seeded attorneys are a fixed list.
- **Editing or deleting notes, timeline filters:** notes are a record of what was said; append-only is also the safer legal default.
- **Inline editing in the list, command palette, more shortcuts (such as `e` to edit):** each one is a focus-management problem; three shortcuts cover the real paths.
- **Phone formatting by country:** needs a library and a firm locale decision. Validate the characters, store what was typed.
- **Dark mode, i18n:** tokens are ready for dark mode; it stays a README talking point.
