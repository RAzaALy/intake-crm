---
name: ship-check
description: Pre-push and pre-submission checks for the Intake CRM. Use before every push, and with "final" before submitting the case study.
---

# Ship check

## Every push
1. `npm run lint && npm run typecheck && npm test && npm run build`. Stop on any failure and report it.
2. Search `src/` for: `console.log`, `debugger`, `any` types, `@ts-ignore`, `TODO` (list `TODO(copy)` separately), hard-coded hex colours outside `globals.css`, commented-out code.
3. `git status`: no stray files (`.env*`, screenshots, scratch files). `.gitignore` covers `.next`, `node_modules`, `.env*`.
4. Report a short pass/fail list. Push only when Raza says so.

## With `final`
Do all of the above, then:
1. Open the **live Vercel URL** in the browser pane (ask Raza for it if unknown). Clear site data first so seed data loads fresh.
2. Walk every flow at 1280px and 375px: list search, filter, sort, refresh keeps filters; create with errors then valid; edit; add note; move in pipeline by drag and by menu; Undo; "Simulate API failure" shows error states and Retry recovers; unknown contact id shows not found.
3. Read the browser console on each page. Any hydration warning or error is a blocker.
4. Check: page titles and favicon are not Next.js defaults; README is one page and has all five required sections; repo is public; `git log --oneline` reads as a clear story with no "wip" or "fix" messages without context.
5. Output a final checklist with pass/fail and anything Raza must fix before sending the links.
