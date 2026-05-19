import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useChatNotifications } from "../hooks/useChatNotifications";

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const NotificationDropdown = () => {
  const role = JSON.parse(localStorage.getItem("user") || "{}")?.role;
  const { unreadChats, totalUnread } = useChatNotifications({ enabled: role === "admin" });
  const previousUnreadCount = useRef(null);

  useEffect(() => {
    if (role !== "admin") return;

    if (previousUnreadCount.current !== null && totalUnread > previousUnreadCount.current) {
      toast.error("New support message received.", {
        containerId: "global-chat-notifications",
        toastId: "new-global-chat-message",
        autoClose: 3500,
        theme: "colored",
      });
    }

    previousUnreadCount.current = totalUnread;
  }, [role, totalUnread]);

  if (role !== "admin") return null;

  return (
    <div className="relative group inline-block text-left">
      <ToastContainer containerId="global-chat-notifications" position="top-right" theme="colored" />

      <button
        className={`p-2 transition-all relative focus:outline-none active:scale-95 ${
          totalUnread > 0 ? "text-red-600" : "text-emerald-700 hover:text-emerald-900"
        }`}
      >
        <span className="sr-only">Support notifications</span>
        <BellIcon />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-2 ring-white animate-bounce shadow-lg">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      <div className="absolute right-0 mt-3 w-80 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all focus:outline-none invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 z-[100]">
        <div className="px-5 py-4 rounded-t-2xl bg-emerald-700 transition-colors duration-500">
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
                className="flex items-center gap-4 px-5 py-4 hover:bg-emerald-50 transition-colors border-b last:border-0"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-black text-emerald-700 shrink-0 border border-emerald-200">
                  {chat.user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-black text-gray-900 truncate">{chat.user?.name || "User"}</p>
                  <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                    {chat.latest_message?.message || "New message"}
                  </p>
                </div>
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center shrink-0 animate-pulse">
                  {chat.unread_count > 9 ? "9+" : chat.unread_count}
                </span>
              </Link>
            ))
          )}
        </div>

        <Link
          to="/chat"
          className="block w-full py-3 text-center text-[11px] font-black uppercase text-emerald-700 hover:bg-emerald-50 transition-colors rounded-b-2xl"
        >
          Go to Chat Portal
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
