import React from 'react';
import { X, Moon, Sun, Trash2, ShieldAlert } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  onClearAllChats,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 dark:border-slateDark-700/50 shadow-2xl glass-panel-light dark:glass-panel-dark p-6 text-slate-800 dark:text-slate-200 transition-all duration-300 transform scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-glow dark:to-indigo-400">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slateDark-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-6">
          {/* Theme Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slateDark-800/80">
            <div>
              <p className="font-semibold text-sm">Color Theme</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Toggle dark and light UI modes</p>
            </div>
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slateDark-700 bg-slate-50 dark:bg-slateDark-800 hover:bg-slate-100 dark:hover:bg-slateDark-700/80 transition-all text-brand-600 dark:text-brand-glow shadow-sm"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} className="mr-1.5 text-amber-500" />
                  <span className="text-xs font-semibold pr-1">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="mr-1.5" />
                  <span className="text-xs font-semibold pr-1">Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Model info */}
          <div className="pb-4 border-b border-slate-100 dark:border-slateDark-800/80">
            <p className="font-semibold text-sm">AI Chatbot Agent</p>
            <div className="mt-2 flex items-center justify-between px-3 py-2.5 rounded-xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">Name:</span>
              <span className="font-bold text-brand-600 dark:text-brand-glow">madhesh</span>
            </div>
            <div className="mt-1 flex items-center justify-between px-3 py-2.5 rounded-xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">Model:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Gemini 3.5 Flash</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3">
            <p className="font-semibold text-sm text-rose-500 flex items-center gap-1.5">
              <ShieldAlert size={16} /> Danger Zone
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
                  onClearAllChats();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-500/20 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white font-semibold text-sm transition-all shadow-sm"
            >
              <Trash2 size={16} />
              Clear All Chats
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-500">
          madhesh AI Chatbot Web App • Version 1.0.0
        </div>
      </div>
    </div>
  );
}
