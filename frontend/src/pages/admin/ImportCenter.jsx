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
  
  // Loading & statuses
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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
    if (!selectedSubject || !selectedChapter || !selectedConcept || !selectedSubConcept) {
      setErrorMessage('Please select Subject, Chapter, Concept, and Sub-concept before importing.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', selectedSubject);
    formData.append('chapter', selectedChapter);
    formData.append('concept', selectedConcept);
    formData.append('subConcept', selectedSubConcept);
    formData.append('classNum', classNum);
    formData.append('difficulty', difficulty);
    formData.append('marks', marks);
    formData.append('negativeMarks', negativeMarks);
    examTypes.forEach(t => formData.append('examType', t));

    try {
      const res = await API.post('/questions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setStatusMessage(`Successfully preloaded ${res.data.count} questions from "${file.name}"!`);
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Failed to import questions. Please check document structure.');
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleImport} className="lg:col-span-2 space-y-6">
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sub Concept</label>
                <select 
                  value={selectedSubConcept} 
                  onChange={(e) => setSelectedSubConcept(e.target.value)}
                  required
                  disabled={!selectedConcept}
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
            <h2 className="text-md font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-2">
              File Selection
            </h2>

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
                <p className="text-xs text-success-600 dark:text-success-500 mt-0.5">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* Trigger Import Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Processing and preloading questions...
              </>
            ) : (
              'Parse and Preload Questions'
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
