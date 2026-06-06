import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Settings, Search, Menu } from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onOpenSettings,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (id) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-72 border-r transition-all duration-300 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } glass-panel-light dark:glass-panel-dark border-slate-200/60 dark:border-slateDark-800/80`}
      >
        {/* Header / New Chat */}
        <div className="p-4 flex flex-col gap-4 border-b border-slate-100 dark:border-slateDark-800/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-glow text-white">
              <span className="font-bold text-sm tracking-wide">M</span>
            </div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
              madhesh AI
            </h1>
          </div>

          <button
            onClick={() => {
              onNewChat();
              onClose(); // Close mobile drawer
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/10 hover:shadow-brand-500/25 active:scale-[0.98] transition-all"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100/50 dark:border-slateDark-800/30">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-slate-400 dark:text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slateDark-800/80 bg-slate-50/50 dark:bg-slateDark-900/50 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-brand-500 dark:focus:border-brand-glow focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
              {searchQuery ? 'No chats found' : 'No chat history'}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = chat.id === editingId;

              return (
                <div
                  key={chat.id}
                  className={`group relative flex items-center justify-between rounded-xl p-2 px-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-glow shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slateDark-800/40 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full mr-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(chat.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                        className="w-full px-1.5 py-0.5 text-xs rounded bg-white dark:bg-slateDark-900 text-slate-800 dark:text-slate-200 border border-brand-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(chat.id)}
                        className="text-emerald-500 hover:text-emerald-600 p-0.5 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-rose-500 hover:text-rose-600 p-0.5 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Clickable Area to Select Chat */}
                      <button
                        onClick={() => {
                          onSelectChat(chat.id);
                          onClose(); // Close mobile drawer
                        }}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                      >
                        <MessageSquare size={16} className="flex-shrink-0" />
                        <span className="truncate pr-4 font-medium text-xs md:text-sm">
                          {chat.title}
                        </span>
                      </button>

                      {/* Hover Actions */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slateDark-800 pl-2 pr-1 rounded-md py-0.5">
                        <button
                          onClick={() => handleStartEdit(chat)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slateDark-700 transition-all"
                          title="Rename Chat"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this chat log?')) {
                              onDeleteChat(chat.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slateDark-700 transition-all"
                          title="Delete Chat"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slateDark-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slateDark-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
              ME
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                User Account
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                madhesh Free Tier
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slateDark-800 transition-all"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
