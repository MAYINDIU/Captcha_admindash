import React, { useState, useMemo } from "react";
import { formatDateTime } from "../../utils/Utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
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
const PlusIcon = () => ( <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></Icon> );
const EditIcon = () => ( <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9" /></Icon> );
const CalendarIcon = () => ( <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" /></Icon> );
const DeleteIcon = () => ( <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></Icon> );
const EyeIcon = () => ( <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" /></Icon> );
const XIcon = () => ( <Icon className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon> );
const InfoIcon = () => ( <Icon className="h-4 w-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon> );
const PowerIcon = () => ( <Icon className="h-5 w-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></Icon> );

// ================= HELPERS =================
const formatToTk = (amount) => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return "Tk 0";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(numericAmount).replace("BDT", "Tk");
};

const toDateTimeLocalValue = (rawValue) => {
  if (!rawValue) return "";

  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const getWithdrawalDisplayDate = (withdrawal) =>
  withdrawal?.processed_at ||
  withdrawal?.payment_date_time ||
  withdrawal?.requested_at ||
  withdrawal?.created_at;

const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
  <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
    <div className="h-12 bg-[#1976D2] flex items-center px-6 space-x-4">
      {[...Array(6)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-24 bg-blue-400/50" />)}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
        <SkeletonPulse className="h-4 w-8" /><SkeletonPulse className="h-6 w-32" /><SkeletonPulse className="h-4 w-20" /><SkeletonPulse className="h-4 w-40" />
        <div className="flex space-x-2 ml-auto"><SkeletonPulse className="h-8 w-8 rounded-full" /><SkeletonPulse className="h-8 w-8 rounded-full" /></div>
      </div>
    ))}
  </div>
);

// ================= MODALS =================
// (I am keeping your Modal components as they are, but they should be defined here or imported)
const WithdrawalReviewModal = ({ withdrawal, onClose }) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const [notes, setNotes] = useState("");
  const [confirmNumber, setConfirmNumber] = useState("");

  const reviewMutation = useMutation({
    mutationFn: async ({ action, body }) => {
      const res = await fetch(`${API_BASE}/admin/withdrawals/${withdrawal.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Operation failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Updated successfully! 🎉");
      queryClient.invalidateQueries(["withdrawals"]);
      queryClient.invalidateQueries(["transactions"]);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const status = withdrawal.status?.toLowerCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-gray-900">Process Request #{withdrawal.id}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><XIcon /></button>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Request Summary</p>
              <p className="text-sm font-bold text-gray-800">{withdrawal.user?.name} (@{withdrawal.user?.username})</p>
              <p className="text-xl font-black text-indigo-700 mt-1">{formatToTk(withdrawal.amount)}</p>
              <p className="text-xs text-gray-600 font-medium">Via: {withdrawal.payment_method} ({withdrawal.account_details?.number})</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Admin Response Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" placeholder="Internal notes or reason for rejection..." />
            </div>
            {status === 'approved' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Transaction ID / Reference</label>
                <input type="text" value={confirmNumber} onChange={(e) => setConfirmNumber(e.target.value)} className="w-full mt-1 p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Paste Txn ID here..." required />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              {status === 'pending' && (
                <>
                  <button onClick={() => reviewMutation.mutate({ action: 'approve', body: { notes } })} disabled={reviewMutation.isPending} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-green-700 transition disabled:opacity-50"> {reviewMutation.isPending ? "Processing..." : "Approve"} </button>
                  <button onClick={() => reviewMutation.mutate({ action: 'reject', body: { notes } })} disabled={reviewMutation.isPending} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"> Reject </button>
                </>
              )}
              {status === 'approved' && (
                <>
                  <button onClick={() => { if(!confirmNumber) return toast.warning("Please provide a transaction ID"); reviewMutation.mutate({ action: 'paid', body: { confirm_number: confirmNumber, notes } }); }} disabled={reviewMutation.isPending} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"> {reviewMutation.isPending ? "Updating..." : "Mark as Paid"} </button>
                  <button onClick={() => reviewMutation.mutate({ action: 'reject', body: { notes } })} disabled={reviewMutation.isPending} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"> Reject </button>
                </>
              )}
              {(status === 'paid' || status === 'rejected') && (
                <div className="w-full py-2 bg-gray-100 text-gray-500 text-center rounded text-xs font-bold italic uppercase"> Finalized entry. Date and notes can still be adjusted. </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawalDateModal = ({ withdrawal, onClose }) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const [processedAt, setProcessedAt] = useState(
    toDateTimeLocalValue(withdrawal?.processed_at || withdrawal?.payment_date_time || withdrawal?.requested_at || withdrawal?.created_at)
  );

  const dateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/admin/withdrawals/${withdrawal.id}/update-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ processed_at: processedAt || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Date update failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Date updated successfully");
      queryClient.invalidateQueries(["withdrawals"]);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-gray-900">Update Date #{withdrawal.id}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><XIcon /></button>
          </div>
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1">Current Entry</p>
              <p className="text-sm font-bold text-gray-800">
                {withdrawal?.user?.name || "Unknown User"} {withdrawal?.user?.username ? `(@${withdrawal.user.username})` : ""}
              </p>
              <p className="text-xs text-gray-600 mt-1">Status: <span className="font-bold uppercase">{withdrawal?.status || "N/A"}</span></p>
              <p className="text-xs text-gray-600">Shown Date: {formatDateTime(withdrawal?.processed_at || withdrawal?.payment_date_time || withdrawal?.requested_at || withdrawal?.created_at)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">New Date & Time</label>
              <input
                type="datetime-local"
                value={processedAt}
                onChange={(e) => setProcessedAt(e.target.value)}
                className="w-full mt-1 p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-amber-600 font-medium">
              Save action requires backend support for a dedicated withdrawal date update endpoint.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={() => dateMutation.mutate()} disabled={dateMutation.isPending} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50">
                {dateMutation.isPending ? "Saving..." : "Save Date"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDetailsModal = ({ user: summaryUser, onClose }) => {
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const { data: user } = useQuery({
    queryKey: ["userDetails", summaryUser.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/users/${summaryUser.id}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to load user details");
      const json = await res.json();
      return json.data;
    },
    initialData: summaryUser,
  });
  const DetailCard = ({ label, value, className = "bg-gray-50 text-gray-700" }) => (
    <div className={`p-3 rounded-lg border border-gray-100 ${className}`}>
      <p className="text-[10px] font-medium uppercase text-gray-500 tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-bold truncate">{value}</p>
    </div>
  );
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 truncate">{user.name}'s Profile</h2>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-red-500 transition-colors"><XIcon /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <DetailCard label="Username" value={user.username} className="bg-indigo-50 text-indigo-800" />
            <DetailCard label="Balance" value={formatToTk(user.main_balance)} className="bg-green-50 text-green-700" />
            <DetailCard label="Wallet" value={formatToTk(user.wallet_balance)} />
            <DetailCard label="Phone" value={user.phone || "N/A"} />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <p className="font-bold text-sm text-gray-700 mb-2 flex items-center"><InfoIcon /> Settings</p>
             <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Access: <span className="font-bold text-indigo-600 uppercase">{user.captcha_access}</span></div>
                <div>Daily Limit: <span className="font-bold text-gray-900">{user.captcha_limit_per_day}</span></div>
             </div>
          </div>
        </div>
        <div className="p-4 bg-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 shadow-sm transition">Close</button>
        </div>
      </div>
    </div>
  );
};

const TransactionDetailsModal = ({ transaction, onClose }) => {
  const DetailCard = ({ label, value, className = "bg-gray-50 text-gray-700" }) => (
    <div className={`p-3 rounded-lg border border-gray-100 ${className}`}>
      <p className="text-[10px] font-medium uppercase text-gray-500 tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-bold truncate">{value}</p>
    </div>
  );
  const getTransactionStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 truncate">Transaction #{transaction.id} Details</h2>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-red-500 transition-colors"><XIcon /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailCard label="User" value={transaction.user?.name} className="bg-indigo-50 text-indigo-800" />
              <DetailCard label="Username" value={`@${transaction.user?.username}`} />
              <DetailCard label="Type" value={transaction.type} className={`capitalize ${transaction.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} />
              <DetailCard label="Source" value={transaction.source?.replace(/_/g, ' ')} className="capitalize" />
              <DetailCard label="Amount" value={formatToTk(transaction.amount)} className="font-bold" />
              <DetailCard label="Balance After" value={formatToTk(transaction.balance_after)} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase text-gray-500 tracking-wider mb-1">Status</p>
              <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight shadow-sm border ${getTransactionStatusStyles(transaction.status)}`}> {transaction.status} </span>
            </div>
            {transaction.description && (
              <div>
                <p className="text-[10px] font-medium uppercase text-gray-500 tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{transaction.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {transaction.transaction_date && <DetailCard label="Transaction Date" value={new Date(transaction.transaction_date).toLocaleString()} />}
              {transaction.created_at && <DetailCard label="Created At" value={new Date(transaction.created_at).toLocaleString()} />}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 shadow-sm transition">Close</button>
        </div>
      </div>
    </div>
  );
};

// ================= MAIN COMPONENT =================
const WithdrawallistTrn = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transSearchTerm, setTransSearchTerm] = useState("");
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [transPage, setTransPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const itemsPerPage = 15;

  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const token = localStorage.getItem("authToken");

  // --- 1. Fetch System Status (Withdraw On/Off) ---
  const { data: sysStatusData, isLoading: sysLoading } = useQuery({
    queryKey: ["systemStatus"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE.replace('/admin', '')}/system/status`);
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch system status");
      return json.data;
    }
  });

  // --- 2. Toggle Withdrawal System Mutation ---
  const toggleWithdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/admin/settings/withdraw-toggle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Toggle failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "System status updated!");
      queryClient.invalidateQueries(["systemStatus"]);
    },
    onError: (err) => toast.error(err.message),
  });

  // Fetch Withdrawals
  const { data: withdrawalsData, isLoading: loading } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load withdrawals");
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch Transactions
  const { data: transactionsData, isLoading: transLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/admin/withdrawals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete.");
      return id;
    },
    onSuccess: () => {
      toast.success("Deleted successfully!");
      queryClient.invalidateQueries(["withdrawals"]);
    },
  });

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This record will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) deleteMutation.mutate(id);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleReviewWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowReviewModal(true);
  };

  const handleEditWithdrawalDate = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDateModal(true);
  };

  const handleViewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailsModal(true);
  };

  const withdrawals = withdrawalsData?.data || [];
  const filteredWithdrawals = useMemo(() => withdrawals.filter(w => 
    w.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [withdrawals, searchTerm]);

  const transactions = transactionsData?.data || [];
  const filteredTransactions = useMemo(() => transactions.filter(t => 
    t.user?.name?.toLowerCase().includes(transSearchTerm.toLowerCase()) ||
    t.source?.toLowerCase().includes(transSearchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(transSearchTerm.toLowerCase())
  ), [transactions, transSearchTerm]);

  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (withdrawPage - 1) * itemsPerPage;
    return filteredWithdrawals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWithdrawals, withdrawPage]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (transPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, transPage]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100"> 
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-6 md:p-10">
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />

          <div className="max-w-7xl mx-auto">
            
            {/* ================= NEW: SYSTEM STATUS CONTROLS ================= */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className={`p-3 rounded-full mr-4 ${sysStatusData?.withdraw_system_enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                   <PowerIcon />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Withdrawal Gateway</h2>
                  <p className="text-sm text-gray-500">
                    Control whether users can submit new withdrawal requests.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Current Withdraw System</p>
                    <p className={`text-sm font-bold ${sysStatusData?.withdraw_system_enabled ? 'text-green-600' : 'text-red-600'}`}>
                       {sysStatusData?.withdraw_system_enabled ? 'ENABLED' : 'DISABLED'}
                    </p>
                 </div>
                 <button 
                  onClick={() => toggleWithdrawMutation.mutate()}
                  disabled={toggleWithdrawMutation.isPending || sysLoading}
                  className={`px-6 py-2.5 rounded-lg text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                    sysStatusData?.withdraw_system_enabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {toggleWithdrawMutation.isPending ? 'Updating...' : sysStatusData?.withdraw_system_enabled ? 'Switch Off' : 'Switch On'}
                </button>
              </div>
            </div>
            {/* ============================================================== */}

            {/* Withdrawals Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Withdrawal <span className="text-indigo-600">Portal</span></h1>
              <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                <span className="text-xs font-bold text-indigo-700">Total Entries: {withdrawals.length}</span>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name, username or method..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setWithdrawPage(1);
                }}
                className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-12">
              {loading ? <TableSkeleton /> : (<>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1976D2]">
                      <tr>
                        {["ID", "User", "Contact", "Amount", "Method", "Status", "Date", "Actions"].map(head => (
                          <th key={head} className="px-6 py-4 text-left text-[11px] font-black uppercase text-white tracking-widest">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {paginatedWithdrawals.map((item, idx) => (
                        <tr key={item.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/30 transition-colors`}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-400">#{item.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{item.user?.name}</span>
                              <span className="text-[10px] text-indigo-600 font-mono tracking-tighter">@{item.user?.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                            {item.user?.phone || "N/A"}
                          </td>
                          <td className="px-6 py-4 font-black text-green-600 text-sm">{formatToTk(item.amount)}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-800 block">{item.payment_method}</span>
                            <span className="text-[10px] text-gray-500">{item.account_details?.number}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md shadow-sm ${
                                item.status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' : 
                                item.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                                item.status?.toLowerCase() === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>{item.status}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                            {getWithdrawalDisplayDate(item) ? formatDateTime(getWithdrawalDisplayDate(item)) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => handleViewDetails(item.user)} className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-600 hover:text-white transition shadow-sm"><EyeIcon /></button>
                            <button onClick={() => handleReviewWithdrawal(item)} className="text-indigo-600 bg-indigo-50 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition shadow-sm"><EditIcon /></button>
                            <button onClick={() => handleEditWithdrawalDate(item)} className="text-amber-600 bg-amber-50 p-2 rounded-full hover:bg-amber-500 hover:text-white transition shadow-sm"><CalendarIcon /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 bg-red-50 p-2 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm"><DeleteIcon /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination for Withdrawals */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Entry {Math.min(filteredWithdrawals.length, (withdrawPage - 1) * itemsPerPage + 1)}-{Math.min(filteredWithdrawals.length, withdrawPage * itemsPerPage)} of {filteredWithdrawals.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={withdrawPage === 1}
                      onClick={() => setWithdrawPage(p => p - 1)}
                      className="px-4 py-2 text-xs font-bold bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    > Prev </button>
                    <button
                      disabled={withdrawPage * itemsPerPage >= filteredWithdrawals.length}
                      onClick={() => setWithdrawPage(p => p + 1)}
                      className="px-4 py-2 text-xs font-bold bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    > Next </button>
                  </div>
                </div>
              </>)}
            </div>

            {/* Transactions Section Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System <span className="text-indigo-600">Transactions</span></h1>
              <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                <span className="text-xs font-bold text-indigo-700">Logs: {transactions.length}</span>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Filter logs by user, source or type..."
                value={transSearchTerm}
                onChange={(e) => {
                  setTransSearchTerm(e.target.value);
                  setTransPage(1);
                }}
                className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {transLoading ? <TableSkeleton /> : (<>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#4338CA]">
                      <tr>
                        {["Date", "User", "Source", "Type", "Amount", "Balance", "Note", "Actions"].map(head => (
                          <th key={head} className="px-6 py-4 text-left text-[11px] font-black uppercase text-white tracking-widest">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {paginatedTransactions.map((item, idx) => (
                        <tr key={item.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/30 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-gray-400">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{item.user?.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">@{item.user?.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-tight">
                            {item.source?.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded shadow-sm ${
                              item.type?.toLowerCase() === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>{item.type}</span>
                          </td>
                          <td className={`px-6 py-4 font-black text-sm ${item.type?.toLowerCase() === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.type?.toLowerCase() === 'credit' ? '+' : '-'}{formatToTk(item.amount)}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-700 bg-gray-50/50">
                            {formatToTk(item.balance_after)}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">
                            {item.note || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => handleViewTransactionDetails(item)} className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-600 hover:text-white transition shadow-sm"><EyeIcon /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination for Transactions */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Entry {Math.min(filteredTransactions.length, (transPage - 1) * itemsPerPage + 1)}-{Math.min(filteredTransactions.length, transPage * itemsPerPage)} of {filteredTransactions.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={transPage === 1}
                      onClick={() => setTransPage(p => p - 1)}
                      className="px-4 py-2 text-xs font-bold bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    > Prev </button>
                    <button
                      disabled={transPage * itemsPerPage >= filteredTransactions.length}
                      onClick={() => setTransPage(p => p + 1)}
                      className="px-4 py-2 text-xs font-bold bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    > Next </button>
                  </div>
                </div>
              </>)}
            </div>
          </div>

          {/* Modals */}
          {showDetailsModal && selectedUser && <UserDetailsModal user={selectedUser} onClose={() => { setShowDetailsModal(false); setSelectedUser(null); }} />}
          {showReviewModal && selectedWithdrawal && <WithdrawalReviewModal withdrawal={selectedWithdrawal} onClose={() => { setShowReviewModal(false); setSelectedWithdrawal(null); }} />}
          {showDateModal && selectedWithdrawal && <WithdrawalDateModal withdrawal={selectedWithdrawal} onClose={() => { setShowDateModal(false); setSelectedWithdrawal(null); }} />}
          {showTransactionDetailsModal && selectedTransaction && <TransactionDetailsModal transaction={selectedTransaction} onClose={() => { setShowTransactionDetailsModal(false); setSelectedTransaction(null); }} />}
        </main>
      </div>
    </div>
  );
};

export default WithdrawallistTrn;
