import { useEffect, useState } from 'react';
import {
  X, GitCompare, Download, FileText, HelpCircle, Star,
  ChevronDown, ChevronUp, Info, BookOpen, TrendingUp, AlertCircle, Scale
} from 'lucide-react';
import { Article } from '../../data/mockData';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';
import ArticleIcon from '../ui/ArticleIcon';
import { comparePapersByCriteria, PaperComparison } from '../../services/paperService';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

/*
 * ComparisonModal
 * -------------------------------------------------------------------------
 * The richer, modal version of the comparison view (opened from
 * AnalyzedReports). Adds visual scoring on top of the plain table:
 *   - a radar chart comparing papers across the comparison criteria
 *   - per-paper score cards with AI explanations per criterion
 *   - a "Best" badge on the most-cited paper
 *   - a field-by-field table + collapsible AI insight cards
 * Scores come from POST /papers/compare (Gemini): difficulty is always
 * compared, plus the supervisor's criteria (or server defaults).
 * Can also spin off a chat via the 'create-chat-from-comparison' event.
 */

interface ComparisonModalProps {
  articles: Article[];   // papers to compare (up to ~4 look good)
  onClose: () => void;
  cachedComparison?: PaperComparison;
  onComparisonLoaded?: (comparison: PaperComparison) => void;
}

