import { useState, useCallback } from "react";

export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  const fetchMoreMessages = useCallback(() => {
    const currentLength = messages.length;
    const more = allMessages.slice(currentLength, currentLength + 30);
    setMessages(prev => [...prev, ...more]);
    
    if (messages.length + more.length >= allMessages.length) {
      setHasMore(false);
    }
  }, [messages.length, allMessages]);

  return {
    messages,
    allMessages,
    hasMore,
    setMessages,
    setAllMessages,
    setHasMore,
    fetchMoreMessages
  };
}