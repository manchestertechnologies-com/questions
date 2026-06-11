import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  BarChart2, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  HelpCircle,
  TrendingUp, 
  FolderPlus,
  Moon, 
  Sun,
  Loader2
} from 'lucide-react';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/questions/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        }
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
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary-500" size={40} />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="max-w-md mx-auto p-4 bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-900/30 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-danger-500 mb-2" size={32} />
          <p className="text-danger-800 dark:text-danger-400 text-sm font-bold">{error}</p>
          <p className="text-danger-600 dark:text-danger-500 text-xs mt-1">Please ensure your backend server is active and the database connection is set up.</p>
        </div>
      </div>
    );
  }

  const { totalQuestions, difficulty, examWise, subjectStats, pendingImageCount, recentUploads } = stats || {
    totalQuestions: 0,
    difficulty: { Easy: 0, Medium: 0, Hard: 0 },
    examWise: { JEE: 0, NEET: 0, KCET: 0, Board: 0 },
    subjectStats: [],
    pendingImageCount: 0,
    recentUploads: []
  };

  // Difficulty Chart Data
  const difficultyData = {
    labels: ['Easy', 'Medium', 'Hard / Important'],
    datasets: [
      {
        data: [difficulty.Easy, difficulty.Medium, difficulty.Hard],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  // Exam Wise Chart Data
  const examData = {
    labels: Object.keys(examWise),
    datasets: [
      {
        label: 'Questions',
        data: Object.values(examWise),
        backgroundColor: '#0ea5e9',
        borderRadius: 8,
      },
    ],
  };

  // Subject Stats Chart Data
  const subjectData = {
    labels: subjectStats.map(s => `${s.name} (Cl ${s.classNum})`),
    datasets: [
      {
        label: 'Questions',
        data: subjectStats.map(s => s.count),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Upper Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time analytics and management for Manchester Technologies Question Bank.
          </p>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover-lift">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-500">
            <Database size={24} />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Total Questions</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 block">{totalQuestions.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Pending Images */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover-lift">
          <div className="w-12 h-12 rounded-xl bg-danger-100 dark:bg-danger-950/30 flex items-center justify-center text-danger-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Empty Image Slots</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 block">{pendingImageCount}</span>
          </div>
        </div>

        {/* Card 3: Easy */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover-lift">
          <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-950/30 flex items-center justify-center text-success-500">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Easy Questions</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 block">{difficulty.Easy}</span>
          </div>
        </div>

        {/* Card 4: Hard / Important */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover-lift">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Hard Questions</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 block">{difficulty.Hard}</span>
          </div>
        </div>
      </div>

      {/* Graphical Dashboard Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Subject distribution */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Subject-wise Questions Count</h2>
            <BarChart2 size={16} className="text-slate-400" />
          </div>
          <div className="h-64">
            {subjectStats.length > 0 ? (
              <Bar data={subjectData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No questions in database yet.</div>
            )}
          </div>
        </div>

        {/* Chart 2: Difficulty breakdown */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Difficulty Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">🟢 Easy vs 🟡 Medium vs 🔴 Hard</p>
          </div>
          <div className="h-48 relative flex items-center justify-center">
            {totalQuestions > 0 ? (
              <Doughnut 
                data={difficultyData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 15, color: '#94a3b8' } } }
                }} 
              />
            ) : (
              <div className="text-slate-400 text-sm">No questions.</div>
            )}
          </div>
        </div>
      </div>

      {/* Exam Wise and Recent Uploads Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Type Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Exam-wise Statistics</h2>
            <p className="text-xs text-slate-400 mt-0.5">JEE vs NEET vs KCET vs Board</p>
          </div>
          <div className="h-48">
            {totalQuestions > 0 ? (
              <Bar data={examData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data.</div>
            )}
          </div>
        </div>

        {/* Recent Uploads Table */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-white mb-4">Recently Preloaded Questions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700/50">
                  <tr>
                    <th className="py-2.5">Q.No</th>
                    <th className="py-2.5">Subject</th>
                    <th className="py-2.5">Difficulty</th>
                    <th className="py-2.5">Uploaded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {recentUploads.length > 0 ? (
                    recentUploads.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-150">
                        <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Q{q.questionNumber}</td>
                        <td className="py-2.5">{q.subject}</td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            q.difficulty === 'Easy' ? 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400' :
                            q.difficulty === 'Medium' ? 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400' :
                            'bg-danger-50 text-danger-600 dark:bg-danger-950/20 dark:text-danger-400'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-2.5">{new Date(q.createdDate).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">No questions preloaded yet. Go to Import Center to add questions.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
