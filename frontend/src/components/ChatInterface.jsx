import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, RefreshCw, Download, Menu, FileText, X, Sparkles, Code, FileSearch, MessageSquare } from 'lucide-react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function ChatInterface({
  chat,
  onSendMessage,
  onClearChat,
  onDownloadChat,
  onSidebarToggle,
  isLoading,
  onAddToast,
}) {
  const [inputText, setInputText] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { name, content, size }
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const messages = chat?.messages || [];

  // Scroll to bottom on new messages or loading state
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input on chat switch
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat?.id]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    onSendMessage(inputText.trim(), attachedFile);
    setInputText('');
    setAttachedFile(null); // Clear attachment
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Process File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp'];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      onAddToast('Unsupported format! Upload PDF, DOCX, TXT, PNG, JPG, or WEBP.', 'error');
      return;
    }

    setFileUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      onAddToast(`Reading ${file.name}...`, 'info');
      // Fetch response from Express API
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setAttachedFile({
        name: data.fileName,
        size: file.size,
        content: data.textContent,
        isImage: data.isImage,
        base64Data: data.base64Data,
        mimetype: data.mimetype
      });
      onAddToast('File parsed and attached to context!', 'success');
    } catch (error) {
      console.error(error);
      onAddToast(error.message || 'Error processing file', 'error');
    } finally {
      setFileUploading(false);
      // Reset input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const suggestionCards = [
    {
      title: 'Analyze PDF / Code',
      desc: 'Upload a document or text and ask me questions about it.',
      prompt: 'Summarize the core topics in my uploaded document and extract 3 key takeaways.',
      icon: <FileSearch className="text-violet-500" size={20} />,
    },
    {
      title: 'Write code or design',
      desc: 'Ask for templates, function explanations, or algorithms.',
      prompt: 'Write a React hook for checking system online status with proper event listeners.',
      icon: <Code className="text-brand-glow animate-pulse" size={20} />,
    },
    {
      title: 'Brainstorm concepts',
      desc: 'Ask for explanations or business proposals.',
      prompt: 'Explain what Quantum Computing is in simple words and give 3 real-world use cases.',
      icon: <Sparkles className="text-amber-500" size={20} />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slateDark-900 transition-colors duration-300">
      
      {/* Header bar */}
      <header className="flex items-center justify-between px-4 py-3 md:px-6 border-b glass-panel-light dark:glass-panel-dark border-slate-200/60 dark:border-slateDark-800/80 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slateDark-800/80 md:hidden transition-all"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              {chat?.title || 'New Chat'}
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Powered by Gemini 3.5 Flash
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (messages.length > 0 && window.confirm('Clear current conversation?')) {
                onClearChat();
              }
            }}
            disabled={messages.length === 0}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slateDark-800/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Clear current chat"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onDownloadChat}
            disabled={messages.length === 0}
            className="p-2 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-glow hover:bg-slate-100 dark:hover:bg-slateDark-800/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Download Chat History"
          >
            <Download size={16} />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Welcome dashboard */
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-glow flex items-center justify-center text-white mb-6">
              <MessageSquare size={32} className="stroke-[2]" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-glow dark:to-indigo-400 md:text-4xl">
              Meet madhesh
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md text-sm md:text-base font-medium">
              Hello! I am your professional AI assistant. How can I help you today? You can write code, analyze documents, and more.
            </p>

            {/* suggestion grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-10 max-w-2xl">
              {suggestionCards.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(card.prompt)}
                  className="flex flex-col items-start text-left p-4 rounded-2xl border border-slate-200/80 dark:border-slateDark-800/80 hover:border-brand-500/30 dark:hover:border-brand-glow/30 hover:bg-white dark:hover:bg-slateDark-800/20 shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slateDark-800/60 mb-3">
                    {card.icon}
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {card.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="flex flex-col">
            {messages.map((message, idx) => (
              <MessageItem
                key={idx}
                message={message}
                onAddToast={onAddToast}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form area */}
      <div className="p-4 border-t border-slate-200/40 dark:border-slateDark-800/30 bg-slate-50/50 dark:bg-slateDark-900/50 backdrop-blur-md">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          
          {/* File attachment preview */}
          {attachedFile && (
            <div className="absolute -top-14 left-0 flex items-center gap-2 p-2 px-3 rounded-xl border border-brand-500/20 bg-white dark:bg-slateDark-800 shadow-md animate-slide-in">
              {attachedFile.isImage && attachedFile.base64Data ? (
                <img src={`data:${attachedFile.mimetype};base64,${attachedFile.base64Data}`} alt="attachment preview" className="w-8 h-8 object-cover rounded-md" />
              ) : (
                <FileText className="text-brand-600 dark:text-brand-glow" size={16} />
              )}
              <div className="flex flex-col min-w-0 max-w-[150px]">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {attachedFile.name}
                </span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500">
                  Ready to send
                </span>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slateDark-700"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Large Glassmorphic Text area input container */}
          <div className="relative flex items-end rounded-2xl border border-slate-200 dark:border-slateDark-750/80 shadow-md focus-within:border-brand-500 dark:focus-within:border-brand-glow focus-within:ring-1 focus-within:ring-brand-500/30 dark:focus-within:ring-brand-glow/20 glass-input-light dark:glass-input-dark overflow-hidden transition-all duration-300 p-2">
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={fileUploading}
              className={`p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slateDark-800 transition-all ${
                fileUploading ? 'animate-pulse' : ''
              }`}
              title="Attach File (PDF, DOCX, TXT)"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {/* Input field */}
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message madhesh... (Shift+Enter for newline)"
              className="flex-1 max-h-48 min-h-[40px] px-3 py-2 bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none font-medium text-sm leading-relaxed"
              style={{ height: 'auto' }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedFile) || isLoading || fileUploading}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-20 text-white shadow-md active:scale-95 disabled:active:scale-100 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
        
        {/* Footer info text */}
        <p className="text-center text-[9px] text-slate-400 dark:text-slate-500 mt-2.5 font-medium">
          madhesh can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
