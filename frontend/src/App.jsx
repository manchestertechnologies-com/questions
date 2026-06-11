import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionManager from './pages/admin/QuestionManager';
import ImportCenter from './pages/admin/ImportCenter';
import StudentPractice from './pages/student/StudentPractice';
import { 
  GraduationCap, 
  Database, 
  Upload, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  BookOpen,
  User as UserIcon
} from 'lucide-react';

// Authentication Guard Component
const AuthGuard = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Validating session credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/student/practice" replace />;
  }

  return children;
};

// Global Layout Frame wrapping sidebars and page content
const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('mantech_theme') === 'dark';
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mantech_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mantech_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Navigation config
  const navLinks = isAdmin 
    ? [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/admin/questions', label: 'Question Manager', icon: <Database size={18} /> },
        { path: '/admin/import', label: 'Bulk Import', icon: <Upload size={18} /> },
      ]
    : [
        { path: '/student/practice', label: 'Practice Arena', icon: <BookOpen size={18} /> },
      ];

  const activeLinkStyle = "bg-primary-500 text-white shadow-md shadow-primary-500/15";
  const inactiveLinkStyle = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header brand logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-150 dark:border-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <GraduationCap size={18} />
            </div>
            <span className="font-extrabold text-sm font-display text-slate-800 dark:text-white">
              Manchester <span className="text-primary-500 font-black">Tech</span>
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current user card summary */}
        <div className="p-4 mx-4 my-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-500 shrink-0">
            <UserIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
            <span className="inline-block px-1.5 py-0.5 mt-0.5 bg-primary-100/50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded text-[9px] font-bold uppercase">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive ? activeLinkStyle : inactiveLinkStyle
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-850 space-y-3">
          {/* Theme switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Moon size={14} className="text-primary-500" /> : <Sun size={14} className="text-warning-500" />}
              {darkMode ? 'Dark Theme' : 'Light Theme'}
            </span>
            <span className="text-[10px] text-slate-400">Toggle</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main body area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-6 lg:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={16} />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-white font-display">Manchester Tech</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 cursor-pointer"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Dynamic page mount view */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <Routes>
            {isAdmin ? (
              <>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/questions" element={<QuestionManager />} />
                <Route path="/admin/import" element={<ImportCenter />} />
                <Route path="*" replace to="/admin/dashboard" />
              </>
            ) : (
              <>
                <Route path="/student/practice" element={<StudentPractice />} />
                <Route path="*" replace to="/student/practice" />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Portals */}
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
};

export default App;
