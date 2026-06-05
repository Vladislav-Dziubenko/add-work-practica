import React, { useState } from "react";
import { 
  FileText, Copy, Check, ShieldCheck, Database, Layers, Github, Globe, Server, Code
} from "lucide-react";

interface UniversityReportProps {
  darkMode: boolean;
  onAlert: (msg: string, type: "success" | "error" | "info") => void;
}

export default function UniversityReport({ darkMode, onAlert }: UniversityReportProps) {
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedDeploy, setCopiedDeploy] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"report" | "deploy">("report");

  const reportText = `МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ
Университетский Технологический Портал

ОТЧЕТ О ВЫПОЛНЕНИИ КУРСОВОГО ПРОЕКТА
Дисциплина: «Методы проектирования систем защищенного документооборота»

Тема проекта: Система защищенного обмена учебными файлами и образовательный портал с ИИ-консультантом

Выполнил:
Студент группы: IAFR 2503R
ФИО: Дзюбенко Владислав (Dziubenko Vladyslav)

--------------------------------------------------
1. ОПИСАНИЕ СУТИ СИСТЕМЫ И ЕЁ КЛЮЧЕВЫХ СЕРВИСОВ

Проект представляет собой комплексную образовательную веб-платформу, сочетающую в себе:
- Защищенное файловое облако для обмена исходным кодом, шпаргалками и лабами с защитой паролем (вычисление совпадения на сервере).
- Учебную базу знаний, разделенную по категориям «Кодинг», «Инструкции» и «Уроки».
- Систему оценки (рейтинга) учебного контента студентами (+1 и -1 к карме статей) и интерактивные комментарии.
- Цифровую библиотеку книг по программированию для быстрого изучения JavaScript, TypeScript, Python с разбором глав.
- Совместный IT-Форум поиска единомышленников и формирования команд для разработки стартапов с фильтрацией по стеку и возможностью вступать/выходить из команды.
- Персональные рекомендации на основе интересов (выбор тегов кодинга в Личном кабинете).
- Интегрированного помощника искусственного интеллекта на базе Gemini 3.5 Flash с сохранением полной истории диалогов в облачной сессии на Node.js.

--------------------------------------------------
2. АРХИТЕКТУРА СИСТЕМЫ (SYSTEM ARCHITECTURE DIAGRAM)

Приложение спроектировано как Fullstack (клиент-серверное) решение, развернутое в монолитном контейнере Cloud Run.

  [ КЛИЕНТСКИЙ ИНТЕРФЕЙС (React SPA) ]
                |
                |  (Fetch REST API запросы по HTTP / CORS-выезде)
                v
  [ СЕРВЕРНЫЙ КОНТЕКСТ (API Server на Express.js) ] <=== [ Среда Node.js Runtime ]
         |                       |                       |
         |                       |                       |
         v                       v                       v
 [ ОБЛАЧНАЯ СЕССИЯ И    [ КЭШ СЕКРЕТНЫХ ФАЙЛОВ   [ ИИ-ИНТЕГРАЦИЯ ]
   ДАННЫЕ В memory ]       И СТРУКТУР КОДА ]             |  (@google/genai SDK)
         |                       |                       |
         v                       v                       v
   (Авторизация,           (Разблокирование       [ GEMINI 3.5 FLASH ]
  публикация постов)       файла по паролю)       (Генерация ответов)

Компоненты стека:
1. FRONTEND:
   - React 19 с типизацией TypeScript.
   - Сборщик Vite 6 (быстрый пре-бандинг).
   - Инструменты стилизации: Tailwind CSS v4 с адаптивной ночной темой.
   - Иконки: Lucide-React.
2. BACKEND:
   - Node.js + Express сервер (размещен в server.ts).
   - Обрабатывает REST API эндпоинты, отвечает за проверку паролей заблокированных файлов.
3. DATABASE (PERSISTENCE):
   - Stateful-хранилище в оперативной памяти сервера (In-memory Storage).
   - Данные сохраняются live в реальном времени на всё время работы контейнера.
4. AI ENGINE:
   - Официальный SDK @google/genai.
   - Серверный запуск и проксирование запросов, что исключает кражу ключа API браузером.

--------------------------------------------------
3. БЕЗОПАСНОСТЬ И КРИПТОГРАФИЧЕСКИЙ СЦЕНАРИЙ

- Файлы загружаются через защищенную REST POST форму.
- Если установлена защита паролем, сервер не передает поле "content" (содержимое) в общем листинге API.
- Для скачивания клиент отправляет JSON-запрос со скрытым ключом пароля. Сервер сверяет пароль с базой в памяти, и только при успехе возвращает дешифрованный буфер с контентом.

--------------------------------------------------
4. ИНСТРУКЦИЯ ПО ЗАПУСКУ И ИСПОЛЬЗОВАНИЮ

Шаги для развертывания локально:
1. Установите Node.js (v18 или v20+).
2. Выполните 'npm install' для скачивания зависимостей.
3. Пропишите API-ключ в переменные окружения GEMINI_API_KEY.
4. Запустите 'npm run dev' для запуска сервера разработчика Express + Vite на порту 3000.
5. Для сборки в продакшн запустите 'npm run build' и 'npm run start'.
`;

  const deployGuideText = `# РУКОВОДСТВО ПО АВТОНОМНОМУ ДЕПЛОЮ (GITHUB + RENDER)

Шаг 1: Экспорт проекта
- Скачайте архив проекта из Google AI Studio через меню "Export to ZIP" (Экспортировать как архив) на панели настроек.
- Распакуйте архив в локальную папку на своем компьютере.

Шаг 2: Загрузка кода на GitHub
1. Создайте новый пустой публичный репозиторий на http://github.com
2. Инициализируйте локальный Git в распакованной папке проекта и выполните push в удаленный репозиторий:
   git init
   git add .
   git commit -m "feat: university auth and security deploy stack"
   git branch -M main
   git remote add origin https://github.com/ВАШ_НИКНЕЙМ/название_репозитория.git
   git push -u origin main

Шаг 3: Настройка Облака Render (render.com)
1. Войдите в Render через кнопку авторизации по вашему аккаунту GitHub.
2. Нажмите "New +" в правом верхнем углу панели Render -> выберите "Web Service".
3. Подключите созданный репозиторий с проектом.
4. Установите ключевые опции сборки:
   - Name:  edu-secure-share (или любое другое)
   - Language: Node
   - Branch: main
   - Root Directory: (оставьте пустым)
   - Build Command: npm install && npm run build
   - Start Command: npm run start
5. Добавьте секретный ключ модели ИИ:
   - В меню Web-сервиса на Render перейдите во вкладку "Environment"
   - Нажмите "Add Environment Variable"
   - Введите Key: GEMINI_API_KEY, а в Value вставьте ваш ключ доступа из Google AI Studio.
6. Нажмите "Deploy Web Service". Сборка займет 1-2 минуты. Готово! Теперь сайт работает 24/7 автономно в интернете!
`;

  const copyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    onAlert("Весь готовый отчет скопирован в буфер обмена!", "success");
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const copyDeploy = () => {
    navigator.clipboard.writeText(deployGuideText);
    setCopiedDeploy(true);
    onAlert("Инструкция по автодеплою на Render скопирована!", "success");
    setTimeout(() => setCopiedDeploy(false), 2000);
  };

  return (
    <div id="univ-report" className="space-y-6">
      
      {/* Visual Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
          <Layers className="w-5 h-5 text-indigo-400 mt-0.5" />
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-zinc-200" : "text-gray-800"}`}>Архитектура</h4>
            <p className={`text-[11px] mt-1 ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>
              Клиент-серверный монолит на Node.js с Express и React. Безопасность и интеграции вынесены полностью на сервер.
            </p>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
          <Database className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-zinc-200" : "text-gray-800"}`}>База Данных</h4>
            <p className={`text-[11px] mt-1 ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>
              Stateful In-Memory кэш оперативной памяти Node.js. Быстрая сессия для постов, комментов и защищенного файлообмена.
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
          <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-zinc-200" : "text-gray-800"}`}>Безопасность</h4>
            <p className={`text-[11px] mt-1 ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>
              Зашифрованное получение буфера. Поле контента скрыто от внешнего листинга API до проверки пароля на сервере.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200 shadow-sm"} transition-all`}>
        
        {/* Tab Selection Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/15 pb-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="subtab-report"
              onClick={() => setActiveSubTab("report")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "report"
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Курсовой Отчет (.TXT)</span>
            </button>

            <button
              id="subtab-deploy"
              onClick={() => setActiveSubTab("deploy")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "deploy"
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Github className="w-4 h-4" />
              <span>2. Инструкция по деплою (Render)</span>
            </button>
          </div>

          <div>
            {activeSubTab === "report" ? (
              <button
                id="copy-report-btn"
                onClick={copyReport}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold rounded-lg text-xs transition-all shadow cursor-pointer w-full justify-center"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Скопировано в буфер!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Скопировать Весь Отчет (TXT)
                  </>
                )}
              </button>
            ) : (
              <button
                id="copy-deploy-btn"
                onClick={copyDeploy}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-all shadow cursor-pointer w-full justify-center"
              >
                {copiedDeploy ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" /> Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Копировать Команды
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        {activeSubTab === "report" ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              Ниже сформирован готовый структурированный отчет по курсовой работе. Его можно скопировать и вставить в ваш вордовский документ или переслать старосте/лектору ИИ.
            </p>
            
            <div className="relative">
              <pre className={`p-5 rounded-xl text-xs font-mono overflow-auto max-h-[450px] text-left whitespace-pre-wrap border ${
                darkMode ? "bg-zinc-950 text-zinc-300 border-zinc-900" : "bg-gray-50 text-gray-800 border-gray-150"
              }`}>
                {reportText}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className={`p-4 rounded-xl border flex items-center gap-3.5 mb-2 ${
              darkMode ? "bg-indigo-500/5 border-indigo-500/10" : "bg-indigo-50 border-indigo-100"
            }`}>
              <Globe className="w-5 h-5 text-indigo-400" />
              <div className="text-xs">
                <span className="font-bold block">Сайт готов к работе без VS Code!</span>
                Привязка к Render означает, что при каждом вашем коммите в GitHub ваш сайт будет мгновенно обновляться в интернете. Все запросы к Gemini ИИ будут безопасно обрабатываться на серверах Render.
              </div>
            </div>

            <pre className={`p-5 rounded-xl text-xs font-mono overflow-auto max-h-[450px] text-left whitespace-pre-wrap border ${
              darkMode ? "bg-zinc-950 text-zinc-300 border-zinc-900" : "bg-gray-50 text-gray-800 border-gray-150"
            }`}>
              {deployGuideText}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
