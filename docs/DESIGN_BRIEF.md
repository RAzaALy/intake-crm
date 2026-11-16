# Design brief: Intake CRM

## The feeling
A calm, precise working tool a law firm would trust. It looks like it was designed by a person who sat with an intake team for a day: dense enough to scan, quiet enough to stay readable for 8 hours, with small kind details.

Think: a well-made paper case file, not a startup landing page.

## Anti-slop rules (hard rules)
Do NOT use:
- Gradients, glassmorphism, glows, blurred blobs, or purple/indigo "AI" palettes
- Hero sections, "Welcome back, Raza! 👋", dashboard stat cards nobody asked for
- Emoji anywhere in the UI
- Default shadcn look (zinc + rounded-xl cards + heavy shadows everywhere)
- Inter or Geist as the only font with no other typographic choice
- Icons on every button and label. Icons only where they help scanning.
- Vague copy: "Manage your contacts effortlessly", "Something went wrong", "Oops!", "Seamless", "Streamline"
- Every card with the same big padding, centred text, and drop shadow
- Random colours per status with no meaning

DO:
- Borders and background shifts for structure; shadows only on floating layers (menus, dialogs, dragged card)
- Left-aligned text, a clear type scale, tabular numbers for counts and dates
- Specific, plain copy in the firm's language
- Small human details (see "Human touches")

## Typography
- UI font: **IBM Plex Sans** (400, 500, 600) via `next/font/google`. Neutral, slightly legal and technical, not the default AI font.
- Page titles only: **Source Serif 4** (600). Gives the "case file" character without being decorative.
- Numbers: `font-variant-numeric: tabular-nums` in tables, counts and dates.
- Scale (px): 12 (meta), 13 (table secondary), 14 (body and table), 16 (inputs on mobile, section titles), 20 (card titles), 24 (page titles), 28 (page titles desktop).
- Inputs are at least 16px on mobile so iOS does not zoom.
- Line height 1.5 for body, 1.25 for headings. Max line length about 70ch for notes.

## How colour works here (token layers)
1. **Primitives**: raw hex values with no meaning (`--green-800: #1F4E46`). Only `globals.css` uses them.
2. **Semantic tokens**: meaning, not colour (`--color-primary`, `--color-text-muted`, `--color-status-lead-bg`). **Components use only these.**
3. **Component use**: a Button reads `--color-primary`; it never knows the hex.

