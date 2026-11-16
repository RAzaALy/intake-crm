# Intake CRM: project rules for Claude

## What this is
A small CRM for a law firm's **client intake team**, built as a 24-hour case study for a Senior Frontend Engineer role.
Reviewers judge: UX and visual judgement, code quality, product sense, and how well the author explains decisions.
The author (Raza) must be able to explain **every line** in a 30-minute walkthrough. Write code a senior engineer would write by hand: plain, typed, readable. No clever tricks.

Read before any UI or feature work:
- `docs/PRODUCT_SPEC.md`: features, acceptance criteria, data model, state matrix
- `docs/DESIGN_BRIEF.md`: visual system, voice and copy, anti-slop rules
- `docs/UX_BRIEF.md`: screen-by-screen UX spec (written by the ux-researcher agent, edited by Raza)

## Stack (do not add other libraries without asking)
- Next.js (latest stable), App Router, TypeScript `strict`
- Tailwind CSS v4 with tokens in `src/app/globals.css` (`@theme`)
- Radix UI primitives for Dialog, DropdownMenu, Select, Toast-free popovers
- TanStack Query v5 for async data
- React Hook Form + Zod (`@hookform/resolvers`)
- dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) for the pipeline
- `sonner` for toasts, `lucide-react` for icons (16px, used sparingly), `date-fns` for dates
- `clsx` + `tailwind-merge` via a `cn()` helper
- Vitest + React Testing Library + `@testing-library/user-event` + jsdom
- Fonts through `next/font/google` (see DESIGN_BRIEF)

Check installed versions in `package.json` before using an API. If unsure how an API works in the installed version, say so and check, do not guess.
Next.js 16 ships its own docs: before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (see @AGENTS.md).

## Architecture
Feature-based folders. Server components for route shells, client components for anything that touches data or interaction.

```
src/
  app/
    layout.tsx           fonts, <Providers>, AppShell
    providers.tsx        'use client': QueryClientProvider, Toaster
    page.tsx             redirect('/contacts')
    not-found.tsx
    globals.css          Tailwind + @theme tokens
    contacts/            page, loading, error, new/, [id]/, [id]/edit/
    pipeline/            page, loading, error
  features/
    contacts/
      api/repository.ts  the ONLY code that touches storage
      api/queries.ts     query keys + useContacts, useContact, useCreateContact, ...
      components/        ContactTable, ContactCard, ContactForm, StatusFilter, ...
      schema.ts          Zod schemas; types are inferred from them
      types.ts
      filters.ts         pure search/filter/sort functions (unit tested)
    pipeline/components/ Board, Column, PipelineCard, MoveToMenu
    activity/            Timeline, activity formatting
  components/ui/         Button, Badge, Input, Textarea, Select, Field, Skeleton, EmptyState, ErrorState
  lib/                   storage.ts, delay.ts, simulate.ts, format.ts, cn.ts
  test/                  setup, factories
```

### Data rules
- `repository.ts` exposes async functions (`listContacts`, `getContact`, `createContact`, `updateContact`, `moveContact`, `addNote`) that return Promises, add 300 to 600 ms latency, and throw when the "Simulate API failure" switch is on.
- The repository writes Activity entries itself (created, edited, status_changed, note_added). Components never create activities.
- Storage key is versioned (`intake-crm:v1`). Seed data loads only when the key is empty.
- Swapping to Supabase must only require changing `repository.ts`. Keep that true.

### State rules
- Server state: TanStack Query only. No copying query data into `useState`.
- List state (search, status, sort): URL search params. Read with `useSearchParams`, write with `window.history.replaceState` (Next.js syncs it into `useSearchParams` at once, with no server round-trip, so the URL never lags the search box).
- Form state: React Hook Form.
- No global store. No Context except providers.

### Next.js rules
- Never read `localStorage` or `window` during render or at module top level. Only inside query functions or effects. This prevents hydration mismatches.
- Any client component using `useSearchParams` must sit inside a `<Suspense>` boundary, or `next build` fails.
- In client components use `useParams()`. In server components `params` is a Promise: `await` it.
- Put `'use client'` as low in the tree as possible.
- Export `metadata` per route (for example `Contacts · Intake`).

## Code conventions
- Components: PascalCase files, one component per file, named exports.
- Hooks start with `use`. Event props start with `on`, handlers with `handle`.
- No `any`. No non-null `!` unless a comment says why. Prefer union types over enums.
- Small components. If a file passes about 150 lines, propose a split.
- Comments explain *why*, not *what*. Few of them.
- Every interactive element is reachable and usable by keyboard, has a visible focus ring, and has an accessible name. Status is never shown by colour alone.

## UI rules
- Follow `docs/DESIGN_BRIEF.md` exactly. Use only the tokens defined there.
- All user-facing text comes from the copy deck in `docs/UX_BRIEF.md`. Do not invent marketing copy, taglines, emoji, or "Welcome back!" lines. If text is missing, leave `TODO(copy)` and tell Raza.
- Every screen has loading (layout-matching skeleton), empty, and error (with Retry) states.

## How to work with Raza
1. Work in **small slices** (one feature at a time). Start each slice in plan mode with a short plan: files to create or change and why.
2. After coding a slice, run: `npm run lint && npm run typecheck && npm test && npm run build`. Report results honestly. Do not say "done" if anything fails.
3. Then give a short **walkthrough**: what each changed file does, and one decision Raza may be asked about.
4. **Do not commit until Raza says "commit".** Suggest small commits in Conventional Commits style (`feat(contacts): ...`). On "commit", make them in order and push.
   **Raza is the only author.** Never add `Co-Authored-By`, "Generated with Claude" or any other Claude attribution to commit messages or PR descriptions. Plain Conventional Commit messages only.
5. Never add a dependency, change the folder structure, or rename public APIs without asking.
6. If a requirement is unclear, ask one short question instead of guessing.

## Phases, skills and agents
- The build is split into phases in `docs/BUILD_PHASES.md`. One phase per session.
- Skills: `/slice N` (build phase N end to end), `/copy-pass` (humanize UI text), `/ship-check` (before push; `final` before submitting), `/walkthrough-quiz` (interview rehearsal).
- Agents: `ux-researcher`, `test-engineer`, `code-reviewer` (see `.claude/agents/`).

## Commands
- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck` (`tsc --noEmit`), `npm test` (`vitest run`)
