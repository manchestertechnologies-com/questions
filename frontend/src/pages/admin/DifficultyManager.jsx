import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  Target, Filter, CheckSquare, Square, CheckCircle, AlertCircle,
  Loader2, ChevronLeft, ChevronRight, Search, RotateCcw
} from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: null,     label: 'Unclassified', color: 'badge-unclassified', emoji: '⬜' },
  { value: 'Easy',   label: 'Easy',          color: 'badge-easy',         emoji: '🟢' },
  { value: 'Medium', label: 'Medium',        color: 'badge-medium',       emoji: '🟡' },
  { value: 'Hard',   label: 'Hard',          color: 'badge-hard',         emoji: '🔴' },
];

const DifficultyBadge = ({ value, onClick, interactive = false }) => {
  const opt = DIFFICULTY_OPTIONS.find(d => d.value === value) || DIFFICULTY_OPTIONS[0];
  return (
    <button
      type="button"
      onClick={onClick}
      title={interactive ? 'Click to change difficulty' : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${opt.color} ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
      }`}
    >
      <span>{opt.emoji}</span>
      {opt.label}
    </button>
  );
};

const DifficultyManager = () => {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  // Filters
  const [filterDiff, setFilterDiff] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [filterType, setFilterType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showUnclassified, setShowUnclassified] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [bulkDiff, setBulkDiff] = useState('Easy');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/syllabus/subjects');
        if (res.data.success) setSubjects(res.data.subjects);
      } catch { }
    };
    load();
  }, []);

  const loadChapters = async (subjectId) => {
    setFilterSubject(subjectId);
    setFilterChapter('');
    setChapters([]);
    if (!subjectId) return;
    try {
      const res = await API.get(`/syllabus/chapters?subjectId=${subjectId}`);
      if (res.data.success) setChapters(res.data.chapters);
    } catch { }
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    let url = `/questions?page=${page}&limit=25&sortBy=questionNumber`;
    if (showUnclassified) url += `&unclassified=true`;
    else if (filterDiff) url += `&difficulty=${filterDiff}`;
    if (filterSubject) url += `&subject=${filterSubject}`;
    if (filterChapter) url += `&chapter=${filterChapter}`;
    if (filterType) url += `&questionType=${filterType}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

    try {
      const res = await API.get(url);
      if (res.data.success) {
        setQuestions(res.data.questions);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch { } finally { setLoading(false); }
  }, [page, showUnclassified, filterDiff, filterSubject, filterChapter, filterType, keyword]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === questions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(questions.map(q => q._id)));
    }
  };

  // ── Inline single difficulty update ────────────────────────────────────
  const cycleDifficulty = async (q) => {
    const cycle = [null, 'Easy', 'Medium', 'Hard'];
    const idx = cycle.indexOf(q.difficulty);
    const next = cycle[(idx + 1) % cycle.length];
    setUpdatingId(q._id);
    try {
      await API.put(`/questions/${q._id}`, { difficulty: next });
      setQuestions(qs => qs.map(x => x._id === q._id ? { ...x, difficulty: next } : x));
    } catch {
      showToast('Failed to update difficulty', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Bulk update ─────────────────────────────────────────────────────────
  const handleBulkUpdate = async () => {
    if (selected.size === 0) {
      showToast('Select at least one question', 'error');
      return;
    }
    const confirmed = window.confirm(
      `Set ${selected.size} selected question(s) to "${bulkDiff}"?`
    );
    if (!confirmed) return;

    setBulkLoading(true);
    try {
      const res = await API.put('/questions/bulk-difficulty', {
        questionIds: Array.from(selected),
        difficulty: bulkDiff || null,
      });
      if (res.data.success) {
        showToast(`Updated ${res.data.modifiedCount} questions to "${bulkDiff}"`, 'success');
        setSelected(new Set());
        fetchQuestions();
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Bulk update failed', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-500/30">
              <Target size={20} />
            </span>
            Difficulty Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Assign, edit, and bulk-update difficulty levels. Unclassified questions are shown first.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[null, 'Easy', 'Medium', 'Hard'].map(d => {
            const opt = DIFFICULTY_OPTIONS.find(x => x.value === d);
            return (
              <button
                key={String(d)}
                onClick={() => { setShowUnclassified(d === null); setFilterDiff(d === null ? '' : d); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  (d === null ? showUnclassified : filterDiff === d && !showUnclassified)
                    ? `${opt.color} shadow-sm`
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search..." value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchQuestions()}
              className="input-field pl-8" />
          </div>
          <select className="input-field" value={filterSubject} onChange={e => loadChapters(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="input-field" value={filterChapter} onChange={e => setFilterChapter(e.target.value)} disabled={!filterSubject}>
            <option value="">All Chapters</option>
            {chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {['MCQ','Numerical','Assertion-Reason','Match-Following','Multiple-Correct','Descriptive','Case-Study'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button onClick={() => { setFilterDiff(''); setFilterSubject(''); setFilterChapter(''); setFilterType(''); setKeyword(''); setShowUnclassified(false); setPage(1); }}
            className="btn-secondary justify-center">
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* ── Bulk Action Bar ─────────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-scale-in">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-400">
            <CheckCircle size={16} />
            {selected.size} question(s) selected
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Set difficulty to:</span>
            {['Easy', 'Medium', 'Hard', 'Unclassified'].map(d => (
              <button
                key={d}
                onClick={() => setBulkDiff(d === 'Unclassified' ? null : d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  (d === 'Unclassified' ? bulkDiff === null : bulkDiff === d)
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
            <button onClick={handleBulkUpdate} disabled={bulkLoading} className="btn-primary">
              {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
              Apply
            </button>
          </div>
        </div>
      )}

      {/* ── Questions Table ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary-500" size={36} />
            <p className="text-slate-400 text-sm font-semibold">Loading questions...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-10 px-4">
                      <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-primary-500 transition-colors">
                        {selected.size === questions.length && questions.length > 0
                          ? <CheckSquare size={16} className="text-primary-500" />
                          : <Square size={16} />}
                      </button>
                    </th>
                    <th>Q.No</th>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Subject / Chapter</th>
                    <th>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length > 0 ? questions.map(q => (
                    <tr key={q._id}>
                      <td className="w-10 px-4">
                        <button onClick={() => toggleSelect(q._id)} className="cursor-pointer text-slate-400 hover:text-primary-500 transition-colors">
                          {selected.has(q._id)
                            ? <CheckSquare size={16} className="text-primary-500" />
                            : <Square size={16} />}
                        </button>
                      </td>
                      <td className="font-bold text-slate-700 dark:text-slate-200">Q{q.questionNumber}</td>
                      <td className="max-w-[300px]">
                        <p className="text-slate-700 dark:text-slate-300 text-xs line-clamp-2">{q.questionText}</p>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[11px] font-semibold">
                          {q.questionType || 'MCQ'}
                        </span>
                      </td>
                      <td>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{q.subject?.name}</p>
                        <p className="text-slate-400 text-[10px]">{q.chapter?.name}</p>
                      </td>
                      <td>
                        {updatingId === q._id ? (
                          <Loader2 size={14} className="animate-spin text-primary-500" />
                        ) : (
                          <DifficultyBadge value={q.difficulty} onClick={() => cycleDifficulty(q)} interactive />
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                        No questions match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-medium">
                {total.toLocaleString()} total • Page {page} of {pages}
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">{page}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-slide-in ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default DifficultyManager;
