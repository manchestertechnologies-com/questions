import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Image as ImageIcon,
  Edit, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  Loader2,
  Lock
} from 'lucide-react';

const QuestionManager = () => {
  // Lists and query states
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search parameters
  const [keyword, setKeyword] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [concept, setConcept] = useState('');
  const [classNum, setClassNum] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [examType, setExamType] = useState('');
  const [questionNumber, setQuestionNumber] = useState('');

  // Syllabus list helpers
  const [subjectsList, setSubjectsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [conceptsList, setConceptsList] = useState([]);

  // Modals / Details view
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingSlotId, setUploadingSlotId] = useState(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    difficulty: 'Easy',
    marks: 4,
    negativeMarks: 1,
    examType: []
  });

  // Load initial list and subjects list
  useEffect(() => {
    const initData = async () => {
      try {
        const subjectsRes = await API.get('/syllabus/subjects');
        if (subjectsRes.data.success) {
          setSubjectsList(subjectsRes.data.subjects);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    initData();
  }, []);

  // Sync chapters when subject changes
  useEffect(() => {
    if (!subject) {
      setChaptersList([]);
      setChapter('');
      setConceptsList([]);
      setConcept('');
      return;
    }
    const loadChapters = async () => {
      try {
        const res = await API.get(`/syllabus/chapters?subjectId=${subject}`);
        if (res.data.success) {
          setChaptersList(res.data.chapters);
          setChapter('');
          setConceptsList([]);
          setConcept('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadChapters();
  }, [subject]);

  // Sync concepts when chapter changes
  useEffect(() => {
    if (!chapter) {
      setConceptsList([]);
      setConcept('');
      return;
    }
    const loadConcepts = async () => {
      try {
        const res = await API.get(`/syllabus/concepts?chapterId=${chapter}`);
        if (res.data.success) {
          setConceptsList(res.data.concepts);
          setConcept('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadConcepts();
  }, [chapter]);

  // Load questions when filters or page changes
  const fetchQuestions = async () => {
    setLoading(true);
    let url = `/questions?page=${currentPage}&limit=10`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (subject) url += `&subject=${subject}`;
    if (chapter) url += `&chapter=${chapter}`;
    if (concept) url += `&concept=${concept}`;
    if (classNum) url += `&classNum=${classNum}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    if (examType) url += `&examType=${examType}`;
    if (questionNumber) url += `&questionNumber=${questionNumber}`;

    try {
      const res = await API.get(url);
      if (res.data.success) {
        setQuestions(res.data.questions);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, subject, chapter, concept, classNum, difficulty, examType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuestions();
  };

  // Open question view and map edit values
  const handleOpenDetails = (q) => {
    setActiveQuestion(q);
    setIsEditMode(false);
    setEditForm({
      questionText: q.questionText,
      optionA: q.options.A.text,
      optionB: q.options.B.text,
      optionC: q.options.C.text,
      optionD: q.options.D.text,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      examType: q.examType
    });
  };

  // Fast one-click difficulty toggling
  const handleQuickDifficulty = async (qId, currentDiff) => {
    const diffCycle = { Easy: 'Medium', Medium: 'Hard', Hard: 'Easy' };
    const nextDiff = diffCycle[currentDiff];

    try {
      const res = await API.put(`/questions/${qId}`, { difficulty: nextDiff });
      if (res.data.success) {
        // Update local list
        setQuestions(questions.map(q => q._id === qId ? { ...q, difficulty: nextDiff } : q));
        if (activeQuestion && activeQuestion._id === qId) {
          setActiveQuestion({ ...activeQuestion, difficulty: nextDiff });
        }
      }
    } catch (err) {
      console.error('Quick difficulty change failed:', err);
    }
  };

  // Handle uploading slot images
  const handleUploadSlot = async (slotId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSlotId(slotId);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await API.post(`/questions/${activeQuestion._id}/slots/${slotId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        // Update URL inside slot
        const updatedSlots = activeQuestion.imageSlots.map(s => 
          s.slotId === slotId ? { ...s, url: res.data.url } : s
        );
        const updatedQ = { ...activeQuestion, imageSlots: updatedSlots };
        
        setActiveQuestion(updatedQ);
        setQuestions(questions.map(q => q._id === activeQuestion._id ? updatedQ : q));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image to slot.');
    } finally {
      setUploadingSlotId(null);
    }
  };

  // Save edits
  const handleSaveEdits = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/questions/${activeQuestion._id}`, editForm);
      if (res.data.success) {
        // Refetch active question details
        const detailRes = await API.get(`/questions/${activeQuestion._id}`);
        if (detailRes.data.success) {
          const updatedQ = detailRes.data.question;
          setActiveQuestion(updatedQ);
          setQuestions(questions.map(q => q._id === updatedQ._id ? updatedQ : q));
          setIsEditMode(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save question changes.');
    }
  };

  // Render question text replaces [[IMG_SLOT]] with inline image preview / slot uploader
  const renderTextWithSlots = (text, prefix, readonly = false) => {
    if (!text) return null;
    const parts = text.split('[[IMG_SLOT]]');
    
    return (
      <div className="leading-relaxed">
        {parts.map((part, index) => {
          const slotId = `${prefix}_${index}`;
          const slot = activeQuestion.imageSlots.find(s => s.slotId === slotId);
          
          return (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < parts.length - 1 && (
                <div className="my-3 block">
                  {slot && slot.url ? (
                    <div className="relative group max-w-lg">
                      <img 
                        src={slot.url.startsWith('/') ? `http://localhost:5000${slot.url}` : slot.url} 
                        alt={slotId} 
                        className="max-h-56 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white"
                      />
                      {!readonly && (
                        <label className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-lg text-xs font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          Change
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={(e) => handleUploadSlot(slotId, e)} 
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    readonly ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-400 font-mono">
                        <ImageIcon size={14} /> Missing Diagram
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex flex-col items-center justify-center max-w-sm">
                        <ImageIcon size={20} className="text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Empty Image Slot ({slotId})</span>
                        
                        <label className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
                          {uploadingSlotId === slotId ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Upload size={12} />
                          )}
                          Upload Drawing
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            disabled={uploadingSlotId !== null}
                            onChange={(e) => handleUploadSlot(slotId, e)} 
                          />
                        </label>
                      </div>
                    )
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const getPendingCount = (q) => {
    return q.imageSlots.filter(s => s.url === null).length;
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Question Bank Manager
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Perform high performance searches, toggle difficulties with one click, and fill dynamic image slots.
        </p>
      </div>

      {/* Search Filter Form */}
      <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Keyword search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by keywords..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* QNo search */}
          <input 
            type="number" 
            placeholder="QNo (e.g. 15)" 
            value={questionNumber}
            onChange={(e) => setQuestionNumber(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
          />

          {/* Subject */}
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
          >
            <option value="">All Subjects</option>
            {subjectsList.map(s => (
              <option key={s._id} value={s._id}>{s.name} (Class {s.classNum})</option>
            ))}
          </select>

          {/* Chapter */}
          <select 
            value={chapter} 
            disabled={!subject}
            onChange={(e) => setChapter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
          >
            <option value="">All Chapters</option>
            {chaptersList.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Class */}
          <select 
            value={classNum} 
            onChange={(e) => setClassNum(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
          >
            <option value="">All Classes</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>

          {/* Difficulty */}
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
          </select>

          {/* Exam Type */}
          <select 
            value={examType} 
            onChange={(e) => setExamType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
          >
            <option value="">All Exam Types</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="KCET">KCET</option>
            <option value="Board">Board</option>
          </select>

          {/* Submit Search */}
          <button 
            type="submit"
            className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Filter size={16} /> Filter Results
          </button>
        </div>
      </form>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-primary-500" size={36} />
            <p className="text-slate-400 text-sm font-semibold">Filtering question bank database...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-150 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Q.No</th>
                    <th className="px-6 py-4 font-bold">Question Text</th>
                    <th className="px-6 py-4 font-bold">Subject / Chapter</th>
                    <th className="px-6 py-4 font-bold">Difficulty</th>
                    <th className="px-6 py-4 font-bold">Exam Target</th>
                    <th className="px-6 py-4 font-bold">Drawings/Slots</th>
                    <th className="px-6 py-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {questions.length > 0 ? (
                    questions.map((q) => (
                      <tr 
                        key={q._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-100">
                          Q{q.questionNumber}
                        </td>
                        <td className="px-6 py-4 max-w-[280px] truncate font-medium text-slate-700 dark:text-slate-300">
                          {q.questionText}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{q.subject?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">{q.chapter?.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          {/* One Click Toggle Difficulty */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickDifficulty(q._id, q.difficulty);
                            }}
                            title="Click to toggle difficulty"
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border hover-lift ${
                              q.difficulty === 'Easy' ? 'bg-success-50 border-success-200 text-success-600 dark:bg-success-950/20 dark:border-success-900/30 dark:text-success-400' :
                              q.difficulty === 'Medium' ? 'bg-warning-50 border-warning-200 text-warning-600 dark:bg-warning-950/20 dark:border-warning-900/30 dark:text-warning-400' :
                              'bg-danger-50 border-danger-200 text-danger-600 dark:bg-danger-950/20 dark:border-danger-900/30 dark:text-danger-400'
                            }`}
                          >
                            {q.difficulty === 'Easy' ? '🟢 Easy' : q.difficulty === 'Medium' ? '🟡 Medium' : '🔴 Hard'}
                          </button>
                        </td>
                        <td className="px-6 py-4 flex flex-wrap gap-1 max-w-[160px] py-6">
                          {q.examType.map(e => (
                            <span key={e} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold text-slate-500">
                              {e}
                            </span>
                          ))}
                        </td>
                        <td className="px-6 py-4">
                          {q.imageSlots.length > 0 ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              {getPendingCount(q) > 0 ? (
                                <span className="text-warning-500 font-bold flex items-center gap-1">
                                  <ImageIcon size={14} /> {getPendingCount(q)} empty
                                </span>
                              ) : (
                                <span className="text-success-500 font-bold flex items-center gap-1">
                                  <CheckCircle size={14} /> All filled
                                </span>
                              )}
                              <span className="text-slate-400">({q.imageSlots.length} total)</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">No drawings</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpenDetails(q)}
                            className="px-3.5 py-1.5 bg-primary-50 dark:bg-primary-950/30 hover:bg-primary-100 dark:hover:bg-primary-950/60 text-primary-500 border border-primary-200 dark:border-primary-900/30 rounded-xl text-xs font-semibold cursor-pointer transition-all hover-lift"
                          >
                            Open Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">No questions found matching the filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Showing page {currentPage} of {pages} ({total} items)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage === pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Modal for Question Details */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-150 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                  Q{activeQuestion.questionNumber} Details
                </span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-slate-500">
                  Class {activeQuestion.classNum}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeQuestion.difficulty === 'Easy' ? 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400' :
                  activeQuestion.difficulty === 'Medium' ? 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400' :
                  'bg-danger-50 text-danger-600 dark:bg-danger-950/20 dark:text-danger-400'
                }`}>
                  {activeQuestion.difficulty}
                </span>
              </div>
              <button 
                onClick={() => setActiveQuestion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!isEditMode ? (
                /* Detail Read Only Mode with Inline Upload Buttons */
                <div className="space-y-6">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Text</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-900 rounded-2xl text-slate-800 dark:text-slate-200">
                      {renderTextWithSlots(activeQuestion.questionText, 'questionText')}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map(o => (
                        <div 
                          key={o} 
                          className={`p-4 rounded-2xl border ${
                            activeQuestion.correctAnswer === o 
                              ? 'border-success-500 bg-success-50/20 text-success-700 dark:text-success-400'
                              : 'border-slate-150 dark:border-slate-800 bg-slate-50/30 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <p className="font-extrabold text-xs mb-1.5 uppercase">Option {o} {activeQuestion.correctAnswer === o && '✓ (Correct)'}</p>
                          {renderTextWithSlots(activeQuestion.options[o].text, `option${o}`)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Explanation</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-900 rounded-2xl text-slate-800 dark:text-slate-200">
                      {activeQuestion.explanation ? (
                        renderTextWithSlots(activeQuestion.explanation, 'explanation')
                      ) : (
                        <p className="text-slate-400 text-xs italic">No explanation provided.</p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-950 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
                    <div><strong>Subject:</strong> {activeQuestion.subject?.name}</div>
                    <div><strong>Class:</strong> {activeQuestion.classNum}</div>
                    <div><strong>Marks:</strong> +{activeQuestion.marks} / -{activeQuestion.negativeMarks}</div>
                    <div><strong>Chapter:</strong> {activeQuestion.chapter?.name}</div>
                  </div>
                </div>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={handleSaveEdits} className="space-y-5">
                  {/* Text inputs */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Text</label>
                    <textarea 
                      value={editForm.questionText}
                      onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map(o => (
                      <div key={o} className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Option {o} Text</label>
                        <input 
                          type="text"
                          value={editForm[`option${o}`]}
                          onChange={(e) => setEditForm({ ...editForm, [`option${o}`]: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Correct Ans */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correct Option</label>
                      <select 
                        value={editForm.correctAnswer}
                        onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                      <select 
                        value={editForm.difficulty}
                        onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard / Important</option>
                      </select>
                    </div>

                    {/* Marks info */}
                    <div className="space-y-1 flex gap-2">
                      <div className="w-1/2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marks</label>
                        <input 
                          type="number" 
                          value={editForm.marks}
                          onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Neg Marks</label>
                        <input 
                          type="number" 
                          value={editForm.negativeMarks}
                          onChange={(e) => setEditForm({ ...editForm, negativeMarks: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Explanation text */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Explanation</label>
                    <textarea 
                      value={editForm.explanation}
                      onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Submit edits */}
                  <div className="flex gap-2 justify-end pt-3">
                    <button 
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/10 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 flex justify-between border-t border-slate-150 dark:border-slate-700/50">
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Lock size={12} /> Manchester Technologies Question ID: {activeQuestion._id}
              </span>
              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/10 flex items-center gap-1.5 cursor-pointer hover-lift transition-all"
                >
                  <Edit size={14} /> Edit Question Text
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
