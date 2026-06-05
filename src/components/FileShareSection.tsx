import React, { useState, useEffect } from "react";
import { 
  File, Lock, Shield, Unlock, Download, UploadCloud, Copy, Check, Info, Trash, AlertTriangle, Key
} from "lucide-react";
import { SharedFile, UserSession } from "../types";

interface FileShareSectionProps {
  currentUser: UserSession;
  onAlert: (msg: string, type: "success" | "error" | "info") => void;
  darkMode: boolean;
}

export default function FileShareSection({ currentUser, onAlert, darkMode }: FileShareSectionProps) {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload States
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadPassword, setUploadPassword] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Security Challenge States
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [challengePassword, setChallengePassword] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error(err);
      onAlert("Не удалось загрузить реестр файлов", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle upload
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilename.trim() || !uploadContent.trim()) {
      onAlert("Заполните имя файла и его содержимое!", "error");
      return;
    }

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadFilename.trim(),
          description: uploadDesc.trim(),
          content: uploadContent,
          password: uploadPassword,
          author: currentUser.name,
        }),
      });

      if (res.ok) {
        onAlert("Файл успешно зашифрован и загружен в облако!", "success");
        setUploadFilename("");
        setUploadDesc("");
        setUploadContent("");
        setUploadPassword("");
        fetchFiles();
      } else {
        const errData = await res.json();
        onAlert(errData.error || "Ошибка при загрузке", "error");
      }
    } catch (err) {
      console.error(err);
      onAlert("Ошибка подключения к серверу", "error");
    }
  };

  // Simulated drag and drop file parser
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadFilename(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadContent(event.target.result.toString());
          onAlert(`Файл "${file.name}" прочитан. Установите пароль защиты при желании!`, "info");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFilename(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadContent(event.target.result.toString());
          onAlert(`Файл "${file.name}" успешно импортирован.`, "info");
        }
      };
      reader.readAsText(file);
    }
  };

  // Download / Password verification challenge
  const handleDownloadChallenge = async (file: SharedFile) => {
    if (!file.passwordProtected) {
      // Direct load
      await downloadFileRaw(file.id, "");
    } else {
      setChallengeId(file.id);
      setSelectedFileName(file.filename);
      setChallengePassword("");
      setSelectedFileContent(null);
    }
  };

  const downloadFileRaw = async (id: string, pass: string) => {
    try {
      const res = await fetch("/api/files/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: pass }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedFileContent(data.content);
        setSelectedFileName(data.filename);
        onAlert("Доступ разрешен! Файл успешно дешифрован.", "success");
        if (challengeId) {
          // Keep dialog open to show decrypted content
        } else {
          // If no password lock
          setChallengeId(data.id);
        }
        fetchFiles(); // Refresh downloads counter
      } else {
        const errData = await res.json();
        onAlert(errData.error || "Ошибка дешифрации", "error");
      }
    } catch (err) {
      onAlert("Ошибка сетевого запроса", "error");
    }
  };

  const submitChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    downloadFileRaw(challengeId, challengePassword);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFileId(id);
    onAlert("Содержимое скопировано в буфер!", "success");
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  return (
    <div id="file-exchange" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left panel: Upload Form */}
      <div className="lg:col-span-4 space-y-4">
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"} shadow-sm transition-all`}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className={`font-semibold text-lg ${darkMode ? "text-zinc-100" : "text-gray-900"}`}>Защищенная Загрузка</h2>
          </div>
          
          <form onSubmit={handleFileUploadSubmit} className="space-y-4">
            {/* Drag & Drop Zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                isDragOver 
                  ? "border-emerald-500 bg-emerald-50/10" 
                  : darkMode 
                    ? "border-zinc-800 hover:border-zinc-700 bg-zinc-950/30" 
                    : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-medium">Перетащите сюда текстовый/код файл</p>
              <p className="text-[10px] text-zinc-500 my-1">или нажмите кнопку ниже</p>
              
              <label className="inline-block mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium rounded-md cursor-pointer transition-all">
                Выбрать файл
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".txt,.js,.ts,.py,.json,.html,.css,.md,.cpp"
                />
              </label>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-zinc-400" : "text-gray-600"}`}>
                Имя файла (с расширением)
              </label>
              <input 
                id="upload-filename-input"
                type="text" 
                placeholder="example.json"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                  darkMode 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-emerald-600" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-zinc-400" : "text-gray-600"}`}>
                Описание учебного материала
              </label>
              <input 
                id="upload-desc-input"
                type="text" 
                placeholder="Например, Лабораторная No3 по программированию"
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                  darkMode 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-emerald-600" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-zinc-400" : "text-gray-600"}`}>
                Текстовые данные или Код (содержимое файла)
              </label>
              <textarea 
                id="upload-content-input"
                rows={5}
                placeholder="Вставьте исходный код или лекционные заметки..."
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none resize-none font-mono ${
                  darkMode 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-emerald-600" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                }`}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-medium ${darkMode ? "text-zinc-400" : "text-gray-600"}`}>
                  Защитный пароль для скачивания
                </label>
                <span className="text-[10px] text-emerald-500 font-medium">Опционально</span>
              </div>
              <input 
                id="upload-password-input"
                type="password" 
                placeholder="Оставьте пустым для открытого файла"
                value={uploadPassword}
                onChange={(e) => setUploadPassword(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                  darkMode 
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-emerald-600" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                }`}
              />
            </div>

            <button
              id="submit-upload-btn"
              type="submit"
              className="w-full text-xs py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm transition-all"
            >
              Загрузить в Облачное Хранилище
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: Files Catalog */}
      <div className="lg:col-span-8 space-y-6">
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"} shadow-sm transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <File className="w-5 h-5 text-indigo-500" />
              <h2 className={`font-semibold text-lg ${darkMode ? "text-zinc-100" : "text-gray-900"}`}>Все Общие Файлы</h2>
            </div>
            <span className={`text-xs font-mono px-2 py-1 rounded-full ${darkMode ? "bg-zinc-850 text-zinc-400" : "bg-zinc-100 text-zinc-650"}`}>
              {files.length} сохр.
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Пользователи могут обмениваться исходным кодом программ, тестами и PDF материалами. Файлы с замком <Lock className="inline w-3 h-3 text-red-400" /> требуют ввода студенческого секретного ключа/пароля для разблокирования прямо на сервере.
          </p>

          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500 animate-pulse">Загрузка файлов...</div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-zinc-800">
              <p className="text-xs text-zinc-400">Файлов пока нет. Будьте первыми, кто зальет методичку!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  id={`file-item-${file.id}`}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    darkMode 
                      ? "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700" 
                      : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className={`text-xs font-semibold ${darkMode ? "text-zinc-200" : "text-gray-900"} truncate max-w-[140px]`}>
                          {file.filename}
                        </span>
                      </div>
                      
                      {file.passwordProtected ? (
                        <span className="flex items-center gap-0.5 text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-md font-mono">
                          <Lock className="w-2.5 h-2.5" /> Защищен
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono">
                          <Unlock className="w-2.5 h-2.5" /> Открытый
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-[11px] mt-2 mb-3 leading-relaxed ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>
                      {file.description}
                    </p>
                  </div>

                  <div className="border-t border-zinc-800/10 pt-2 flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex flex-col">
                      <span>Автор: {file.author}</span>
                      <span>{Math.round(file.fileSize / 10.24) / 100} KB • {file.downloads} скач.</span>
                    </div>
                    
                    <button
                      id={`dl-btn-${file.id}`}
                      onClick={() => handleDownloadChallenge(file)}
                      className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-md transition-all text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Дешифровать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Challenge & Decrypted Output Panel */}
        {challengeId && (
          <div 
            id="challenge-panel"
            className={`p-5 rounded-2xl border ${
              darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
            } shadow-sm transition-all`}
          >
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className={`font-semibold text-sm ${darkMode ? "text-zinc-200" : "text-gray-800"}`}>
                  Дешифратор: <span className="text-emerald-500 font-mono">{selectedFileName}</span>
                </h3>
              </div>
              <button 
                onClick={() => { setChallengeId(null); setSelectedFileContent(null); }}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Закрыть
              </button>
            </div>

            {selectedFileContent === null ? (
              <form onSubmit={submitChallenge} className="max-w-md mx-auto py-6 space-y-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                  <Key className="w-6 h-6 text-red-400" />
                </div>
                <h4 className={`text-xs font-semibold ${darkMode ? "text-zinc-300" : "text-gray-700"}`}>
                  Файл защищен сквозным паролем.
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Пожалуйста, введите пароль, чтобы запросить исходные байты с зашифрованного сервера. (Для предустановленного файла пароль: <span className="font-mono text-emerald-400">2503</span>)
                </p>
                <div className="flex gap-2">
                  <input 
                    id="challenge-password-input"
                    type="password" 
                    placeholder="Введите пароль..."
                    value={challengePassword}
                    onChange={(e) => setChallengePassword(e.target.value)}
                    className={`w-full text-xs p-2 rounded-lg border outline-none ${
                      darkMode 
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-indigo-600" 
                        : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                    }`}
                    required
                  />
                  <button 
                    id="challenge-submit-btn"
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                  >
                    Разблокировать
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-500" /> Расшифровка завершена успешно!
                  </span>
                  
                  <button
                    id="copy-decrypted-btn"
                    onClick={() => copyToClipboard(selectedFileContent, challengeId!)}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-all"
                  >
                    {copiedFileId === challengeId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Скопировать код</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[350px]">
                  <pre className="p-4 rounded-xl text-xs font-mono text-emerald-400 bg-zinc-950 border border-zinc-800 text-left whitespace-pre-wrap">
                    {selectedFileContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
