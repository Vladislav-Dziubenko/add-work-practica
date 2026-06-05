import React, { useState, useEffect } from "react";
import { 
  Award, Bell, BookOpen, CheckSquare, FileText, LayoutDashboard, Plus, Send, Settings, Sparkles, User
} from "lucide-react";
import { Article, Notification, UserSession } from "../types";

interface AuthorSectionProps {
  currentUser: UserSession;
  onUpdateSession: (updated: UserSession) => void;
  onAlert: (msg: string, type: "success" | "error" | "info") => void;
  darkMode: boolean;
}

export default function AuthorSection({ currentUser, onUpdateSession, onAlert, darkMode }: AuthorSectionProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  
  // Create Article form state
  const [artTitle, setArtTitle] = useState("");
  const [artDesc, setArtDesc] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artCategory, setArtCategory] = useState<"programming" | "guides" | "lessons">("programming");

  // Interests editor state
  const [availableInterests] = useState(["JavaScript", "TypeScript", "React", "Python", "Secure Sharing", "Docker", "Algorithms", "C++"]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser.interests);

  const fetchCabinetData = async () => {
    try {
      const [notRes, recRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch(`/api/recommendations/${currentUser.username}`)
      ]);

      if (notRes.ok && recRes.ok) {
        setNotifications(await notRes.json());
        const recData = await recRes.json();
        setRecommendedArticles(recData.articles || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCabinetData();
  }, [currentUser]);

  const handleInterestToggle = (interest: string) => {
    let updated: string[];
    if (selectedInterests.includes(interest)) {
      updated = selectedInterests.filter(i => i !== interest);
    } else {
      updated = [...selectedInterests, interest];
    }
    setSelectedInterests(updated);
  };

  const handleSaveInterests = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          interests: selectedInterests,
        }),
      });

      if (res.ok) {
        const uSession = await res.json();
        onUpdateSession(uSession);
        onAlert("Персональные интересы обновлены!", "success");
      }
    } catch (err) {
      onAlert("Не удалось обновить настройки", "error");
    }
  };

  const handleCreateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artContent.trim() || !artDesc.trim()) {
      onAlert("Заполните все поля статьи!", "error");
      return;
    }

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: artTitle.trim(),
          description: artDesc.trim(),
          content: artContent,
          category: artCategory,
          author: currentUser.name,
          group: currentUser.group,
        }),
      });

      if (res.ok) {
        onAlert("Новый обучающий гайд успешно опубликован!", "success");
        setArtTitle("");
        setArtDesc("");
        setArtContent("");
        fetchCabinetData(); // Trigger recommendations / notifications reload
      } else {
        onAlert("Ошибка сохранения статьи", "error");
      }
    } catch (err) {
      onAlert("Сбой сотовой связи с сервером", "error");
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username }),
      });

      if (res.ok) {
        fetchCabinetData();
        onAlert("Все уведомления помечены прочитанными", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.readBy.includes(currentUser.username)).length;

  return (
    <div id="author-cabinet" className="space-y-6">
      
      {/* 1. STUDENT CABINET OVERVIEW HEADER */}
      <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-150"} shadow-sm transition-all`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-12 h-12 rounded-full border border-indigo-500/30 object-cover" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className={`font-bold text-base ${darkMode ? "text-zinc-100" : "text-gray-950"}`}>
                  Личный Кабинет Автора
                </h2>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>
                Студент: <span className="text-emerald-500 font-semibold">{currentUser.name}</span> • Группа: <span className="font-mono text-indigo-400">{currentUser.group}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-900 min-w-[100px]">
              <div className="text-indigo-400 font-bold text-sm">Группа</div>
              <div className="text-[10px] text-zinc-400 font-mono">IAFR 2503R</div>
            </div>
            
            <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-900 min-w-[100px]">
              <div className="text-emerald-500 font-bold text-sm">Разработчик</div>
              <div className="text-[10px] text-zinc-400">Dziubenko V.</div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE CABINET COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 columns: Article formulation & Interest selection */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Create Article Block */}
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-850" : "bg-white border-gray-150"} shadow-sm transition-all`}>
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-400" />
              <h3 className={`font-bold text-sm ${darkMode ? "text-zinc-100" : "text-gray-950"}`}>
                Опубликовать Обучающую Статью или Руководство
              </h3>
            </div>

            <form onSubmit={handleCreateArticleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-650"}`}>
                    Категория урока
                  </label>
                  <select
                    id="art-category-select"
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value as any)}
                    className={`w-full text-xs p-2 rounded-lg border outline-none ${
                      darkMode 
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                        : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                    }`}
                  >
                    <option value="programming">Кодинг (Programming)</option>
                    <option value="guides">Безопасность и Руководства</option>
                    <option value="lessons">Лекции и Уроки</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-650"}`}>
                    Заголовок публикации
                  </label>
                  <input 
                    id="art-title-input"
                    type="text" 
                    placeholder="Например, Подробный разбор алгоритмов поиска пути"
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    className={`w-full text-xs p-2 rounded-lg border outline-none ${
                      darkMode 
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                        : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-650"}`}>
                  Краткое поясняющее описание (превью в ленте)
                </label>
                <input 
                  id="art-desc-input"
                  type="text" 
                  placeholder="Вкратце опишите о чем гайд..."
                  value={artDesc}
                  onChange={(e) => setArtDesc(e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg border outline-none ${
                    darkMode 
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                      : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-650"}`}>
                  Содержимое статьи (с поддержкой Markdown)
                </label>
                <textarea 
                  id="art-content-input"
                  rows={6}
                  placeholder="# Введите текст статьи в удобном Markdown..."
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg border outline-none resize-none font-sans ${
                    darkMode 
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                      : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/40">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Статья будет автоматически закреплена за автором {currentUser.name}
                </span>
                
                <button
                  id="publish-art-btn"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Опубликовать
                </button>
              </div>
            </form>
          </div>

          {/* Interests & Recommendation Management Customizer */}
          <div id="interests-customizer" className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-850" : "bg-white border-gray-150"} shadow-sm transition-all`}>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-emerald-400" />
              <h3 className={`font-bold text-sm ${darkMode ? "text-zinc-100" : "text-gray-950"}`}>
                Настройка Интересов и Персональные Рекомендации
              </h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Выберите интересующие вас технологические темы. Наша рекомендательная ИИ система мгновенно подстроится и выведет на главный экран только наиболее подходящие под ваши стек-интересы лекции и гайды!
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {availableInterests.map(interest => (
                <button
                  key={interest}
                  id={`interest-tag-${interest}`}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                    selectedInterests.includes(interest)
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  {selectedInterests.includes(interest) ? "✓ " : ""} {interest}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                id="save-interests-btn"
                onClick={handleSaveInterests}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-100 font-semibold rounded-lg text-xs transition-all"
              >
                Сохранить Предпочтения
              </button>
            </div>
          </div>

        </div>

        {/* Right 4 columns: Platform Notifications & Live matches feed */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Notifications Panel */}
          <div id="notifications-panel" className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-850" : "bg-white border-gray-150"} shadow-sm transition-allSpace-y-4`}>
            <div className="flex items-center justify-between border-b border-zinc-800/20 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className={`font-bold text-xs uppercase tracking-wider ${darkMode ? "text-zinc-200" : "text-gray-900"}`}>
                  Уведомления ({unreadNotificationsCount})
                </h3>
              </div>
              
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={handleMarkNotificationsRead}
                  className="text-[10px] text-xs font-semibold text-indigo-400 hover:underline"
                >
                  Прочитать все
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-[11px] text-zinc-500 italic py-2">Свежих системных уведомлений нет.</p>
              ) : (
                notifications.map(n => {
                  const isUnread = !n.readBy.includes(currentUser.username);
                  return (
                    <div 
                      key={n.id}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        isUnread 
                          ? darkMode 
                            ? "bg-indigo-500/10 border-indigo-500/30" 
                            : "bg-indigo-50 border-indigo-100"
                          : darkMode 
                            ? "bg-zinc-950/40 border-zinc-900/60" 
                            : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-bold text-[11px] ${isUnread ? "text-indigo-400" : "text-zinc-400"}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-zinc-500">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className={`text-[11px] mt-1 ${darkMode ? "text-zinc-400" : "text-gray-650"}`}>
                        {n.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick recommendations summary */}
          <div id="ai-recs-panel" className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-850" : "bg-white border-gray-150"} shadow-sm transition-all`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 border-b border-zinc-800/20 pb-2 mb-3`}>
              <Sparkles className="w-4 h-4" />
              Рекомендованные вам уроки
            </h4>

            {recommendedArticles.length === 0 ? (
              <p className="subtitle-caption text-[11px] text-zinc-500">Добавьте больше тэгов в предпочтения для генерации персональных рекомендаций!</p>
            ) : (
              <div className="space-y-3">
                {recommendedArticles.map(art => (
                  <div 
                    key={art.id} 
                    className={`p-3 rounded-xl border text-xs ${
                      darkMode ? "bg-zinc-950/60 border-zinc-850" : "bg-gray-50/50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-950 px-1 py-0.5 rounded text-indigo-400">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-zinc-500">Автор: {art.author}</span>
                    </div>
                    <span className={`font-semibold text-xs leading-snug hover:text-indigo-400 transition-all cursor-pointer truncate block ${darkMode ? "text-zinc-200" : "text-gray-850"}`}>
                      {art.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
