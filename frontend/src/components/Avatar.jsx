import React from 'react';
import { Bot, User } from 'lucide-react';

export default function Avatar({ role, name = 'User' }) {
  const isAI = role === 'model' || role === 'assistant' || role === 'system';

  if (isAI) {
    return (
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-glow text-white animate-pulse-slow">
        <Bot size={20} className="stroke-[2]" />
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white dark:border-slateDark-900"></span>
        </span>
      </div>
    );
  }

  // Generate user initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-200 dark:bg-slateDark-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-white/20">
      {initials.length > 0 ? initials : <User size={20} />}
    </div>
  );
}
