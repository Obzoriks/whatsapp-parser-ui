import { motion } from "framer-motion";
import InfiniteScroll from "react-infinite-scroll-component";
import Message from "./Message";
import { FaSpinner } from "react-icons/fa";

export default function MessageList({ messages, hasMore, fetchMore, currentUser }) {
  return (
    <div className="h-[70vh] overflow-hidden">
      <div
        id="scrollableDiv"
        className="h-full overflow-y-auto px-6 py-4 space-y-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <motion.div
              className="flex items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <FaSpinner className="animate-spin text-lg" />
                <span className="font-medium">Загрузка сообщений...</span>
              </div>
            </motion.div>
          }
          scrollableTarget="scrollableDiv"
          endMessage={
            messages.length > 0 && (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Все сообщения загружены!
                </p>
              </motion.div>
            )
          }
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Message
                key={`${message.id}-${index}`}
                message={message}
                currentUser={currentUser}
                index={index}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        #scrollableDiv::-webkit-scrollbar {
          width: 6px;
        }
        #scrollableDiv::-webkit-scrollbar-track {
          background: transparent;
        }
        #scrollableDiv::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        #scrollableDiv::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}