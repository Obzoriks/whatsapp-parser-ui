import { useMemo } from "react";

export function useSearch(messages, filter, searchQuery) {
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter(msg => msg.processed.type === filter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(msg => {
        const content = msg.processed.content || msg.processed.fileName || "";
        const author = msg.author || "";
        return (
          content.toLowerCase().includes(query) ||
          author.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [messages, filter, searchQuery]);

  return { filteredMessages };
}