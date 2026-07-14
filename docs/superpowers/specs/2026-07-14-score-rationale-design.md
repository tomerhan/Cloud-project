# Lecturer "Why this score?" — Design

Date: 2026-07-14
Status: Approved

## Goal

Let a lecturer click a button next to a student's comprehension score and see
why the AI gave that score. The AI already produces a one-sentence rationale in
`assessComprehension`, but chatController currently discards it.

## Backend (backend_web)

1. **Progress model** — add `rationale: String`.
2. **chatController** — capture `rationale` (already returned by
   `assessComprehension`) alongside `score` and pass it to `upsertProgress`.
3. **progressController** — `upsertProgress(studentId, paperId, score, rationale)`
   persists the rationale; `getStudentProgress` and `getMyProgress` add
   `rationale` to the selected fields.

## Frontend (Cloud-project)

4. **progressService** — `ProgressItem.rationale?`, and a `toRationaleMap`
   helper (paperId -> rationale).
5. **ChatInterface (lecturer view)** — next to the per-article comprehension bar,
   a small info button, shown only when a rationale exists. Clicking opens a
   small popup with the AI rationale, the score, and the understanding level.
6. **Translations** — en + he.

## Out of scope

- No retroactive re-scoring of historical progress (older records get a
  rationale on the student's next chat message; until then no button shows).
- No manual editing of the rationale by the lecturer.
