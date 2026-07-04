import React, { useState } from 'react';
import {
  X, BookOpen, MessageSquare, BarChart2, ChevronRight, UploadCloud, Search, CheckCircle2,
  FileText, Users, Trash2, LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'student' | 'lecturer';
}

type TabType = 'library' | 'chat' | 'analyzer' | 'dashboard' | 'students';

export default function GuideModal({ isOpen, onClose, variant = 'student' }: GuideModalProps) {
  const isLecturer = variant === 'lecturer';
  const [activeTab, setActiveTab] = useState<TabType>(isLecturer ? 'dashboard' : 'library');
  const { t } = useLanguage();

  if (!isOpen) return null;

  const tabs: { id: TabType; icon: React.ElementType; label: string }[] = isLecturer
    ? [
        { id: 'dashboard', icon: LayoutDashboard, label: t('guideLect.tabDashboard') },
        { id: 'library', icon: BookOpen, label: t('guideLect.tabLibrary') },
        { id: 'students', icon: Users, label: t('guideLect.tabStudents') },
      ]
    : [
        { id: 'library', icon: BookOpen, label: t('guide.tabLibrary') },
        { id: 'chat', icon: MessageSquare, label: t('guide.tabChat') },
        { id: 'analyzer', icon: BarChart2, label: t('guide.tabAnalyzer') },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{isLecturer ? t('guideLect.welcomeTitle') : t('guide.welcomeTitle')}</h2>
              <p className="text-sm text-muted-foreground">{isLecturer ? t('guideLect.subtitle') : t('guide.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-64 bg-muted border-r border-border p-4 flex flex-col gap-2 overflow-y-auto shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-red-500'}`} />
                  {tab.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-background">

            {/* ───────── STUDENT CONTENT ───────── */}
            {!isLecturer && activeTab === 'library' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <UploadCloud className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{t('guide.libraryTitle')}</h3>
                    <p className="text-muted-foreground">{t('guide.libraryDesc')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { n: '1', title: t('guide.step1Title'), body: <>{t('guide.step1Pre')}<strong>{t('guide.step1Bold')}</strong>{t('guide.step1Post')}</> },
                    { n: '2', title: t('guide.step2Title'), body: t('guide.step2Desc') },
                    { n: '3', title: t('guide.step3Title'), body: t('guide.step3Desc') },
                  ].map((s) => (
                    <div key={s.n} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-red-600">{s.n}</div>
                      <div>
                        <h4 className="font-bold text-foreground">{s.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{s.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLecturer && activeTab === 'chat' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{t('guide.chatSectionTitle')}</h3>
                    <p className="text-muted-foreground">{t('guide.chatSectionDesc')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-card border border-border p-4 rounded-xl flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-sm text-foreground"><strong>{t('guide.goalLabel')}</strong> {t('guide.goalText')}</p>
                  </div>
                  <ul className="space-y-3">
                    {['guide.chatItem1', 'guide.chatItem2', 'guide.chatItem3', 'guide.chatItem4'].map((k) => (
                      <li key={k} className="flex gap-3 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        <span>{t(k)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!isLecturer && activeTab === 'analyzer' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <BarChart2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{t('guide.analyzerSectionTitle')}</h3>
                    <p className="text-muted-foreground">{t('guide.analyzerSectionDesc')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <Search className="w-5 h-5 text-red-600 mb-2" />
                      <h4 className="font-bold text-foreground text-sm">{t('guide.crossReferenceTitle')}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{t('guide.crossReferenceDesc')}</p>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <FileText className="w-5 h-5 text-red-600 mb-2" />
                      <h4 className="font-bold text-foreground text-sm">{t('guide.generateReportsTitle')}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{t('guide.generateReportsDesc')}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
                    <h4 className="font-bold text-foreground text-sm mb-2">{t('guide.howToUse')}</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>{t('guide.howToStep1Pre')}<strong>{t('guide.howToStep1Bold')}</strong>{t('guide.howToStep1Post')}</li>
                      <li>{t('guide.howToStep2')}</li>
                      <li>{t('guide.howToStep3Pre')}<strong>{t('guide.howToStep3Bold')}</strong>{t('guide.howToStep3Post')}</li>
                      <li>{t('guide.howToStep4Pre')}<strong>{t('guide.howToStep4Bold')}</strong>{t('guide.howToStep4Post')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* ───────── LECTURER CONTENT ───────── */}
            {isLecturer && activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <LayoutDashboard className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{t('guideLect.dashTitle')}</h3>
                    <p className="text-muted-foreground">{t('guideLect.dashDesc')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { n: '1', body: t('guideLect.dashStep1') },
                    { n: '2', body: t('guideLect.dashStep2') },
                    { n: '3', body: <>{t('guideLect.dashStep3Pre')}<strong>{t('guideLect.dashStep3Bold')}</strong>{t('guideLect.dashStep3Post')}</> },
                  ].map((s) => (
                    <div key={s.n} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-red-600">{s.n}</div>
                      <p className="text-sm text-muted-foreground mt-1">{s.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLecturer && activeTab === 'library' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <BookOpen className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{t('guideLect.libTitle')}</h3>
                    <p className="text-muted-foreground">{t('guideLect.libDesc')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <UploadCloud className="w-5 h-5 text-red-600 mb-2" />
                      <p className="text-xs text-muted-foreground">{t('guideLect.libItem1')}</p>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl">
                      <Trash2 className="w-5 h-5 text-red-600 mb-2" />
                      <p className="text-xs text-muted-foreground">{t('guideLect.libItem3')}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['guideLect.libItem2', 'guideLect.libItem4'].map((k) => (
                      <li key={k} className="flex gap-3 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        <span>{t(k)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {isLecturer && activeTab === 'students' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{t('guideLect.studTitle')}</h3>
                    <p className="text-muted-foreground">{t('guideLect.studDesc')}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {['guideLect.studItem1', 'guideLect.studItem2', 'guideLect.studItem3'].map((k) => (
                    <li key={k} className="flex gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>{t(k)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
