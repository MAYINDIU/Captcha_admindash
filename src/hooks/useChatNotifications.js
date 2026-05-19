import { useQuery } from "@tanstack/react-query";

const API_BASE = "https://fastwork24.com/captcha_backend/public/api";

const getUnreadCount = (chat) => {
  const unreadCount = Number(chat?.unread_count ?? chat?.admin_unread_count ?? 0);

  if (unreadCount > 0) return unreadCount;

  const latestMessage = chat?.latest_message;
  if (latestMessage?.sender_type === "user" && latestMessage?.seen_status !== "seen") {
    return 1;
  }

  return 0;
};

export const useChatNotifications = ({ enabled = true } = {}) => {
  const token = localStorage.getItem("authToken");

  const { data: inboxResponse, ...query } = useQuery({
    queryKey: ["chatInbox"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!res.ok) return { data: [] };
      return res.json();
    },
    refetchInterval: 5000,
    enabled: enabled && !!token,
  });

  const chats = Array.isArray(inboxResponse?.data) ? inboxResponse.data : [];
  const unreadChats = chats
    .map((chat) => ({ ...chat, unread_count: getUnreadCount(chat) }))
    .filter((chat) => chat.unread_count > 0);
  const totalUnread = unreadChats.reduce((total, chat) => total + chat.unread_count, 0);

  return {
    chats,
    unreadChats,
    totalUnread,
    ...query,
  };
};
