import { motion } from "framer-motion";
import { FaFileAlt, FaImage, FaVideo, FaFile } from "react-icons/fa"; // npm install react-icons

export default function Message({ message, currentUser }) {
  const { type, content, fileName } = message.processed;
  const isMine = message.author === currentUser;

  const renderIcon = () => {
    switch (type) {
      case "text":
        return <FaFileAlt className="text-gray-500" />;
      case "image":
        return <FaImage className="text-green-500" />;
      case "video":
        return <FaVideo className="text-red-500" />;
      case "file":
        return <FaFile className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col max-w-lg ${isMine ? "items-end" : "items-start"}`}
    >
      <div
        className={`flex items-start p-4 rounded-2xl shadow-lg mt-2 transform hover:scale-[1.02] transition-transform duration-300 ${
          isMine
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
        }`}
      >
        {/* Иконка */}
        <motion.div
          className="mr-2 mt-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {renderIcon()}
        </motion.div>

        <div className="flex flex-col">
          {!isMine && <div className="font-bold mb-1 text-blue-600">{message.author}</div>}

          {type === "text" && <div className="whitespace-pre-wrap">{content}</div>}

          {type === "image" && (
            <img
              src={`http://localhost:3001/files/${fileName}`}
              alt={fileName}
              className="mt-2 max-w-xs rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
            />
          )}

          {type === "video" && (
            <video
              controls
              src={`http://localhost:3001/files/${fileName}`}
              className="mt-2 max-w-xs rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
            />
          )}

          {type === "file" && (
            <a
              href={`http://localhost:3001/files/${fileName}`}
              download
              className="text-blue-600 underline mt-2 block hover:text-blue-400 transition-colors duration-300"
            >
              {fileName}
            </a>
          )}

          <div className="text-xs text-gray-400 mt-1 text-right">
            {message.date} {message.time}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
