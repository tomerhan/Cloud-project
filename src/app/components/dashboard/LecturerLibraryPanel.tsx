import { useState, useEffect } from 'react';
import { BookOpen, Upload, Trash2, X, Plus, Loader2, FileText } from 'lucide-react';
import { Article } from '../../data/mockData';
import { getPapers, uploadPaper, deletePaper, updatePaper } from '../../services/paperService';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

// Lecturer course-library management: upload papers, delete them, and edit the
// topics attached to each. The library is shared with all students.
export default function LecturerLibraryPanel() {
  const { t } = useLanguage();
  const [papers, setPapers] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        setPapers(await getPapers());
      } catch {
        toast.error(t('lecturerLib.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const created = await uploadPaper(file);
      setPapers((p) => [created, ...p]);
      toast.success(t('lecturerLib.uploadSuccess'));
    } catch {
      toast.error(t('lecturerLib.uploadError'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePaper(id);
      setPapers((p) => p.filter((a) => a.id !== id));
      toast.success(t('lecturerLib.deleteSuccess'));
    } catch {
      toast.error(t('lecturerLib.deleteError'));
    }
  };

  const saveTopics = async (id: string, topics: string[]) => {
    setSavingId(id);
    try {
      const updated = await updatePaper(id, { topics });
      setPapers((p) => p.map((a) => (a.id === id ? updated : a)));
    } catch {
      toast.error(t('lecturerLib.topicsError'));
    } finally {
      setSavingId(null);
    }
  };

  const removeTopic = (paper: Article, topic: string) =>
    saveTopics(paper.id, paper.topics.filter((x) => x !== topic));

  const addTopic = (paper: Article) => {
    const value = (newTopic[paper.id] || '').trim();
    if (!value || paper.topics.includes(value)) return;
    setNewTopic((s) => ({ ...s, [paper.id]: '' }));
    saveTopics(paper.id, [...paper.topics, value]);
  };

  return (
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('lecturerLib.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('lecturerLib.subtitle')}</p>
          </div>
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-500 bg-red-600 text-white text-sm font-bold cursor-pointer hover:bg-red-700 transition-all active:scale-95 shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? t('lecturerLib.uploading') : t('lecturerLib.upload')}
          <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="divide-y divide-border min-h-[120px]">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
          </div>
        ) : papers.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">{t('lecturerLib.empty')}</div>
        ) : (
          papers.map((paper) => (
            <div key={paper.id} className="p-5 flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground text-sm truncate">{paper.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {paper.authors[0]} · {paper.year}
                  </p>
                  {/* Editable topics */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {paper.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-300 dark:border-slate-600 rounded-full text-[11px] font-medium"
                      >
                        {topic}
                        <button
                          onClick={() => removeTopic(paper, topic)}
                          disabled={savingId === paper.id}
                          className="text-muted-foreground hover:text-red-600 disabled:opacity-50"
                          title={t('lecturerLib.removeTopic')}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1">
                      <input
                        value={newTopic[paper.id] || ''}
                        onChange={(e) => setNewTopic((s) => ({ ...s, [paper.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addTopic(paper)}
                        placeholder={t('lecturerLib.addTopicPlaceholder')}
                        className="w-28 px-2 py-0.5 text-[11px] border border-input rounded-full bg-background text-foreground focus:ring-1 focus:ring-red-500 outline-none"
                      />
                      <button
                        onClick={() => addTopic(paper)}
                        disabled={savingId === paper.id}
                        className="p-0.5 text-red-600 hover:text-red-700 disabled:opacity-50"
                        title={t('lecturerLib.addTopic')}
                      >
                        {savingId === paper.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(paper.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 border border-border rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0 self-start"
                title={t('lecturerLib.delete')}
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('lecturerLib.delete')}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
