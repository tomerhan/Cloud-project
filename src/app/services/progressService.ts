import api from './api';

export interface ProgressItem {
  paper: string;
  score: number;
  understandingLevel: 'low' | 'medium' | 'high' | 'excellent';
  rationale?: string;
}

/** The logged-in student's progress across all papers. */
export async function getMyProgress(): Promise<ProgressItem[]> {
  const response = await api.get('/progress/me');
  return response.data as ProgressItem[];
}

/** A specific student's progress (lecturer only). */
export async function getStudentProgress(studentId: string): Promise<ProgressItem[]> {
  const response = await api.get(`/progress/student/${studentId}`);
  return response.data as ProgressItem[];
}

/** Hebrew translation of a score's rationale (cached server-side). */
export async function translateRationale(studentId: string, paperId: string): Promise<string> {
  const response = await api.post('/progress/rationale-translation', { studentId, paperId });
  return (response.data?.rationaleHe as string) || '';
}

/** Build a paperId -> score map from a list of progress items. */
export function toScoreMap(items: ProgressItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const it of items) map[it.paper] = it.score;
  return map;
}

/** Build a paperId -> AI rationale map from a list of progress items. */
export function toRationaleMap(items: ProgressItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const it of items) if (it.rationale) map[it.paper] = it.rationale;
  return map;
}

/** Build a paperId -> understanding level map from a list of progress items. */
export function toLevelMap(items: ProgressItem[]): Record<string, ProgressItem['understandingLevel']> {
  const map: Record<string, ProgressItem['understandingLevel']> = {};
  for (const it of items) map[it.paper] = it.understandingLevel;
  return map;
}
