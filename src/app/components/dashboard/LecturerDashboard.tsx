import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, FileText, Search, ArrowRight, BookOpen, LogOut, Sparkles, Sun, Moon, HelpCircle, Languages } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import LecturerLibraryPanel from './LecturerLibraryPanel';
import GuideModal from '../ui/GuideModal';

interface Student {
  id: string;
  name: string;
  email: string;
  project: string;
  papersAnalyzed: number;
  lastActive: string;
  status: string;
}

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pct] = useState(75); // Progress percentage for the SVG spinner
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('system');

  useEffect(() => {
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
    fetchStudents();
  }, []);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    setFontSize(size);
    applyFontSize(size);
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const family = e.target.value;
    setFontFamily(family);
    applyFontFamily(family);
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const applyFontSize = (size: string) => {
    const root = document.documentElement;
    const body = document.body;
    const sizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--user-font-size', sizeMap[size as keyof typeof sizeMap]);
    body.style.fontSize = sizeMap[size as keyof typeof sizeMap];

    // Apply to all text elements
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, button, input, label, select, textarea');
    textElements.forEach(el => {
      (el as HTMLElement).style.fontSize = sizeMap[size as keyof typeof sizeMap];
    });
  };

  const applyFontFamily = (family: string) => {
    const root = document.documentElement;
    const body = document.body;
    const familyMap = {
      'system': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'sans-serif': 'Georgia, "Times New Roman", Times, serif',
      'serif': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      'monospace': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    };
    root.style.setProperty('--user-font-family', familyMap[family as keyof typeof familyMap]);
    body.style.fontFamily = familyMap[family as keyof typeof familyMap];

    // Apply to all text elements
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, button, input, label, select, textarea');
    textElements.forEach(el => {
      (el as HTMLElement).style.fontFamily = familyMap[family as keyof typeof familyMap];
    });
  };



  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen w-full bg-background font-sans overflow-hidden">

      {/* ─── Top Navigation Bar ─── */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-xl leading-tight">{t('dashboard.lecturerTitle')}</h1>
            <p className="text-xs text-muted-foreground">{t('dashboard.welcomeBack')} {user?.name || t('dashboard.professorFallback')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Guide */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium border border-red-200 dark:border-red-900/30"
            title={t('topbar.guide')}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('topbar.guide')}</span>
          </button>
          {/* Language switcher */}
          <button
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            className="p-2 rounded-lg bg-muted border border-border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-bold"
            title={language === 'he' ? 'Switch to English' : 'החלף לעברית'}
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'he' ? 'EN' : 'עב'}</span>
          </button>
          {/* Theme toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg bg-muted border border-border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-muted-foreground hover:text-foreground"
            title={t('dashboard.displayMode')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Sign out */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:shadow-lg hover:scale-105 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t('dashboard.signOut')}
          </button>
        </div>
      </header>

      {/* ─── Main Dashboard Content ─── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 min-h-0 bg-muted">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">

          {/* Settings Panel */}
          <div className="fixed bottom-6 left-6 z-50">
            <div className="bg-card border border-border rounded-xl shadow-lg p-3">
              <div className="flex items-center gap-4">
                {/* Font Size */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {t('dashboard.fontSize')}
                  </label>
                  <select
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent transition-all"
                  >
                    <option value="small">{t('dashboard.fontSizeSmall')}</option>
                    <option value="medium">{t('dashboard.fontSizeMedium')}</option>
                    <option value="large">{t('dashboard.fontSizeLarge')}</option>
                    <option value="extra-large">{t('dashboard.fontSizeExtraLarge')}</option>
                  </select>
                </div>

                {/* Font Family */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {t('dashboard.fontFamily')}
                  </label>
                  <select
                    value={fontFamily}
                    onChange={handleFontFamilyChange}
                    className="px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent transition-all"
                  >
                    <option value="system">{t('dashboard.fontFamilyDefault')}</option>
                    <option value="sans-serif">{t('dashboard.fontFamilySansSerif')}</option>
                    <option value="serif">{t('dashboard.fontFamilySerif')}</option>
                    <option value="monospace">{t('dashboard.fontFamilyMonospace')}</option>
                  </select>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={handleThemeToggle}
                  className="px-3 py-1 text-sm border border-input rounded bg-background text-foreground hover:bg-muted hover:border-ring focus:ring-1 focus:ring-ring focus:border-transparent transition-all flex items-center gap-1"
                  title={t('dashboard.displayMode')}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3 h-3 text-red-600" />
                  ) : (
                    <Moon className="w-3 h-3 text-red-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalStudents')}</p>
                <h2 className="text-2xl font-bold text-foreground">{students.length}</h2>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalPapersAnalyzed')}</p>
                <h2 className="text-2xl font-bold text-foreground">
                  {students.reduce((acc, curr) => acc + curr.papersAnalyzed, 0)}
                </h2>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
              {/* SVG Spinner - Similar to AnalysisStagesDialog */}
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
                <h2 className="text-2xl font-bold text-foreground">{students.filter(s => s.status === 'Active').length}</h2>
              </div>
            </div>
          </div>

          {/* Students List Section */}
          <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('dashboard.studentProjects')}</h2>
                <p className="text-sm text-muted-foreground">{t('dashboard.monitorProgress')}</p>
              </div>

              {/* Search Box */}
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

            {/* Students Table/Grid */}
            <div className="divide-y divide-border relative min-h-[200px]">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
                  <div className="w-8 h-8 rounded-full border-4 border-red-500/30 border-t-red-600 animate-spin"></div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  {t('dashboard.noStudentsFound')}
                </div>
              ) : (
                filteredStudents.map((student) => (
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

                      {/* This button sends the lecturer to view the student's research */}
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

          {/* Course library management (upload / delete / edit topics) */}
          <LecturerLibraryPanel />

        </div>
      </main>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}