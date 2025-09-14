import { motion } from "framer-motion";
import { FaFileAlt, FaImage, FaVideo, FaFile, FaUsers, FaComments } from "react-icons/fa";

const statItems = [
  { key: "total", label: "Всего сообщений", icon: FaComments, color: "blue" },
  { key: "text", label: "Текстовые", icon: FaFileAlt, color: "gray" },
  { key: "image", label: "Изображения", icon: FaImage, color: "green" },
  { key: "video", label: "Видео", icon: FaVideo, color: "red" },
  { key: "file", label: "Файлы", icon: FaFile, color: "purple" },
  { key: "authors", label: "Участников", icon: FaUsers, color: "indigo" }
];

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  gray: "from-gray-500 to-gray-600",
  green: "from-green-500 to-green-600",
  red: "from-red-500 to-red-600",
  purple: "from-purple-500 to-purple-600",
  indigo: "from-indigo-500 to-indigo-600"
};

export default function StatsPanel({ stats }) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
        <FaComments className="text-blue-500" />
        Статистика чата
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const value = stats[item.key];
          
          return (
            <motion.div
              key={item.key}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 shadow-lg border border-gray-200/50 dark:border-gray-600/50"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[item.color]} text-white shadow-lg`}>
                  <Icon className="text-sm" />
                </div>
                <motion.div
                  className="text-2xl font-bold text-gray-800 dark:text-gray-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                >
                  {value?.toLocaleString() || 0}
                </motion.div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {item.label}
              </p>
              
              {/* Decorative gradient overlay */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colorClasses[item.color]} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}