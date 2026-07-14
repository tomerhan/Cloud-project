# Save Guiding Questions Popup — Design

Date: 2026-07-14
Status: Approved

## Goal

When a student clicks "Create Chat" in Research Chat and has written guiding
questions, show a popup asking whether to save those questions. Saved questions
are restored into the Guiding Questions block on the next visit.

## Behavior

1. Student writes guiding questions in `GuidingQuestionsBlock`, clicks
   **Create Chat** in `ChatInterface`.
2. If at least one question has non-empty text → a modal opens:
   "Save your guiding questions?" with two actions:
   - **Save & continue** — persist questions to localStorage, then navigate to
     the chat (`/chat-analyzer`).
   - **Continue without saving** — navigate without persisting.
   Both actions proceed to the chat; the popup never blocks the flow.
3. If there are no questions with text → no popup, navigate directly (current
   behavior).
4. On next mount, `GuidingQuestionsBlock` initializes its state from the saved
   questions instead of an empty list.

## Components

- **New: `src/utils/guidingQuestionsStore.ts`** — mirrors the
  `reportsStore.ts` localStorage pattern. Key: `guiding_questions_v1`.
  Stores `{ id, text, guide, answer }[]`. Exposes `loadGuidingQuestions()`,
  `saveGuidingQuestions(questions)`.
- **`GuidingQuestionsBlock.tsx`** — new optional prop
  `onQuestionsChange(questions)` invoked whenever the questions array changes,
  so the parent holds a current snapshot. Initial state comes from
  `loadGuidingQuestions()`.
- **`ChatInterface.tsx`** — holds the latest questions snapshot; `openInChatAnalyzer`
  opens the save modal when a non-empty question exists. Modal follows the
  existing hand-rolled overlay pattern (like the save-analysis-name modal).
- **`translations.ts`** — new keys (en + he) for the modal title, subtitle,
  and both buttons.

## Out of scope

- No backend/server changes; storage is per-browser localStorage.
- No management screen for saved questions (editing the block and saving again
  overwrites).
- AI answers are saved if present but chats themselves are unchanged.
