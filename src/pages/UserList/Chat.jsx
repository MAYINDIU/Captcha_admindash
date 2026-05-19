import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= HELPERS =================

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

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

const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{children}</svg>
);
const BackIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></Icon>;
const SendIcon = () => <Icon className="h-5 w-5 rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></Icon>;
const DeleteIcon = () => <Icon className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></Icon>;

// ================= MAIN COMPONENT =================
const Chat = () => {
  const queryClient = useQueryClient();
  const topRef = useRef(null);
  const lastInboxRef = useRef([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  
  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const token = localStorage.getItem("authToken");

  // ---------------- Queries ----------------

  // 1. Fetch Chat Inbox
  const { data: inboxResponse } = useQuery({
    queryKey: ["chatInbox"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      return res.json();
    },
    refetchInterval: 4000, // ৪ সেকেন্ড পর পর রিফ্রেশ হবে
  });

  // 2. Fetch Active Conversation
  const { 
    data: messagesResponse,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages
  } = useInfiniteQuery({
    queryKey: ["chatMessages", selectedUserId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`${API_BASE}/admin/chats/${selectedUserId}?page=${pageParam}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      return res.json();
    },
    getNextPageParam: (lastPage) => (lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined),
    enabled: !!selectedUserId,
    refetchInterval: 3000, // চ্যাট উইন্ডো খোলা থাকলে প্রতি ৩ সেকেন্ডে ডাটা আপডেট হবে
  });

  // ---------------- Notifications ----------------
  useEffect(() => {
    if (!inboxResponse?.data) return;

    // Only trigger notifications if we already have a baseline to compare against (prevents alerts on initial load)
    if (lastInboxRef.current.length > 0) {
      inboxResponse.data.forEach(chat => {
        const prevChat = lastInboxRef.current.find(c => c.conversation_key === chat.conversation_key);
        
        // Detect if unread count increased for a user that is NOT the one we are currently chatting with
        if (chat.user_unread_count > 0 && (!prevChat || chat.user_unread_count > prevChat.user_unread_count)) {
          if (chat.user_id !== selectedUserId) {
            toast.error(`🔔 New Message from ${chat.user?.name || 'User'}`, {
              theme: "colored",
              autoClose: 3500,
            });
          }
        }
      });
    }
    lastInboxRef.current = inboxResponse.data;
  }, [inboxResponse, selectedUserId]);

  // ---------------- Mutation ----------------

  const replyMutation = useMutation({
    mutationFn: async (message) => {
      const res = await fetch(`${API_BASE}/admin/chats/${selectedUserId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message, user_id: selectedUserId }),
      });
      return res.json();
    },
    // Optimistic Update: ব্যাকএন্ডে হিট করার সাথে সাথে ফ্রন্টএন্ড চ্যাট বক্সে মেসেজ পুশ করার লজিক
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries(["chatMessages", selectedUserId]);
      const previousMessages = queryClient.getQueryData(["chatMessages", selectedUserId]);

      // লোকালভাবে নতুন মেসেজ অবজেক্ট তৈরি করা হলো
      const mockNewMsg = {
        id: Date.now(), // ইউনিক টেম্পোরারি আইডি
        message: newMessage,
        sender_type: "admin",
        seen_status: "unseen",
        created_at: new Date().toISOString(),
        sent_at: new Date().toISOString()
      };

      // ক্যাশ ডাটাতে ইনস্ট্যান্ট পুশ (এর ফলে মেসেজ সাথে সাথে স্ক্রিনে ভেসে উঠবে)
      queryClient.setQueryData(["chatMessages", selectedUserId], (old) => {
        if (!old) return old;
        const pages = [...old.pages];
        if (pages.length > 0) {
          pages[0] = {
            ...pages[0],
            data: [mockNewMsg, ...pages[0].data], // নিউ মেসেজ ইনডেক্স ০ তে যাবে (যেহেতু রিভার্সড স্ক্রল)
          };
        }
        return { ...old, pages };
      });

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["chatMessages", selectedUserId], context.previousMessages);
      }
      toast.error("Failed to send message.");
    },
    onSuccess: () => {
      setReplyMessage("");
      // সার্ভারের অরিজিনাল ডাটার সাথে সিঙ্ক করার জন্য জোরপূর্বক ইনভ্যালিডেশন
      queryClient.invalidateQueries(["chatMessages", selectedUserId]);
      queryClient.invalidateQueries(["chatInbox"]);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      const res = await fetch(`${API_BASE}/admin/chats/${selectedUserId}/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete message");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Message deleted successfully");
      queryClient.invalidateQueries(["chatMessages", selectedUserId]);
      queryClient.invalidateQueries(["chatInbox"]);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${API_BASE}/admin/chats/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete conversation");
      return data;
    },
    onSuccess: (data, userId) => {
      toast.success(data.message || "Conversation deleted successfully");
      if (userId === selectedUserId) {
        setSelectedUserId(null); // Only clear if we deleted the active chat
      }
      queryClient.invalidateQueries(["chatInbox"]); // Refresh the inbox list
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDeleteConversation = (userId) => {
    const targetId = (typeof userId === 'number' || typeof userId === 'string') ? userId : selectedUserId;
    if (!targetId) return;

    Swal.fire({
      title: "Delete entire conversation?",
      text: "This will remove all messages for this user. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete everything!",
    }).then((result) => {
      if (result.isConfirmed) deleteConversationMutation.mutate(targetId);
    });
  };

  const handleDeleteMessage = (messageId) => {
    Swal.fire({
      title: "Delete Message?",
      text: "This will permanently remove the message.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) deleteMessageMutation.mutate(messageId);
    });
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || replyMutation.isPending) return;
    replyMutation.mutate(replyMessage);
  };

  // Infinite Scroll Trigger
  useEffect(() => {
    if (!topRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const chats = inboxResponse?.data || [];  
  
  // মেসেজ প্রসেসিং এবং সর্টিং (রিভার্স স্ক্রলের জন্য সঠিক ফরম্যাট নিশ্চিতকরণ)
  const processedMessages = useMemo(() => {
    // Flatten and ensure messages are sorted NEWEST to OLDEST for flex-col-reverse logic
    let raw = messagesResponse?.pages.flatMap((page) => page.data) || [];
    raw = [...raw].sort((a, b) => new Date(b.sent_at || b.created_at) - new Date(a.sent_at || a.created_at));

    const result = [];
    let unreadDividerAdded = false;

    for (let i = 0; i < raw.length; i++) {
      const msg = raw[i];
      const nextMsg = raw[i + 1];
      
      result.push({ type: 'message', ...msg });

      // Add "New Messages" divider between the last seen message and the first unseen message
      if (!unreadDividerAdded && msg.sender_type === 'user' && msg.seen_status === 'unseen' && 
          (!nextMsg || nextMsg.seen_status === 'seen' || nextMsg.sender_type === 'admin')) {
        result.push({ type: 'unread_divider', id: `unread-divider-${msg.id}` });
        unreadDividerAdded = true;
      }

      if (!nextMsg || !isSameDay(msg.sent_at || msg.created_at, nextMsg.sent_at || nextMsg.created_at)) {
        result.push({ type: 'header', date: msg.sent_at || msg.created_at, id: `header-${msg.sent_at || msg.created_at}-${i}` });
      }
    }
    return result;
  }, [messagesResponse]);

  const activeChat = chats.find(c => c.user_id === selectedUserId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex grow overflow-hidden relative">
          <ToastContainer position="top-right" theme="colored" />

          {/* Inbox Sidebar */}
          <div className={`${selectedUserId ? 'hidden md:flex' : 'flex'} w-full md:w-96 bg-white border-r flex-col h-full overflow-hidden`}>
            <div className="p-4 border-b">
              <h2 className="text-xl font-black text-gray-800 mb-4">Messages</h2>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {chats
                .filter(c => c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((chat) => {
                  const isSelected = selectedUserId === chat.user_id;
                  // Hide unread indicators for the chat that is currently open
                  const hasUnread = chat.user_unread_count > 0 && !isSelected;
                  
                  return (
                    <button
                      key={chat.conversation_key}
                      onClick={() => setSelectedUserId(chat.user_id)}
                      className={`w-full p-4 flex items-start space-x-3 text-left transition-all relative group
                        ${isSelected ? 'bg-indigo-50/70 border-r-4 border-r-indigo-600' : ''}
                        ${!isSelected && hasUnread ? 'bg-indigo-50 hover:bg-indigo-100' : ''}
                        ${!isSelected && !hasUnread ? 'bg-white hover:bg-slate-50' : ''}
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm text-base">
                          {chat.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {hasUnread && (
                          <span className="absolute -top-1 -left-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-sm"></span>
                          </span>
                        )}

                        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                          chat.user?.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="flex items-center space-x-2 truncate">
                            <span className={`text-sm truncate ${hasUnread ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {chat.user?.name}
                            </span>
                            {hasUnread && (
                              <span className="shrink-0 bg-red-100 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">NEW</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                            {formatMessageDateTime(chat.latest_message_at)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className={`text-xs truncate max-w-[85%] ${hasUnread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                            {chat.latest_message?.sender_type === 'admin' ? (
                              <span className="text-indigo-600 font-medium">You: </span>
                            ) : null}
                            {chat.latest_message?.message}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            {hasUnread && (
                              <span className="bg-red-500 text-white font-extrabold text-[10px] h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center animate-pulse shadow-sm shadow-red-200">
                                {chat.user_unread_count}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(chat.user_id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50"
                              title="Delete Conversation"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`${selectedUserId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-100 h-full overflow-hidden`}>
            {selectedUserId ? (
              <>
                {/* Header */}
                <div className="p-3.5 bg-white border-b flex items-center justify-between shadow-sm z-30">
                  <div className="flex items-center min-w-0">
                    <button onClick={() => setSelectedUserId(null)} className="md:hidden p-1 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                      <BackIcon />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-3 shadow-inner">
                      {activeChat?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">{activeChat?.user?.name}</h3>
                      <p className="text-[10px] text-gray-400 font-semibold truncate">
                        {activeChat?.user?.email} • <span className="text-emerald-600 uppercase font-bold">Balance: ${activeChat?.user?.wallet_balance}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleDeleteConversation}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete Entire Conversation"
                    >
                      <DeleteIcon className="h-5 w-5" />
                    </button>
                    <div className="shrink-0 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {activeChat?.subject || "Support"}
                    </div>
                  </div>
                </div>

                {/* Messages Feed (Reversed Layout) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col-reverse">
                  {processedMessages.map((item) => (
                    item.type === 'unread_divider' ? (
                      <div key={item.id} className="flex items-center my-8">
                        <div className="flex-1 h-px bg-indigo-200"></div>
                        <span className="mx-4 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-50 px-4 py-1 rounded-full shadow-sm border border-indigo-100">
                          New Messages
                        </span>
                        <div className="flex-1 h-px bg-indigo-200"></div>
                      </div>
                    ) : item.type === 'header' ? (
                      <div key={item.id} className="flex justify-center my-6">
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
                          {formatDateHeader(item.date)}
                        </span>
                      </div>
                    ) : (
                      <div key={item.id} className={`flex mb-4 group ${item.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        {item.sender_type === 'admin' && (
                          <button onClick={() => handleDeleteMessage(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity self-center mr-2">
                            <DeleteIcon />
                          </button>
                        )}
                        <div className={`max-w-[85%] md:max-w-[70%] p-3 px-4 rounded-2xl shadow-sm relative transition-all duration-500 ${
                          item.sender_type === 'admin' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : `${item.seen_status === 'unseen' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-gray-100'} text-gray-800 border rounded-tl-none`
                        }`}>
                          {/* New Message Indicator Dot */}
                          {item.sender_type === 'user' && item.seen_status === 'unseen' && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 border-2 border-white shadow-sm"></span>
                            </span>
                          )}

                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{item.message}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1.5 font-bold ${
                            item.sender_type === 'admin' ? 'text-indigo-200' : 'text-gray-400'
                          }`}>
                            <span className="text-[10px] opacity-80 font-medium">
                              {item?.sent_at ? formatMessageDateTime(item.sent_at) : (item?.created_at ? formatMessageDateTime(item.created_at) : 'No Date')}
                            </span>
                            {item.sender_type === 'admin' && (
                              <span className="text-[10px] ml-1 tracking-tighter">
                                {item.seen_status === 'seen' ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.sender_type !== 'admin' && (
                          <button onClick={() => handleDeleteMessage(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity self-center ml-2">
                            <DeleteIcon />
                          </button>
                        )}
                      </div>
                    )
                  ))}

                  {/* Sentinel at the end of the DOM flow (Visual Top in reversed column) */}
                  {hasNextPage && (
                    <div ref={topRef} className="py-4 flex justify-center">
                      <div className="h-5 w-5 border-2 border-indigo-600/20 border-t-indigo-600 animate-spin rounded-full" />
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-2 max-w-5xl mx-auto">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={`Reply to ${activeChat?.user?.name || "user"}...`}
                      className="flex-1 p-3 px-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                    />
                    <button
                      type="submit"
                      disabled={replyMutation.isPending || !replyMessage.trim()}
                      className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shrink-0"
                    >
                      {replyMutation.isPending ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      ) : (
                        <SendIcon />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-white">
                <div className="p-4 bg-slate-50 rounded-full mb-3 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-gray-500 font-bold text-sm tracking-wide">Select a conversation to start messaging</h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;