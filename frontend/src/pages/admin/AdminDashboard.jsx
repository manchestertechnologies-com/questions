import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  BarChart2, Database, AlertCircle, CheckCircle, FileText,
  TrendingUp, Loader2, Zap, Target, ClipboardList, HelpCircle, Image
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover-lift ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider block">{label}</span>
      <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">{value?.toLocaleString?.() ?? value}</span>
    </div>
  </div>
);

const ACTION_COLORS = {
  CREATE_QUESTION: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  UPDATE_QUESTION: 'bg-sky-100 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
  DELETE_QUESTION: 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
  DIFFICULTY_CHANGE: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  IMPORT_QUESTIONS: 'bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
  SECURITY_VIOLATION: 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/questions/dashboard/stats');
        if (response.data.success) setStats(response.data.stats);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Could not load statistics from database.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Database size={24} className="text-white" />
            </div>
          </div>
          <Loader2 className="animate-spin text-primary-500" size={28} />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-3" size={36} />
          <p className="text-rose-800 dark:text-rose-400 text-sm font-bold">{error}</p>
          <p className="text-rose-600 dark:text-rose-500 text-xs mt-2">Ensure the backend is running and database is connected.</p>
        </div>
      </div>
    );
  }

  const {
    totalQuestions = 0,
    unclassifiedCount = 0,
    difficulty = { Easy: 0, Medium: 0, Hard: 0, Unclassified: 0 },
    examWise = {},
    subjectStats = [],
    questionTypes = {},
    pendingImageCount = 0,
    recentUploads = [],
    recentActivity = [],
  } = stats || {};

  const difficultyData = {
    labels: ['Easy', 'Medium', 'Hard', 'Unclassified'],
    datasets: [{
      data: [difficulty.Easy, difficulty.Medium, difficulty.Hard, difficulty.Unclassified],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8'],
      borderWidth: 0,
    }],
  };

  const examData = {
    labels: Object.keys(examWise),
    datasets: [{
      label: 'Questions',
      data: Object.values(examWise),
      backgroundColor: 'rgba(14,165,233,0.8)',
      borderRadius: 6,
    }],
  };

  const subjectData = {
    labels: subjectStats.map(s => s.name),
    datasets: [{
      label: 'Questions',
      data: subjectStats.map(s => s.count),
      backgroundColor: 'rgba(99,102,241,0.8)',
      borderRadius: 6,
    }],
  };

  const typeData = {
    labels: Object.keys(questionTypes),
    datasets: [{
      label: 'Count',
      data: Object.values(questionTypes),
      backgroundColor: ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    },
  };

  const formatRelative = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time analytics for the Question Bank.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => navigate('/admin/quick-add')} className="btn-primary">
            <Zap size={14} /> Quick Add
          </button>
          <button onClick={() => navigate('/admin/difficulty')} className="btn-secondary">
            <Target size={14} /> Difficulty Manager
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          icon={<Database size={22} className="text-primary-500" />}
          label="Total Questions" value={totalQuestions}
          color="bg-primary-100 dark:bg-primary-950/30"
        />
        <StatCard
          icon={<HelpCircle size={22} className="text-amber-500" />}
          label="Unclassified" value={unclassifiedCount}
          color="bg-amber-100 dark:bg-amber-950/30"
          onClick={() => navigate('/admin/difficulty')}
        />
        <StatCard
          icon={<CheckCircle size={22} className="text-emerald-500" />}
          label="Easy Questions" value={difficulty.Easy}
          color="bg-emerald-100 dark:bg-emerald-950/30"
        />
        <StatCard
          icon={<TrendingUp size={22} className="text-rose-500" />}
          label="Hard Questions" value={difficulty.Hard}
          color="bg-rose-100 dark:bg-rose-950/30"
        />
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Quick Add', icon: <Zap size={16} />, path: '/admin/quick-add', color: 'border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-800/50 dark:text-primary-400 dark:hover:bg-primary-950/20' },
          { label: 'Difficulty', icon: <Target size={16} />, path: '/admin/difficulty', color: 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-950/20' },
          { label: 'Bulk Import', icon: <FileText size={16} />, path: '/admin/import', color: 'border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800/50 dark:text-violet-400 dark:hover:bg-violet-950/20' },
          { label: 'Audit Logs', icon: <ClipboardList size={16} />, path: '/admin/audit', color: 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/40' },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${item.color}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* ── Charts Row 1 ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Questions by Subject</h2>
            <BarChart2 size={15} className="text-slate-400" />
          </div>
          <div className="h-56">
            {subjectStats.length > 0
              ? <Bar data={subjectData} options={chartOptions} />
              : <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data yet.</div>}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Difficulty Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">🟢 Easy 🟡 Medium 🔴 Hard ⬜ Unclassified</p>
          <div className="h-48">
            {totalQuestions > 0
              ? <Doughnut data={difficultyData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 12, color: '#94a3b8', font: { size: 11 } } } } }} />
              : <div className="h-full flex items-center justify-center text-slate-400 text-sm">No questions.</div>}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Question Types</h2>
          <div className="h-48">
            {Object.keys(questionTypes).length > 0
              ? <Doughnut data={typeData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 10, color: '#94a3b8', font: { size: 10 } } } } }} />
              : <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data.</div>}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Exam-wise Distribution</h2>
          <div className="h-48">
            {Object.keys(examWise).length > 0
              ? <Bar data={examData} options={chartOptions} />
              : <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data.</div>}
          </div>
        </div>
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Recent Activity</h2>
            <button onClick={() => navigate('/admin/audit')} className="text-xs text-primary-500 hover:underline font-semibold">View all</button>
          </div>
          <div className="flex-1 space-y-2.5 overflow-y-auto">
            {recentActivity.length > 0 ? recentActivity.map((log, i) => (
              <div key={log._id || i} className="flex items-start gap-2.5">
                <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${ACTION_COLORS[log.action] || 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {log.action?.replace(/_/g,' ').substring(0,16)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{log.details}</p>
                  <p className="text-[10px] text-slate-400">{log.userId?.name} • {formatRelative(log.createdDate)}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm text-center py-8">No activity yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Uploads Table ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recently Added Questions</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Q.No</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {recentUploads.length > 0 ? recentUploads.map(q => (
                <tr key={q._id}>
                  <td className="font-bold text-slate-700 dark:text-slate-200">Q{q.questionNumber}</td>
                  <td className="text-xs">{q.subject?.name || '—'}</td>
                  <td>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[11px] font-semibold">
                      {q.questionType || 'MCQ'}
                    </span>
                  </td>
                  <td>
                    {q.difficulty ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        q.difficulty === 'Easy' ? 'badge-easy' :
                        q.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                      }`}>
                        {q.difficulty}
                      </span>
                    ) : (
                      <span className="badge-unclassified inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border">Unclassified</span>
                    )}
                  </td>
                  <td className="text-xs text-slate-400">{formatRelative(q.createdDate)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">No questions yet. Use Quick Add or Bulk Import.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
