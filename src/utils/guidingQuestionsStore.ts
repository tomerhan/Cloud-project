// Persistence for guiding questions written in Research Chat. Saved when the
// student confirms the "save questions" popup on Create Chat, restored into
// the Guiding Questions block on the next visit. Mirrors the localStorage
// pattern used in reportsStore.ts.

const KEY = 'guiding_questions_v1';

export interface SavedGuidingQuestion {
  id: string;
  text: string;
  guide: string;
  answer: string | null;
}

/** Read all saved guiding questions. Returns [] on any error. */
export function loadGuidingQuestions(): SavedGuidingQuestion[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedGuidingQuestion[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Overwrite the saved set with the given questions (empty text entries are dropped). */
export function saveGuidingQuestions(questions: SavedGuidingQuestion[]): void {
  const cleaned = questions.filter((q) => q.text.trim().length > 0);
  try { localStorage.setItem(KEY, JSON.stringify(cleaned)); } catch { /* ignore */ }
}
