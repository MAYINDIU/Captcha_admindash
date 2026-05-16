import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= HELPERS =================

const formatMessageDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{children}</svg>
);
const BackIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></Icon>;
const SendIcon = () => <Icon className="h-5 w-5 rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></Icon>;

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
  const { data: inboxResponse } = useQuery({
    queryKey: ["chatInbox"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      return res.json();
    },
    refetchInterval: 5000,
  });

  // 2. Fetch Active Conversation
  const { data: messagesResponse } = useQuery({
    queryKey: ["chatMessages", selectedUserId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/chats/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      return res.json();
    },
    enabled: !!selectedUserId,
    refetchInterval: 3000,
  });

  // 3. Send Message Mutation
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
    onError: () => {
      toast.error("Failed to send message.");
    }
  });

  // --- FIX: Define the missing function ---
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || replyMutation.isPending) return;
    replyMutation.mutate(replyMessage);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesResponse?.data?.length]);

  const chats = inboxResponse?.data || [];
  const activeMessages = messagesResponse?.data || [];
  const activeChat = chats.find(c => c.user_id === selectedUserId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex grow overflow-hidden relative">
          <ToastContainer position="top-right" theme="colored" />

          {/* SIDEBAR */}
          <div className={`${selectedUserId ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white border-r flex-col overflow-hidden`}>
            <div className="p-4 border-b">
              <h2 className="text-xl font-black text-gray-800 mb-4">Messages</h2>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.filter(c => c.user.name.toLowerCase().includes(searchTerm.toLowerCase())).map((chat) => (
                <button
                  key={chat.conversation_key}
                  onClick={() => setSelectedUserId(chat.user_id)}
                  className={`w-full p-4 flex items-start space-x-3 border-b hover:bg-gray-50 ${selectedUserId === chat.user_id ? 'bg-indigo-50 border-r-4 border-r-indigo-600' : ''}`}
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
                    {chat.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-sm text-gray-900 truncate">{chat.user.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold ml-2">{formatMessageDateTime(chat.latest_message_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{chat.latest_message.message}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className={`${selectedUserId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-100 overflow-hidden`}>
            {selectedUserId ? (
              <>
                <div className="p-3 bg-white border-b flex items-center shadow-sm z-30">
                  <button onClick={() => setSelectedUserId(null)} className="md:hidden p-1 mr-2 text-gray-500"><BackIcon /></button>
                  <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">{activeChat?.user.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{activeChat?.user.name}</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">● Support Portal</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {activeMessages?.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] p-3 px-4 rounded-2xl shadow-sm relative ${msg.sender_type === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1.5 font-bold ${msg.sender_type === 'admin' ? 'text-indigo-200' : 'text-gray-400'}`}>
                       <span className="text-[10px] opacity-80 font-medium">
                        {msg?.sent_at 
                          ? new Date(msg.sent_at).toLocaleString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              hour12: true 
                            }) 
                          : (msg?.created_at ? new Date(msg.created_at).toLocaleString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              hour12: true 
                            }) : 'No Date')}
                      </span>
                        {msg.sender_type === 'admin' && <span className="text-[10px] ml-1">{msg.seen_status === 'seen' ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* FORM FIXED */}
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-2 max-w-5xl mx-auto">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write your response..."
                      className="flex-1 p-3 px-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                    />
                    <button
                      type="submit"
                      disabled={replyMutation.isPending || !replyMessage.trim()}
                      className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {replyMutation.isPending ? <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <SendIcon />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-white">
                <h3 className="text-gray-600 font-bold">No Conversation Selected</h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;