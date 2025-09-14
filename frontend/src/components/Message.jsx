import { motion } from "framer-motion";
import { useState } from "react";
import { FaFileAlt, FaImage, FaVideo, FaFile, FaDownload, FaExpand, FaUser } from "react-icons/fa";

const typeIcons = {
  text: { icon: FaFileAlt, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  image: { icon: FaImage, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  video: { icon: FaVideo, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
  file: { icon: FaFile, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" }
};

export default function Message({ message, currentUser, index }) {
  const { type, content, fileName } = message.processed;
  const isMine = message.author === currentUser;
  const [imageError, setImageError] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const typeConfig = typeIcons[type] || typeIcons.text;
  const Icon = typeConfig.icon;

  const formatTime = (date, time) => {
    try {
      const [day, month, year] = date.split('/');
      const dateObj = new Date(`${year}-${month}-${day} ${time}`);
      return dateObj.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return `${date} ${time}`;
    }
  };

  const getAuthorColor = (author) => {
    const colors = [
      'text-blue-600 dark:text-blue-400',
      'text-green-600 dark:text-green-400',
      'text-purple-600 dark:text-purple-400',
      'text-red-600 dark:text-red-400',
      'text-indigo-600 dark:text-indigo-400',
      'text-pink-600 dark:text-pink-400',
      'text-yellow-600 dark:text-yellow-400',
      'text-teal-600 dark:text-teal-400'
    ];
    const hash = author.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
    >
      <div
        className={`
          relative max-w-md lg:max-w-lg xl:max-w-xl p-4 rounded-2xl shadow-lg backdrop-blur-sm border
          transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
          ${isMine
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30 rounded-br-md'
            : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 border-gray-200/50 dark:border-gray-700/50 rounded-bl-md'
          }
        `}
      >
        {/* Message Type Indicator */}
        <motion.div
          className={`absolute -top-2 -left-2 p-1.5 rounded-full ${typeConfig.bg} border-2 border-white dark:border-gray-800 shadow-lg`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
        >
          <Icon className={`text-xs ${typeConfig.color}`} />
        </motion.div>

        {/* Author */}
        {!isMine && (
          <motion.div
            className={`flex items-center gap-2 mb-2 pb-2 border-b border-gray-200/30 dark:border-gray-600/30`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.1 }}
          >
            <FaUser className="text-xs text-gray-400" />
            <span className={`font-semibold text-sm ${getAuthorColor(message.author)}`}>
              {message.author}
            </span>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.3 }}
        >
          {type === "text" && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          )}

          {type === "image" && !imageError && (
            <div className="space-y-2">
              <motion.img
                src={`http://localhost:3001/files/${fileName}`}
                alt={fileName}
                className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onError={() => setImageError(true)}
                onClick={() => setIsImageExpanded(true)}
                whileHover={{ scale: 1.02 }}
                loading="lazy"
              />
              <div className="flex items-center justify-between text-xs opacity-70">
                <span>{fileName}</span>
                <button
                  onClick={() => setIsImageExpanded(true)}
                  className="flex items-center gap-1 hover:opacity-100 transition-opacity"
                >
                  <FaExpand />
                </button>
              </div>
            </div>
          )}

          {type === "video" && (
            <div className="space-y-2">
              <video
                controls
                src={`http://localhost:3001/files/${fileName}`}
                className="max-w-full h-auto rounded-lg shadow-md"
                preload="metadata"
              />
              <div className="text-xs opacity-70">{fileName}</div>
            </div>
          )}

          {(type === "file" || imageError) && (
            <motion.a
              href={`http://localhost:3001/files/${fileName}`}
              download
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-all duration-200
                ${isMine 
                  ? 'border-white/30 hover:border-white/50 hover:bg-white/10' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-2 rounded-lg ${typeConfig.bg}`}>
                <Icon className={`${typeConfig.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{fileName}</div>
                <div className="text-xs opacity-70">Нажмите для скачивания</div>
              </div>
              <FaDownload className="text-sm opacity-70" />
            </motion.a>
          )}
        </motion.div>

        {/* Timestamp */}
        <motion.div
          className={`text-xs mt-2 text-right opacity-70 ${isMine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: index * 0.05 + 0.4 }}
        >
          {formatTime(message.date, message.time)}
        </motion.div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Image Modal */}
      {isImageExpanded && type === "image" && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsImageExpanded(false)}
        >
          <motion.img
            src={`http://localhost:3001/files/${fileName}`}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </motion.div>
  );
}