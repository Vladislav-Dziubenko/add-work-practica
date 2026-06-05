import React, { useState, useEffect } from "react";
import { 
  BookOpen, ThumbsUp, ThumbsDown, MessageSquare, ChevronRight, Book, Clock, User, Award, ArrowLeft, Send
} from "lucide-react";
import { Article, Book as InfoBook, UserSession } from "../types";

interface LearningSectionProps {
  currentUser: UserSession;
  onAlert: (msg: string, type: "success" | "error" | "info") => void;
  darkMode: boolean;
}

export default function LearningSection({ currentUser, onAlert, darkMode }: LearningSectionProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [books, setBooks] = useState<InfoBook[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Detailed Views
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeBookChapterIdx, setActiveBookChapterIdx] = useState<number>(0);

  // New Comment State
  const [commentText, setCommentText] = useState("");

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const [artRes, bookRes] = await Promise.all([
        fetch("/api/articles"),
        fetch("/api/books")
      ]);

      if (artRes.ok && bookRes.ok) {
        const artData = await artRes.json();
        const bookData = await bookRes.json();
        setArticles(artData);
        setBooks(bookData);
      }
    } catch (err) {
      console.error(err);
      onAlert("Не удалось загрузить учебные материалы", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, []);

  const handleVote = async (articleId: string, voteType: "up" | "down") => {
    try {
      const res = await fetch("/api/articles/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: articleId,
          username: currentUser.username,
          voteType
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update local status
        setArticles(prev => prev.map(art => {
          if (art.id === articleId) {
            return {
              ...art,
              rating: data.rating,
              votedUsers: { ...art.votedUsers, [currentUser.username]: data.userVote }
            };
          }
          return art;
        }));

        onAlert(data.userVote ? "Рейтинг изменен!" : "Голос отозван!", "success");
      }
    } catch (err) {
      onAlert("Не удалось отправить голос", "error");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, articleId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch("/api/articles/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: articleId,
          author: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          text: commentText.trim(),
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        
        // Update comments locally
        setArticles(prev => prev.map(art => {
          if (art.id === articleId) {
            return { ...art, comments: [...art.comments, comment] };
          }
          return art;
        }));

        setCommentText("");
        onAlert("Комментарий успешно озаглавлен!", "success");
      }
    } catch (err) {
      onAlert("Ошибка сохранения комментария", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeArticle = articles.find(a => a.id === activeArticleId);
  const activeBook = books.find(b => b.id === activeBookId);

  // Filter computation
  const filteredArticles = selectedCategory === "all" 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div id="learning-section" className="space-y-6">
      
      {/* SECTION SELECTORS */}
      {(!activeArticleId && !activeBookId) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-zinc-950/40 p-1 rounded-xl border border-zinc-800/60 transition-all">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "all" 
                  ? "bg-indigo-600 text-white shadow" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Все Материалы
            </button>
            <button
              onClick={() => setSelectedCategory("programming")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "programming" 
                  ? "bg-indigo-600 text-white shadow" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Кодинг
            </button>
            <button
              onClick={() => setSelectedCategory("guides")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "guides" 
                  ? "bg-indigo-600 text-white shadow" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Руководства
            </button>
            <button
              onClick={() => setSelectedCategory("lessons")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "lessons" 
                  ? "bg-indigo-600 text-white shadow" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Уроки
            </button>
          </div>

          <p className="text-xs text-zinc-500 font-medium">
            Обменивайтесь знаниями с поддержкой рейтингов контента.
          </p>
        </div>
      )}

      {activeArticle ? (
        /* DETAILED ARTICLE VIEW */
        <div id="expanded-article" className={`p-8 rounded-2xl border ${darkMode ? "bg-[#121214] border-zinc-800" : "bg-white border-gray-150"} shadow-sm transition-all`}>
          <button
            onClick={() => setActiveArticleId(null)}
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-400 transition-all border border-zinc-805/40 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к списку
          </button>

          <header className="space-y-3 border-b border-zinc-850/15 pb-5 mb-5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md">
              #{activeArticle.category}
            </span>
            <h1 className={`text-3xl font-serif italic font-light tracking-tight ${darkMode ? "text-indigo-300" : "text-gray-950"}`}>
              {activeArticle.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500 items-center">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {activeArticle.author} {activeArticle.group && `(${activeArticle.group})`}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readTime} чтения</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-500" /> Рейтинг: {activeArticle.rating}</span>
            </div>
          </header>

          <div className={`prose max-w-none text-sm leading-relaxed whitespace-pre-line mb-8 font-sans ${darkMode ? "text-zinc-350" : "text-gray-800"}`}>
            {activeArticle.content}
          </div>

          {/* Comment & Votes section */}
          <section className="border-t border-zinc-800/15 pt-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className={`font-semibold text-sm ${darkMode ? "text-zinc-200" : "text-gray-800"}`}>
                Обсуждение ({activeArticle.comments.length})
              </h3>

              {/* Voting buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Оцените материал:</span>
                <button
                  onClick={() => handleVote(activeArticle.id, "up")}
                  className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                    activeArticle.votedUsers[currentUser.username] === "up"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : "border-zinc-800 bg-[#0E0E10] text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Полезно"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> +1
                </button>
                <button
                  onClick={() => handleVote(activeArticle.id, "down")}
                  className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                    activeArticle.votedUsers[currentUser.username] === "down"
                      ? "bg-red-500/10 border-red-500/40 text-red-400"
                      : "border-zinc-800 bg-[#0E0E10] text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Бесполезно"
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> -1
                </button>
              </div>
            </div>

            {/* List existing comments */}
            <div className="space-y-4">
              {activeArticle.comments.length === 0 ? (
                <p className="text-[11px] text-zinc-500 italic py-2">Материал пока никто не обсуждал. Напишите первый комментарий.</p>
              ) : (
                <div className="space-y-3">
                  {activeArticle.comments.map(c => (
                    <div 
                      key={c.id} 
                      className={`p-3 rounded-xl border text-xs ${
                        darkMode ? "bg-[#0E0E10] border-zinc-800" : "bg-gray-50/50 border-gray-150"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img src={c.avatarUrl} alt={c.author} className="w-5 h-5 rounded-full object-cover" />
                          <span className={`font-semibold ${darkMode ? "text-zinc-300" : "text-gray-800"}`}>{c.author}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className={`${darkMode ? "text-zinc-400" : "text-gray-650"}`}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Comments Form */}
            <form onSubmit={(e) => handleCommentSubmit(e, activeArticle.id)} className="flex gap-2">
              <input 
                id="comment-input"
                type="text" 
                placeholder="Поделитесь опытом или задайте автору вопрос по материалу..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                  darkMode 
                    ? "bg-[#0E0E10] border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-indigo-505"
                }`}
                required
              />
              <button 
                id="comment-submit-btn"
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Отправить
              </button>
            </form>
          </section>
        </div>

      ) : activeBook ? (
        /* DETAILED DIGITAL BOOK TERMINAL */
        <div id="expanded-book" className={`p-6 rounded-2xl border ${darkMode ? "bg-[#121214] border-zinc-800" : "bg-white border-gray-150"} shadow-sm transition-all`}>
          <div className="flex items-center justify-between mb-4 border-b border-zinc-850/15 pb-3">
            <button
              onClick={() => { setActiveBookId(null); setActiveBookChapterIdx(0); }}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-400 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Обратно в библиотеку
            </button>
            <span className="text-xs font-mono text-zinc-500">Автор учебных глав: {activeBook.author}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Chapters index */}
            <div className="md:col-span-1 space-y-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-zinc-400" : "text-gray-650"}`}>
                Содержание книги
              </h4>
              <div className="space-y-1">
                {activeBook.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    id={`chapter-tab-${idx}`}
                    onClick={() => setActiveBookChapterIdx(idx)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      activeBookChapterIdx === idx 
                        ? "bg-indigo-600 text-white" 
                        : darkMode 
                          ? "bg-[#0E0E10] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" 
                          : "bg-gray-100/50 text-gray-650 hover:bg-gray-150"
                    }`}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Chapter content */}
            <div className="md:col-span-3 space-y-4">
              <div className={`p-5 rounded-xl border min-h-[300px] ${darkMode ? "bg-zinc-950/80 border-zinc-850" : "bg-gray-50 border-gray-150"} transition-all`}>
                <h3 className={`text-sm font-semibold mb-3 pb-2 border-b border-zinc-900/10 ${darkMode ? "text-emerald-400 border-zinc-800" : "text-gray-800 border-gray-200"}`}>
                  {activeBook.chapters[activeBookChapterIdx]?.title || "Глава"}
                </h3>
                
                <pre className={`text-xs font-mono whitespace-pre-wrap leading-relaxed ${darkMode ? "text-zinc-300" : "text-gray-700"}`}>
                  {activeBook.chapters[activeBookChapterIdx]?.text || "Пустое содержание главы."}
                </pre>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Вы можете скопировать данные примеры кода и вставить во встраиваемый терминал нашего ИИ ассистента, чтобы получить подробное научное описание алгоритмов!</span>
              </div>
            </div>
          </div>
        </div>

      ) : (
        /* ARTICLES & BOOKS OVERVIEW LIST */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-zinc-850/15 pt-6">
          
          {/* Main article stream: Left 8 cols */}
          <div className="lg:col-span-8 space-y-4 pr-0 lg:pr-6 lg:border-r border-zinc-850/15">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-3xl font-serif italic font-light leading-none">Content Hub</h2>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Showing: Refined Resources</div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-zinc-800">
                <p className="text-xs text-zinc-400 font-medium">В этой категории пока отсутствуют публикации.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((art) => (
                  <article 
                    key={art.id} 
                    id={`art-card-${art.id}`}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      darkMode 
                        ? "bg-[#121214] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40" 
                        : "bg-white border-gray-150 shadow-sm hover:border-indigo-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
                        #{art.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <User className="w-3" /> {art.author}
                      </span>
                    </div>

                    <h3 
                      onClick={() => setActiveArticleId(art.id)}
                      className={`text-xl font-serif italic font-medium mb-2 hover:text-indigo-400 transition-all ${darkMode ? "text-zinc-100" : "text-gray-900"}`}
                    >
                      {art.title}
                    </h3>

                    <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                       {art.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-zinc-850/15 pt-3 text-xs text-zinc-500">
                      <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {art.readTime}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {art.comments.length} коммент.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Rating block */}
                        <div className="flex items-center gap-1 bg-zinc-950/30 px-2 py-1 rounded-md border border-zinc-850/15">
                          <span className="text-[10px] font-mono font-semibold">Рейтинг: {art.rating}</span>
                        </div>
                        
                        <button
                          onClick={() => setActiveArticleId(art.id)}
                          className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          Читать <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Library & Language support: Right 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className={`font-semibold text-sm flex items-center gap-1.5 ${darkMode ? "text-zinc-350" : "text-gray-900"}`}>
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Цифровые Книги по ЯП
            </h3>

            <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-150"} shadow-sm transition-all space-y-4`}>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Доступны интерактивные книги по программированию с наглядными главами теории и примерами. Запустите чтение прямо на сайте!
              </p>

              {books.map((b) => (
                <div 
                  key={b.id} 
                  id={`book-card-${b.id}`}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    darkMode 
                      ? "bg-[#0E0E10] border-zinc-800 hover:border-zinc-700" 
                      : "bg-gray-50/50 border-gray-150 hover:border-gray-250"
                  }`}
                  onClick={() => { setActiveBookId(b.id); setActiveBookChapterIdx(0); }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      📚 {b.category}
                    </span>
                    <span className="text-[10px] text-zinc-500">Главы: {b.chapters.length}</span>
                  </div>
                  <h4 className={`text-xs font-semibold ${darkMode ? "text-zinc-200" : "text-gray-800"} mb-1`}>
                    {b.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 line-clamp-2">
                    {b.description}
                  </p>
                  
                  <div className="flex justify-end mt-2">
                    <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-0.5">
                      Начать чтение <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
