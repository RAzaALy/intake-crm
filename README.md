# Intake CRM

A small CRM for a law firm's client intake team: log new enquiries, check conflicts, and move people from first call to signed matter.

**Live:** https://intake-crm-eight.vercel.app/contacts

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest + React Testing Library (156 tests)
npm run build
```

Data lives in `localStorage` (key `intake-crm:v1`) and survives refresh. 18 realistic contacts are seeded on first load. The **Simulate API failure** switch (in the sidebar on desktop, at the end of each page on mobile) makes every request fail, so you can see the error states and Retry.

## What's built

- **Contacts list:** debounced search, status filter chips with counts, sort. Filters live in the URL, so a refresh or the back button keeps them. Table on desktop, cards on mobile.
- **Contact details:** status and conflict-check badges, a status menu, contact info, notes (added optimistically, rolled back on failure), and an activity timeline written as plain sentences.
- **Create / edit:** one shared form with React Hook Form + Zod. Errors appear on blur and submit, the first invalid field gets focus, emails must be unique, and you're warned about unsaved changes.
- **Pipeline:** Lead / Active / Closed columns. Move cards by drag and drop (mouse or keyboard) or with a "Move to" menu on every card. Moves are optimistic with rollback and an Undo toast, and moving a flagged conflict to Active warns you in that toast.
- **States everywhere:** layout-matching skeletons, empty states (no data vs. no results), and errors with Retry.

## Structure and state

```
src/app/                 routes (server shells) + not-found
src/features/contacts/   api/repository.ts, api/queries.ts, schema.ts, filters.ts, components/
src/features/pipeline/   Board, Column, PipelineCard, MoveToMenu
src/features/activity/   notes, timeline and activity wording
src/components/ui/       small accessible UI kit on Radix primitives
src/components/shell/    sidebar, top bar, mobile tabs, demo switch
src/lib/                 storage, delay, simulate, format, cn
```

- **Server state:** TanStack Query. `repository.ts` is the only code that touches storage. It's async with 300–600 ms latency and writes activity entries itself.
- **List state:** URL search params.
- **Form state:** React Hook Form.
- **No global store.** Nothing needs one.

## UX decisions

- Built for intake coordinators who triage many calls, so the list is dense and scannable, and status is always text plus colour, never colour alone.
- The "Move to" menu gives keyboard and touch users the same power as drag and drop.
- Undo instead of confirm dialogs: moves are cheap to reverse, so they shouldn't slow you down.
- A custom visual system (warm "case file" neutrals, one deep green) on Radix instead of default component-library styling. Contrast is checked to WCAG AA.

## Tradeoff

I used **localStorage instead of a real backend.** It's fast to build and works offline, but there's no multi-user sync, so two coordinators can't share a pipeline. Because every read and write goes through `repository.ts`, swapping in Supabase only changes that one file.

With another day, I'd add Supabase with row-level security, assignment and reminders for stale leads, and end-to-end tests with Playwright.

## AI use

I used Claude (Claude Code) to plan the project and as a pair programmer: scaffolding, seed data, drafting tests and reviewing diffs. I made the architecture, design system, copy and UX decisions, and I reviewed every change before committing it. The planning notes are kept out of this repo, and I'm happy to share them on request.
