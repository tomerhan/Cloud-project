import { GraduationCap, FileText, User } from 'lucide-react';
import { Article } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Badge distinguishing who uploaded a paper: lecturer course material,
 * the current user's own upload, or another student's upload.
 */
export default function UploaderBadge({ article }: { article: Article }) {
  const { t } = useLanguage();

  if (article.uploaderRole === 'lecturer') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
        title={article.uploaderName}
      >
        <GraduationCap className="w-3 h-3" />
        {t('uploader.courseMaterial')}
        {article.uploaderName && <span className="font-medium opacity-80">· {article.uploaderName}</span>}
      </span>
    );
  }

  if (article.isMine) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
        <FileText className="w-3 h-3" />
        {t('uploader.myUpload')}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border"
      title={article.uploaderName}
    >
      <User className="w-3 h-3" />
      {t('uploader.studentUpload')}
      {article.uploaderName && <span className="font-medium opacity-80">· {article.uploaderName}</span>}
    </span>
  );
}

export type UploaderFilter = 'all' | 'lecturer' | 'mine';

export function matchesUploaderFilter(article: Article, filter: UploaderFilter): boolean {
  if (filter === 'lecturer') return article.uploaderRole === 'lecturer';
  if (filter === 'mine') return !!article.isMine;
  return true;
}

/** Segmented control for filtering paper lists by uploader. */
export function UploaderFilterControl({
  value,
  onChange,
}: {
  value: UploaderFilter;
  onChange: (value: UploaderFilter) => void;
}) {
  const { t } = useLanguage();
  const options: Array<{ key: UploaderFilter; label: string }> = [
    { key: 'all', label: t('uploader.filterAll') },
    { key: 'lecturer', label: t('uploader.filterCourse') },
    { key: 'mine', label: t('uploader.filterMine') },
  ];

  return (
    <div className="flex items-center bg-muted border border-border rounded-xl p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            value === opt.key
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
