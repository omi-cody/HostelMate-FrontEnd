import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm HostelMate Assistant I can help you find a hostel, explain the booking process, or answer any questions about staying in Kathmandu. What would you like to know?",
    },
  ]);
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!user || user.role !== 'STUDENT') return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Send history minus the initial greeting to keep context window small
      const history = newMessages.slice(1).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await studentService.chat(text, history.slice(0, -1));
      const reply = res?.data?.reply || res?.reply || 'Sorry, I could not get a response.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const suggestions = [
    'Which hostels are near Tribhuvan University?',
    'How do I pay the admission fee?',
    'What is the booking process?',
    'Can I visit before applying?',
  ];

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
          title="Chat with HostelMate Assistant"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[560px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500 text-white">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">HostelMate Assistant</p>
              <p className="text-xs text-cyan-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                Online
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50" style={{ maxHeight: 380 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-cyan-600" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-cyan-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions (show only on first message) */}
          {messages.length === 1 && !loading && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 bg-gray-50 border-t border-gray-100">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-cyan-400 hover:text-cyan-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-200 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-xl border border-transparent focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors placeholder-gray-400 disabled:opacity-60"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}