---
name: slice
description: Build one phase of the Intake CRM end to end, following docs/BUILD_PHASES.md. Use when the user says "run phase N", "next phase", or "/slice N".
---

# Build one phase

The argument is a phase number from `docs/BUILD_PHASES.md` (for example `/slice 4`). If none is given, ask which phase.

## Steps
1. **Read** `CLAUDE.md`, the phase section in `docs/BUILD_PHASES.md`, and every doc that section names. Run `git log --oneline -15` and `git status` to see where the project stands. If an earlier phase this one depends on is not committed, stop and say so.
2. **Plan**: write a short plan (files to create or change, one line each, and the reason). List any open question. Wait for Raza's approval before writing code.
3. **Build** the phase exactly as specified. No extra features, no new libraries.
4. **Check**: run `npm run lint && npm run typecheck && npm test && npm run build`. Fix failures. Report the real result.
5. **Look** (UI phases only): start the dev server, open the phase's routes in the browser pane at 375px and 1280px, take screenshots, and read the browser console for hydration or React warnings.
6. **Review with agents** (as the phase section says):
   - `ux-researcher` Mode 2 on the screenshots. Apply the fixes Raza approves.
   - `test-engineer` for the phase's logic and flows.
   - `code-reviewer` on the diff. Fix every Blocker.
7. **Explain**: a short walkthrough of each changed file, and the 2 or 3 decisions Raza may be asked about in the interview.
8. **Hand over**: print the "Done when" checklist from the phase with each item ticked or not, and suggest the commit messages (several small ones where the work splits naturally). Do not commit unless Raza says "commit". When Raza says "commit", make the commits in that order and push.
