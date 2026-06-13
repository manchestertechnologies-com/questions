import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../../services/api';
import {
  Zap, ChevronDown, CheckCircle, AlertCircle, Loader2, X, Eye,
  RotateCcw, Save, Plus, BookOpen, Keyboard, Copy, ChevronRight
} from 'lucide-react';

const SUBJECT_LEVELS = ['subject', 'chapter', 'concept', 'subConcept'];

const QUESTION_TYPES = [
  { value: 'MCQ', label: 'MCQ', desc: 'Single correct option' },
  { value: 'Multiple-Correct', label: 'Multiple Correct', desc: 'More than one correct' },
  { value: 'Numerical', label: 'Numerical', desc: 'Numeric answer' },
  { value: 'Assertion-Reason', label: 'Assertion-Reason', desc: 'A & R type' },
  { value: 'Match-Following', label: 'Match the Following', desc: 'Column matching' },
  { value: 'Descriptive', label: 'Descriptive', desc: 'Free-form answer' },
  { value: 'Case-Study', label: 'Case Study', desc: 'Passage-based' },
];

const emptyForm = () => ({
  questionText: '',
  optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: '',
  explanation: '',
  questionType: 'MCQ',
  questionNumber: '',
  subject: '', chapter: '', concept: '', subConcept: '',
  examType: [],
  board: '',
  questionBank: '',
  topic: '',
  tags: '',
});

