import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/practice');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = searchParams.get('expired') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-50" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 hover-lift">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-4 animate-bounce">
            <GraduationCap size={30} />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            Manchester <span className="text-primary-500 flex items-center gap-1 font-extrabold">Technologies <Sparkles size={16} className="text-warning-500" /></span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            JEE, NEET, KCET & Board Question Management
          </p>
        </div>

        {isExpired && (
          <div className="mb-4 p-3 bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-900/30 rounded-xl text-center">
            <p className="text-warning-600 dark:text-warning-400 text-xs font-semibold">
              Your session has expired. Please log in again.
            </p>
          </div>
        )}

        {/* Error Notification */}
        {(error || authError) && (
          <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-900/30 rounded-xl text-center">
            <p className="text-danger-600 dark:text-danger-400 text-xs font-semibold">
              {error || authError}
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ManchesterTECHNOLOGIESS@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Credentials Tip (Helpful for users who deploy and test) */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            Default Admin credentials pre-seeded in code.
          </p>
          <div className="mt-2 text-left bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
            <p><strong>Admin Email:</strong> ManchesterTECHNOLOGIESS@gmail.com</p>
            <p><strong>Admin Password:</strong> MANTECH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
