import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import ToastContainerComponent from './components/Toast'; // import the default ToastContainer from './components/Toast'
import { Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('madhesh_chats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chats', e);
      }
    }
    // Default initial chat session
    const initialId = Date.now().toString();
    return [
      {
        id: initialId,
        title: 'New Chat',
        messages: [],
      },
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const savedActive = localStorage.getItem('madhesh_active_chat_id');
    if (savedActive && chats.some(c => c.id === savedActive)) {
      return savedActive;
    }
    return chats[0]?.id || '';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('madhesh_theme') || 'dark';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Apply and persist theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('madhesh_theme', theme);
  }, [theme]);

  // Persist chats state
  useEffect(() => {
    localStorage.setItem('madhesh_chats', JSON.stringify(chats));
    if (activeChatId) {
      localStorage.setItem('madhesh_active_chat_id', activeChatId);
    }
  }, [chats, activeChatId]);

  // Toast helper
  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Find active chat object
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Actions
  const handleSelectChat = (id) => {
    setActiveChatId(id);
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
    };
    setChats((prev) => [newSession, ...prev]);
    setActiveChatId(newId);
    addToast('Created new chat session', 'info');
  };

  const handleRenameChat = (id, newTitle) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
    addToast('Chat renamed', 'success');
  };

  const handleDeleteChat = (id) => {
    const remainingChats = chats.filter((c) => c.id !== id);
    
    if (remainingChats.length === 0) {
      const fallbackId = Date.now().toString();
      setChats([
        {
          id: fallbackId,
          title: 'New Chat',
          messages: [],
        },
      ]);
      setActiveChatId(fallbackId);
    } else {
      setChats(remainingChats);
      if (activeChatId === id) {
        setActiveChatId(remainingChats[0].id);
      }
    }
    addToast('Chat log deleted', 'info');
  };

  const handleClearChat = () => {
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: [] } : c))
    );
    addToast('Chat history cleared', 'info');
  };

  const handleClearAllChats = () => {
    const fallbackId = Date.now().toString();
    setChats([
      {
        id: fallbackId,
        title: 'New Chat',
        messages: [],
      },
    ]);
    setActiveChatId(fallbackId);
    addToast('All chat history cleared', 'success');
  };

  const handleDownloadChat = () => {
    if (!activeChat || activeChat.messages.length === 0) return;

    try {
      const dataStr = JSON.stringify(activeChat, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `${activeChat.title.replace(/\s+/g, '_')}_history.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      addToast('History download initialized!', 'success');
    } catch (error) {
      addToast('Failed to download chat logs', 'error');
    }
  };

  const handleSendMessage = async (text, file) => {
    if (!text.trim() && !file) return;

    const currentChat = activeChat;
    if (!currentChat) return;

    // Create user message object
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      file: file ? { name: file.name, size: file.size } : null,
    };

    // Auto-rename chat from "New Chat" to first prompt
    let updatedTitle = currentChat.title;
    if (currentChat.title === 'New Chat' && text.trim()) {
      const words = text.split(' ').slice(0, 5).join(' ');
      updatedTitle = words.length > 25 ? words.substring(0, 25) + '...' : words;
    }

    // Update frontend state with user's message
    const updatedMessages = [...currentChat.messages, userMsg];
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChat.id
          ? { ...c, title: updatedTitle, messages: updatedMessages }
          : c
      )
    );

    setIsLoading(true);

    try {
      // Build API request payload
      // Send previous messages (context) along with the current input and file details
      const payload = {
        messages: currentChat.messages,
        currentMessage: text,
        fileContext: file ? { name: file.name, content: file.content } : null,
      };

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error');
      }

      // Append AI response
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    role: 'assistant',
                    content: data.content,
                    timestamp: data.timestamp || new Date().toISOString(),
                  },
                ],
              }
            : c
        )
      );
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Failed to connect to backend server.', 'error');
      
      // Append an error notice as system message so the conversation can continue
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    role: 'system',
                    content: `⚠️ **Error:** ${error.message || 'Failed to generate response. Check backend connection.'}`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slateDark-900 transition-colors duration-300">
      
      {/* Toast Alert popup */}
      <ToastContainerComponent toasts={toasts} removeToast={removeToast} />

      {/* Sidebar history drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main chat interface screen */}
      <ChatInterface
        chat={activeChat}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        onDownloadChat={handleDownloadChat}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isLoading={isLoading}
        onAddToast={addToast}
      />

      {/* Modal Settings panel */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        onClearAllChats={handleClearAllChats}
      />
    </div>
  );
}
