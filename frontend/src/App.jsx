import { useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { motion, AnimatePresence } from "framer-motion";
import Message from "./components/Message";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentUser, setCurrentUser] = useState("✧/𝓛𝓾𝓷𝓪/✧[she/her]#Фембойчики #星の子 #Hosh_no_ko");
  const [filter, setFilter] = useState("all");

  const uploadZip = async (e) => {
    const formData = new FormData();
    formData.append("zipfile", e.target.files[0]);
    const res = await axios.post("http://localhost:3001/upload", formData);

    setAllMessages(res.data.messages);
    setMessages(res.data.messages.slice(0, 20));
    setHasMore(res.data.messages.length > 20);
  };

  const fetchMoreMessages = () => {
    const currentLength = messages.length;
    const more = allMessages.slice(currentLength, currentLength + 20);
    setMessages([...messages, ...more]);
    if (messages.length + more.length >= allMessages.length) setHasMore(false);
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === "all") return true;
    return msg.processed.type === filter;
  });

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-600 animate-pulse">
        WhatsappExportParser 🚀
      </h1>

      <motion.div
        className="flex gap-2 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="file"
          accept=".zip"
          onChange={uploadZip}
          className="border p-2 rounded-md shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded-md shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          <option value="all">All</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="file">File</option>
        </select>
      </motion.div>

      <div
        id="scrollableDiv"
        className="h-[75vh] w-full overflow-y-auto flex flex-col p-2 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm shadow-inner"
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreMessages}
          hasMore={hasMore}
          loader={<h4 className="text-gray-500 animate-pulse text-center mt-4">Loading more messages...</h4>}
          scrollableTarget="scrollableDiv"
        >
          <AnimatePresence>
            {filteredMessages.map((msg) => (
              <Message key={msg.id} message={msg} currentUser={currentUser} />
            ))}
          </AnimatePresence>
        </InfiniteScroll>
      </div>
    </div>
  );
}
