import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  MoreVertical, 
  Bot, 
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      // Optional: Add error message to UI
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans selection:bg-pink-100">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 288 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-slate-50 border-r border-slate-200 overflow-hidden flex flex-col transition-all duration-300"
      >
        <div className="p-4 flex flex-col h-full">
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-pink-200 text-pink-500 rounded-xl font-semibold shadow-sm hover:bg-pink-50 transition-colors mb-6"
          >
            <Plus size={20} />
            New Chat
          </button>
          
          <div className="flex-1 overflow-y-auto px-1 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Recent Conversations
            </div>
            {messages.length === 0 && (
              <div className="text-sm text-slate-400 px-2 italic">
                No recent conversations
              </div>
            )}
            {messages.filter(m => m.role === 'user').slice(-5).reverse().map((m, idx) => (
              <div 
                key={m.id} 
                className={cn(
                  "p-3 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-3 transition-colors truncate",
                  idx === 0 ? "bg-pink-50 border border-pink-100 text-slate-700" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Trash2 size={16} className={cn(idx === 0 ? "text-pink-400" : "opacity-0")} />
                <span className="truncate">{m.content}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto p-4 -mx-4 -mb-4 bg-slate-100/50 flex items-center gap-3 border-t border-slate-200">
            <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-slate-800 truncate">Jane Doe</div>
              <div className="text-xs text-slate-500 truncate">Pro Plan</div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
            >
              <PanelLeftOpen size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Sleek<span className="text-pink-500">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                v4.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Ready
            </div>
            <button className="p-2 text-slate-400 hover:text-pink-500 transition-colors">
              <Sparkles size={20} />
            </button>
          </div>
        </header>

        {/* Chat Window */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-8 space-y-6 scroll-smooth bg-white"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                <Bot size={48} className="text-pink-500 mx-auto" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sleek Intelligence</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Experience professional AI assistance refined for performance and clarity.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                {["Explain quantum physics", "Write a marketing plan", "Debug my React code", "System health check"].map((txt) => (
                  <button 
                    key={txt}
                    onClick={() => setInput(txt)} 
                    className="p-4 text-xs font-medium border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-left text-slate-600 hover:border-pink-200"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex w-full gap-4 max-w-4xl mx-auto",
                  m.role === "user" ? "justify-end" : "justify-start items-start"
                )}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={18} className="text-slate-500" />
                  </div>
                )}
                
                <div className={cn(
                  "flex flex-col gap-2",
                  m.role === "user" ? "items-end max-w-[70%]" : "items-start max-w-[75%]"
                )}>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    m.role === "user" 
                      ? "bg-pink-500 text-white rounded-tr-none" 
                      : "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none"
                  )}>
                    <div className={cn(
                      "prose prose-sm max-w-none",
                      m.role === "user" ? "prose-invert" : "prose-slate"
                    )}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                  
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-3 ml-1">
                      <button 
                        onClick={() => copyToClipboard(m.content, m.id)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-pink-500 transition-colors uppercase tracking-wider"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider">
                        Regenerate
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-center gap-4 max-w-4xl mx-auto"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse"></div>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <div className="absolute left-4 flex gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-lg">
                <Plus size={20} />
              </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              className="w-full pl-16 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all text-sm shadow-inner"
            />
            <div className="absolute right-3">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95",
                  input.trim() 
                    ? "bg-pink-500 text-white shadow-pink-200 hover:bg-pink-600" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                )}
              >
                Send
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest font-bold">
            Powered by Gemini Engine • Experimental Enterprise Mode
          </p>
        </div>
      </main>
    </div>
  );
}
