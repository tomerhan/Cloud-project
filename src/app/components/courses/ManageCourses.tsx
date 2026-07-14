import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, FileText, Search, ArrowRight, Sparkles, Check, X, SlidersHorizontal, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  email: string;
  project: string;
  papersAnalyzed: number;
  lastActive: string;
  status: string;
}

export default function ManageCourses() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pct] = useState(75);

  // Paper-comparison criteria this lecturer applies to all their students.
  const [criteria, setCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [isSavingCriteria, setIsSavingCriteria] = useState(false);

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => setCriteria(res.data.comparisonCriteria || []))
      .catch((err) => console.error('Failed to fetch criteria:', err));
  }, []);

  const saveCriteria = async (next: string[]) => {
    setIsSavingCriteria(true);
    try {
      await api.put('/users/comparison-criteria', { criteria: next });
      setCriteria(next);
      toast.success(t('criteria.saved'));
    } catch (error) {
      console.error('Failed to save criteria:', error);
      toast.error(t('criteria.saveFailed'));
    } finally {
      setIsSavingCriteria(false);
    }
  };

  const addCriterion = () => {
    const value = newCriterion.trim();
    if (!value) return;
    if (criteria.some((c) => c.toLowerCase() === value.toLowerCase())) {
      toast.error(t('criteria.duplicate'));
      return;
    }
    setNewCriterion('');
    saveCriteria([...criteria, value]);
  };

  const removeCriterion = (value: string) => {
    saveCriteria(criteria.filter((c) => c !== value));
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAccept = async (studentId: string) => {
    try {
      await api.put(`/users/accept-student/${studentId}`);
      fetchStudents();
    } catch (error) {
      console.error('Failed to accept student:', error);
    }
  };

  const handleReject = async (studentId: string) => {
    try {
      await api.put(`/users/reject-student/${studentId}`);
      fetchStudents();
    } catch (error) {
      console.error('Failed to reject student:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingStudents = filteredStudents.filter(s => s.status === 'Pending');
  const approvedStudents = filteredStudents.filter(s => s.status !== 'Pending');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalStudents')}</p>
            <h2 className="text-2xl font-bold text-foreground">{approvedStudents.length}</h2>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalPapersAnalyzed')}</p>
            <h2 className="text-2xl font-bold text-foreground">
              {approvedStudents.reduce((acc, curr) => acc + curr.papersAnalyzed, 0)}
            </h2>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90 animate-[spin_2s_linear_infinite]" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#fee2e2" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="#dc2626" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34 * pct / 100} ${2 * Math.PI * 34 * (1 - pct / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.activeProjects')}</p>
            <h2 className="text-2xl font-bold text-foreground">{approvedStudents.filter(s => s.status === 'Active').length}</h2>
          </div>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingStudents.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-amber-200 dark:border-amber-800 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-500">Pending Requests ({pendingStudents.length})</h2>
          </div>
          <div className="divide-y divide-amber-200 dark:divide-amber-800/50">
            {pendingStudents.map((student) => (
              <div key={student.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300 text-lg border border-amber-300 dark:border-amber-700">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAccept(student.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(student.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-foreground font-medium rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comparison Criteria Section */}
      <section className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('criteria.title')}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{t('criteria.subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {criteria.length === 0 && (
            <p className="text-sm text-muted-foreground italic">{t('criteria.empty')}</p>
          )}
          {criteria.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-full text-sm font-medium text-foreground"
            >
              {c}
              <button
                onClick={() => removeCriterion(c)}
                disabled={isSavingCriteria}
                className="p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 transition-colors disabled:opacity-50"
                aria-label={`${t('criteria.remove')} ${c}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCriterion(); }}
            placeholder={t('criteria.placeholder')}
            className="flex-1 px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          />
          <button
            onClick={addCriterion}
            disabled={!newCriterion.trim() || isSavingCriteria}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t('criteria.add')}
          </button>
        </div>
      </section>

      {/* Students List Section */}
      <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('nav.manageCourses') || 'Manage Students'}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.monitorProgress') || 'Monitor progress and review analyzed research.'}
            </p>
          </div>

          <div className="relative max-w-md w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-border relative min-h-[200px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
              <div className="w-8 h-8 rounded-full border-4 border-red-500/30 border-t-red-600 animate-spin"></div>
            </div>
          ) : approvedStudents.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              {searchTerm ? t('dashboard.noStudentsFound') : 'No students have been approved yet.'}
            </div>
          ) : (
            approvedStudents.map((student) => (
              <div key={student.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-red-600 dark:text-red-600 text-lg border border-border">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>

                <div className="flex-1 md:px-10">
                  <p className="text-sm font-semibold text-foreground">{student.project}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <FileText className="w-3 h-3" /> {student.papersAnalyzed} {t('dashboard.papersAnalyzedSuffix')}
                    <span className="text-border mx-1">|</span>
                    {t('dashboard.lastActive')} {student.lastActive}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {student.status}
                  </span>

                  <button
                    onClick={() => navigate(`/student/${student.id}`)}
                    className="flex items-center gap-4 px-6 py-5 rounded-xl transition-all text-left border-2 border-slate-300 bg-slate-50 dark:bg-slate-700 text-foreground dark:border-slate-400 hover:bg-red-600 hover:text-white hover:border-red-500 hover:shadow-xl hover:scale-105"
                  >
                    {t('dashboard.viewWork')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
