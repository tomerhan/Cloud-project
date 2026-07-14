# AI Paper Comparison with Lecturer Criteria — Design

Date: 2026-07-14
Status: Approved

## Goal

Replace the mock/random comparison scores in ComparisonModal with a real
server-side AI comparison. Difficulty level is always compared. If the
student's approved supervisor(s) defined comparison criteria, those are used;
otherwise the defaults are methodology and the parameters the papers examined.

## Backend (backend_web)

1. **User model** — new `comparisonCriteria: [String]` (used by lecturers).
2. **`PUT /api/users/comparison-criteria`** — lecturer saves a free-form list
   of criteria. Returned as part of `GET /users/profile` (whole doc already
   returned).
3. **`POST /api/papers/compare`** — body `{ paperIds, language }`.
   - Resolves the calling student's approved supervisors and unions their
     non-empty `comparisonCriteria`; falls back to
     `['Methodology', 'Examined parameters']` when none.
   - Always prepends `Difficulty level`.
   - Calls `geminiService.comparePapers(papers, criteria, language)` with each
     paper's stored title/abstract/methodology/keywords.
   - Response: `{ criteria: string[], papers: [{ paperId, scores: { [criterion]: { score: 1-10, explanation } } }], difficultySummary: string }`.
4. **geminiService.comparePapers** — single Gemini call, JSON-mode prompt,
   Hebrew output when `language === 'he'`. Uses the existing retry helper.

## Frontend (Cloud-project)

5. **Lecturer criteria editor** — card in the lecturer dashboard manage tab
   (ManageCourses): chip list with add/remove and save via the new endpoint.
6. **ComparisonModal** — on open, calls `POST /papers/compare`.
   - Loading: spinner over the scores section.
   - Success: radar chart axes become the real criteria (scores 1-10),
     per-criterion AI explanations, difficulty summary paragraph.
   - Failure: keep the metadata comparison table, show an error note; no mock
     scores anywhere.
7. **Translations** — all new texts in en + he.

## Out of scope

- Persisting comparison results (recomputed per open).
- Per-student criteria; lecturer criteria apply to all their students.
