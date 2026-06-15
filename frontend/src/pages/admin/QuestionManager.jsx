import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../../services/api';
import {
  Search, Filter, ChevronLeft, ChevronRight, Upload, Image as ImageIcon,
  Edit, CheckCircle, AlertCircle, X, FileText, Loader2, Trash2, Eye, EyeOff,
  Tag, Clock, User, ZoomIn, Copy, RotateCcw, ChevronDown, BookOpen
} from 'lucide-react';

// ── Image Zoom Modal ──────────────────────────────────────────────────────────
const ImageZoomModal = ({ src, onClose }) => (
  <div className="img-zoom-modal" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
      <X size={20} />
    </button>
    <img
      src={src}
      alt="Zoomed"
      onClick={e => e.stopPropagation()}
    />
  </div>
);

// ── Image Slot Component ──────────────────────────────────────────────────────
const ImageSlot = ({ label, imageUrl, onUpload, onDelete, onZoom, loading }) => {
  const fullUrl = imageUrl?.startsWith('/') ? `http://localhost:5000${imageUrl}` : imageUrl;
  return (
    <div className="space-y-1.5">
      <label className="input-label">{label}</label>
      {imageUrl ? (
        <div className="relative group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-2 flex items-center justify-between gap-2">
          <img
            src={fullUrl}
            alt={label}
            className="h-14 w-20 object-contain rounded-lg bg-white border border-slate-200 dark:border-slate-800 cursor-zoom-in"
            onClick={() => onZoom(fullUrl)}
          />
          <div className="flex flex-col gap-1">
            <button onClick={() => onZoom(fullUrl)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-500 transition-colors cursor-pointer">
              <ZoomIn size={12} />
            </button>
            <label className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-500 transition-colors cursor-pointer">
              <Upload size={12} />
              <input type="file" accept="image/*" className="hidden" disabled={loading}
                onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
            </label>
            <button onClick={onDelete} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-950/10 transition-all">
          {loading ? <Loader2 className="animate-spin text-primary-500" size={16} /> : (
            <>
              <ImageIcon size={16} className="text-slate-400 mb-1" />
              <span className="text-[11px] font-bold text-primary-500">+ {label}</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" disabled={loading}
            onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
        </label>
      )}
    </div>
  );
};

// ── MathJax typeset trigger ───────────────────────────────────────────────────
const triggerMathJax = () => {
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise().catch(console.error);
  }
};

// ── Difficulty badge ──────────────────────────────────────────────────────────
const DiffBadge = ({ value, onClick }) => {
  const opts = {
    Easy:   { cls: 'badge-easy',   emoji: '🟢' },
    Medium: { cls: 'badge-medium', emoji: '🟡' },
    Hard:   { cls: 'badge-hard',   emoji: '🔴' },
  };
  const opt = opts[value] || { cls: 'badge-unclassified', emoji: '⬜' };
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to cycle difficulty"
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:scale-105 active:scale-95 transition-transform ${opt.cls}`}
    >
      {opt.emoji} {value || 'Unclassified'}
    </button>
  );
};

const QUESTION_TYPES = ['MCQ','Numerical','Assertion-Reason','Match-Following','Multiple-Correct','Descriptive','Case-Study'];
const EXAM_TYPES = ['JEE', 'NEET', 'KCET', 'Board', 'UPSC', 'CET', 'CBSE', 'ICSE'];
const DIFF_CYCLE = { null: 'Easy', Easy: 'Medium', Medium: 'Hard', Hard: null };

const QuestionManager = () => {
  // ── List state ──
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── Filters ──
  const [keyword, setKeyword] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [filterConcept, setFilterConcept] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterExamType, setFilterExamType] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterQNum, setFilterQNum] = useState('');
  const [filterUnclassified, setFilterUnclassified] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ── Syllabus data ──
  const [subjects, setSubjects] = useState([]);
  const [filterChapters, setFilterChapters] = useState([]);
  const [filterConcepts, setFilterConcepts] = useState([]);

  // ── Detail view ──
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingField, setLoadingField] = useState(null);
  const [zoomedImg, setZoomedImg] = useState(null);
  const [updatingDiffId, setUpdatingDiffId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Edit form ──
  const [editForm, setEditForm] = useState({});

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Create form ──
  const blankCreate = {
    questionType: 'MCQ', questionNumber: '', questionText: '',
    optionA: '', optionB: '', optionC: '', optionD: '',
    correctAnswer: '', explanation: '',
    subject: '', chapter: '', concept: '', subConcept: '',
    examType: [], board: '', questionBank: '', topic: '', tags: '',
    questionImage: null, optionAImage: null, optionBImage: null,
    optionCImage: null, optionDImage: null, solutionImage: null,
  };
  const [createForm, setCreateForm] = useState(blankCreate);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createChapters, setCreateChapters] = useState([]);
  const [createConcepts, setCreateConcepts] = useState([]);
  const [createSubConcepts, setCreateSubConcepts] = useState([]);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const res = await API.get('/syllabus/subjects');
        if (res.data.success) setSubjects(res.data.subjects);
      } catch { }
    };
    init();
  }, []);

  // ── Filter chain ──────────────────────────────────────────────────────────
  const handleFilterSubjectChange = async (id) => {
    setFilterSubject(id); setFilterChapter(''); setFilterConcept('');
    setFilterChapters([]); setFilterConcepts([]);
    if (!id) return;
    try { const r = await API.get(`/syllabus/chapters?subjectId=${id}`); if (r.data.success) setFilterChapters(r.data.chapters); } catch { }
  };
  const handleFilterChapterChange = async (id) => {
    setFilterChapter(id); setFilterConcept(''); setFilterConcepts([]);
    if (!id) return;
    try { const r = await API.get(`/syllabus/concepts?chapterId=${id}`); if (r.data.success) setFilterConcepts(r.data.concepts); } catch { }
  };

  // ── Fetch questions ───────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    let url = `/questions?page=${currentPage}&limit=20`;
    if (keyword)          url += `&keyword=${encodeURIComponent(keyword)}`;
    if (filterSubject)    url += `&subject=${filterSubject}`;
    if (filterChapter)    url += `&chapter=${filterChapter}`;
    if (filterConcept)    url += `&concept=${filterConcept}`;
    if (filterDifficulty) url += `&difficulty=${filterDifficulty}`;
    if (filterExamType)   url += `&examType=${filterExamType}`;
    if (filterType)       url += `&questionType=${filterType}`;
    if (filterQNum)       url += `&questionNumber=${filterQNum}`;
    if (filterUnclassified) url += `&unclassified=true`;
    try {
      const res = await API.get(url);
      if (res.data.success) {
        setQuestions(res.data.questions);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch { } finally { setLoading(false); }
  }, [currentPage, keyword, filterSubject, filterChapter, filterConcept, filterDifficulty, filterExamType, filterType, filterQNum, filterUnclassified]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // Re-run MathJax after questions load
  useEffect(() => {
    if (!loading) setTimeout(triggerMathJax, 100);
  }, [loading, activeQuestion]);

  // ── Open detail ───────────────────────────────────────────────────────────
  const openDetail = (q) => {
    setActiveQuestion(q);
    setIsEditMode(false);
    setEditForm({
      title: q.title || '',
      questionType: q.questionType || 'MCQ',
      questionText: q.questionText,
      optionA: q.options?.A?.text || '',
      optionB: q.options?.B?.text || '',
      optionC: q.options?.C?.text || '',
      optionD: q.options?.D?.text || '',
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      marks: q.marks || 4,
      negativeMarks: q.negativeMarks || 1,
      examType: q.examType || [],
      tags: (q.tags || []).join(', '),
      board: q.board || '',
      questionBank: q.questionBank || '',
      topic: q.topic || '',
      questionImage: q.questionImage || null,
      optionAImage: q.optionAImage || null,
      optionBImage: q.optionBImage || null,
      optionCImage: q.optionCImage || null,
      optionDImage: q.optionDImage || null,
      solutionImage: q.solutionImage || null,
    });
  };

  // ── Save edits ────────────────────────────────────────────────────────────
  const handleSaveEdits = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const res = await API.put(`/questions/${activeQuestion._id}`, payload);
      if (res.data.success) {
        const detailRes = await API.get(`/questions/${activeQuestion._id}`);
        if (detailRes.data.success) {
          const updated = detailRes.data.question;
          setActiveQuestion(updated);
          setQuestions(qs => qs.map(q => q._id === updated._id ? updated : q));
          setIsEditMode(false);
          showToast('Question updated successfully!');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save edits.', 'error');
    } finally { setSaving(false); }
  };

  // ── Quick difficulty toggle ───────────────────────────────────────────────
  const cycleDiff = async (q, e) => {
    e?.stopPropagation();
    const next = DIFF_CYCLE[q.difficulty] ?? 'Easy';
    setUpdatingDiffId(q._id);
    try {
      await API.put(`/questions/${q._id}`, { difficulty: next });
      const updated = { ...q, difficulty: next };
      setQuestions(qs => qs.map(x => x._id === q._id ? updated : x));
      if (activeQuestion?._id === q._id) setActiveQuestion(updated);
    } catch { showToast('Failed to update difficulty', 'error'); }
    finally { setUpdatingDiffId(null); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await API.delete(`/questions/${id}`);
      setQuestions(qs => qs.filter(q => q._id !== id));
      setTotal(t => t - 1);
      if (activeQuestion?._id === id) setActiveQuestion(null);
      setDeleteConfirm(null);
      showToast('Question deleted.', 'success');
    } catch { showToast('Delete failed.', 'error'); }
  };

  // ── Image upload (edit mode) ──────────────────────────────────────────────
  const handleImgUpload = async (fieldName, file) => {
    setLoadingField(fieldName);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await API.post(`/questions/${activeQuestion._id}/image-fields/${fieldName}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const updated = res.data.question;
        setActiveQuestion(updated);
        setQuestions(qs => qs.map(q => q._id === updated._id ? updated : q));
        setEditForm(f => ({ ...f, [fieldName]: res.data.url }));
        showToast('Image uploaded!');
      }
    } catch { showToast('Image upload failed', 'error'); }
    finally { setLoadingField(null); }
  };

  const handleImgDelete = async (fieldName) => {
    try {
      const res = await API.delete(`/questions/${activeQuestion._id}/image-fields/${fieldName}`);
      if (res.data.success) {
        const updated = res.data.question;
        setActiveQuestion(updated);
        setQuestions(qs => qs.map(q => q._id === updated._id ? updated : q));
        setEditForm(f => ({ ...f, [fieldName]: null }));
        showToast('Image removed.');
      }
    } catch { showToast('Delete failed.', 'error'); }
  };

  // ── Temp upload for create form ───────────────────────────────────────────
  const handleTempUpload = async (fieldName, file) => {
    setLoadingField(fieldName);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await API.post('/questions/temp-upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) setCreateForm(f => ({ ...f, [fieldName]: res.data.url }));
    } catch { showToast('Upload failed', 'error'); }
    finally { setLoadingField(null); }
  };

  // ── Create form chain ─────────────────────────────────────────────────────
  const handleCreateSubjectChange = async (id) => {
    setCreateForm(f => ({ ...f, subject: id, chapter: '', concept: '', subConcept: '' }));
    setCreateChapters([]); setCreateConcepts([]); setCreateSubConcepts([]);
    if (!id) return;
    try { const r = await API.get(`/syllabus/chapters?subjectId=${id}`); if (r.data.success) setCreateChapters(r.data.chapters); } catch { }
  };
  const handleCreateChapterChange = async (id) => {
    setCreateForm(f => ({ ...f, chapter: id, concept: '', subConcept: '' }));
    setCreateConcepts([]); setCreateSubConcepts([]);
    if (!id) return;
    try { const r = await API.get(`/syllabus/concepts?chapterId=${id}`); if (r.data.success) setCreateConcepts(r.data.concepts); } catch { }
  };
  const handleCreateConceptChange = async (id) => {
    setCreateForm(f => ({ ...f, concept: id, subConcept: '' }));
    setCreateSubConcepts([]);
    if (!id) return;
    try { const r = await API.get(`/syllabus/subconcepts?conceptId=${id}`); if (r.data.success) setCreateSubConcepts(r.data.subConcepts); } catch { }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.subject || !createForm.chapter || !createForm.concept) {
      showToast('Select Subject, Chapter, and Concept', 'error'); return;
    }
    if (!createForm.questionText) { showToast('Question text required', 'error'); return; }
    setCreating(true);
    try {
      const payload = {
        ...createForm,
        tags: createForm.tags ? createForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const res = await API.post('/questions', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setCreateForm(blankCreate);
        fetchQuestions();
        showToast('Question created successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Creation failed.', 'error');
    } finally { setCreating(false); }
  };

  // ── Copy ID ───────────────────────────────────────────────────────────────
  const copyId = (id) => {
    navigator.clipboard.writeText(id).then(() => showToast('Question ID copied!'));
  };

  const imgUrl = (url) => url?.startsWith('/') ? `http://localhost:5000${url}` : url;

  const renderTextWithSlots = (text, prefix) => {
    if (!text) return null;
    const regex = /\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi;
    
    const hasExplicitSlots = regex.test(text);
    let processedText = text;
    if (!hasExplicitSlots) {
      const slotId = `${prefix}_0`;
      const slot = activeQuestion?.imageSlots?.find(s => s.slotId === slotId);
      if (slot && slot.url) {
        processedText = processedText + ' [[IMAGE SLOT]]';
      } else {
        return text;
      }
    }
    
    const parts = processedText.split(regex);
    const finalElements = [];
    
    for (let p = 0; p < parts.length; p++) {
      finalElements.push(<span key={`txt_${p}`}>{parts[p]}</span>);
      if (p < parts.length - 1) {
        const slotId = `${prefix}_${p}`;
        const slot = activeQuestion?.imageSlots?.find(s => s.slotId === slotId);
        if (slot && slot.url) {
          finalElements.push(
            <span key={`img_${p}`} className="block my-3">
              <img 
                src={imgUrl(slot.url)} 
                alt={slotId} 
                className="max-h-56 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white cursor-zoom-in"
                onClick={() => setZoomedImg(imgUrl(slot.url))}
              />
            </span>
          );
        } else {
          finalElements.push(
            <span key={`pending_${p}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-400 font-mono my-2">
              [ Diagram pending admin upload ]
            </span>
          );
        }
      }
    }
    return <span>{finalElements}</span>;
  };

  const renderEditableTextWithSlots = (text, prefix) => {
    if (!text) return null;
    const regex = /\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi;
    
    const hasExplicitSlots = regex.test(text);
    let processedText = text;
    if (!hasExplicitSlots) {
      processedText = processedText + ' [[IMAGE SLOT]]';
    }
    
    const parts = processedText.split(regex);
    const elements = [];
    
    for (let p = 0; p < parts.length; p++) {
      elements.push(<span key={`text_${p}`}>{parts[p]}</span>);
      if (p < parts.length - 1) {
        const slotId = `${prefix}_${p}`;
        const slot = activeQuestion?.imageSlots?.find(s => s.slotId === slotId);
        const imageUrl = slot ? slot.url : null;
        
        elements.push(
          <span key={`slot_${p}`} className="inline-block mx-1.5 align-middle">
            {imageUrl ? (
              <div className="relative group inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white p-1 max-w-[200px]">
                <img 
                  src={imageUrl.startsWith('/') ? `http://localhost:5000${imageUrl}` : imageUrl} 
                  alt={slotId} 
                  className="h-8 w-12 object-contain rounded border bg-white cursor-zoom-in"
                  onClick={() => setZoomedImg(imgUrl(imageUrl))}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to remove this slot image?')) {
                      try {
                        const res = await API.delete(`/questions/${activeQuestion._id}/slots/${slotId}`);
                        if (res.data.success) {
                          const detailRes = await API.get(`/questions/${activeQuestion._id}`);
                          if (detailRes.data.success) {
                            const updated = detailRes.data.question;
                            setActiveQuestion(updated);
                            setQuestions(qs => qs.map(q => q._id === updated._id ? updated : q));
                            showToast('Slot image removed.');
                          }
                        }
                      } catch { showToast('Image removal failed', 'error'); }
                    }
                  }}
                  className="px-1.5 py-0.5 bg-danger-50 hover:bg-danger-100 text-danger-600 rounded text-[9px] font-bold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-primary-300 bg-primary-50/20 hover:bg-primary-50 dark:border-primary-800 dark:bg-primary-950/20 rounded-lg px-2 py-0.5 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-all select-none">
                {loadingField === `slot_${slotId}` ? (
                  <Loader2 className="animate-spin text-primary-500" size={10} />
                ) : (
                  <span className="text-[10px] font-bold text-primary-500 flex items-center gap-1">
                    📷 Click to upload slot
                  </span>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  disabled={loadingField === `slot_${slotId}`}
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLoadingField(`slot_${slotId}`);
                      const fd = new FormData();
                      fd.append('image', e.target.files[0]);
                      try {
                        const res = await API.post(`/questions/${activeQuestion._id}/slots/${slotId}`, fd, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        if (res.data.success) {
                          const detailRes = await API.get(`/questions/${activeQuestion._id}`);
                          if (detailRes.data.success) {
                            const updated = detailRes.data.question;
                            setActiveQuestion(updated);
                            setQuestions(qs => qs.map(q => q._id === updated._id ? updated : q));
                            showToast('Slot image uploaded!');
                          }
                        }
                      } catch { showToast('Image upload failed', 'error'); }
                      finally { setLoadingField(null); }
                    }
                  }} 
                />
              </label>
            )}
          </span>
        );
      }
    }
    
    return (
      <div className="p-2.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/30 dark:bg-slate-900/10 text-xs text-slate-700 dark:text-slate-300 leading-normal my-2">
        <span className="text-[9px] font-bold text-primary-400 block mb-1 uppercase tracking-wider">Inline Layout Preview (Click to upload):</span>
        {elements}
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 space-y-5 max-w-7xl mx-auto w-full animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">Question Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {total.toLocaleString()} questions · Search, edit, delete, and manage images.
          </p>
        </div>
        <button onClick={() => { setCreateForm(blankCreate); setShowCreateModal(true); }} className="btn-primary shrink-0">
          <FileText size={15} /> Add Single Question
        </button>
      </div>

      {/* ── Search & Filter ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search questions, keywords, LaTeX..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setCurrentPage(1); fetchQuestions(); } }}
              className="input-field pl-9"
            />
          </div>
          <input type="number" placeholder="Q.No" value={filterQNum}
            onChange={e => setFilterQNum(e.target.value)} className="input-field w-24" />
          <button onClick={() => setShowFilters(f => !f)} className="btn-secondary">
            <Filter size={14} /> Filters {showFilters ? <ChevronDown size={12} className="rotate-180 transition-transform" /> : <ChevronDown size={12} className="transition-transform" />}
          </button>
          <button onClick={() => { setKeyword(''); setFilterSubject(''); setFilterChapter(''); setFilterConcept(''); setFilterDifficulty(''); setFilterExamType(''); setFilterType(''); setFilterQNum(''); setFilterUnclassified(false); setCurrentPage(1); }} className="btn-secondary">
            <RotateCcw size={13} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
            <select className="input-field" value={filterSubject} onChange={e => handleFilterSubjectChange(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select className="input-field" value={filterChapter} onChange={e => handleFilterChapterChange(e.target.value)} disabled={!filterSubject}>
              <option value="">All Chapters</option>
              {filterChapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="input-field" value={filterConcept} onChange={e => setFilterConcept(e.target.value)} disabled={!filterChapter}>
              <option value="">All Concepts</option>
              {filterConcepts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="input-field" value={filterDifficulty} onChange={e => { setFilterDifficulty(e.target.value); setFilterUnclassified(false); }}>
              <option value="">All Difficulties</option>
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
            </select>
            <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input-field" value={filterExamType} onChange={e => setFilterExamType(e.target.value)}>
              <option value="">All Exams</option>
              {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-2 col-span-2 cursor-pointer">
              <input type="checkbox" checked={filterUnclassified} onChange={e => { setFilterUnclassified(e.target.checked); setFilterDifficulty(''); }}
                className="w-4 h-4 rounded border-slate-300 text-primary-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Show unclassified only</span>
            </label>
          </div>
        )}
      </div>

      {/* ── Question Table ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary-500" size={36} />
            <p className="text-slate-400 text-sm font-semibold">Loading question bank...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-16">Q.No</th>
                    <th>Question</th>
                    <th>Subject / Chapter</th>
                    <th>Type</th>
                    <th>Difficulty</th>
                    <th>Exams</th>
                    <th className="text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length > 0 ? questions.map(q => (
                    <tr key={q._id} className="cursor-pointer" onClick={() => openDetail(q)}>
                      <td className="font-extrabold text-slate-700 dark:text-slate-200">Q{q.questionNumber}</td>
                      <td className="max-w-[260px]">
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{q.questionText}</p>
                        {q.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {q.tags.slice(0,3).map(t => (
                              <span key={t} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[9px] font-semibold">{t}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{q.subject?.name || '—'}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{q.chapter?.name}</p>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[11px] font-bold">
                          {q.questionType || 'MCQ'}
                        </span>
                      </td>
                      <td>
                        {updatingDiffId === q._id
                          ? <Loader2 size={14} className="animate-spin text-primary-500" />
                          : <DiffBadge value={q.difficulty} onClick={(e) => cycleDiff(q, e)} />}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-0.5 max-w-[120px]">
                          {(q.examType || []).map(et => (
                            <span key={et} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold">{et}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openDetail(q)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-500 transition-colors cursor-pointer">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(q)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-400 text-sm">
                        No questions match the filters. Try broadening your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-medium">
                {total.toLocaleString()} questions · Page {currentPage} of {pages}
              </p>
              <div className="flex gap-1.5 items-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                  <ChevronLeft size={14} />
                </button>
                {[...Array(Math.min(5, pages))].map((_, i) => {
                  const pg = Math.max(1, currentPage - 2) + i;
                  if (pg > pages) return null;
                  return (
                    <button key={pg} onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pg === currentPage ? 'bg-primary-500 text-white' : 'btn-secondary py-0 px-0'}`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(pages, p + 1))} disabled={currentPage === pages}
                  className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Question Detail Slide-over ──────────────────────────────────────── */}
      {activeQuestion && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setActiveQuestion(null)} />
          <div className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-800 dark:text-white text-sm">Q{activeQuestion.questionNumber}</span>
                <DiffBadge value={activeQuestion.difficulty} onClick={() => cycleDiff(activeQuestion)} />
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md text-[11px] font-bold">
                  {activeQuestion.questionType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyId(activeQuestion._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer" title="Copy ID">
                  <Copy size={14} />
                </button>
                <button onClick={() => setIsEditMode(e => !e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isEditMode ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40' : 'btn-secondary'}`}>
                  <Edit size={12} /> {isEditMode ? 'Viewing' : 'Edit'}
                </button>
                <button onClick={() => setDeleteConfirm(activeQuestion)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
                <button onClick={() => setActiveQuestion(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Metadata bar */}
            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 overflow-x-auto shrink-0">
              {activeQuestion.subject?.name && <span className="flex items-center gap-1 whitespace-nowrap"><BookOpen size={10} />{activeQuestion.subject.name}</span>}
              {activeQuestion.chapter?.name && <><span className="text-slate-300 dark:text-slate-700">›</span><span className="whitespace-nowrap">{activeQuestion.chapter.name}</span></>}
              {activeQuestion.concept?.name && <><span className="text-slate-300 dark:text-slate-700">›</span><span className="whitespace-nowrap">{activeQuestion.concept.name}</span></>}
              <span className="ml-auto flex items-center gap-1 whitespace-nowrap">
                <Clock size={10} />{new Date(activeQuestion.createdDate).toLocaleDateString()}
              </span>
              {activeQuestion.modifiedBy && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <User size={10} />{activeQuestion.modifiedBy.name}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {!isEditMode ? (
                /* ── View Mode ── */
                <div className="space-y-5">
                  {/* Question text */}
                  <div>
                    <p className="input-label mb-2">Question</p>
                    <div className="question-text secure-content leading-relaxed">
                      {activeQuestion.questionImage && (
                        <img src={imgUrl(activeQuestion.questionImage)} alt="Q" className="max-h-48 rounded-xl mb-3 border border-slate-200 dark:border-slate-800 object-contain bg-white cursor-zoom-in" onClick={() => setZoomedImg(imgUrl(activeQuestion.questionImage))} />
                      )}
                      {renderTextWithSlots(activeQuestion.questionText, 'questionText')}
                    </div>
                  </div>

                  {/* Options */}
                  {['A','B','C','D'].map(opt => {
                    const text = activeQuestion.options?.[opt]?.text;
                    const img = activeQuestion.options?.[opt]?.image;
                    if (!text && !img) return null;
                    return (
                      <div key={opt} className={`question-option ${activeQuestion.correctAnswer === opt ? 'correct' : ''}`}>
                        <span className={`option-badge ${activeQuestion.correctAnswer === opt ? 'correct' : ''}`}>{opt}</span>
                        <div className="flex-1">
                          {img && <img src={imgUrl(img)} alt={`Option ${opt}`} className="h-12 mb-1 rounded-lg object-contain cursor-zoom-in" onClick={() => setZoomedImg(imgUrl(img))} />}
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {renderTextWithSlots(text, `option${opt}`)}
                          </div>
                        </div>
                        {activeQuestion.correctAnswer === opt && <CheckCircle size={15} className="text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })}

                  {/* Explanation */}
                  {activeQuestion.explanation && (
                    <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 rounded-xl">
                      <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mb-2">Solution / Explanation</p>
                      {activeQuestion.solutionImage && (
                        <img src={imgUrl(activeQuestion.solutionImage)} alt="Solution" className="max-h-40 rounded-lg mb-2 object-contain cursor-zoom-in" onClick={() => setZoomedImg(imgUrl(activeQuestion.solutionImage))} />
                      )}
                      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {renderTextWithSlots(activeQuestion.explanation, 'explanation')}
                      </div>
                    </div>
                  )}

                  {/* Tags / metadata */}
                  {activeQuestion.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <Tag size={12} className="text-slate-400 mt-0.5" />
                      {activeQuestion.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-semibold">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Edit history */}
                  {activeQuestion.editHistory?.length > 0 && (
                    <details className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <summary className="px-4 py-2.5 cursor-pointer text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
                        Edit History ({activeQuestion.editHistory.length} changes)
                      </summary>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {[...activeQuestion.editHistory].reverse().slice(0,10).map((h, i) => (
                          <div key={i} className="px-4 py-2.5">
                            <p className="text-xs text-slate-600 dark:text-slate-300">{h.changesSummary}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{h.editedBy?.name || 'Unknown'} · {new Date(h.editedAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                /* ── Edit Mode ── */
                <form onSubmit={handleSaveEdits} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Question Type</label>
                      <select className="input-field" value={editForm.questionType} onChange={e => setEditForm(f => ({ ...f, questionType: e.target.value }))}>
                        {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Correct Answer</label>
                      <input type="text" className="input-field" value={editForm.correctAnswer} onChange={e => setEditForm(f => ({ ...f, correctAnswer: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Question Text</label>
                    <textarea className="input-field resize-y" rows={4} value={editForm.questionText} onChange={e => setEditForm(f => ({ ...f, questionText: e.target.value }))} />
                    {renderEditableTextWithSlots(editForm.questionText, 'questionText')}
                  </div>

                  {['A','B','C','D'].map(opt => (
                    <div key={opt}>
                      <label className="input-label">Option {opt}</label>
                      <input type="text" className="input-field" value={editForm[`option${opt}`]} onChange={e => setEditForm(f => ({ ...f, [`option${opt}`]: e.target.value }))} />
                      {renderEditableTextWithSlots(editForm[`option${opt}`], `option${opt}`)}
                    </div>
                  ))}

                  <div>
                    <label className="input-label">Explanation</label>
                    <textarea className="input-field resize-y" rows={3} value={editForm.explanation} onChange={e => setEditForm(f => ({ ...f, explanation: e.target.value }))} />
                    {renderEditableTextWithSlots(editForm.explanation, 'explanation')}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="input-label">Marks</label>
                      <input type="number" className="input-field" value={editForm.marks} onChange={e => setEditForm(f => ({ ...f, marks: e.target.value }))} />
                    </div>
                    <div>
                      <label className="input-label">Neg. Marks</label>
                      <input type="number" className="input-field" value={editForm.negativeMarks} onChange={e => setEditForm(f => ({ ...f, negativeMarks: e.target.value }))} />
                    </div>
                    <div>
                      <label className="input-label">Board</label>
                      <input type="text" className="input-field" value={editForm.board} onChange={e => setEditForm(f => ({ ...f, board: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Topic</label>
                      <input type="text" className="input-field" value={editForm.topic} onChange={e => setEditForm(f => ({ ...f, topic: e.target.value }))} />
                    </div>
                    <div>
                      <label className="input-label">Question Bank</label>
                      <input type="text" className="input-field" value={editForm.questionBank} onChange={e => setEditForm(f => ({ ...f, questionBank: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Tags (comma-separated)</label>
                    <input type="text" className="input-field" value={editForm.tags} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} />
                  </div>

                  {/* Exam types */}
                  <div>
                    <label className="input-label">Exam Types</label>
                    <div className="flex flex-wrap gap-2">
                      {EXAM_TYPES.map(et => (
                        <button key={et} type="button"
                          onClick={() => setEditForm(f => ({
                            ...f, examType: f.examType.includes(et) ? f.examType.filter(x => x !== et) : [...f.examType, et]
                          }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                            editForm.examType?.includes(et) ? 'bg-primary-500 text-white border-primary-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >{et}</button>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="input-label mb-3">Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { key: 'questionImage',  label: 'Question Image' },
                        { key: 'optionAImage',   label: 'Option A' },
                        { key: 'optionBImage',   label: 'Option B' },
                        { key: 'optionCImage',   label: 'Option C' },
                        { key: 'optionDImage',   label: 'Option D' },
                        { key: 'solutionImage',  label: 'Solution' },
                      ].map(({ key, label }) => (
                        <ImageSlot key={key} label={label}
                          imageUrl={editForm[key]}
                          onUpload={file => handleImgUpload(key, file)}
                          onDelete={() => handleImgDelete(key)}
                          onZoom={url => setZoomedImg(url)}
                          loading={loadingField === key}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditMode(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Modal ────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h2 className="font-bold text-slate-800 dark:text-white">Add Single Question</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Type selector */}
                <div>
                  <label className="input-label">Question Type</label>
                  <div className="flex flex-wrap gap-2">
                    {QUESTION_TYPES.map(t => (
                      <button key={t} type="button"
                        onClick={() => setCreateForm(f => ({ ...f, questionType: t }))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${createForm.questionType === t ? 'bg-primary-500 text-white border-primary-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                {/* Placement */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="input-label">Subject *</label>
                    <select className="input-field" value={createForm.subject} onChange={e => handleCreateSubjectChange(e.target.value)}>
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Chapter *</label>
                    <select className="input-field" value={createForm.chapter} onChange={e => handleCreateChapterChange(e.target.value)} disabled={!createForm.subject}>
                      <option value="">Select Chapter</option>
                      {createChapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Concept *</label>
                    <select className="input-field" value={createForm.concept} onChange={e => handleCreateConceptChange(e.target.value)} disabled={!createForm.chapter}>
                      <option value="">Select Concept</option>
                      {createConcepts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Q. Number</label>
                    <input type="number" className="input-field" value={createForm.questionNumber} onChange={e => setCreateForm(f => ({ ...f, questionNumber: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="input-label">Question Text *</label>
                  <textarea className="input-field resize-y" rows={4} value={createForm.questionText}
                    onChange={e => setCreateForm(f => ({ ...f, questionText: e.target.value }))}
                    placeholder="Question text (supports LaTeX: \( \frac{x}{y} \))" />
                </div>

                {['A','B','C','D'].map(opt => (
                  <div key={opt} className="flex gap-2 items-center">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${createForm.correctAnswer === opt ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{opt}</span>
                    <input type="text" className="input-field flex-1" placeholder={`Option ${opt}`}
                      value={createForm[`option${opt}`]} onChange={e => setCreateForm(f => ({ ...f, [`option${opt}`]: e.target.value }))} />
                    <button type="button" onClick={() => setCreateForm(f => ({ ...f, correctAnswer: opt }))}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all shrink-0 ${createForm.correctAnswer === opt ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-400'}`}>
                      <CheckCircle size={14} />
                    </button>
                  </div>
                ))}

                <div>
                  <label className="input-label">Correct Answer (Numerical / Descriptive)</label>
                  <input type="text" className="input-field" placeholder="e.g. 42 or B" value={createForm.correctAnswer} onChange={e => setCreateForm(f => ({ ...f, correctAnswer: e.target.value }))} />
                </div>

                <div>
                  <label className="input-label">Explanation</label>
                  <textarea className="input-field resize-y" rows={3} value={createForm.explanation} onChange={e => setCreateForm(f => ({ ...f, explanation: e.target.value }))} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="input-label">Board</label>
                    <input type="text" className="input-field" placeholder="CBSE/ICSE/State" value={createForm.board} onChange={e => setCreateForm(f => ({ ...f, board: e.target.value }))} />
                  </div>
                  <div>
                    <label className="input-label">Topic</label>
                    <input type="text" className="input-field" value={createForm.topic} onChange={e => setCreateForm(f => ({ ...f, topic: e.target.value }))} />
                  </div>
                  <div>
                    <label className="input-label">Tags</label>
                    <input type="text" className="input-field" placeholder="important, PYQ" value={createForm.tags} onChange={e => setCreateForm(f => ({ ...f, tags: e.target.value }))} />
                  </div>
                </div>

                {/* Exam types */}
                <div>
                  <label className="input-label">Exam Types</label>
                  <div className="flex flex-wrap gap-2">
                    {EXAM_TYPES.map(et => (
                      <button key={et} type="button"
                        onClick={() => setCreateForm(f => ({
                          ...f, examType: f.examType.includes(et) ? f.examType.filter(x => x !== et) : [...f.examType, et]
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${createForm.examType.includes(et) ? 'bg-primary-500 text-white border-primary-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                      >{et}</button>
                    ))}
                  </div>
                </div>

                {/* Note: No difficulty field — questions start unclassified */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    ℹ️ Difficulty is not set during creation. Assign it later using the Difficulty Manager.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center">
                    {creating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                    Save Question
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-rose-500" />
            </div>
            <h3 className="text-center font-bold text-slate-800 dark:text-white mb-2">Delete Question?</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-5">
              Q{deleteConfirm.questionNumber} will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger flex-1 justify-center">
                <Trash2 size={14} /> Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Zoom Modal ─────────────────────────────────────────────────── */}
      {zoomedImg && <ImageZoomModal src={zoomedImg} onClose={() => setZoomedImg(null)} />}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
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

export default QuestionManager;
