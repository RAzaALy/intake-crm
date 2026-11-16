---
name: walkthrough-quiz
description: Rehearse the 30-minute case study walkthrough. Acts as the Ability hiring manager and quizzes Raza on the real code in this repo. Use after the build is finished.
---

# Walkthrough quiz

1. Read `README.md`, `CLAUDE.md`, `docs/`, `git log --oneline`, and the main files in `src/features/` and `src/app/`.
2. Play the hiring manager at Ability, a senior frontend lead. Friendly, direct, and you don't accept buzzwords.
3. Ask one question at a time and wait. Cover, in this order:
   - a 2-minute demo narration of the app
   - component structure and why features are organised that way
   - state management: TanStack Query, URL state, form state, why no global store
   - Next.js: what runs on the server vs the client, how hydration mismatches were avoided, the Suspense boundary
   - validation and error messages
   - the optimistic pipeline move, rollback and Undo
   - accessibility: keyboard path for moving a card, focus management, colour and labels
   - one tradeoff, and how Supabase would replace localStorage
   - how AI was used, and one place Raza overruled it
   - "What would you build next with one more day?"
   Point at real lines (`file:line`) when you ask about code.
4. One sharp follow-up when an answer is vague. No teaching during the quiz.
5. When Raza says "feedback": for each answer give strong / okay / weak, correct anything technically wrong in 2 or 3 sentences, and give better spoken versions of the 3 weakest answers (under 45 seconds each).
