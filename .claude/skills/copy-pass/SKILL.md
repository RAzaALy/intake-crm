---
name: copy-pass
description: Find every user-facing string in the Intake CRM and flag text that sounds generic or AI-written, then propose plain, human rewrites in the firm's intake voice. Use after a UI phase, before the README, or when the user asks to humanize copy.
---

# Copy pass

Goal: every word on screen sounds like it was written by someone who sat with an intake team, not by a model.

## Steps
1. Read the "Voice and copy" and "Anti-slop" sections of `docs/DESIGN_BRIEF.md` and the copy deck in `docs/UX_BRIEF.md`.
2. Collect user-facing strings from `src/` (JSX text, `aria-label`, `placeholder`, `title`, toast messages, Zod error messages, `metadata`). Include `TODO(copy)` markers.
3. Flag a string when it:
   - uses filler or hype: seamless, effortlessly, streamline, powerful, unlock, journey, "Oops", "Whoops", "Something went wrong", "successfully", "please", exclamation marks, emoji
   - is vague: says nothing about what happened or what to do next
   - uses generic CRM words where intake words fit better (customer → prospective client, deal → matter, owner → assigned attorney)
   - is Title Case instead of sentence case, or a button that is not a verb
   - differs from the copy deck without a reason
4. Output one table: `file:line | current | problem | proposed`. Proposed text is short, plain, specific, sentence case. If the Humanizer skill is installed, use it on longer strings (empty states, error messages) and keep the meaning exactly.
5. Wait for Raza to approve, edit or reject each row. Raza's wording always wins. Then apply only the approved rows, update the copy deck in `docs/UX_BRIEF.md` to match, and run the tests (validation messages may be asserted).
