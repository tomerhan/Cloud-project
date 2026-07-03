import { useState, useEffect } from 'react';
import { GitCompare, Download, Plus, X, Check } from 'lucide-react';
import { Article } from '../../data/mockData';
import { getPapers } from '../../services/paperService';
import { useLanguage } from '../../context/LanguageContext';

/*
 * Comparison (full page)
 * -------------------------------------------------------------------------
 * Standalone side-by-side comparison page (not the modal). User picks up to
 * 4 articles, and they are laid out as a table: rows = fields (title, authors,
 * year, topics, methodology, findings, citations), columns = articles.
 * Bottom shows static "AI insights". All data comes from mockArticles.
 */

interface ComparisonProps {
  onNavigate: (page: string) => void;   // route helper (currently unused here)
}

export default function Comparison({ onNavigate }: ComparisonProps) {
  const { t } = useLanguage();
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const papers = await getPapers();
        setAllArticles(papers);
      } catch (err) {
        console.error('Failed to load papers in Comparison:', err);
      }
    };
    loadPapers();
  }, []);

  // Pre-seed selection when papers load if there are at least two papers
  useEffect(() => {
    if (allArticles.length >= 2 && selectedArticles.length === 0) {
      setSelectedArticles([allArticles[0], allArticles[1]]);
    }
  }, [allArticles]);

  // Add/remove an article from the selection. Hard cap of 4 columns.
  const toggleArticleSelection = (article: Article) => {
    if (selectedArticles.find(a => a.id === article.id)) {
      setSelectedArticles(prev => prev.filter(a => a.id !== article.id));   // already in -> remove
    } else if (selectedArticles.length < 4) {
      setSelectedArticles(prev => [...prev, article]);                       // room left -> add
    }
  };

  // The rows of the comparison table, in display order. `key` maps to an
  // Article field; `label` is the human heading.
  const comparisonCategories = [
    { key: 'title', label: t('analysis.compare.field.title') },
    { key: 'authors', label: t('analysis.compare.field.authors') },
    { key: 'year', label: t('analysis.compare.field.year') },
    { key: 'topics', label: t('analysis.compare.field.topics') },
    { key: 'methodology', label: t('analysis.compare.field.methodology') },
    { key: 'keyFindings', label: t('analysis.compare.field.keyFindings') },
    { key: 'citations', label: t('analysis.compare.field.citations') }
  ];

  // Render one table cell. Arrays get special formatting: keyFindings -> a
  // bulleted list, topics -> coloured pills, anything else array -> CSV.
  // Scalars are stringified, with '-' as a fallback for empty values.
  const renderCellContent = (article: Article, key: string) => {
    const value = article[key as keyof Article];

    if (Array.isArray(value)) {
      if (key === 'keyFindings') {
        return (
          <ul className="space-y-1 text-sm">
            {value.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (key === 'topics') {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, idx) => (
              <span key={idx} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">
                {item}
              </span>
            ))}
          </div>
        );
      }
      return value.join(', ');
    }

    return value?.toString() || '-';
  };

  // Render: header (select/export buttons) -> optional article picker grid ->
  // comparison table OR empty state -> static AI insights (only when 2+ picked).
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('analysis.compare.pageTitle')}</h1>
              <p className="text-slate-600">{t('analysis.compare.pageSubtitle')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('analysis.compare.selectArticlesCount').replace('{count}', String(selectedArticles.length))}
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t('analysis.compare.exportComparison')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Article Selector */}
        {showSelector && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">{t('analysis.compare.selectUpTo4')}</h3>
              <button
                onClick={() => setShowSelector(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allArticles.map(article => {
                const isSelected = selectedArticles.find(a => a.id === article.id);
                const canSelect = selectedArticles.length < 4 || isSelected;

                return (
                  <button
                    key={article.id}
                    onClick={() => canSelect && toggleArticleSelection(article)}
                    disabled={!canSelect}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50'
                        : canSelect
                        ? 'border-slate-200 hover:border-slate-300 bg-white'
                        : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">{article.title}</h4>
                        <p className="text-xs text-slate-600">{article.authors[0]} {t('analysis.reports.etAl')} ({article.year})</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedArticles.length > 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900 w-48">{t('analysis.compare.category')}</th>
                    {selectedArticles.map(article => (
                      <th key={article.id} className="px-6 py-4 text-left font-semibold text-slate-900 min-w-[300px]">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm">{article.title.substring(0, 50)}...</span>
                          <button
                            onClick={() => toggleArticleSelection(article)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((category, idx) => (
                    <tr key={category.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-4 font-medium text-slate-900 align-top border-r border-slate-200">
                        {category.label}
                      </td>
                      {selectedArticles.map(article => (
                        <td key={article.id} className="px-6 py-4 text-slate-700 align-top">
                          {renderCellContent(article, category.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <GitCompare className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('analysis.compare.noArticlesTitle')}</h3>
            <p className="text-slate-600 mb-6">{t('analysis.compare.noArticlesDesc')}</p>
            <button
              onClick={() => setShowSelector(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {t('analysis.compare.selectArticles')}
            </button>
          </div>
        )}

        {/* AI Insights */}
        {selectedArticles.length >= 2 && (
          <div className="mt-6 bg-gradient-to-br from-emerald-50 to-violet-50 rounded-lg border border-emerald-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-emerald-600" />
              {t('analysis.compare.aiInsightsTitle')}
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="font-medium text-emerald-900 mb-2">{t('analysis.compare.commonThemes')}</p>
                <p>{t('analysis.compare.commonThemesText')}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="font-medium text-emerald-900 mb-2">{t('analysis.compare.methodologicalDifferences')}</p>
                <p>{t('analysis.compare.methodologicalDifferencesText')}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="font-medium text-emerald-900 mb-2">{t('analysis.compare.recommendations')}</p>
                <p>{t('analysis.compare.recommendationsText')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