const QuickAddPage = () => {
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsedQueue, setParsedQueue] = useState([]); // multiple questions
  const [currentQueueIdx, setCurrentQueueIdx] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [toast, setToast] = useState(null);

  // Syllabus
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [subConcepts, setSubConcepts] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const textareaRef = useRef(null);

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

  const handleSubjectChange = async (id) => {
    setForm(f => ({ ...f, subject: id, chapter: '', concept: '', subConcept: '' }));
    setChapters([]); setConcepts([]); setSubConcepts([]);
    if (!id) return;
    setSubjectLoading(true);
    try {
      const res = await API.get(`/syllabus/chapters?subjectId=${id}`);
      if (res.data.success) setChapters(res.data.chapters);
    } catch { } finally { setSubjectLoading(false); }
  };

  const handleChapterChange = async (id) => {
    setForm(f => ({ ...f, chapter: id, concept: '', subConcept: '' }));
    setConcepts([]); setSubConcepts([]);
    if (!id) return;
    try {
      const res = await API.get(`/syllabus/concepts?chapterId=${id}`);
      if (res.data.success) setConcepts(res.data.concepts);
    } catch { }
  };

  const handleConceptChange = async (id) => {
    setForm(f => ({ ...f, concept: id, subConcept: '' }));
    setSubConcepts([]);
    if (!id) return;
    try {
      const res = await API.get(`/syllabus/subconcepts?conceptId=${id}`);
      if (res.data.success) setSubConcepts(res.data.subConcepts);
    } catch { }
  };

  // ── Smart Parse ──────────────────────────────────────────────────────────
  const handleParse = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setParseError('');
    try {
      const res = await API.post('/questions/parse-text', { text: rawText });
      if (res.data.success && res.data.questions.length > 0) {
        const firstQ = res.data.questions[0];
        setParsedQueue(res.data.questions);
        setCurrentQueueIdx(0);
        applyParsed(firstQ);
        showToast(`Parsed ${res.data.count} question(s) successfully!`, 'success');
      } else {
        setParseError('Could not extract question. Please fill fields manually.');
      }
    } catch (err) {
      setParseError(err.response?.data?.error || 'Parse failed. Try again.');
    } finally {
      setParsing(false);
    }
  };

  const applyParsed = (q) => {
    setForm(f => ({
      ...f,
      questionText: q.questionText || '',
      optionA: q.options?.A || '',
      optionB: q.options?.B || '',
      optionC: q.options?.C || '',
      optionD: q.options?.D || '',
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      questionType: q.questionType || 'MCQ',
    }));
    setShowPreview(true);
  };

  const handleNextInQueue = () => {
    const next = currentQueueIdx + 1;
    if (next < parsedQueue.length) {
      setCurrentQueueIdx(next);
      applyParsed(parsedQueue[next]);
    }
  };

  // ── Save question ─────────────────────────────────────────────────────────
  const handleSave = async (andNext = false) => {
    if (!form.questionText.trim()) {
      showToast('Question text is required', 'error');
      return;
    }
    if (!form.subject || !form.chapter || !form.concept) {
      showToast('Please select Subject, Chapter, and Concept', 'error');
      return;
    }

    setSaving(true);
    try {
      const qNum = form.questionNumber || (Date.now() % 100000);
      const payload = {
        ...form,
        questionNumber: parseInt(qNum, 10),
        examType: form.examType,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      const res = await API.post('/questions', payload);
      if (res.data.success) {
        setSessionCount(c => c + 1);
        showToast(`Question saved! (${sessionCount + 1} this session)`, 'success');

        if (andNext && currentQueueIdx + 1 < parsedQueue.length) {
          handleNextInQueue();
        } else {
          // Reset form
          setForm(prev => ({
            ...emptyForm(),
            subject: prev.subject,
            chapter: prev.chapter,
            concept: prev.concept,
            subConcept: prev.subConcept,
            examType: prev.examType,
            board: prev.board,
            questionBank: prev.questionBank,
          }));
          setRawText('');
          setShowPreview(false);
          setParsedQueue([]);
          setCurrentQueueIdx(0);
          // Focus parse textarea
          setTimeout(() => textareaRef.current?.focus(), 100);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save question', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave(false);
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSave(true);
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handleParse();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [form, rawText]);

  const inp = (field) => ({
    value: form[field],
    onChange: (e) => setForm(f => ({ ...f, [field]: e.target.value })),
    className: 'input-field',
  });

  const examTypes = ['JEE', 'NEET', 'KCET', 'Board', 'UPSC', 'CET', 'CBSE', 'ICSE'];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-3">
            <span className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary-500/30">
              <Zap size={20} />
            </span>
            Quick Add Questions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Paste text → Parse → Review → Save. Keyboard-first workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Session counter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
            <CheckCircle size={15} className="text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">{sessionCount} saved this session</span>
          </div>
          {/* Keyboard shortcuts hint */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Keyboard size={12} />
            <span>Ctrl+P Parse • Ctrl+S Save • Ctrl+Enter Save+Next</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── LEFT: Parse Box + Placement ──────────────────────────────────── */}
        <div className="space-y-5">
          {/* Smart Parse Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary-500" />
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Smart Paste & Parse</h2>
              </div>
              {parsedQueue.length > 1 && (
                <span className="text-xs bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-semibold">
                  {currentQueueIdx + 1} / {parsedQueue.length} in queue
                </span>
              )}
            </div>
            <textarea
              ref={textareaRef}
              placeholder={`Paste question text here. Example:\n\nQ. What is the capital of India?\n\nA) Mumbai\nB) Delhi\nC) Chennai\nD) Kolkata\n\nAnswer: B\n\nExplanation: Delhi is the capital city of India.`}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="parse-textarea"
              rows={10}
              autoFocus
            />
            {parseError && (
              <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> {parseError}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleParse}
                disabled={parsing || !rawText.trim()}
                className="btn-primary flex-1 justify-center"
              >
                {parsing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                {parsing ? 'Parsing...' : 'Parse & Fill Fields (Ctrl+P)'}
              </button>
              <button onClick={() => { setRawText(''); setParseError(''); }} className="btn-secondary">
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Placement */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
              <BookOpen size={15} className="text-primary-500" />
              Question Placement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="input-label">Subject *</label>
                <select className="input-field" value={form.subject} onChange={e => handleSubjectChange(e.target.value)}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} {s.classNum ? `(Cl.${s.classNum})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Chapter *</label>
                <select className="input-field" value={form.chapter} onChange={e => handleChapterChange(e.target.value)} disabled={!form.subject}>
                  <option value="">Select Chapter</option>
                  {chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Concept *</label>
                <select className="input-field" value={form.concept} onChange={e => handleConceptChange(e.target.value)} disabled={!form.chapter}>
                  <option value="">Select Concept</option>
                  {concepts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Sub-Concept</label>
                <select className="input-field" value={form.subConcept} onChange={e => setForm(f => ({ ...f, subConcept: e.target.value }))} disabled={!form.concept}>
                  <option value="">Select Sub-Concept</option>
                  {subConcepts.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Topic</label>
                <input type="text" placeholder="e.g. Newton's Laws" {...inp('topic')} />
              </div>
              <div>
                <label className="input-label">Question Bank</label>
                <input type="text" placeholder="e.g. JEE 2024 PYQ" {...inp('questionBank')} />
              </div>
              <div>
                <label className="input-label">Board</label>
                <input type="text" placeholder="CBSE / ICSE / State" {...inp('board')} />
              </div>
              <div>
                <label className="input-label">Q. Number</label>
                <input type="number" placeholder="Auto-assigned if blank" {...inp('questionNumber')} />
              </div>
            </div>
            {/* Exam Types */}
            <div className="mt-3">
              <label className="input-label">Exam Types</label>
              <div className="flex flex-wrap gap-2">
                {examTypes.map(et => (
                  <button
                    key={et}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      examType: f.examType.includes(et)
                        ? f.examType.filter(x => x !== et)
                        : [...f.examType, et]
                    }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      form.examType.includes(et)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                    }`}
                  >
                    {et}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Editable Form ──────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Question content */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">Question Content</h2>
              <div className="flex gap-2">
                {QUESTION_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    title={t.desc}
                    onClick={() => setForm(f => ({ ...f, questionType: t.value }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      form.questionType === t.value
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="input-label">Question Text *</label>
                <textarea
                  className="input-field min-h-[100px] resize-y"
                  placeholder="Question text (supports LaTeX: \( \frac{d}{dx} \))"
                  value={form.questionText}
                  onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                  rows={4}
                />
              </div>

              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt} className="flex gap-2 items-center">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    form.correctAnswer === opt
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>{opt}</span>
                  <input
                    type="text"
                    placeholder={`Option ${opt}`}
                    value={form[`option${opt}`]}
                    onChange={e => setForm(f => ({ ...f, [`option${opt}`]: e.target.value }))}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    title="Mark as correct"
                    onClick={() => setForm(f => ({ ...f, correctAnswer: opt }))}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      form.correctAnswer === opt
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-400'
                    }`}
                  >
                    <CheckCircle size={14} />
                  </button>
                </div>
              ))}

              <div>
                <label className="input-label">Correct Answer (for Numerical/Descriptive)</label>
                <input type="text" placeholder="e.g. 42 or B or AB" value={form.correctAnswer}
                  onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))} className="input-field" />
              </div>

              <div>
                <label className="input-label">Explanation / Solution</label>
                <textarea className="input-field resize-y" rows={3}
                  placeholder="Solution explanation (supports LaTeX)"
                  value={form.explanation}
                  onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
              </div>

              <div>
                <label className="input-label">Tags (comma-separated)</label>
                <input type="text" placeholder="e.g. important, PYQ, tricky" {...inp('tags')} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary"
            >
              <Eye size={15} />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save (Ctrl+S)
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="btn-primary flex-1 justify-center bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <ChevronRight size={15} />}
              Save + Next (Ctrl+Enter)
            </button>
          </div>

          {/* Question Preview */}
          {showPreview && form.questionText && (
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Preview</h3>
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-4">{form.questionText}</p>
              {['A', 'B', 'C', 'D'].map(opt => form[`option${opt}`] && (
                <div key={opt} className={`question-option mb-2 ${form.correctAnswer === opt ? 'correct' : ''}`}>
                  <span className={`option-badge ${form.correctAnswer === opt ? 'correct' : ''}`}>{opt}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{form[`option${opt}`]}</span>
                </div>
              ))}
              {form.explanation && (
                <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/40 rounded-xl">
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">Explanation</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{form.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-slide-in ${
          toast.type === 'success'
            ? 'bg-emerald-500 text-white'
            : 'bg-rose-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default QuickAddPage;
