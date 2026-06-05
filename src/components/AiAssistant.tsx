import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, Trash2, Bot, User, Cpu, Code, ShieldAlert, Check, HelpCircle
} from "lucide-react";
import { ChatMessage, UserSession } from "../types";

interface AiAssistantProps {
  currentUser: UserSession;
  onAlert: (msg: string, type: "success" | "error" | "info") => void;
  darkMode: boolean;
}

export default function AiAssistant({ currentUser, onAlert, darkMode }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`/api/assistant/chat/${currentUser.username}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [currentUser]);

  // Autoscroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    // Append user message instantly on client for native response flow
    const userMsg: ChatMessage = {
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          message: textToSend.trim()
        })
      });

      if (res.ok) {
        const reply = await res.json();
        setMessages(prev => [...prev, reply]);
      } else {
        onAlert("Превышен лимит запросов к ИИ", "error");
      }
    } catch (err) {
      onAlert("Ошибка подключения к ИИ-серверу", "error");
    } finally {
      setIsSending(false);
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Quick preloaded dialogues to query
  const quickChips = [
    { label: "🔑 Защита файлов", text: "Как устроена защита файлов паролем в нашем проекте?" },
    { label: "💻 Шаблон кода на TS", text: "Дай пример простой функции на TypeScript для шифрования данных" },
    { label: "📂 Структура проекта", text: "Опиши кратко файловую архитектуру этого веб-приложения для отчета" },
    { label: "🐳 Введение в Docker", text: "Объясни основы Docker простыми словами и напиши пример Dockerfile" }
  ];

  return (
    <div id="ai-tutor-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Left 1 Column: Visual Helper profile & Instructions */}
      <div className="lg:col-span-1 space-y-4">
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-150"} shadow-sm transition-all text-center`}>
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center mb-3 shadow">
            <Bot className="w-8 h-8 text-white" />
          </div>

          <p className={`text-xs font-mono px-2 py-0.5 inline-block rounded-full bg-emerald-500/10 text-emerald-400 font-bold mb-3`}>
            ● Online | Gemini Intel
          </p>

          <h3 className={`font-bold text-sm ${darkMode ? "text-zinc-100" : "text-gray-900"}`}>
            ИИ Консультант
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
            Ваш встраиваемый академический ассистент по веб-технологиям. Знает всё о безопасности обмена данными и языках программирования.
          </p>

          <div className="border-t border-zinc-800/15 my-4 pt-4 text-left space-y-2 text-[10px] text-zinc-400">
            <div className="flex items-center gap-1.5 font-medium text-indigo-400">
              <Cpu className="w-3.5 h-3.5" /> Стек Архитектура:
            </div>
            <p>Модель: <code className="text-zinc-300 font-semibold bg-zinc-900 px-1 py-0.5 rounded">gemini-3.5-flash</code></p>
            <p>История диалогов сохраняется в облачную память сессии в реальном времени.</p>
          </div>
        </div>

        {/* Quick prompt templates to guide student */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-150"} shadow`}>
          <h4 className={`text-xs font-extrabold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1`}>
            <HelpCircle className="w-3.5 h-3.5" /> Быстрые Вопросы:
          </h4>
          <div className="space-y-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                id={`quick-chip-${idx}`}
                onClick={() => handleQuickPromptClick(chip.text)}
                disabled={isSending}
                className={`w-full text-left p-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border block ${
                  darkMode 
                    ? "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700" 
                    : "bg-gray-50 border-gray-100 text-gray-750 hover:bg-gray-100"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right 3 Columns: Real Chat Engine */}
      <div className="lg:col-span-3 flex flex-col justify-between h-[520px]">
        {/* Chat Message Window Area */}
        <div className={`p-5 rounded-2xl border flex-1 overflow-y-auto space-y-4 mb-4 ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-150 shadow-sm"
        }`}>
          {messages.map((m, idx) => {
            const isBot = m.role === "model";
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto text-left" : "ml-auto text-right flex-row-reverse"}`}
              >
                {/* Visual Circle Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                  isBot 
                    ? "bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white" 
                    : "bg-zinc-800 text-zinc-100"
                }`}>
                  {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message balloon */}
                <div>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isBot 
                      ? darkMode 
                        ? "bg-zinc-950 text-zinc-300 border border-zinc-850" 
                        : "bg-gray-100/80 text-gray-800 border border-gray-200/50"
                      : "bg-indigo-600 text-white"
                  }`}>
                    {/* Simplified markdown support renderer inside browser for code and italic styles */}
                    <div className="whitespace-pre-wrap select-text markdown-body">
                      {m.text}
                    </div>
                  </div>
                  
                  <span className="text-[9px] text-zinc-500 mt-1 block px-1">
                    {isBot ? "Виртуальный Помощник" : currentUser.name} • {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Animated loading bubble when processing */}
          {isSending && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className={`p-3 rounded-xl text-xs font-mono text-zinc-400 border border-dashed border-zinc-700 bg-zinc-950`}>
                ИИ обдумывает ответ
                <span className="animate-pulse">..</span>
                <span className="animate-ping">.</span>
              </div>
            </div>
          )}

          {/* Target for autoscroll */}
          <div ref={chatEndRef} />
        </div>

        {/* Form and Prompt Input box */}
        <form onSubmit={submitForm} className="flex gap-2.5">
          <input 
            id="ai-prompt-input"
            type="text" 
            placeholder="Задайте вопрос по программированию или попросите исправить ошибку..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            required
            className={`w-full text-xs p-3 rounded-xl border outline-none ${
              darkMode 
                ? "bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                : "bg-white border-gray-150 text-gray-800 focus:border-indigo-500 shadow-sm"
            }`}
          />
          <button 
            id="ai-send-btn"
            type="submit"
            disabled={isSending}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Отправить
          </button>
        </form>
      </div>

    </div>
  );
}
