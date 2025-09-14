import { motion } from "framer-motion";
import { FaList, FaFileAlt, FaImage, FaVideo, FaFile } from "react-icons/fa";

const filterOptions = [
  { value: "all", label: "Все", icon: FaList, color: "gray" },
  { value: "text", label: "Текст", icon: FaFileAlt, color: "blue" },
  { value: "image", label: "Фото", icon: FaImage, color: "green" },
  { value: "video", label: "Видео", icon: FaVideo, color: "red" },
  { value: "file", label: "Файлы", icon: FaFile, color: "purple" }
];

const colorClasses = {
  gray: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600",
  green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600",
  red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600"
};

export default function MessageFilters({ filter, onFilterChange, stats }) {
  const getCount = (type) => {
    if (!stats) return 0;
    return type === "all" ? stats.total : stats[type] || 0;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const isActive = filter === option.value;
        const count = getCount(option.value);
        
        return (
          <motion.button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium transition-all duration-200
              ${isActive 
                ? `${colorClasses[option.color]} ring-2 ring-offset-2 ring-${option.color}-400 dark:ring-offset-gray-800` 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="text-sm" />
            <span className="text-sm">{option.label}</span>
            {count > 0 && (
              <motion.span
                className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive 
                    ? 'bg-white/20 text-current' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {count}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}