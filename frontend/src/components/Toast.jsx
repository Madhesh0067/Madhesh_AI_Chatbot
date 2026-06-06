import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function ToastItem({ toast, onClose }) {
  const { id, message, type = 'info', duration = 3000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-rose-500" size={18} />,
    info: <Info className="text-brand-500" size={18} />,
  };

  const bgStyles = {
    success: 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10',
    error: 'border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10',
    info: 'border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/10',
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-slide-in max-w-sm ${bgStyles[type]}`}
    >
      <div className="flex items-center gap-2.5">
        {icons[type]}
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {message}
        </p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slateDark-700"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
