import React from 'react';
import Avatar from './Avatar';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 items-start py-6 px-4 md:px-6 bg-slate-50/50 dark:bg-slateDark-800/30 border-y border-slate-100 dark:border-slateDark-800/50 transition-colors duration-200">
      <Avatar role="model" />
      <div className="flex flex-col gap-1 w-full max-w-3xl">
        <span className="text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-glow">
          madhesh
        </span>
        <div className="flex items-center gap-1.5 py-2">
          <div className="typing-dot w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-glow"></div>
          <div className="typing-dot w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-glow"></div>
          <div className="typing-dot w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-glow"></div>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-medium italic">
            madhesh is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}
