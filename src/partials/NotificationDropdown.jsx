import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const NotificationDropdown = () => {
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const prevUnreadCount = useRef(null);

  // Shared query key ["chatInbox"] ensures data is synced across the whole app
  const { data: inboxResponse } = useQuery({
    queryKey: ["chatInbox"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) return { data: [] };
      return res.json();
    },
    refetchInterval: 5000, // Check for new messages every 5 seconds globally
    enabled: !!token,
  });

  const unreadChats = inboxResponse?.data?.filter(
    c => c.latest_message?.sender_type === 'user' && c.latest_message?.seen_status !== 'seen'
  ) || [];

  const totalUnread = unreadChats.length;

  // Global Alert: Trigger a popup notification when the count increases
  useEffect(() => {
    if (prevUnreadCount.current !== null && totalUnread > prevUnreadCount.current) {
      toast.error("📩 New message received in support portal!", { 
        toastId: "new-global-chat-msg",
        position: "top-right"
      });
    }
    prevUnreadCount.current = totalUnread;
  }, [totalUnread]);

  return (
    <div className="relative group inline-block text-left">
      <button className={`p-2 transition-all relative focus:outline-none active:scale-95 ${totalUnread > 0 ? 'text-red-600' : 'text-gray-500 hover:text-indigo-600'}`}>
        <BellIcon />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-white animate-bounce shadow-lg">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      <div className="absolute right-0 mt-3 w-80 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all focus:outline-none invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 z-[100]">
        <div className={`px-5 py-4 rounded-t-2xl transition-colors duration-500 ${totalUnread > 0 ? 'bg-red-600' : 'bg-indigo-600'}`}>
          <h3 className="text-xs font-black uppercase text-white tracking-[0.2em]">Support Notifications</h3>
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {unreadChats.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs font-bold text-gray-400 italic">No new messages</p>
            </div>
          ) : (
            unreadChats.map((chat) => (
              <Link
                key={chat.conversation_key}
                to="/chat"
                className="flex items-center gap-4 px-5 py-4 hover:bg-indigo-50 transition-colors border-b last:border-0"
              >
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600 shrink-0 border border-indigo-200">
                  {chat.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-black text-gray-900 truncate">{chat.user.name}</p>
                  <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">{chat.latest_message.message}</p>
                </div>
                <span className="h-2.5 w-2.5 bg-red-500 rounded-full shrink-0 animate-pulse"></span>
              </Link>
            ))
          )}
        </div>
        <Link to="/chat" className="block w-full py-3 text-center text-[11px] font-black uppercase text-indigo-600 hover:bg-gray-50 transition-colors rounded-b-2xl">
          Go to Chat Portal
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;

export default NotificationDropdown;