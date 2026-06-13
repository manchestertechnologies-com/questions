import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionManager from './pages/admin/QuestionManager';
import ImportCenter from './pages/admin/ImportCenter';
import QuickAddPage from './pages/admin/QuickAddPage';
import DifficultyManager from './pages/admin/DifficultyManager';
import AuditDashboard from './pages/admin/AuditDashboard';
import StudentPractice from './pages/student/StudentPractice';
import SecurityLayer from './components/SecurityLayer';
import {
  GraduationCap, Database, Upload, LayoutDashboard, LogOut, Menu, X,
  Sun, Moon, BookOpen, User as UserIcon, Zap, Target, ClipboardList, Shield
} from 'lucide-react';

// ── Auth Guard ────────────────────────────────────────────────────────────────
const AuthGuard = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-primary-400 animate-ping opacity-30" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Validating session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/student/practice" replace />;
  return children;
};

// ── App Layout ────────────────────────────────────────────────────────────────
const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('mantech_theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mantech_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mantech_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isAdmin = user?.role === 'admin';

  const adminNavLinks = [
    { path: '/admin/dashboard',  label: 'Dashboard',          icon: <LayoutDashboard size={17} /> },
    { path: '/admin/quick-add',  label: 'Quick Add',          icon: <Zap size={17} />, accent: 'text-primary-500' },
    { path: '/admin/questions',  label: 'Question Manager',   icon: <Database size={17} /> },
    { path: '/admin/difficulty', label: 'Difficulty Manager', icon: <Target size={17} />, accent: 'text-amber-500' },
    { path: '/admin/import',     label: 'Bulk Import',        icon: <Upload size={17} /> },
    { path: '/admin/audit',      label: 'Audit Logs',         icon: <ClipboardList size={17} />, accent: 'text-violet-500' },
  ];

  const studentNavLinks = [
    { path: '/student/practice', label: 'Practice Arena', icon: <BookOpen size={17} /> },
  ];

  const navLinks = isAdmin ? adminNavLinks : studentNavLinks;

  return (
    <SecurityLayer>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Brand */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-500/30">
                <GraduationCap size={17} />
              </div>
              <div className="leading-none">
                <span className="font-extrabold text-[13px] text-slate-800 dark:text-white tracking-tight">
                  Manchester
                </span>
                <span className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest">Technologies</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* User card */}
          <div className="mx-3 mt-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <span className="inline-block px-1.5 py-px mt-0.5 bg-primary-100/60 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-[9px] font-black uppercase tracking-wide">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'nav-active'
                      : `nav-inactive ${link.accent || ''}`
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom controls */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {darkMode ? <Moon size={13} className="text-primary-400" /> : <Sun size={13} className="text-amber-500" />}
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">Toggle</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile topbar */}
          <header className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-4 lg:hidden shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-white">
                <GraduationCap size={15} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-white">Manchester Tech</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 cursor-pointer"
            >
              <Menu size={19} />
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            <Routes>
              {isAdmin ? (
                <>
                  <Route path="/admin/dashboard"  element={<AdminDashboard />} />
                  <Route path="/admin/quick-add"  element={<QuickAddPage />} />
                  <Route path="/admin/questions"  element={<QuestionManager />} />
                  <Route path="/admin/difficulty" element={<DifficultyManager />} />
                  <Route path="/admin/import"     element={<ImportCenter />} />
                  <Route path="/admin/audit"      element={<AuditDashboard />} />
                  <Route path="*" element={<Navigate replace to="/admin/dashboard" />} />
                </>
              ) : (
                <>
                  <Route path="/student/practice" element={<StudentPractice />} />
                  <Route path="*" element={<Navigate replace to="/student/practice" />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </SecurityLayer>
  );
};

// ── Root App ──────────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      />
    </Routes>
  </AuthProvider>
);

export default App;
