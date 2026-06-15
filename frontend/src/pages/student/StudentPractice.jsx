import React, { useState, useEffect } from 'react';
import API, { getBackendUrl } from '../../services/api';

const backendUrl = getBackendUrl();
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Check, 
  X, 
  Loader2, 
  Search, 
  SlidersHorizontal,
  Bookmark,
  GraduationCap,
  HelpCircle,
  Clock
} from 'lucide-react';

const StudentPractice = () => {
  // Filter states
  const [classNum, setClassNum] = useState('11');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [examType, setExamType] = useState('');
  const [jumpToQ, setJumpToQ] = useState('');

  // Questions in scope
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Student interaction states
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // Stores selected answers per question ID
  const [revealedQuestions, setRevealedQuestions] = useState({}); // Tracks which questions have had their answers revealed

  // Initial load
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await API.get(`/syllabus/subjects?classNum=${classNum}`);
        if (res.data.success) {
          setSubjects(res.data.subjects);
          setSelectedSubject('');
          setChapters([]);
          setSelectedChapter('');
          setConcepts([]);
          setSelectedConcept('');
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjects();
  }, [classNum]);

  // Load chapters
  useEffect(() => {
    if (!selectedSubject) return;
    const loadChapters = async () => {
      try {
        const res = await API.get(`/syllabus/chapters?subjectId=${selectedSubject}`);
        if (res.data.success) {
          setChapters(res.data.chapters);
          setSelectedChapter('');
          setConcepts([]);
          setSelectedConcept('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadChapters();
  }, [selectedSubject]);

  // Load concepts
  useEffect(() => {
    if (!selectedChapter) return;
    const loadConcepts = async () => {
      try {
        const res = await API.get(`/syllabus/concepts?chapterId=${selectedChapter}`);
        if (res.data.success) {
          setConcepts(res.data.concepts);
          setSelectedConcept('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadConcepts();
  }, [selectedChapter]);

  // Trigger search filter
  const handleApplyFilters = async (e) => {
    if (e) e.preventDefault();
    setLoadingQuestions(true);
    setHasSearched(true);
    
    let url = `/questions?limit=150`; // Load a large set for the practice session
    if (selectedSubject) url += `&subject=${selectedSubject}`;
    if (selectedChapter) url += `&chapter=${selectedChapter}`;
    if (selectedConcept) url += `&concept=${selectedConcept}`;
    if (classNum) url += `&classNum=${classNum}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    if (examType) url += `&examType=${examType}`;

    try {
      const res = await API.get(url);
      if (res.data.success) {
        setQuestions(res.data.questions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setRevealed(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Keep interaction states synced when moving between questions
  const activeQuestion = questions[currentIndex];

  useEffect(() => {
    if (!activeQuestion) return;
    setSelectedOption(userAnswers[activeQuestion._id] || null);
    setRevealed(revealedQuestions[activeQuestion._id] || false);
  }, [currentIndex, questions]);

  const handleSelectOption = (optionKey) => {
    if (revealed) return; // Disable option switching after answer is revealed
    setSelectedOption(optionKey);
    setUserAnswers({
      ...userAnswers,
      [activeQuestion._id]: optionKey
    });
  };

  const handleRevealAnswer = () => {
    if (!selectedOption) {
      alert('Please select an option before revealing the correct answer.');
      return;
    }
    setRevealed(true);
    setRevealedQuestions({
      ...revealedQuestions,
      [activeQuestion._id]: true
    });
  };

  const handleJumpToQNo = (e) => {
    e.preventDefault();
    if (!jumpToQ) return;
    const targetQNo = parseInt(jumpToQ, 10);
    const foundIdx = questions.findIndex(q => q.questionNumber === targetQNo);
    if (foundIdx !== -1) {
      setCurrentIndex(foundIdx);
      setJumpToQ('');
    } else {
      alert(`Question number ${targetQNo} is not in the current practice set.`);
    }
  };

  // Render text and replace [[IMG_SLOT]] or new slot placeholders with inline image preview
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
      }
    }
    
    const newPlaceholders = {
      '[QUESTION_IMAGE_SLOT]': activeQuestion?.questionImage,
      '[OPTION_A_IMAGE_SLOT]': activeQuestion?.optionAImage,
      '[OPTION_B_IMAGE_SLOT]': activeQuestion?.optionBImage,
      '[OPTION_C_IMAGE_SLOT]': activeQuestion?.optionCImage,
      '[OPTION_D_IMAGE_SLOT]': activeQuestion?.optionDImage,
      '[SOLUTION_IMAGE_SLOT]': activeQuestion?.solutionImage
    };

    let elements = [processedText];
    
    for (const [placeholder, imgUrl] of Object.entries(newPlaceholders)) {
      const nextElements = [];
      for (const el of elements) {
        if (typeof el === 'string' && el.includes(placeholder)) {
          const parts = el.split(placeholder);
          for (let p = 0; p < parts.length; p++) {
            nextElements.push(parts[p]);
            if (p < parts.length - 1 && imgUrl) {
              nextElements.push(
                <span key={`${placeholder}_${p}`} className="block my-3">
                  <img 
                    src={imgUrl.startsWith('/') ? `${backendUrl}${imgUrl}` : imgUrl} 
                    alt="inline asset" 
                    className="max-h-56 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white"
                  />
                </span>
              );
            }
          }
        } else {
          nextElements.push(el);
        }
      }
      elements = nextElements;
    }
    
    let finalElements = [];
    for (const el of elements) {
      if (typeof el === 'string' && /\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi.test(el)) {
        const parts = el.split(/\[\[(?:IMG|IMAGE)[ _]SLOT\]\]/gi);
        for (let p = 0; p < parts.length; p++) {
          finalElements.push(parts[p]);
          if (p < parts.length - 1) {
            const slotId = `${prefix}_${p}`;
            const slot = activeQuestion?.imageSlots?.find(s => s.slotId === slotId);
            if (slot && slot.url) {
              finalElements.push(
                <span key={`legacy_img_${p}`} className="block my-3">
                  <img 
                    src={slot.url.startsWith('/') ? `${backendUrl}${slot.url}` : slot.url} 
                    alt={slotId} 
                    className="max-h-56 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white"
                  />
                </span>
              );
            } else {
              finalElements.push(
                <span key={`legacy_img_pending_${p}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-400 font-mono">
                  [ Diagram pending admin upload ]
                </span>
              );
            }
          }
        }
      } else {
        finalElements.push(el);
      }
    }
    
    return <span>{finalElements}</span>;
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Student Practice Portal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Simulate examination MCQs, test your skills, and check step-by-step explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Filter Control Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <SlidersHorizontal size={14} className="text-primary-500" />
              Practice Filters
            </h2>

            {/* Class */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</label>
              <select 
                value={classNum} 
                onChange={(e) => setClassNum(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="11">Class 11 (Class XI)</option>
                <option value="12">Class 12 (Class XII)</option>
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chapter</label>
              <select 
                value={selectedChapter} 
                disabled={!selectedSubject}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none disabled:opacity-40"
              >
                <option value="">All Chapters</option>
                {chapters.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Target</label>
              <select 
                value={examType} 
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Exams</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="KCET">KCET</option>
                <option value="Board">Board</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
            </div>

            {/* Submit */}
            <button
              onClick={() => handleApplyFilters()}
              className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs shadow-md shadow-primary-500/10 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Search size={14} /> Start Practice Session
            </button>
          </div>

          {/* Jump To Question Number Form */}
          {questions.length > 0 && (
            <form onSubmit={handleJumpToQNo} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jump to QNo</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="e.g. 24"
                  value={jumpToQ}
                  onChange={(e) => setJumpToQ(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Go
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Center: Main Arena / Sidebar Palette */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          {loadingQuestions ? (
            <div className="md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-16 flex flex-col items-center justify-center gap-3 shadow-sm">
              <Loader2 className="animate-spin text-primary-500" size={36} />
              <p className="text-slate-400 text-sm font-semibold">Generating practice session questions...</p>
            </div>
          ) : !hasSearched ? (
            /* Blank state before searching */
            <div className="md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <GraduationCap size={48} className="text-primary-500 animate-pulse mb-3" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Start Your Learning Session</h2>
              <p className="text-slate-400 text-xs mt-1 max-w-sm">Select your subject and class on the left, then click "Start Practice" to review preloaded exam problems.</p>
            </div>
          ) : questions.length === 0 ? (
            /* Empty state */
            <div className="md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <HelpCircle size={48} className="text-danger-500 mb-3" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">No Questions Found</h2>
              <p className="text-slate-400 text-xs mt-1 max-w-sm">No questions match your filter criteria in our NCERT preloaded set. Try adjusting class or difficulty filters.</p>
            </div>
          ) : (
            <>
              {/* Mid Panel: Question Viewer */}
              <div className="md:col-span-3 space-y-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-6">
                  {/* Meta headers */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">SESSION PROGRESS</span>
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-950/30 text-primary-500 rounded text-xs font-bold">
                        {currentIndex + 1} / {questions.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeQuestion.examType.map(e => (
                        <span key={e} className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold text-slate-500">
                          {e}
                        </span>
                      ))}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        activeQuestion.difficulty === 'Easy' ? 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400' :
                        activeQuestion.difficulty === 'Medium' ? 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400' :
                        'bg-danger-50 text-danger-600 dark:bg-danger-950/20 dark:text-danger-400'
                      }`}>
                        {activeQuestion.difficulty === 'Easy' ? '🟢 Easy' : activeQuestion.difficulty === 'Medium' ? '🟡 Medium' : '🔴 Hard'}
                      </span>
                    </div>
                  </div>

                  {/* Question number and Text */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-display flex items-start gap-2">
                      <span className="text-primary-500">Q{activeQuestion.questionNumber}.</span>
                      {renderTextWithSlots(activeQuestion.questionText, 'questionText')}
                    </h2>

                    {/* Radio Options */}
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {['A', 'B', 'C', 'D'].map(key => {
                        const opt = activeQuestion.options[key];
                        const isSelected = selectedOption === key;
                        const isCorrect = activeQuestion.correctAnswer === key;
                        
                        let optionStyle = 'border-slate-200 dark:border-slate-700 bg-slate-50/20 hover:bg-slate-50 dark:hover:bg-slate-900';
                        if (isSelected) optionStyle = 'border-primary-500 bg-primary-50/10 text-primary-600 dark:text-primary-400';
                        if (revealed) {
                          if (isCorrect) {
                            optionStyle = 'border-success-500 bg-success-50/20 text-success-600 dark:text-success-400';
                          } else if (isSelected) {
                            optionStyle = 'border-danger-500 bg-danger-50/20 text-danger-600 dark:text-danger-400';
                          }
                        }

                        return (
                          <button
                            key={key}
                            onClick={() => handleSelectOption(key)}
                            disabled={revealed}
                            className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${optionStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                              }`}>
                                {key}
                              </span>
                              <div className="text-sm font-semibold leading-relaxed">
                                {opt?.image && (
                                  <img 
                                    src={opt.image.startsWith('/') ? `${backendUrl}${opt.image}` : opt.image} 
                                    alt={`Option ${key}`} 
                                    className="max-h-24 mb-1.5 rounded-lg object-contain bg-white border border-slate-200 dark:border-slate-800" 
                                  />
                                )}
                                {opt?.text && renderTextWithSlots(opt.text, `option${key}`)}
                              </div>
                            </div>

                            {revealed && (
                              isCorrect ? (
                                <div className="w-5 h-5 rounded-full bg-success-500 flex items-center justify-center text-white shrink-0">
                                  <Check size={12} />
                                </div>
                              ) : isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-danger-500 flex items-center justify-center text-white shrink-0">
                                  <X size={12} />
                                </div>
                              ) : null
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation and check buttons */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-5 gap-2">
                    <button
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    {!revealed ? (
                      <button
                        onClick={handleRevealAnswer}
                        disabled={!selectedOption}
                        className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-xs shadow-md shadow-primary-500/10 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
                      >
                        <Eye size={14} /> Reveal Answer & Explanation
                      </button>
                    ) : (
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold border ${
                        selectedOption === activeQuestion.correctAnswer
                          ? 'bg-success-50 border-success-200 text-success-700 dark:bg-success-950/20'
                          : 'bg-danger-50 border-danger-200 text-danger-700 dark:bg-danger-950/20'
                      }`}>
                        {selectedOption === activeQuestion.correctAnswer ? '✓ Correct Answer' : '✗ Incorrect Answer'}
                      </span>
                    )}

                    <button
                      disabled={currentIndex === questions.length - 1}
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Explanation Details Reveal block */}
                {revealed && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-4 animate-in slide-in-from-bottom duration-300">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Bookmark size={14} className="text-primary-500" />
                      Detailed Solution
                    </h3>
                    <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 border-l-4 border-primary-500 pl-4 py-1">
                      {activeQuestion.explanation ? (
                        renderTextWithSlots(activeQuestion.explanation, 'explanation')
                      ) : (
                        <p className="text-slate-400 italic">No explanation was provided for this question.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel: Question Palette */}
              <div className="md:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                    Question Palette
                  </h3>
                  
                  {/* Grid numbers */}
                  <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[300px] pr-1">
                    {questions.map((q, idx) => {
                      const isVisited = userAnswers[q._id] !== undefined;
                      const isActive = currentIndex === idx;
                      const isQRevealed = revealedQuestions[q._id] === true;
                      
                      let dotColor = '🟢';
                      if (q.difficulty === 'Medium') dotColor = '🟡';
                      if (q.difficulty === 'Hard') dotColor = '🔴';

                      let btnStyle = 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900';
                      if (isVisited) btnStyle = 'bg-slate-100 dark:bg-slate-900 border-primary-300 text-primary-500';
                      if (isActive) btnStyle = 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/10 scale-105';
                      if (isQRevealed) {
                        btnStyle = userAnswers[q._id] === q.correctAnswer 
                          ? 'bg-success-500 border-success-500 text-white' 
                          : 'bg-danger-500 border-danger-500 text-white';
                      }

                      return (
                        <button
                          key={q._id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`py-2 rounded-xl text-center text-xs font-bold border transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer ${btnStyle}`}
                        >
                          <span>Q{q.questionNumber}</span>
                          <span className="text-[8px] mt-0.5">{dotColor}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info legend */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-6 text-[10px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2">🟢 <span className="font-semibold text-slate-600 dark:text-slate-400">Easy Question</span></div>
                  <div className="flex items-center gap-2">🟡 <span className="font-semibold text-slate-600 dark:text-slate-400">Medium Question</span></div>
                  <div className="flex items-center gap-2">🔴 <span className="font-semibold text-slate-600 dark:text-slate-400">Hard / Important</span></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPractice;
