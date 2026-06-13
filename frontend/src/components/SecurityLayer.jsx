import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { ShieldOff, Eye } from 'lucide-react';

const SecurityLayer = ({ children }) => {
  const { user } = useAuth();
  const [tabBlurred, setTabBlurred] = React.useState(false);
  const [devToolsOpen, setDevToolsOpen] = React.useState(false);
  const devToolsCheckRef = useRef(null);

  // ── Log security events to backend ────────────────────────────────────────
  const logEvent = useCallback(async (eventType, details) => {
    try {
      await API.post('/questions/security-event', {
        eventType,
        details,
        url: window.location.href,
      });
    } catch {
      // Silently fail — don't block user
    }
  }, []);

  // ── Disable right-click ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      logEvent('CONTEXT_MENU_ATTEMPT', 'Right-click context menu blocked');
      return false;
    };
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, [logEvent]);

  // ── Disable copy / cut ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection()?.toString();
      if (selection) {
        e.preventDefault();
        e.clipboardData?.setData('text/plain', '');
        logEvent('COPY_ATTEMPT', `Attempted to copy: "${selection.substring(0, 80)}"`);
      }
    };
    const handleCut = (e) => {
      e.preventDefault();
      logEvent('COPY_ATTEMPT', 'Cut operation blocked');
    };
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
    };
  }, [logEvent]);

  // ── Block keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F12 - DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        logEvent('KEYBOARD_SHORTCUT_BLOCK', 'F12 (DevTools) blocked');
        return false;
      }
      // Ctrl+Shift+I - DevTools
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        logEvent('KEYBOARD_SHORTCUT_BLOCK', 'Ctrl+Shift+I (DevTools) blocked');
        return false;
      }
      // Ctrl+Shift+J - Console
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        logEvent('KEYBOARD_SHORTCUT_BLOCK', 'Ctrl+Shift+J (Console) blocked');
        return false;
      }
      // Ctrl+U - View Source
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        logEvent('KEYBOARD_SHORTCUT_BLOCK', 'Ctrl+U (View Source) blocked');
        return false;
      }
      // Ctrl+P - Print
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        logEvent('PRINT_ATTEMPT', 'Ctrl+P (Print) blocked');
        return false;
      }
      // PrtScn - Screenshot key (best effort)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        logEvent('SCREENSHOT_KEY', 'PrintScreen key pressed');
        return false;
      }
      // Meta+Shift+4 (Mac screenshot)
      if (e.metaKey && e.shiftKey && (e.key === '4' || e.key === '3')) {
        logEvent('SCREENSHOT_KEY', 'Mac screenshot shortcut detected');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [logEvent]);

  // ── Tab visibility (blur) detection ───────────────────────────────────────
  useEffect(() => {
    const handleBlur = () => {
      setTabBlurred(true);
      logEvent('TAB_BLUR', 'User switched away from question content');
    };
    const handleFocus = () => setTabBlurred(false);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabBlurred(true);
        logEvent('TAB_BLUR', 'Tab became hidden/inactive');
      } else {
        setTabBlurred(false);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logEvent]);

  // ── DevTools detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      const isOpen = widthThreshold || heightThreshold;
      if (isOpen && !devToolsOpen) {
        setDevToolsOpen(true);
        logEvent('DEVTOOLS_OPEN', `DevTools detected. Diff: W=${window.outerWidth - window.innerWidth} H=${window.outerHeight - window.innerHeight}`);
      } else if (!isOpen && devToolsOpen) {
        setDevToolsOpen(false);
      }
    };
    devToolsCheckRef.current = setInterval(check, 1500);
    return () => clearInterval(devToolsCheckRef.current);
  }, [devToolsOpen, logEvent]);

  // ── Disable drag on images ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        logEvent('DRAG_IMAGE_ATTEMPT', `Attempted to drag image: ${e.target.src?.substring(0, 80)}`);
      }
    };
    document.addEventListener('dragstart', handler);
    return () => document.removeEventListener('dragstart', handler);
  }, [logEvent]);

  const watermarkText = user
    ? `${user.name} • ${user.email} • CONFIDENTIAL`
    : 'CONFIDENTIAL • MANCHESTER TECHNOLOGIES';

  return (
    <div className="relative">
      {/* ── Tiled watermark overlay ──────────────────────────────────────── */}
      <div className="watermark-overlay" aria-hidden="true">
        <div className="watermark-grid">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="watermark-cell">{watermarkText}</div>
          ))}
        </div>
      </div>

      {/* ── Tab-blur overlay ────────────────────────────────────────────── */}
      {tabBlurred && (
        <div className="content-blur-overlay" onClick={() => setTabBlurred(false)}>
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <Eye size={28} className="text-primary-400" />
          </div>
          <h2 className="text-white text-xl font-bold">Content Hidden</h2>
          <p className="text-slate-400 text-sm mt-1">Click anywhere to continue viewing</p>
          <div className="mt-4 px-4 py-2 bg-primary-500/20 border border-primary-500/30 rounded-lg">
            <p className="text-primary-400 text-xs font-mono">Session activity is being monitored</p>
          </div>
        </div>
      )}

      {/* ── DevTools warning overlay ─────────────────────────────────────── */}
      {devToolsOpen && (
        <div className="devtools-overlay">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
              <ShieldOff size={36} className="text-rose-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Developer Tools Detected</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Developer tools are not allowed while viewing question content.
              Please close DevTools to continue. This action has been logged.
            </p>
            <div className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-rose-400 text-xs font-mono">
                🔒 Security violation recorded • {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className={devToolsOpen || tabBlurred ? 'select-none pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

export default SecurityLayer;
