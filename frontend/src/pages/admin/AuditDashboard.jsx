import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  ClipboardList, Shield, ChevronLeft, ChevronRight, Filter,
  Download, AlertTriangle, Info, AlertCircle, CheckCircle, Loader2, RotateCcw
} from 'lucide-react';

const ACTION_COLORS = {
  CREATE_QUESTION:      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40',
  UPDATE_QUESTION:      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-800/40',
  DELETE_QUESTION:      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/40',
  DIFFICULTY_CHANGE:    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/40',
  BULK_DIFFICULTY_CHANGE:'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800/40',
  IMPORT_QUESTIONS:     'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800/40',
  UPLOAD_IMAGE_SLOT:    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800/40',
  DELETE_IMAGE:         'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-800/40',
  SECURITY_VIOLATION:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40',
  LOGIN:                'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  LOGOUT:               'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const SECURITY_EVENT_COLORS = {
  DEVTOOLS_OPEN:          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400',
  CONTEXT_MENU_ATTEMPT:   'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400',
  COPY_ATTEMPT:           'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400',
  SCREENSHOT_KEY:         'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400',
  PRINT_ATTEMPT:          'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-400',
  TAB_BLUR:               'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
  KEYBOARD_SHORTCUT_BLOCK:'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400',
  DRAG_IMAGE_ATTEMPT:     'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400',
};

const AuditDashboard = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [logs, setLogs] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [secTotal, setSecTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [secPages, setSecPages] = useState(1);
  const [page, setPage] = useState(1);
  const [secPage, setSecPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters - Activity
  const [filterAction, setFilterAction] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  // Filters - Security
  const [filterSecType, setFilterSecType] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/questions/audit-logs?page=${page}&limit=40`;
      if (filterAction) url += `&action=${filterAction}`;
      if (filterSeverity) url += `&severity=${filterSeverity}`;
      if (filterDateFrom) url += `&dateFrom=${filterDateFrom}`;
      if (filterDateTo) url += `&dateTo=${filterDateTo}`;
      const res = await API.get(url);
      if (res.data.success) {
        setLogs(res.data.logs);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch { } finally { setLoading(false); }
  }, [page, filterAction, filterSeverity, filterDateFrom, filterDateTo]);

  const fetchSecurityEvents = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/questions/security-events?page=${secPage}&limit=40`;
      if (filterSecType) url += `&eventType=${filterSecType}`;
      if (filterDateFrom) url += `&dateFrom=${filterDateFrom}`;
      if (filterDateTo) url += `&dateTo=${filterDateTo}`;
      const res = await API.get(url);
      if (res.data.success) {
        setSecurityEvents(res.data.events);
        setSecTotal(res.data.total);
        setSecPages(res.data.pages);
      }
    } catch { } finally { setLoading(false); }
  }, [secPage, filterSecType, filterDateFrom, filterDateTo]);

  useEffect(() => {
    if (activeTab === 'activity') fetchLogs();
    else fetchSecurityEvents();
  }, [activeTab, fetchLogs, fetchSecurityEvents]);

  const handleExport = () => {
    const data = activeTab === 'activity' ? logs : securityEvents;
    const headers = activeTab === 'activity'
      ? ['Timestamp', 'User', 'Role', 'Action', 'Severity', 'Details', 'IP', 'QuestionNo']
      : ['Timestamp', 'User', 'EventType', 'Details', 'IP', 'URL'];
    const rows = activeTab === 'activity'
      ? data.map(l => [
          new Date(l.createdDate).toLocaleString(),
          l.userId?.name || 'Unknown',
          l.userId?.role || '',
          l.action,
          l.severity,
          `"${l.details?.replace(/"/g, '""')}"`,
          l.ipAddress,
          l.questionId?.questionNumber || '',
        ])
      : data.map(e => [
          new Date(e.timestamp).toLocaleString(),
          e.userId?.name || 'Unknown',
          e.eventType,
          `"${e.details?.replace(/"/g, '""')}"`,
          e.ipAddress,
          e.url,
        ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `audit_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatRelative = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const ACTIONS = [
    'CREATE_QUESTION','UPDATE_QUESTION','DELETE_QUESTION','DIFFICULTY_CHANGE',
    'BULK_DIFFICULTY_CHANGE','IMPORT_QUESTIONS','UPLOAD_IMAGE_SLOT','DELETE_IMAGE',
    'SECURITY_VIOLATION','LOGIN','LOGOUT'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-3">
            <span className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-500/30">
              <ClipboardList size={20} />
            </span>
            Audit Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Complete activity trail and security event monitoring.
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary">
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover-lift">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover-lift">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Events</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">{secTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover-lift">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Log</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 truncate">
            {logs[0]?.action?.replace(/_/g, ' ') || '—'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover-lift">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Activity</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
            {logs[0] ? formatRelative(logs[0].createdDate) : '—'}
          </p>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'activity'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-2"><ClipboardList size={14} /> Activity Log</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-2"><Shield size={14} /> Security Events</span>
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {activeTab === 'activity' ? (
            <>
              <select className="input-field" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
                <option value="">All Actions</option>
                {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
              </select>
              <select className="input-field" value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}>
                <option value="">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </>
          ) : (
            <select className="input-field" value={filterSecType} onChange={e => { setFilterSecType(e.target.value); setSecPage(1); }}>
              <option value="">All Event Types</option>
              {Object.keys(SECURITY_EVENT_COLORS).map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          )}
          <input type="date" className="input-field" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          <input type="date" className="input-field" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          <button onClick={() => { setFilterAction(''); setFilterSeverity(''); setFilterSecType(''); setFilterDateFrom(''); setFilterDateTo(''); }} className="btn-secondary justify-center">
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary-500" size={36} />
            <p className="text-slate-400 text-sm font-semibold">Loading logs...</p>
          </div>
        ) : activeTab === 'activity' ? (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Severity</th>
                    <th>Details</th>
                    <th>Q.No</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? logs.map(l => (
                    <tr key={l._id}>
                      <td className="whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatRelative(l.createdDate)}</p>
                        <p className="text-[10px] text-slate-400">{new Date(l.createdDate).toLocaleString()}</p>
                      </td>
                      <td>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{l.userId?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400">{l.userId?.role}</p>
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${ACTION_COLORS[l.action] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {l.action?.replace(/_/g,' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`flex items-center gap-1 text-xs font-semibold ${
                          l.severity === 'critical' ? 'text-rose-500' :
                          l.severity === 'warning' ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {l.severity === 'critical' ? <AlertTriangle size={12} /> :
                           l.severity === 'warning' ? <AlertCircle size={12} /> : <Info size={12} />}
                          {l.severity}
                        </span>
                      </td>
                      <td className="max-w-[250px]">
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{l.details}</p>
                      </td>
                      <td className="text-xs font-mono text-slate-500">
                        {l.questionId?.questionNumber ? `Q${l.questionId.questionNumber}` : '—'}
                      </td>
                      <td className="text-xs font-mono text-slate-400">{l.ipAddress || '—'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="py-16 text-center text-slate-400">No activity logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-medium">{total.toLocaleString()} total logs • Page {page} of {pages}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"><ChevronLeft size={14}/></button>
                <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"><ChevronRight size={14}/></button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Event Type</th>
                    <th>Details</th>
                    <th>IP</th>
                    <th>Page URL</th>
                  </tr>
                </thead>
                <tbody>
                  {securityEvents.length > 0 ? securityEvents.map(e => (
                    <tr key={e._id}>
                      <td className="whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatRelative(e.timestamp)}</p>
                        <p className="text-[10px] text-slate-400">{new Date(e.timestamp).toLocaleString()}</p>
                      </td>
                      <td>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{e.userId?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400">{e.userId?.email}</p>
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${SECURITY_EVENT_COLORS[e.eventType] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {e.eventType?.replace(/_/g,' ')}
                        </span>
                      </td>
                      <td className="max-w-[250px]">
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{e.details}</p>
                      </td>
                      <td className="text-xs font-mono text-slate-400">{e.ipAddress || '—'}</td>
                      <td className="max-w-[150px]">
                        <p className="text-xs text-slate-400 truncate font-mono">{e.url || '—'}</p>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="py-16 text-center text-slate-400">No security events recorded. Good sign! ✅</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-medium">{secTotal.toLocaleString()} total events • Page {secPage} of {secPages}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setSecPage(p => Math.max(1, p-1))} disabled={secPage===1} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"><ChevronLeft size={14}/></button>
                <button onClick={() => setSecPage(p => Math.min(secPages, p+1))} disabled={secPage===secPages} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"><ChevronRight size={14}/></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditDashboard;
