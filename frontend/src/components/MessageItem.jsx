import React, { useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Avatar from './Avatar';

export default function MessageItem({ message, onAddToast }) {
  const { role, content, timestamp, file } = message;
  const isAI = role === 'model' || role === 'assistant';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Clean content by removing the file context block if we display it in system
      let textToCopy = content;
      if (content.startsWith('[ATTACHED FILE CONTEXT]')) {
        const parts = content.split('User Query:\n');
        if (parts.length > 1) {
          textToCopy = parts.slice(1).join('User Query:\n');
        }
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (onAddToast) {
        onAddToast('Response copied to clipboard', 'success');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Format time stamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Preprocess display content: Hide raw file context tags for the user bubble
  const getDisplayContent = () => {
    if (!isAI && content.startsWith('[ATTACHED FILE CONTEXT]')) {
      const parts = content.split('User Query:\n');
      if (parts.length > 1) {
        return parts.slice(1).join('User Query:\n');
      }
    }
    return content;
  };

  // Custom components for Markdown rendering
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      return !inline && match ? (
        <div className="relative my-3 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slateDark-700 max-w-full">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slateDark-800 text-xs font-mono text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slateDark-700/80">
            <span>{match[1].toUpperCase()}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeString);
                if (onAddToast) onAddToast(`${match[1].toUpperCase()} code copied!`, 'success');
              }}
              className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-glow transition-all"
            >
              <Copy size={12} />
              Copy
            </button>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              background: '#0e1420',
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slateDark-700/60 font-mono text-brand-600 dark:text-brand-glow text-sm" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div
      className={`flex gap-4 py-6 px-4 md:px-6 border-y border-transparent transition-colors duration-200 ${
        isAI
          ? 'bg-slate-50/40 dark:bg-slateDark-800/10 border-slate-100/50 dark:border-slateDark-800/20'
          : 'bg-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar role={role} name={isAI ? 'madhesh' : 'User'} />
      </div>

      {/* Message Body */}
      <div className="flex flex-col gap-1 w-full max-w-3xl overflow-hidden">
        {/* Name & Time */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {isAI ? 'madhesh' : 'You'}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Attached File Indicator in Chat Bubble */}
        {file && (
          <div className="flex items-center gap-2 mt-1.5 p-2 px-3 rounded-xl border border-brand-500/10 bg-brand-500/5 dark:bg-brand-500/10 w-fit max-w-xs shadow-sm">
            <FileText className="text-brand-600 dark:text-brand-glow flex-shrink-0" size={16} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {file.name}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                {(file.size / 1024).toFixed(1)} KB • Extracted context
              </span>
            </div>
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose-custom text-slate-700 dark:text-slate-300 mt-2 break-words max-w-full">
          <ReactMarkdown components={MarkdownComponents}>
            {getDisplayContent()}
          </ReactMarkdown>
        </div>

        {/* Action Buttons (Copy) */}
        {isAI && (
          <div className="flex gap-2 mt-4 self-start opacity-70 hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slateDark-700 bg-white dark:bg-slateDark-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-glow hover:border-brand-500/20 dark:hover:border-slateDark-600 shadow-sm transition-all"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy response</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
