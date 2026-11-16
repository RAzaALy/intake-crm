# Build phases: Intake CRM

One phase = one fresh Claude session in the project folder, run with `/slice N`.
Phases run **in order**: each one builds on the commits of the one before. Raza reviews, says "commit", and the session commits and pushes. Vercel redeploys on every push.

| # | Phase | Time | Depends on |
|---|---|---|---|
| 0 | Setup and first deploy | 0:20 | nothing |
| 1 | UX brief and copy deck | 0:30 | 0 |
| 2 | Foundation and UI kit | 1:00 | 1 |
| 3 | Data layer | 0:45 | 2 |
| 4 | Contacts list | 1:15 | 3 |
| 5 | Create and edit form | 1:00 | 4 |
| 6 | Contact details | 1:00 | 5 |
| 7 | Pipeline | 1:00 | 6 |
| 8 | Polish and copy pass | 0:45 | 7 |
| 9 | README and final check | 0:30 | 8 |
| 10 | Walkthrough rehearsal | 0:30 | 9 |

**If behind schedule at hour 6**, cut in this order: keyboard shortcuts → stale-lead hint → drag and drop (keep the Move to menu) → Undo toast. Never cut loading, empty or error states.

---

## Phase 0: setup and first deploy
Done from the Ability prep session, not with `/slice`.
- `create-next-app` in `~/projects/intake-crm` (TypeScript, Tailwind, ESLint, App Router, `src/`, npm).
- Copy the kit (`CLAUDE.md`, `docs/`, `.claude/`) into the project.
- Create the public GitHub repo `intake-crm` and push.
- Raza imports the repo on vercel.com and deploys.

**Done when:** the Vercel URL opens in a private window. **Commit:** `chore: scaffold Next.js app with project docs`

## Phase 1: UX brief and copy deck
**Reads:** PRODUCT_SPEC, DESIGN_BRIEF.
- `ux-researcher` Mode 1 writes `docs/UX_BRIEF.md`: persona, screen-by-screen hierarchy, states, accessibility notes, full copy deck marked DRAFT.
- Run the Humanizer skill (if installed) over the copy deck, then **Raza rewrites it in Raza's own words** and removes the DRAFT markers.

**Done when:** every string the app needs is in the copy deck and Raza has approved it. **Commit:** `docs: add UX brief and copy deck`

## Phase 2: foundation and UI kit
**Reads:** CLAUDE.md (stack, architecture), DESIGN_BRIEF (tokens, type, layout).
- Install the stack. Add `typecheck` and `test` scripts, Vitest + RTL setup.
- `globals.css` with `@theme` tokens exactly from the brief. `next/font` for IBM Plex Sans and Source Serif 4.
- `cn()`, `providers.tsx` (QueryClient, Toaster), AppShell: sidebar on desktop, top bar + bottom tabs on mobile. `/` redirects to `/contacts`. Per-route `metadata`, custom favicon.
- `components/ui`: Button, Badge, Input, Textarea, Select, Field, Skeleton, EmptyState, ErrorState, Avatar, PageHeader.
- Agents: `ux-researcher` Mode 2 on the shell, `code-reviewer`.

**Done when:** empty shell looks right at 375px and 1280px, all checks pass. **Commits:** `chore: add dependencies and tooling`, `feat(ui): design tokens and app shell`, `feat(ui): base components`

## Phase 3: data layer
**Reads:** PRODUCT_SPEC (data model, seed rules), CLAUDE.md (data and state rules).
- `schema.ts` (Zod, types inferred), `lib/storage.ts` (versioned key), realistic seed data, `repository.ts` (latency, automatic activities, simulated failure), `queries.ts` (query keys, hooks, mutations).
- Agents: `test-engineer` for schema and repository, `code-reviewer`.

**Done when:** repository tests pass; seed loads once; failure switch throws. **Commits:** `feat(data): contact schema and types`, `feat(data): localStorage repository with seed data`, `test(data): schema and repository`

## Phase 4: contacts list
**Reads:** PRODUCT_SPEC §1, UX_BRIEF list section.
- `filters.ts` (pure), URL state, debounced search, status chips with counts, sort, table (desktop) and cards (mobile), skeleton, two empty states, error + Retry, Suspense around `useSearchParams`, "Simulate API failure" switch in the footer.
- Agents: `ux-researcher` Mode 2, `test-engineer` (filters, empty states), `code-reviewer`.

**Done when:** every list acceptance criterion holds; refresh keeps filters. **Commits:** `feat(contacts): pure filter and sort helpers`, `feat(contacts): list with search, filters and sort`, `feat(demo): simulate API failure switch`

## Phase 5: create and edit form
**Reads:** PRODUCT_SPEC §3, UX_BRIEF form section.
- Shared `ContactForm`, `/contacts/new`, `/contacts/[id]/edit`, errors on blur and submit, focus first invalid field, unique email, saving state, toast, unsaved-changes guard, edit load and save error states.
- Agents: `ux-researcher` Mode 2, `test-engineer` (form flow), `code-reviewer`.

**Done when:** invalid submit focuses the first error; valid save lands on the contact page. **Commit:** `feat(contacts): create and edit form with validation`

## Phase 6: contact details
**Reads:** PRODUCT_SPEC §2, UX_BRIEF details section.
- Header with badges and status menu, details panel (mailto, tel), notes with optimistic add, timeline with human sentences, not-found and error states, skeleton.
- Agents: `ux-researcher` Mode 2, `test-engineer` (note add, timeline text), `code-reviewer`.

**Done when:** status change and new note both appear in the timeline. **Commits:** `feat(contacts): details page`, `feat(activity): notes and timeline`

## Phase 7: pipeline
**Reads:** PRODUCT_SPEC §4, UX_BRIEF pipeline section.
- Three columns with counts, dnd-kit drag and drop, Move to menu on every card, optimistic move with rollback, Undo toast, flagged-conflict warning, horizontal snap scroll on mobile, all states.
- Agents: `ux-researcher` Mode 2, `test-engineer` (Move to menu, rollback), `code-reviewer`.

**Done when:** a card moves by mouse, keyboard menu and on mobile; failure rolls back. **Commits:** `feat(pipeline): status board with move menu`, `feat(pipeline): drag and drop with undo`

## Phase 8: polish and copy pass
- Accessibility and responsive pass on every screen: keyboard-only walkthrough, focus after actions, contrast, 375px overflow, 44px tap targets, reduced motion. List issues, Raza approves, then fix.
- Human touches from the brief: relative times with exact date on hover, stale-lead hint, `/` focuses search.
- `/copy-pass`, Raza approves every row.

**Done when:** no keyboard traps, no overflow, no flagged copy left. **Commits:** `fix(a11y): ...`, `feat(contacts): stale lead hint and search shortcut`, `chore(copy): final copy pass`

## Phase 9: README and final check
- Raza writes the README draft (five sections from the brief), Claude tightens it to one page without changing the voice.
- `/ship-check final` against the live Vercel URL.

**Done when:** every final check passes. **Commit:** `docs: add README`. Then Raza sends the Vercel and GitHub links to Maryam.

## Phase 10: walkthrough rehearsal
- `/walkthrough-quiz`, then "feedback". Repeat the weakest answers out loud.
