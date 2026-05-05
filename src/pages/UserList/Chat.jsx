import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= ICONS =================
const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {children}
  </svg>
);
const BackIcon = () => ( <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></Icon> );
const SendIcon = () => ( <Icon className="h-5 w-5 rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></Icon> );

// ================= HELPERS =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const InboxSkeleton = () => (
  <div className="space-y-3 p-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <SkeletonPulse className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-4 w-1/2" />
          <SkeletonPulse className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// ================= MAIN COMPONENT =================
const Chat = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  const API_BASE = "https://alhamarahomesbd.com/captcha_backend/public/api";
  const token = localStorage.getItem("authToken");

  // 1. Fetch Chat Inbox
  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ["chatInbox"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load inbox");
      return res.json();
    },
    refetchInterval: 5000, // Auto-refresh inbox every 5 seconds
  });

  // 2. Fetch Messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["chatMessages", selectedUserId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/chats/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json();
    },
    enabled: !!selectedUserId,
    refetchInterval: 5000, // Auto-refresh messages every 5 seconds
  });

  // 3. Mutations
  const replyMutation = useMutation({
    mutationFn: async (message) => {
      const res = await fetch(`${API_BASE}/admin/chats/${selectedUserId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message, user_id: selectedUserId }),
      });
      return res.json();
    },
    onSuccess: () => {
      setReplyMessage("");
      queryClient.invalidateQueries(["chatMessages", selectedUserId]);
    },
  });

  const seenMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API_BASE}/admin/chats/${id}/seen`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: id }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["chatInbox"]),
  });

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messagesData?.data?.length]); // Only scroll when a new message is actually received

  const handleSelectUser = (id) => {
    setSelectedUserId(id);
    seenMutation.mutate(id);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    replyMutation.mutate(replyMessage);
  };

  const chats = inboxData?.data || [];
  const filteredChats = useMemo(() => chats.filter(c => 
    c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [chats, searchTerm]);

  const activeMessages = messagesData?.data || [];
  const selectedConversation = chats.find(c => c.user_id === selectedUserId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex grow overflow-hidden relative">
          <ToastContainer position="top-right" theme="colored" />

          {/* --- INBOX SIDEBAR --- */}
          <div className={`
            ${selectedUserId ? 'hidden md:flex' : 'flex'} 
            w-full md:w-80 bg-white border-r flex-col overflow-hidden transition-all duration-300
          `}>
            <div className="p-4 border-b bg-white sticky top-0 z-20">
              <h2 className="text-xl font-black text-gray-800 mb-4 tracking-tight">Support <span className="text-indigo-600">Inbox</span></h2>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {inboxLoading ? <InboxSkeleton /> : filteredChats.map((chat) => (
                <button
                  key={chat.conversation_key}
                  onClick={() => handleSelectUser(chat.user_id)}
                  className={`w-full p-4 flex items-start space-x-3 border-b hover:bg-gray-50 transition-all ${selectedUserId === chat.user_id ? 'bg-indigo-50 border-r-4 border-r-indigo-600' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 border-2 border-white shadow-sm">
                      {chat.user?.name?.charAt(0)}
                    </div>
                    {chat.admin_unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {chat.admin_unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-sm text-gray-900 truncate">{chat.user?.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(chat.latest_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${chat.admin_unread_count > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {chat.latest_message?.message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* --- CHAT WINDOW --- */}
          <div className={`
            ${selectedUserId ? 'flex' : 'hidden md:flex'} 
            flex-1 flex-col bg-gray-50 overflow-hidden relative
          `}>
            {selectedUserId ? (
              <>
                {/* Mobile Back Button & Header */}
                <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm z-30">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedUserId(null)} 
                      className="md:hidden p-2 -ml-2 text-gray-500 hover:text-indigo-600"
                    >
                      <BackIcon />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                      {selectedConversation?.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm md:text-base leading-none">{selectedConversation?.user?.name}</h3>
                      <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest mt-1">● Active Session</p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {messagesLoading ? (
                     <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                     </div>
                  ) : activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`
                        max-w-[85%] md:max-w-[70%] p-3 px-4 rounded-2xl shadow-sm relative
                        ${msg.sender_type === 'admin' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}
                      `}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <span className={`
                          text-[9px] mt-1 block text-right font-medium
                          ${msg.sender_type === 'admin' ? 'text-indigo-200' : 'text-gray-400'}
                        `}>
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-2 max-w-5xl mx-auto">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write your response..."
                      className="flex-1 p-3 px-4 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={replyMutation.isPending || !replyMessage.trim()}
                      className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg disabled:shadow-none active:scale-95"
                    >
                      {replyMutation.isPending ? <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <SendIcon />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Empty State (Desktop Only) */
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-white/50">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-gray-600 font-bold">Your Workspace</h3>
                <p className="text-sm text-gray-400">Select a user to view conversation history</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;