import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import MessageFilters from "./components/MessageFilters";
import MessageList from "./components/MessageList";
import StatsPanel from "./components/StatsPanel";
import SearchBar from "./components/SearchBar";
import { useMessages } from "./hooks/useMessages";
import { useSearch } from "./hooks/useSearch";

export default function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState("✧/𝓛𝓾𝓷𝓪/✧[she/her]#Фембойчики #星の子 #Hosh_no_ko");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    messages,
    allMessages,
    hasMore,
    setMessages,
    setAllMessages,
    setHasMore,
    fetchMoreMessages
  } = useMessages();

  const { filteredMessages } = useSearch(messages, filter, searchQuery);

  const stats = useMemo(() => {
    if (!allMessages.length) return null;
    
    const textCount = allMessages.filter(m => m.processed.type === "text").length;
    const imageCount = allMessages.filter(m => m.processed.type === "image").length;
    const videoCount = allMessages.filter(m => m.processed.type === "video").length;
    const fileCount = allMessages.filter(m => m.processed.type === "file").length;
    
    const authors = [...new Set(allMessages.map(m => m.author))];
    
    return {
      total: allMessages.length,
      text: textCount,
      image: imageCount,
      video: videoCount,
      file: fileCount,
      authors: authors.length
    };
  }, [allMessages]);

  const uploadZip = useCallback(async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("zipfile", file);
      
      const res = await axios.post("http://localhost:3001/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setAllMessages(res.data.messages);
      setMessages(res.data.messages.slice(0, 30));
      setHasMore(res.data.messages.length > 30);
      
      toast.success(`Загружено ${res.data.messages.length} сообщений!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Ошибка при загрузке файла");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [setAllMessages, setMessages, setHasMore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Upload Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <FileUpload 
              onUpload={uploadZip}
              isUploading={isUploading}
              progress={uploadProgress}
            />
          </div>

          {/* Stats Panel */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StatsPanel stats={stats} />
            </motion.div>
          )}

          {/* Controls */}
          {allMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <SearchBar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <MessageFilters 
                  filter={filter}
                  onFilterChange={setFilter}
                  stats={stats}
                />
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {allMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              <MessageList
                messages={filteredMessages}
                hasMore={hasMore}
                fetchMore={fetchMoreMessages}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {/* Empty State */}
          {allMessages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Загрузите WhatsApp чат
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Выберите ZIP файл с экспортированным чатом для начала анализа
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}