Theming (dark mode, or a client's brand) = remap layer 2 to different primitives under `[data-theme="dark"]`. No component changes. Dark mode is out of scope for the build, but the tokens are named so it is a one-block change, which is a good walkthrough point.

Proportions: about 80% neutrals (backgrounds, surfaces, lines), 15% text, 5% primary. In a data-heavy tool the primary colour is rare on purpose: it marks the one main action per view, the current nav item, links and focus.

**Brand colour never doubles as a status colour.** The primary is green, so Active is blue, not green. Otherwise "New contact" and "Active" would look related.

## Colour tokens (Tailwind v4 `@theme`), direction A "Case file"
Warm neutrals with one deep green. Status colours carry meaning and always come with a text label. All pairs below were checked against WCAG AA.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--color-paper` | `#FAF9F7` | App background | |
| `--color-surface` | `#FFFFFF` | Panels, table, cards | |
| `--color-sunken` | `#F3F1ED` | Pipeline columns, hover and selected rows | |
| `--color-line` | `#E4E0D9` | Dividers (decorative only) | |
| `--color-line-input` | `#958E83` | Input, select and secondary button borders | 3.2:1 on white (UI needs 3:1) |
| `--color-ink` | `#1F1D1A` | Primary text | 16:1 |
| `--color-ink-muted` | `#5F5A52` | Secondary text | 6.5:1 |
| `--color-ink-faint` | `#746D64` | Meta text, placeholders | 5.1:1 |
| `--color-primary` | `#1F4E46` | Primary button, links, focus ring | white on it 9.4:1 |
| `--color-primary-hover` | `#173C36` | | |
| `--color-primary-soft` | `#E3EEEB` | Selected filter chip, current nav | primary text on it 7.9:1 |
| `--color-accent` | `#8A6420` | Rare highlights: stale-lead hint, "assigned to you" | 5.4:1 |
| Lead | text `#8A5A00`, bg `#FBF1DC` | Waiting, needs action | 5.3:1 |
| Active | text `#1D5A9E`, bg `#E3EDF9` | Engaged | 5.9:1 |
| Closed | text `#55595F`, bg `#ECEDEE` | Done, quiet | 6.0:1 |
| Conflict flagged | text `#9B2C2C`, bg `#FBE7E5` | Risk | 6.3:1 |
| Conflict pending | text `#5F5A52`, bg `#F3F1ED` | Neutral | 6.1:1 |
| Conflict cleared | text `#5F5A52`, no bg, check icon | Low emphasis | |
| `--color-danger` | `#B42318` | Errors, destructive | 6.6:1 |

Secondary button = white surface, `--color-line-input` border, ink text. There is no second brand colour: in product UI, "secondary" means quieter, not a different hue.

## Space, shape, motion
- 4px grid. Common steps: 4, 8, 12, 16, 24, 32, 48.
- Radius: 6px controls, 8px panels, 999px badges. Nothing larger.
- Borders 1px `--color-line`.
- Shadows: only menus, dialogs, toasts and the card being dragged.
- Motion 120 to 180 ms ease-out on hover, menus and drag drop. Respect `prefers-reduced-motion`.
- Focus ring: 2px `--color-primary` with 2px offset, always visible on keyboard focus.

## Layout
- Desktop (≥ 1024px): left sidebar 224px (product name, Contacts, Pipeline, "New contact" button), content max width 1200px, 32px page padding.
- Tablet (768 to 1023px): collapsed sidebar or top bar.
- Mobile (< 768px): top bar with page title and "New" action, bottom tab bar (Contacts, Pipeline), 16px gutters, touch targets 44px minimum, no horizontal page scroll (only the pipeline scrolls sideways, on purpose).
- Table rows 48px high on desktop, about 56px when a secondary line (such as email) is stacked under the name. Row hover uses `--color-sunken`.

## Components (the small design system)
Button (primary, secondary, ghost, danger; sm and md; loading state), Badge (status, conflict), Input, Textarea, Select, Field (label + hint + error, wires `aria-describedby` and `aria-invalid`), Skeleton, EmptyState, ErrorState, Avatar (initials only, colour from name hash within a muted set), PageHeader, Toolbar.

## Human touches (pick what fits the time)
- Relative times ("3 days ago") with the exact date in a `title` or tooltip.
- "Last activity" column, so the coordinator sees who has gone quiet.
- Leads with no activity for 7+ days show a quiet "No contact in 9 days" hint.
- Undo toast after moving a card, instead of a confirm dialog.
- Press `/` to focus search. `n` opens "New contact" when not typing.
- Empty states say what the screen is for, in one sentence, with one clear action.
- Error messages say what happened and what to do next.
- Initials avatars, never stock photos or illustrations.

## Voice and copy
- Plain, calm, specific. Short sentences. Sentence case everywhere ("New contact", not "New Contact").
- Use intake language: inquiry, matter, conflict check, assigned attorney, prospective client.
- Buttons are verbs: "Save contact", "Add note", "Move to Active", "Clear filters", "Try again".
- Never blame the user. Never be cute.

Examples (Raza rewrites these in Raza's own voice before they ship; the final deck lives in `docs/UX_BRIEF.md`):
| Place | Copy |
|---|---|
| Empty list | "No contacts yet. New inquiries you add will appear here." / button "New contact" |
| No matches | "No contacts match "{query}" in {status}." / button "Clear filters" |
| List error | "We couldn't load contacts. Check your connection and try again." / "Try again" |
| Not found | "This contact doesn't exist or was removed." / "Back to contacts" |
| No notes | "No notes yet. Add what was discussed on the first call." |
| Email error | "Enter an email like name@firm.com" |
| Duplicate email | "Another contact already uses this email." |
| Moved toast | "Amna Siddiqui moved to Active." / "Undo" |
| Flagged warning | "Moved to Active. Conflict check is still flagged." |