// Render one comparison-table cell, formatting by field type: keyFindings ->
// bulleted list, topics -> coloured pills, other arrays -> CSV, abstract ->
// paragraph, scalars -> plain text (em-dash when missing).
function renderCell(article: Article, key: string) {
  const value = article[key as keyof Article];
  if (key === 'keyFindings' && Array.isArray(value)) {
    return (
      <ul className="space-y-1 text-sm text-slate-700">
        {(value as string[]).map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  }
  if (key === 'topics' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {(value as string[]).map((t, i) => (
          <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium border border-red-100">
            {t}
          </span>
        ))}
      </div>
    );
  }
  if (Array.isArray(value)) return (value as string[]).join(', ');
  if (key === 'abstract') {
    return <p className="text-sm text-slate-700 leading-relaxed" style={{ minHeight: 'auto' }}>{value as string}</p>;
  }
  return <span className="text-sm text-slate-700">{String(value ?? '—')}</span>;
}

export default function ComparisonModal({ articles, onClose, cachedComparison, onComparisonLoaded }: ComparisonModalProps) {
  const { t, language } = useLanguage();
  const aiInsights = [
    {
      label: t('analysis.compareModal.insight.commonThemes.label'),
      text: t('analysis.compareModal.insight.commonThemes.text'),
    },
    {
      label: t('analysis.compareModal.insight.methodologicalDivergence.label'),
      text: t('analysis.compareModal.insight.methodologicalDivergence.text'),
    },
    {
      label: t('analysis.compareModal.insight.conflictingFindings.label'),
      text: t('analysis.compareModal.insight.conflictingFindings.text'),
    },
    {
      label: t('analysis.compareModal.insight.recommendation.label'),
      text: t('analysis.compareModal.insight.recommendation.text'),
    },
  ];
  const comparisonCategories = [
    { key: 'authors',      label: t('analysis.compareModal.field.authors') },
    { key: 'year',         label: t('analysis.compareModal.field.year') },
    { key: 'topics',       label: t('analysis.compareModal.field.topics') },
    { key: 'methodology',  label: t('analysis.compareModal.field.methodology') },
    { key: 'keyFindings',  label: t('analysis.compareModal.field.keyFindings') },
    { key: 'citations',    label: t('analysis.compareModal.field.citations') },
    { key: 'abstract',     label: t('analysis.compareModal.field.abstract') },
  ];
  const [showExplanation, setShowExplanation] = useState(false);          // "How AI got this?" banner
  const [activeInsight, setActiveInsight] = useState<number | null>(null); // expanded insight card
  // "Best" paper = highest citation count; gets the gold badge/border.
  const bestMatchIdx = articles.reduce(
    (best, a, i) => (a.citations > articles[best].citations ? i : best),
    0
  );

  /* ─── Real AI comparison (difficulty + supervisor/default criteria) ─── */
  const [comparison, setComparison] = useState<PaperComparison | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(true);
  const [comparisonError, setComparisonError] = useState(false);

  useEffect(() => {
    if (cachedComparison) {
      setComparison(cachedComparison);
      setComparisonLoading(false);
      return;
    }

    let cancelled = false;
    setComparisonLoading(true);
    setComparisonError(false);
    comparePapersByCriteria(articles.map((a) => a.id), language)
      .then((result) => {
        if (!cancelled) {
          setComparison(result);
          if (onComparisonLoaded) {
            onComparisonLoaded(result);
          }
        }
      })
      .catch((error) => {
        console.error('AI comparison failed:', error);
        if (!cancelled) setComparisonError(true);
      })
      .finally(() => { if (!cancelled) setComparisonLoading(false); });
    return () => { cancelled = true; };
  }, [articles, language, cachedComparison, onComparisonLoaded]);

  const scoresFor = (articleId: string) =>
    comparison?.papers.find((p) => p.paperId === articleId)?.scores;

  /* ─── Radar chart data ───
   * One row per criterion; each row spreads in a `Paper N` key per article so
   * recharts can draw one Radar series per paper over the shared axes. */
  const radarData = (comparison?.criteria || []).map((criterion) => ({
    metric: criterion,
    ...articles.reduce(
      (acc, article, idx) => ({
        ...acc,
        [`Paper ${idx + 1}`]: scoresFor(article.id)?.[criterion]?.score ?? 0,
      }),
      {}
    ),
  }));

  const chartColors = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b'];

  const handleExport = (format: 'pdf' | 'word') => {
    toast.success(t('analysis.compareModal.exportingAs').replace('{format}', format.toUpperCase()), {
      description: t('analysis.compareModal.exportDesc'),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-6">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <ArticleIcon size="md" title={t('analysis.compareModal.iconTitle')}>
                <GitCompare className="w-5 h-5 text-current" />
              </ArticleIcon>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{t('analysis.compareModal.title')}</h2>
              <p className="text-xs text-slate-500">
                {t('analysis.compareModal.comparingPapers').replace('{count}', String(articles.length))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Create Chat: broadcast a window event that ChatAnalyzer listens
                for, which spins up a new chat group from these articles, then
                close this modal. Decoupled via CustomEvent (no shared state). */}
            <button
              onClick={() => {
                const detail = { articleIds: articles.map(a => a.id), name: `${t('analysis.compareModal.comparisonNamePrefix')} ${articles.map(a => a.title).slice(0,2).join(' / ')}` };
                window.dispatchEvent(new CustomEvent('create-chat-from-comparison', { detail }));
                onClose();
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold mr-2"
            >
              {t('analysis.compareModal.createChat')}
            </button>
            {/* How AI got this */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors border border-slate-200"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {t('analysis.compareModal.howAiGotThis')}
            </button>
            {/* Export dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors border border-red-200">
                <Download className="w-3.5 h-3.5" />
                {t('analysis.compareModal.export')}
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-30">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 font-medium"
                >
                  <FileText className="w-4 h-4" /> {t('analysis.compareModal.exportToPdf')}
                </button>
                <button
                  onClick={() => handleExport('word')}
                  className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 font-medium"
                >
                  <FileText className="w-4 h-4" /> {t('analysis.compareModal.exportToWord')}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Explanation banner */}
        {showExplanation && (
          <div className="mx-6 mt-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4 flex items-start gap-3 flex-shrink-0">
            <Info className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">{t('analysis.compareModal.howAiGeneratedTitle')}</p>
              <p className="text-xs text-amber-700 dark:text-amber-200 leading-relaxed">{t('analysis.compareModal.explanationText')}</p>
            </div>
            <button onClick={() => setShowExplanation(false)} className="text-amber-500 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-100 ml-auto flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-w-0 min-h-0 relative">

          {/* ═══ Visual Comparison Metrics (real AI scores) ═══ */}
          <div className="px-6 pt-5 pb-4 space-y-5">

            {comparisonLoading && (
              <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-red-500/30 border-t-red-600 animate-spin"></div>
                <p className="text-sm text-slate-500 font-medium">{t('analysis.compareModal.aiComparing')}</p>
              </div>
            )}

            {comparisonError && !comparisonLoading && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{t('analysis.compareModal.aiComparisonFailed')}</p>
              </div>
            )}

            {comparison && !comparisonLoading && (
              <>
                {/* Radar Chart over the real criteria */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-red-600" />
                      {t('analysis.compareModal.multiDimensional')}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                      {comparison.criteriaSource === 'supervisor'
                        ? t('analysis.compareModal.criteriaBySupervisor')
                        : t('analysis.compareModal.criteriaDefault')}
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      {articles.map((_, idx) => (
                        <Radar
                          key={idx}
                          name={t('analysis.compareModal.paperLabel').replace('{n}', String(idx + 1))}
                          dataKey={`Paper ${idx + 1}`}
                          stroke={chartColors[idx]}
                          fill={chartColors[idx]}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Difficulty summary */}
                {comparison.difficultySummary && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-red-600" />
                      {t('analysis.compareModal.difficultySummary')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{comparison.difficultySummary}</p>
                  </div>
                )}

                {/* Per-paper criterion scores + AI explanations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((article, idx) => {
                    const scores = scoresFor(article.id);
                    const isBest = idx === bestMatchIdx;
                    return (
                      <div
                        key={article.id}
                        className={`p-4 rounded-xl border-2 ${
                          isBest ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-2">
                            <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">
                              {t('analysis.compareModal.paperLabel').replace('{n}', String(idx + 1))}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {article.authors[0]} {t('analysis.reports.etAl')} · {article.year}
                            </p>
                          </div>
                          {isBest && (
                            <div className="flex items-center gap-1 bg-amber-400 px-2 py-0.5 rounded-full">
                              <Star className="w-2.5 h-2.5 text-red-600 fill-amber-900" />
                              <span className="text-[10px] font-bold text-amber-900 uppercase">{t('analysis.compareModal.best')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg mb-4 w-fit">
                          <BookOpen className="w-3.5 h-3.5 text-red-600" />
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">{t('analysis.compareModal.citations')}</div>
                            <div className="text-base font-bold text-slate-900">{article.citations}</div>
                          </div>
                        </div>

                        {/* Criterion score bars with AI explanations */}
                        <div className="space-y-3">
                          {comparison.criteria.map((criterion) => {
                            const entry = scores?.[criterion];
                            if (!entry) return null;
                            return (
                              <div key={criterion}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                                    {criterion}
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">{entry.score}/10</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${entry.score * 10}%`,
                                      backgroundColor: chartColors[idx],
                                    }}
                                  />
                                </div>
                                {entry.explanation && (
                                  <p className="text-[11px] text-slate-500 leading-snug mt-1">{entry.explanation}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Article header cards (responsive flex row for screen) */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-[200px] flex-shrink-0" />
                <div className="flex-1 overflow-x-auto">
                  <div className="flex gap-4 min-w-max">
                    {articles.map((article, idx) => (
                      <div
                        key={article.id}
                        className={`rounded-2xl shadow-sm p-5 ${
                          idx === bestMatchIdx
                            ? 'border-amber-400 border-2 bg-amber-50'
                            : 'border border-slate-200 bg-white'
                        } w-72 flex-shrink-0`}
                      >
                        {idx === bestMatchIdx && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3.5 h-3.5 text-red-600 fill-amber-500" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{t('analysis.compareModal.bestMatch')}</span>
                          </div>
                        )}
                        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-3 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {article.authors[0]} {t('analysis.reports.etAl')} · {article.year}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{t('analysis.compareModal.citationsLabel')}</span>
                          <span className="text-xs font-bold text-red-600">{article.citations}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="px-6 pb-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <tbody>
                    {comparisonCategories.map((cat, idx) => (
                      <tr key={cat.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                        <td className="px-4 py-3.5 font-bold text-slate-700 text-sm border-r border-slate-200 w-[200px] align-top whitespace-nowrap">
                          {cat.label}
                        </td>
                        {articles.map((article) => (
                          <td key={article.id} className="px-4 py-3.5 align-top border-r border-slate-100 last:border-r-0">
                            {renderCell(article, cat.key)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="px-6 pb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-red-600" />
              {t('analysis.compareModal.aiInsightsTitle')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-red-300 hover:shadow-sm transition-all"
                  onClick={() => setActiveInsight(activeInsight === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-bold text-slate-800 text-sm">{insight.label}</span>
                    {activeInsight === idx
                      ? <ChevronUp className="w-4 h-4 text-red-600" />
                      : <ChevronDown className="w-4 h-4 text-red-600" />
                    }
                  </div>
                  {activeInsight === idx && (
                    <div className="px-4 pb-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed pt-3">{insight.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
