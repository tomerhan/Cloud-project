import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, FileText, Search, ArrowRight, BookOpen, LogOut, Sparkles, Sun, Moon, HelpCircle, Languages, FileEdit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import LecturerLibraryPanel from './LecturerLibraryPanel';
import GuideModal from '../ui/GuideModal';
import ManageCourses from '../courses/ManageCourses';

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
  const [activeTab, setActiveTab] = useState<'library' | 'manage'>('library');
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('system');

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
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="w-64 bg-card border-r border-border p-4 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Course Library
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'manage'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <FileEdit className="w-5 h-5" />
            {t('nav.manageCourses') || 'Manage Courses'}
          </button>
        </aside>

        {/* Settings Panel (Global across tabs) */}
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

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 min-h-0 bg-muted">
          {activeTab === 'manage' ? (
            <ManageCourses />
          ) : (
            <div className="max-w-6xl mx-auto space-y-8 pb-20">

          {/* Course library management (upload / delete / edit topics) */}
          <LecturerLibraryPanel />

        </div>
          )}
        </main>
      </div>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} variant="lecturer" />
    </div>
  );
}