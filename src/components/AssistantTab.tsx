import React from "react";
import { Send, Sparkles, MessageSquare, Plus, Trash2, ArrowRight, User, Cpu } from "lucide-react";
import { ChatMessage, ChatThread, UserProfile } from "../types";

interface AssistantTabProps {
  chatHistory: ChatMessage[];
  chatThreads: ChatThread[];
  activeThreadId: string;
  onSendMessage: (text: string) => void;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  isSending: boolean;
  userProfile?: UserProfile;
}

export const AssistantTab: React.FC<AssistantTabProps> = ({
  chatHistory,
  chatThreads,
  activeThreadId,
  onSendMessage,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  isSending,
  userProfile,
}) => {
  const [inputText, setInputText] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const userName = userProfile?.name || "Valued Member";
  const firstName = userProfile?.name ? userProfile.name.split(" ")[0] : "there";

  const quickPrompts = [
    { label: "Analyze Budget & Outflows", text: `Hello FinSight AI, please run a detailed monthly budget surplus and expense leakage analysis for ${firstName}.` },
    { label: "Portfolio Risk & Rebalancing", text: `Evaluate my investment portfolio balance against my ${userProfile?.riskTolerance || "Moderate"} risk tolerance.` },
    { label: "Subscription & Recurring Audit", text: "Identify duplicate subscriptions or recurring costs I can consolidate to increase monthly savings." },
    { label: "Tax & Wealth Strategy", text: "What tax-saving strategies or retirement contribution steps should I consider this year?" }
  ];

  const handleSend = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div id="assistant-tab-view" className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Thread History Sidebar */}
      <div className="md:col-span-1 border-r border-slate-800 flex flex-col justify-between bg-slate-950/40 h-full">
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={onNewThread}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-500/10 hover:bg-sky-600 text-sky-400 hover:text-white rounded-xl text-xs font-bold border border-sky-500/20 hover:border-sky-500/10 shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat Thread
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatThreads.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectThread(t.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                activeThreadId === t.id
                  ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                  : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.title}</span>
              </div>

              {chatThreads.length > 1 && (
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDeleteThread(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 font-mono">FinSight AI Intelligence v2.0</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="md:col-span-3 flex flex-col justify-between h-full relative">
        {/* Messages Screen */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto my-auto">
              <div className="p-4 bg-sky-500/10 text-sky-400 rounded-3xl animate-bounce">
                <Sparkles className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Hello, {firstName}! 👋</h4>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Welcome to your personalized FinSight AI Terminal. I am synchronized with your active financial profile, real-time transaction ledgers, investment holdings, and goal targets.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 gap-2.5 w-full pt-4">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(p.text)}
                    className="flex justify-between items-center text-left p-3.5 bg-slate-950 hover:bg-sky-500/10 border border-slate-800 hover:border-sky-500/30 text-xs text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer group"
                  >
                    <span>{p.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((m) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={m.id}
                  className={`flex gap-4 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 shadow">
                      <Cpu className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed border shadow-md ${
                    isAssistant
                      ? "bg-slate-950/90 border-slate-800 text-slate-200"
                      : "bg-sky-600 text-white border-sky-500/30"
                  }`}>
                    {/* Render message formatting dynamically */}
                    <div className="whitespace-pre-line space-y-2">
                      {m.content}
                    </div>

                    {/* Grounding sources display */}
                    {isAssistant && m.data?.sources && m.data.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <span className="text-[10px] text-slate-400 font-mono block">LIVE GROUNDED SOURCES</span>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {m.data.sources.map((src: any, sIdx: number) => (
                            <a
                              key={sIdx}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5 underline"
                            >
                              [{sIdx + 1}] {src.title || "FinSight Grounding Reference"}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-200 shrink-0 font-bold text-xs shadow" title={userName}>
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Cpu className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 font-mono">
                Running financial telemetry analysis for {firstName}...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <form onSubmit={handleSend} className="relative flex gap-2">
            <input
              type="text"
              disabled={isSending}
              placeholder={`Ask FinSight AI anything, ${firstName}... (e.g., 'What is my current net worth?' or 'How can I save on taxes?')`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center justify-center shadow-lg shadow-sky-950/20 border border-sky-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

