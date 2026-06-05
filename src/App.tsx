import React, { useState, useEffect } from "react";
import { 
  File, BookOpen, Users, User, Bot, FileText, Sun, Moon, Bell, LogIn, Award, ShieldAlert, CheckCircle, Info, X
} from "lucide-react";
import { UserSession } from "./types";

// Import custom sub-modules
import FileShareSection from "./components/FileShareSection";
import LearningSection from "./components/LearningSection";
import ForumSection from "./components/ForumSection";
import AuthorSection from "./components/AuthorSection";
import AiAssistant from "./components/AiAssistant";
import UniversityReport from "./components/UniversityReport";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>("learning");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Registration Dialog inputs
  const [regUsername, setRegUsername] = useState("vlad_student");
  const [regName, setRegName] = useState("Dziubenko Vladyslav");
  const [regRole, setRegRole] = useState<"student" | "author">("author");
  const [regInterests, setRegInterests] = useState<string[]>(["JavaScript", "TypeScript", "React", "Python", "Secure Sharing"]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Platform Notification indicator
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Alert dismiss timer
  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Synchronise system login / session
  const executeLogin = async (username: string, name?: string, role?: string, interests?: string[]) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, role, interests })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        localStorage.setItem("edu_share_username", data.username);
        showAlert(`Добро пожаловать, ${data.name}! Сессия авторизована.`, "success");
      }
    } catch (err) {
      console.error(err);
      showAlert("Не удалось подключиться к серверу авторизации", "error");
    }
  };

  // Check existing session on boot
  useEffect(() => {
    const savedUser = localStorage.getItem("edu_share_username");
    if (savedUser) {
      executeLogin(savedUser);
    } else {
      // Auto-login default Vladyslav user so the sandbox works instantly with zero setup
      executeLogin("vlad_student", "Dziubenko Vladyslav", "author", ["JavaScript", "TypeScript", "React", "Python", "Secure Sharing"]);
    }
  }, []);

  // Fetch unread notifications count regularly
  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const notifs = await res.json();
        const unread = notifs.filter((n: any) => !n.readBy.includes(currentUser.username)).length;
        setUnreadNotifCount(unread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 8000); // Poll notifications list
    return () => clearInterval(interval);
  }, [currentUser]);

  // Apply visual theme to html element for Tailwind compatibility
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      darkMode ? "bg-[#0A0A0B] text-[#E4E4E7]" : "bg-[#fcfcfd] text-[#121214]"
    }`}>
      
      {/* GLOBAL TOAST NOTICE FEED */}
      {toast && (
        <div 
          id="global-toast"
          className="fixed top-5 right-5 z-55 flex items-center gap-2 p-3.5 rounded-xl border shadow-xl animate-bounce text-xs font-semibold backdrop-blur"
          style={{
            backgroundColor: darkMode ? "rgba(18, 18, 20, 0.95)" : "rgba(255, 255, 255, 0.95)",
            borderColor: toast.type === "success" ? "#10b981" : toast.type === "error" ? "#ef4444" : "#3b82f6"
          }}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          {toast.type === "error" && <ShieldAlert className="w-4 h-4 text-red-500" />}
          {toast.type === "info" && <Info className="w-4 h-4 text-blue-500" />}
          
          <span className={darkMode ? "text-zinc-200" : "text-gray-800"}>{toast.message}</span>
          
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      )}

      {/* INSTITUTIONAL BRANDING HEADER */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-all duration-200 ${
        darkMode ? "bg-[#121214] border-zinc-800 text-[#E4E4E7]" : "bg-white border-gray-200 text-gray-900"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif italic font-bold text-indigo-400">EduSecureShare</h1>
              <span className="text-[9px] font-mono tracking-wider bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase">
                IAFR 2503R
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">
              Knowledge & Secure Exchange Platform • Курсовой проект • D. Vladyslav
            </p>
          </div>

          {/* MASTER MENU BUTTONS */}
          <nav className={`hidden md:flex items-center gap-6 ${darkMode ? "text-zinc-400" : "text-gray-600"}`}>
            <button
              onClick={() => setActiveTab("learning")}
              className={`pb-1 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "learning" 
                  ? "text-indigo-400 border-b-2 border-indigo-400" 
                  : darkMode ? "hover:text-white" : "hover:text-black"
              }`}
            >
              База Знаний
            </button>

            <button
              onClick={() => setActiveTab("files")}
              className={`pb-1 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "files" 
                  ? "text-indigo-400 border-b-2 border-indigo-400" 
                  : darkMode ? "hover:text-white" : "hover:text-black"
              }`}
            >
              Обмен Файлами
            </button>

            <button
              onClick={() => setActiveTab("forum")}
              className={`pb-1 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "forum" 
                  ? "text-indigo-400 border-b-2 border-indigo-400" 
                  : darkMode ? "hover:text-white" : "hover:text-black"
              }`}
            >
              IT Форум
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab("cabinet")}
                className={`pb-1 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer relative ${
                  activeTab === "cabinet" 
                    ? "text-indigo-400 border-b-2 border-indigo-400" 
                    : darkMode ? "hover:text-white" : "hover:text-black"
                }`}
              >
                <span>Кабинет</span>
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab("assistant")}
              className={`pb-1 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "assistant" 
                  ? "text-indigo-400 border-b-2 border-indigo-400" 
                  : darkMode ? "hover:text-white" : "hover:text-black"
              }`}
            >
              ИИ Ассистент
            </button>

            <button
              onClick={() => setActiveTab("report")}
              className={`pb-1 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "report" 
                  ? "text-indigo-400 border-b-2 border-indigo-400" 
                  : darkMode ? "hover:text-white" : "hover:text-black"
              }`}
            >
              Отчет (IAFR)
            </button>
          </nav>

          {/* CONTROLS PROFILE & THEME BUTTONS */}
          <div className="flex items-center gap-3">
            
            {/* Dark theme toggle button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                darkMode ? "border-zinc-800 bg-[#0E0E10] text-yellow-400 hover:bg-zinc-800" : "border-gray-200 bg-white text-zinc-600 hover:bg-gray-100"
              }`}
              title={darkMode ? "Включить дневную тему" : "Включить ночную тему"}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Simulated User identity badge */}
            {currentUser ? (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 border rounded-full hidden sm:flex ${
                darkMode ? "border-zinc-800 bg-[#0E0E10]" : "border-gray-200 bg-white"
              }`}>
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-indigo-505" />
                <div className="text-left font-sans">
                  <div className={`text-[10px] font-bold leading-none ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>{currentUser.name}</div>
                  <div className="text-[8px] text-zinc-500 font-mono leading-none mt-0.5">{currentUser.group}</div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => executeLogin("guest", "Гость Кафедры", "guest")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-[#4f46e5] text-white text-xs font-semibold rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5" /> Войти
              </button>
            )}
          </div>
        </div>

        {/* MOBILE NAVIGATION RAIL */}
        <div className={`md:hidden flex items-center justify-around border-t px-1 py-1.5 text-[10px] ${
          darkMode ? "border-zinc-800 bg-[#0C0C0E] text-zinc-400" : "border-gray-200 bg-white text-gray-500"
        }`}>
          <button 
            onClick={() => setActiveTab("learning")} 
            className={`flex flex-col items-center p-1.5 ${activeTab === "learning" ? "text-indigo-400 font-bold" : ""}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Знания</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("files")} 
            className={`flex flex-col items-center p-1.5 ${activeTab === "files" ? "text-indigo-400 font-bold" : ""}`}
          >
            <File className="w-4 h-4" />
            <span>Файлы</span>
          </button>

          <button 
            onClick={() => setActiveTab("forum")} 
            className={`flex flex-col items-center p-1.5 ${activeTab === "forum" ? "text-indigo-400 font-bold" : ""}`}
          >
            <Users className="w-4 h-4" />
            <span>Форум</span>
          </button>

          <button 
            onClick={() => setActiveTab("cabinet")} 
            className={`flex flex-col items-center p-1.5 ${activeTab === "cabinet" ? "text-indigo-400 font-bold" : ""}`}
          >
            <User className="w-4 h-4" />
            <span>Личный</span>
          </button>

          <button 
            onClick={() => setActiveTab("assistant")} 
            className={`flex flex-col items-center p-1.5 ${activeTab === "assistant" ? "text-indigo-400 font-bold" : ""}`}
          >
            <Bot className="w-4 h-4" />
            <span>ИИ Ассистент</span>
          </button>

          <button 
            onClick={() => setActiveTab("report")} 
            className={`flex flex-col items-center p-1.5 ${activeTab === "report" ? "text-indigo-400 font-bold" : ""}`}
          >
            <FileText className="w-4 h-4" />
            <span>Отчет</span>
          </button>
        </div>
      </header>

      {/* REGISTRATION OVERLAY (Shown if user specifically clears local storage / wants custom profile name) */}
      {!currentUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`p-6 rounded-2xl border w-full max-w-md ${
            darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
          }`}>
            <h3 className="font-serif italic text-lg font-bold mb-2">Настройка Профиля Студента / Автора</h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Этот ресурс предназначен для группы **IAFR 2503R**. Войдите под своим именем, чтобы получить доступ к защищенному диску и разделу рекомендаций статей.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); executeLogin(regUsername, regName, regRole, regInterests); }} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-semibold">Никнейм в системе (username):</label>
                <input 
                  type="text" 
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border outline-none bg-zinc-950 border-zinc-850"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-semibold">ФИО студента (будет лицом автора):</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border outline-none bg-zinc-950 border-zinc-850"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-semibold">Ролевая принадлежность:</label>
                <select 
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border outline-none bg-zinc-950 border-zinc-850 text-zinc-200"
                >
                  <option value="author">Автор (Студент-Публикатор)</option>
                  <option value="student">Слушатель (Только учебный диск)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
              >
                Сохранить и войти на портал
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CORE DISPLAY WINDOW VIEW */}
      {currentUser && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="transition-all duration-300">
            {activeTab === "learning" && (
              <LearningSection 
                currentUser={currentUser} 
                onAlert={showAlert} 
                darkMode={darkMode} 
              />
            )}

            {activeTab === "files" && (
              <FileShareSection 
                currentUser={currentUser} 
                onAlert={showAlert} 
                darkMode={darkMode} 
              />
            )}

            {activeTab === "forum" && (
              <ForumSection 
                currentUser={currentUser} 
                onAlert={showAlert} 
                darkMode={darkMode} 
              />
            )}

            {activeTab === "cabinet" && (
              <AuthorSection 
                currentUser={currentUser} 
                onUpdateSession={(updated) => setCurrentUser(updated)}
                onAlert={showAlert} 
                darkMode={darkMode} 
              />
            )}

            {activeTab === "assistant" && (
              <AiAssistant 
                currentUser={currentUser} 
                onAlert={showAlert} 
                darkMode={darkMode} 
              />
            )}

            {activeTab === "report" && (
              <UniversityReport 
                darkMode={darkMode} 
                onAlert={showAlert} 
              />
            )}
          </div>
        </main>
      )}

      {/* ACADEMIC STANDARD INSTITUTION FOOTER */}
      <footer className={`border-t py-6 mt-12 px-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-wider ${
        darkMode ? "bg-[#0E0E10] border-zinc-850 text-zinc-505" : "bg-gray-50 border-gray-150 text-gray-500"
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center w-full gap-4 text-[10px] tracking-widest text-zinc-500 font-mono">
          <div>
            <span>SYSTEM ARCHITECTURE: [ FRONTEND: REACT | BACKEND: NODE.JS | STORAGE: IN-MEMORY | AI: GEMINI 3.5 FLASH ]</span>
          </div>
          <div>
            © 2026 EduSecureShare • Dziubenko Vladyslav • University Report Ref: 2503R-01
          </div>
        </div>
      </footer>

    </div>
  );
}
