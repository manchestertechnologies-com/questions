import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  HelpCircle,
  Loader2,
  Trash2
} from 'lucide-react';

const ImageReviewSlot = ({ label, imageUrl, onUpload, onDelete, loading }) => {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{label}</label>
      {imageUrl ? (
        <div className="relative group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/30 p-2 flex items-center justify-between gap-2 max-w-[240px]">
          <img 
            src={imageUrl.startsWith('/') ? `http://localhost:5000${imageUrl}` : imageUrl} 
            alt={label} 
            className="h-12 w-20 object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
          />
          <button
            type="button"
            onClick={onDelete}
            className="px-2 py-1 bg-danger-50 hover:bg-danger-100 text-danger-600 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-[0.98]"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-all max-w-[200px]">
          {loading ? (
            <Loader2 className="animate-spin text-primary-500" size={14} />
          ) : (
            <span className="text-[10px] font-bold text-primary-500">+ Add {label}</span>
          )}
          <input 
            type="file" 
            accept="image/*"
            className="hidden" 
            disabled={loading}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUpload(e.target.files[0]);
              }
            }} 
          />
        </label>
      )}
    </div>
  );
};

const ImportCenter = () => {
  // Selections state
  const [classNum, setClassNum] = useState('11');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState('');
  const [subConcepts, setSubConcepts] = useState([]);
  const [selectedSubConcept, setSelectedSubConcept] = useState('');

  // Form overrides
  const [difficulty, setDifficulty] = useState('Easy');
  const [examTypes, setExamTypes] = useState(['Board']);
  const [marks, setMarks] = useState('4');
  const [negativeMarks, setNegativeMarks] = useState('1');

  // File state
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [importMethod, setImportMethod] = useState('file'); // 'file' or 'json'
  const [pastedJson, setPastedJson] = useState('');
  
  // Loading & statuses
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Review screen states
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [loadingField, setLoadingField] = useState(null); // format: `${qIdx}_${fieldName}`

  // Load subjects on mount or classNum change
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
          setSubConcepts([]);
          setSelectedSubConcept('');
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjects();
  }, [classNum]);

  // Load chapters when subject changes
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
          setSubConcepts([]);
          setSelectedSubConcept('');
        }
      } catch (err) {
        console.error('Failed to load chapters:', err);
      }
    };
    loadChapters();
  }, [selectedSubject]);

  // Load concepts when chapter changes
  useEffect(() => {
    if (!selectedChapter) return;
    const loadConcepts = async () => {
      try {
        const res = await API.get(`/syllabus/concepts?chapterId=${selectedChapter}`);
        if (res.data.success) {
          setConcepts(res.data.concepts);
          setSelectedConcept('');
          setSubConcepts([]);
          setSelectedSubConcept('');
        }
      } catch (err) {
        console.error('Failed to load concepts:', err);
      }
    };
    loadConcepts();
  }, [selectedChapter]);

  // Load subconcepts when concept changes
  useEffect(() => {
    if (!selectedConcept) return;
    const loadSubConcepts = async () => {
      try {
        const res = await API.get(`/syllabus/subconcepts?conceptId=${selectedConcept}`);
        if (res.data.success) {
          setSubConcepts(res.data.subConcepts);
          setSelectedSubConcept('');
        }
      } catch (err) {
        console.error('Failed to load subconcepts:', err);
      }
    };
    loadSubConcepts();
  }, [selectedConcept]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (['doc', 'docx', 'json'].includes(ext)) {
      setFile(selectedFile);
      setErrorMessage(null);
      setStatusMessage(null);
    } else {
      setErrorMessage('Invalid file format. Only Word Documents (.docx, .doc) and JSON files are supported.');
      setFile(null);
    }
  };

  const toggleExamType = (type) => {
    if (examTypes.includes(type)) {
      if (examTypes.length > 1) {
        setExamTypes(examTypes.filter(t => t !== type));
      }
    } else {
      setExamTypes([...examTypes, type]);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file to import.');
      return;
    }
    if (!selectedSubject || !selectedChapter || !selectedConcept) {
      setErrorMessage('Please select Subject, Chapter, and Concept before importing.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/questions/parse-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setParsedQuestions(res.data.questions);
        setReviewMode(true);
        setStatusMessage(`Successfully parsed ${res.data.questions.length} questions. Please review them below.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Failed to parse questions. Please check document structure.');
    } finally {
      setLoading(false);
    }
  };

  const handleParsePasteJson = (e) => {
    e.preventDefault();
    if (!pastedJson.trim()) {
      setErrorMessage('Please paste some JSON to parse.');
      return;
    }
    if (!selectedSubject || !selectedChapter || !selectedConcept) {
      setErrorMessage('Please select Subject, Chapter, and Concept before importing.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const parsed = JSON.parse(pastedJson);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      
      const validatedQuestions = items.map((item, i) => {
        const qNum = typeof item.questionNumber === 'number' ? item.questionNumber : (i + 1);
        const questionText = item.questionText || '';
        
        if (!questionText) {
          throw new Error(`Question entry at index ${i} is missing 'questionText'.`);
        }
        
        // Options normalization
        const optA = (typeof item.options?.A === 'object') ? (item.options.A.text || '') : (item.options?.A || item.optionA || '');
        const optB = (typeof item.options?.B === 'object') ? (item.options.B.text || '') : (item.options?.B || item.optionB || '');
        const optC = (typeof item.options?.C === 'object') ? (item.options.C.text || '') : (item.options?.C || item.optionC || '');
        const optD = (typeof item.options?.D === 'object') ? (item.options.D.text || '') : (item.options?.D || item.optionD || '');
        
        const correctAnswer = String(item.correctAnswer || 'A').toUpperCase().trim();
        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
          throw new Error(`Question ${qNum} contains invalid correctAnswer '${correctAnswer}'. Must be A, B, C, or D.`);
        }
        
        const explanation = item.explanation || '';
        
        // Initialize imageSlots
        let imageSlots = [];
        if (Array.isArray(item.imageSlots)) {
          imageSlots = item.imageSlots.map(slot => ({
            slotId: slot.slotId,
            url: slot.url || null
          }));
        } else {
          const registerSlots = (sourceText, prefix) => {
            if (!sourceText) return;
            const matches = sourceText.match(/\[\[IMG_SLOT\]\]/g);
            const count = matches ? matches.length : 0;
            for (let s = 0; s < count; s++) {
              imageSlots.push({
                slotId: `${prefix}_${s}`,
                url: null
              });
            }
          };
          registerSlots(questionText, 'questionText');
          registerSlots(optA, 'optionA');
          registerSlots(optB, 'optionB');
          registerSlots(optC, 'optionC');
          registerSlots(optD, 'optionD');
          registerSlots(explanation, 'explanation');
        }
        
        return {
          questionNumber: qNum,
          title: item.title || `Question ${qNum}`,
          questionType: item.questionType || 'MCQ',
          questionText,
          options: {
            A: { text: optA, image: (typeof item.options?.A === 'object') ? (item.options.A.image || null) : (item.optionAImage || null) },
            B: { text: optB, image: (typeof item.options?.B === 'object') ? (item.options.B.image || null) : (item.optionBImage || null) },
            C: { text: optC, image: (typeof item.options?.C === 'object') ? (item.options.C.image || null) : (item.optionCImage || null) },
            D: { text: optD, image: (typeof item.options?.D === 'object') ? (item.options.D.image || null) : (item.optionDImage || null) }
          },
          correctAnswer,
          explanation,
          imageSlots,
          difficulty: item.difficulty || 'Easy',
          examType: Array.isArray(item.examType) ? item.examType : [item.examType || 'Board'],
          classNum: item.classNum || 11,
          marks: typeof item.marks === 'number' ? item.marks : 4,
          negativeMarks: typeof item.negativeMarks === 'number' ? item.negativeMarks : 1,
          questionImage: item.questionImage || null,
          optionAImage: item.optionAImage || null,
          optionBImage: item.optionBImage || null,
          optionCImage: item.optionCImage || null,
          optionDImage: item.optionDImage || null,
          solutionImage: item.solutionImage || null,
        };
      });
      
      setParsedQuestions(validatedQuestions);
      setReviewMode(true);
      setStatusMessage(`Successfully parsed ${validatedQuestions.length} questions from pasted JSON. Please review them below.`);
    } catch (err) {
      console.error(err);
      setErrorMessage('JSON Parsing Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (importMethod === 'file') {
      handleImport(e);
    } else {
      handleParsePasteJson(e);
    }
  };

  const handleUpdateQuestionField = (index, field, value) => {
    setParsedQuestions(prev => prev.map((q, idx) => idx === index ? { ...q, [field]: value } : q));
  };

  const handleUpdateOptionField = (index, optionKey, value) => {
    setParsedQuestions(prev => prev.map((q, idx) => {
      if (idx === index) {
        return {
          ...q,
          options: {
            ...q.options,
            [optionKey]: {
              ...q.options[optionKey],
              text: value
            }
          }
        };
      }
      return q;
    }));
  };

  const handleUploadTempSlot = async (index, fieldName, file) => {
    const fieldKey = `${index}_${fieldName}`;
    setLoadingField(fieldKey);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await API.post('/questions/temp-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setParsedQuestions(prev => prev.map((q, idx) => {
          if (idx === index) {
            const updated = { ...q, [fieldName]: res.data.url };
            if (fieldName === 'optionAImage') updated.options.A.image = res.data.url;
            if (fieldName === 'optionBImage') updated.options.B.image = res.data.url;
            if (fieldName === 'optionCImage') updated.options.C.image = res.data.url;
            if (fieldName === 'optionDImage') updated.options.D.image = res.data.url;
            return updated;
          }
          return q;
        }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setLoadingField(null);
    }
  };

  const handleDeleteTempSlot = (index, fieldName) => {
    setParsedQuestions(prev => prev.map((q, idx) => {
      if (idx === index) {
        const updated = { ...q, [fieldName]: null };
        if (fieldName === 'optionAImage') updated.options.A.image = null;
        if (fieldName === 'optionBImage') updated.options.B.image = null;
        if (fieldName === 'optionCImage') updated.options.C.image = null;
        if (fieldName === 'optionDImage') updated.options.D.image = null;
        return updated;
      }
      return q;
    }));
  };

  const handleBulkSave = async () => {
    if (parsedQuestions.length === 0) return;
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await API.post('/questions/bulk-save', {
        questions: parsedQuestions,
        subject: selectedSubject,
        chapter: selectedChapter,
        concept: selectedConcept,
        subConcept: selectedSubConcept || null,
        classNum,
        examType: examTypes,
        difficulty,
        marks,
        negativeMarks
      });
      if (res.data.success) {
        setStatusMessage(`Successfully imported and saved ${res.data.count} questions to the database!`);
        setParsedQuestions([]);
        setReviewMode(false);
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Failed to save questions to database.');
    } finally {
      setLoading(false);
    }
  };

  if (reviewMode) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <button
              onClick={() => setReviewMode(false)}
              className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Back to Upload
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Interactive Import Review
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Verify questions, correct layout issues, and add drawings/diagrams to slot placements.
            </p>
          </div>
          <button
            onClick={handleBulkSave}
            disabled={loading || parsedQuestions.length === 0}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-primary-500/25 flex items-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving to Database...
              </>
            ) : (
              `Bulk Save ${parsedQuestions.length} Questions`
            )}
          </button>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-4 bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-900/30 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-danger-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-danger-800 dark:text-danger-400">Save Failed</p>
              <p className="text-xs text-danger-600 dark:text-danger-500 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questions review list */}
          <div className="lg:col-span-3 space-y-6">
            {parsedQuestions.map((q, qIdx) => (
              <div 
                key={qIdx} 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 space-y-5 shadow-sm relative"
              >
                {/* Badge Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      #{qIdx + 1}
                    </span>
                    <input 
                      type="number"
                      value={q.questionNumber}
                      onChange={(e) => handleUpdateQuestionField(qIdx, 'questionNumber', e.target.value)}
                      className="w-16 px-2 py-0.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-primary-500"
                      title="Question Number"
                    />
                    <input 
                      type="text"
                      value={q.title}
                      onChange={(e) => handleUpdateQuestionField(qIdx, 'title', e.target.value)}
                      className="px-2 py-0.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 max-w-[200px]"
                      placeholder="Question Title"
                      title="Question Title"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Question Type Selection */}
                    <select
                      value={q.questionType || 'MCQ'}
                      onChange={(e) => handleUpdateQuestionField(qIdx, 'questionType', e.target.value)}
                      className="px-2 py-0.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="Numerical">Numerical</option>
                      <option value="Subjective">Subjective</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setParsedQuestions(prev => prev.filter((_, idx) => idx !== qIdx))}
                      className="text-xs text-danger-500 font-semibold hover:text-danger-600 cursor-pointer"
                    >
                      Discard
                    </button>
                  </div>
                </div>

                {/* Text editor fields */}
                <div className="space-y-4">
                  {/* Question Text */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question Text</label>
                    <textarea
                      value={q.questionText}
                      onChange={(e) => handleUpdateQuestionField(qIdx, 'questionText', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Question Image */}
                  <ImageReviewSlot
                    label="Question Image"
                    imageUrl={q.questionImage}
                    onUpload={(file) => handleUploadTempSlot(qIdx, 'questionImage', file)}
                    onDelete={() => handleDeleteTempSlot(qIdx, 'questionImage')}
                    loading={loadingField === `${qIdx}_questionImage`}
                  />

                  {/* MCQ Options Grid */}
                  {(q.questionType === 'MCQ' || !q.questionType) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map(key => (
                        <div key={key} className="space-y-2 border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/10">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Option {key}</label>
                            <input
                              type="text"
                              value={q.options[key]?.text || ''}
                              onChange={(e) => handleUpdateOptionField(qIdx, key, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                            />
                          </div>
                          <ImageReviewSlot
                            label={`Option ${key} Image`}
                            imageUrl={q[`option${key}Image`]}
                            onUpload={(file) => handleUploadTempSlot(qIdx, `option${key}Image`, file)}
                            onDelete={() => handleDeleteTempSlot(qIdx, `option${key}Image`)}
                            loading={loadingField === `${qIdx}_option${key}Image`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Correct Option Selection & Solution Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {(q.questionType === 'MCQ' || !q.questionType) && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correct Option</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleUpdateQuestionField(qIdx, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Explanation Solution */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solution / Explanation</label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestionField(qIdx, 'explanation', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Solution Image */}
                  <ImageReviewSlot
                    label="Solution Image"
                    imageUrl={q.solutionImage}
                    onUpload={(file) => handleUploadTempSlot(qIdx, 'solutionImage', file)}
                    onDelete={() => handleDeleteTempSlot(qIdx, 'solutionImage')}
                    loading={loadingField === `${qIdx}_solutionImage`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick info sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm text-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                Mapping Destination
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block font-semibold">Subject</label>
                  <p className="text-slate-700 dark:text-slate-200 font-bold">
                    {subjects.find(s => s._id === selectedSubject)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-slate-400 block font-semibold">Chapter</label>
                  <p className="text-slate-700 dark:text-slate-200">
                    {chapters.find(c => c._id === selectedChapter)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-slate-400 block font-semibold">Concept (Topic)</label>
                  <p className="text-slate-700 dark:text-slate-200">
                    {concepts.find(c => c._id === selectedConcept)?.name || 'N/A'}
                  </p>
                </div>
                {selectedSubConcept && (
                  <div>
                    <label className="text-slate-400 block font-semibold">Sub-Concept</label>
                    <p className="text-slate-700 dark:text-slate-200">
                      {subConcepts.find(s => s._id === selectedSubConcept)?.name || 'N/A'}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-slate-400 block font-semibold">Class Level</label>
                  <p className="text-slate-700 dark:text-slate-200 font-bold">Class {classNum}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-300">Bulk Settings Modifiers</h4>
                
                {/* Difficulty */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Difficulty</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard / Important</option>
                  </select>
                </div>

                {/* Marks */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marks</label>
                    <input 
                      type="number" 
                      value={marks} 
                      onChange={(e) => setMarks(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Neg Marks</label>
                    <input 
                      type="number" 
                      value={negativeMarks} 
                      onChange={(e) => setNegativeMarks(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Target Exams */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Exams</label>
                  <div className="flex flex-wrap gap-1">
                    {['JEE', 'NEET', 'KCET', 'Board'].map(type => {
                      const active = examTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleExamType(type)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border active:scale-[0.98] transition-all cursor-pointer ${
                            active
                              ? 'bg-primary-500 border-primary-500 text-white'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Bulk Question Import Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Select target syllabus metadata, configure templates, and drop your questions file (.doc, .docx, .json).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Syllabus selectors & overrides */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-md font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-2">
              Syllabus Mapping Settings
            </h2>
            
            {/* Grid Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Class Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Level</label>
                <select 
                  value={classNum} 
                  onChange={(e) => setClassNum(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="11">Class 11 (Class XI)</option>
                  <option value="12">Class 12 (Class XII)</option>
                </select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chapter Name</label>
                <select 
                  value={selectedChapter} 
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  required
                  disabled={!selectedSubject}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Concept Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Concept</label>
                <select 
                  value={selectedConcept} 
                  onChange={(e) => setSelectedConcept(e.target.value)}
                  required
                  disabled={!selectedChapter}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                >
                  <option value="">Select Concept</option>
                  {concepts.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Concept Selection */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sub Concept (Optional)</label>
                <select 
                  value={selectedSubConcept} 
                  onChange={(e) => setSelectedSubConcept(e.target.value)}
                  disabled={!selectedConcept || subConcepts.length === 0}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                >
                  <option value="">Select Sub-Concept</option>
                  {subConcepts.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Overrides / Defaults */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-md font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-2">
              Import Configuration Defaults
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Difficulty */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty Level</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard / Important</option>
                </select>
              </div>

              {/* Marks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Positive Marks</label>
                <input 
                  type="number" 
                  value={marks} 
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200" 
                />
              </div>

              {/* Negative Marks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Negative Marks</label>
                <input 
                  type="number" 
                  value={negativeMarks} 
                  onChange={(e) => setNegativeMarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200" 
                />
              </div>
            </div>

            {/* Exam types checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Exams</label>
              <div className="flex flex-wrap gap-2">
                {['JEE', 'NEET', 'KCET', 'Board'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleExamType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border active:scale-[0.98] transition-all cursor-pointer ${
                      examTypes.includes(type)
                        ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/10'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Draggable upload zone */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2 mb-4">
              <h2 className="text-md font-bold text-slate-950 dark:text-white">
                Import Source
              </h2>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImportMethod('file')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    importMethod === 'file'
                      ? 'bg-white dark:bg-slate-800 text-primary-500 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImportMethod('json')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    importMethod === 'json'
                      ? 'bg-white dark:bg-slate-800 text-primary-500 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Paste JSON
                </button>
              </div>
            </div>

            {importMethod === 'file' ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full min-h-[160px] border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all relative ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-500/5' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <input 
                  id="file-upload"
                  type="file" 
                  onChange={handleFileChange}
                  accept=".docx,.doc,.json"
                  className="hidden"
                />
                
                {!file ? (
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-1">
                      <Upload size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Drag & drop your file or <span className="text-primary-500 underline">browse</span></span>
                    <span className="text-xs text-slate-400 mt-1">Supports Word .docx, .doc or .json file formats</span>
                  </label>
                ) : (
                  <div className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-500 font-bold text-xs uppercase">
                        <File size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[400px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="p-2 text-slate-400 hover:text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder={`[\n  {\n    "questionNumber": 1,\n    "questionText": "A block of mass 2kg is placed on...",\n    "options": {\n      "A": "10 m/s²",\n      "B": "5 m/s²",\n      "C": "0 m/s²",\n      "D": "2 m/s²"\n    },\n    "correctAnswer": "B",\n    "explanation": "Using F = ma, we get a = F/m..."\n  }\n]`}
                  rows={8}
                  className="w-full p-4 bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400 dark:placeholder-slate-700 leading-normal"
                />
              </div>
            )}
          </div>

          {/* Notifications */}
          {errorMessage && (
            <div className="p-4 bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-900/30 rounded-2xl flex items-start gap-3">
              <AlertCircle size={20} className="text-danger-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-danger-800 dark:text-danger-400">Import Failed</p>
                <p className="text-xs text-danger-600 dark:text-danger-500 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-4 bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-900/30 rounded-2xl flex items-start gap-3">
              <CheckCircle size={20} className="text-success-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-success-800 dark:text-success-400">Success</p>
                <p className="text-xs text-success-600 dark:text-danger-500 mt-0.5">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* Trigger Import Button */}
          <button
            type="submit"
            disabled={loading || (importMethod === 'file' ? !file : !pastedJson.trim())}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Processing and parsing questions...
              </>
            ) : (
              'Parse and Review Questions'
            )}
          </button>
        </form>

        {/* Right Info Sidebar: formatting rules & guide */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm text-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
              <Info size={16} className="text-primary-500" />
              Document Formatting Guide
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
              To import questions successfully from Word (.docx/.doc) files, follow this standard formatting template:
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre space-y-1">
{`Question 1
Find the value of x in the diagram.
[[IMG_SLOT]]
A) 2A
B) 4A
C) 6A
D) 8A
Correct: B
Explanation: Apply Kirchhoff's law...`}
            </div>
            
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-6 mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
              <HelpCircle size={16} className="text-primary-500" />
              Image Placeholders
            </h3>
            <ul className="list-disc pl-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                Insert <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-primary-500 font-semibold font-mono">[[IMG_SLOT]]</code> inside your Word files wherever an image, graph, diagram, or circuit exists.
              </li>
              <li>
                The system detects placeholders and auto-generates upload slots.
              </li>
              <li>
                Once imported, you can upload the drawings/diagrams for each question in the Question Manager list.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCenter;
