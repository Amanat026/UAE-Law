import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, Sparkles, Globe, BookOpen } from 'lucide-react';
import { sendChatMessage } from './ai/client';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I am your UAE Legal and Regulatory Advisor. How can I assist you with UAE laws (ICP, MOHRE, traffic, tenancy, visa) today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      let assistantResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      
      await sendChatMessage(newMessages, language, (chunk) => {
        assistantResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantResponse;
          return updated;
        });
      });
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Error: " + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-500 p-2 rounded-xl text-white shadow-lg bg-blue-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">UAE Law AI Assistant</h1>
            <p className="text-xs text-slate-400">Expert guidance on UAE Regulations & Labor Law</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 text-xs border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>
      </header>

      <div className="bg-amber-950/40 border-b border-amber-900/50 px-4 py-2 text-xs text-amber-200 flex items-center space-x-2">
        <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Disclaimer: AI-powered guidance for informational purposes only. Consult legal professionals for official advice.</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-slate-700'}`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about UAE Visa, Labor, or Tenancy Law..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-600 transition"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-xl transition flex items-center justify-center shadow-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
