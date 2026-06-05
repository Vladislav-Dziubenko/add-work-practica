import React, { useState, useEffect } from "react";
import { 
  Users, PlusCircle, Check, Send, Sparkles, MessageSquare, Terminal, Tag, UserCheck, Eye, ArrowLeft
} from "lucide-react";
import { ForumProject, UserSession } from "../types";

interface ForumSectionProps {
  currentUser: UserSession;
  onAlert: (msg: string, type: "success" | "error" | "info") => void;
  darkMode: boolean;
}

export default function ForumSection({ currentUser, onAlert, darkMode }: ForumSectionProps) {
  const [projects, setProjects] = useState<ForumProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter skills
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>("All");

  // Selection state
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // New posting form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [skillsString, setSkillsString] = useState(""); // Comma separated tags
  const [contacts, setContacts] = useState("");

  // New reply state
  const [replyText, setReplyText] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/forum");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
      onAlert("Не удалось загрузить проекты форума", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      onAlert("Заполните название проекта и описание!", "error");
      return;
    }

    const requiredSkills = skillsString
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          creator: currentUser.name,
          requiredSkills,
          contacts: contacts.trim() || "Telegram / Direct",
        }),
      });

      if (res.ok) {
        onAlert("Проект успешно опубликован на форуме!", "success");
        setNewTitle("");
        setNewDesc("");
        setSkillsString("");
        setContacts("");
        setShowCreateForm(false);
        fetchProjects();
      } else {
        onAlert("Не удалось создать публикацию", "error");
      }
    } catch (err) {
      onAlert("Ошибка сетевого соединения с сервером", "error");
    }
  };

  const handleJoinTeam = async (projId: string) => {
    try {
      const res = await fetch("/api/forum/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projId, username: currentUser.name }),
      });

      if (res.ok) {
        const data = await res.json();
        onAlert(data.message, "success");
        
        // Sync state locally
        setProjects(prev => prev.map(p => {
          if (p.id === projId) {
            return { ...p, teamMembers: data.teamMembers };
          }
          return p;
        }));
      }
    } catch (err) {
      onAlert("Ошибка выполнения действия", "error");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, projId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await fetch("/api/forum/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projId,
          author: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          text: replyText.trim(),
        }),
      });

      if (res.ok) {
        const reply = await res.json();
        
        // Sync replies locally
        setProjects(prev => prev.map(p => {
          if (p.id === projId) {
            return { ...p, replies: [...p.replies, reply] };
          }
          return p;
        }));

        setReplyText("");
        onAlert("Ответ успешно опубликован!", "success");
      }
    } catch (err) {
      onAlert("Ошибка отправки ответа", "error");
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Calculate unique skills tags for filtering
  const allSkills = ["All", ...Array.from(new Set(projects.flatMap(p => p.requiredSkills)))];

  const filteredProjects = selectedSkillFilter === "All"
    ? projects
    : projects.filter(p => p.requiredSkills.includes(selectedSkillFilter));

  return (
    <div id="forum-section" className="space-y-6">
      
      {/* HEADER CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className={`font-semibold text-lg ${darkMode ? "text-zinc-100" : "text-gray-900"}`}>
            Форум Поиска Команды в IT
          </h2>
        </div>

        <button
          id="toggle-create-project-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow"
        >
          <PlusCircle className="w-4 h-4" /> Разместить свой проект
        </button>
      </div>

      {/* POPUP / ACCORDION CREATE POSTING FORM */}
      {showCreateForm && (
        <div id="create-project-form" className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-indigo-900/40" : "bg-indigo-50/30 border-indigo-100"} transition-all`}>
          <h3 className={`font-semibold text-sm mb-3 ${darkMode ? "text-zinc-200" : "text-indigo-950"}`}>
            Создание новой заявки на поиск команды
          </h3>

          <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Название вашего IT проекта
                </label>
                <input 
                  id="project-title-input"
                  type="text" 
                  placeholder="Например, Чат-бот на ИИ для автоматизации кафедры"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                    darkMode 
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                      : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Необходимые Стек-теги (через запятую)
                </label>
                <input 
                  id="project-skills-input"
                  type="text" 
                  placeholder="React, TypeScript, FastAPI, Python"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                    darkMode 
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                      : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Описание затеи, цели и текущей стадии разработки
              </label>
              <textarea 
                id="project-desc-input"
                rows={4}
                placeholder="Расскажите какую проблему решает ваш проект, у кого какие роли и кого вы ищете..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none resize-none ${
                  darkMode 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Контактная информация (Telegram/Email/Discord)
              </label>
              <input 
                id="project-contacts-input"
                type="text" 
                placeholder="Telegram @vlad_student или worldofshipkruto@gmail.com"
                value={contacts}
                onChange={(e) => setContacts(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                  darkMode 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3.5 py-2 border border-zinc-700 bg-transparent text-zinc-400 rounded-lg text-xs font-semibold cursor-pointer hover:text-zinc-200"
              >
                Отмена
              </button>
              <button
                id="submit-project-btn"
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
              >
                Опубликовать Заявку
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER SKILL LIST */}
      {!activeProjectId && (
        <div className="flex flex-wrap items-center gap-1.5 pb-2">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mr-2">Стек:</span>
          {allSkills.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkillFilter(skill)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all uppercase tracking-wider ${
                selectedSkillFilter === skill
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* RENDER LOGIC */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-500 animate-pulse">Загрузка проектов...</div>
      ) : activeProject ? (
        
        /* DETAILED THREAD VIEW */
        <div id="expanded-project" className={`p-6 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-150"} shadow-sm transition-all`}>
          <button
            onClick={() => { setActiveProjectId(null); setReplyText(""); }}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-800/40 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к списку тем
          </button>

          <header className="border-b border-zinc-800/40 pb-4 mb-4 space-y-2">
            <h2 className={`text-xl font-bold tracking-tight ${darkMode ? "text-zinc-100" : "text-gray-900"}`}>
              {activeProject.title}
            </h2>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
              <span>Лидер проекта: <span className="text-indigo-400 font-semibold">{activeProject.creator}</span></span>
              <span>Опубликовано: {new Date(activeProject.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 pt-1">
              {activeProject.requiredSkills.map(skill => (
                <span key={skill} className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 space-y-4">
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${darkMode ? "bg-zinc-950/30 border-zinc-800 text-zinc-300" : "bg-gray-50 text-gray-800"}`}>
                <h4 className="font-bold mb-2">Общая концепция:</h4>
                <p className="whitespace-pre-line">{activeProject.description}</p>
              </div>

              {/* Discussion thread replies list */}
              <div className="space-y-4">
                <h4 className={`font-bold text-xs uppercase text-zinc-400 tracking-wider flex items-center gap-1`}>
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Переписка и обсуждение ({activeProject.replies.length})
                </h4>

                <div className="space-y-3">
                  {activeProject.replies.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 italic py-2">Здесь пока нет ответов. Напишите создателю, чтобы предложить сотрудничество!</p>
                  ) : (
                    activeProject.replies.map(rep => (
                      <div 
                        key={rep.id} 
                        className={`p-3 rounded-xl border text-xs ${
                          darkMode ? "bg-zinc-950/20 border-zinc-850" : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <img src={rep.avatarUrl} alt={rep.author} className="w-5 h-5 rounded-full object-cover" />
                            <span className={`font-bold ${darkMode ? "text-zinc-200" : "text-gray-900"}`}>{rep.author}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500">{new Date(rep.createdAt).toLocaleString()}</span>
                        </div>
                        <p className={darkMode ? "text-zinc-400" : "text-gray-750"}>{rep.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={(e) => handleReplySubmit(e, activeProject.id)} className="flex gap-2 pt-2">
                  <input 
                    id="reply-input"
                    type="text" 
                    placeholder="Напишите свои контакты или отзыв о затее..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                      darkMode 
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                        : "bg-white border-gray-200 text-gray-850 focus:border-indigo-500"
                    }`}
                    required
                  />
                  <button 
                    id="submit-reply-btn"
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Ответить
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar with Team Members & Contacts */}
            <div className="col-span-1 space-y-4">
              <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-gray-50/50 border-gray-150"}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider text-indigo-400`}>Контакты Связи:</h4>
                <p className="text-xs font-mono bg-zinc-950 p-2 rounded border border-zinc-800/80 text-emerald-400">{activeProject.contacts}</p>
              </div>

              <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-gray-50/50 border-gray-150"}`}>
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Команда ({activeProject.teamMembers.length})</h4>
                  <span className="text-[10px] text-zinc-500 bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">active</span>
                </div>

                <div className="space-y-1.5">
                  {activeProject.teamMembers.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span>{m}</span>
                      {m === activeProject.creator && (
                        <span className="text-[9px] text-zinc-500">(Основатель)</span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  id="join-team-btn"
                  onClick={() => handleJoinTeam(activeProject.id)}
                  className={`w-full mt-2 text-xs py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeProject.teamMembers.includes(currentUser.name)
                      ? "bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500/20"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {activeProject.teamMembers.includes(currentUser.name) ? (
                    <>Выйти из команды</>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Вступить в команду!
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

      ) : (
        
        /* GENERAL LIST RENDER */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-xl border border-dashed border-zinc-800">
              <p className="text-slate-400 text-xs">Проектов в данной категории стека пока не размещено.</p>
            </div>
          ) : (
            filteredProjects.map(p => (
              <div 
                key={p.id} 
                id={`project-card-${p.id}`}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  darkMode 
                    ? "bg-zinc-900 border-zinc-850 hover:border-zinc-700" 
                    : "bg-white border-gray-150 shadow-sm hover:border-indigo-400"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] text-zinc-500 font-medium bg-zinc-950 p-1.5 rounded border border-zinc-800/40">
                      Лидер: {p.creator}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Участников: <span className="text-emerald-400 font-bold">{p.teamMembers.length}</span>
                    </span>
                  </div>

                  <h3 
                    onClick={() => setActiveProjectId(p.id)}
                    className={`text-sm font-bold hover:text-indigo-400 transition-all cursor-pointer mb-2 line-clamp-1 ${
                      darkMode ? "text-zinc-100" : "text-gray-950"
                    }`}
                  >
                    {p.title}
                  </h3>

                  <p className={`text-xs line-clamp-3 mb-4 leading-relaxed ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>
                    {p.description}
                  </p>
                </div>

                <div className="border-t border-zinc-800/20 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1 max-w-[70%]">
                    {p.requiredSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[9px] font-bold uppercase tracking-wider bg-zinc-950 text-indigo-400 border border-zinc-850 px-1.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                    {p.requiredSkills.length > 3 && (
                      <span className="text-[9px] font-mono text-zinc-500">+{p.requiredSkills.length - 3}</span>
                    )}
                  </div>

                  <button
                    id={`view-proj-btn-${p.id}`}
                    onClick={() => { setActiveProjectId(p.id); setReplyText(""); }}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> Подробнее
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
