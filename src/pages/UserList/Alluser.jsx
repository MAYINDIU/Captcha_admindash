import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components (Assuming these are available)
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= ICONS =================
// Simplified icon usage for professionalism
const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {children}
  </svg>
);
const PlusIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></Icon> );
const EditIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9" /></Icon> );
const DeleteIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></Icon> );
const EyeIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" /></Icon> );
const XIcon = ({ className = "h-6 w-6" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon> );
const InfoIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon> );

// ================= HELPER =================
const formatToTk = (amount) => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return "N/A";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  })
    .format(numericAmount)
    .replace("BDT", "Tk");
};

// ================= SKELETON LOADERS =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-[#1976D2] flex items-center px-6 space-x-4">
             <SkeletonPulse className="h-4 w-6 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-32 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-32 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-24 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-24 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-20 ml-auto bg-blue-400/50" />
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-8" />
                <SkeletonPulse className="h-6 w-24 rounded-full" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-12" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ================= DETAILS MODAL COMPONENT (Small & Material) =================

const UserDetailsModal = ({ user: summaryUser, onClose }) => {
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://alhamarahomesbd.com/captcha_backend/public/api";

  const { data: user, isFetching } = useQuery({
    queryKey: ["userDetails", summaryUser.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/users/${summaryUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to load user details");
      const json = await res.json();
      return json.data;
    },
    initialData: summaryUser, // Use list data as placeholder while fetching fresh details
  });

  // Reusable card for modal details
  const DetailCard = ({ label, value, className = "bg-gray-50 text-gray-700" }) => (
    <div className={`p-3 rounded-lg transition ${className} border border-gray-100`}>
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-base font-bold truncate">{value}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4"> {/* Backdrop blur removed */}
      {/* Reduced max-w-md for a smaller modal */}
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all relative overflow-hidden">
        {isFetching && (
           <div className="absolute top-4 right-12">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
           </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 border-b pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 truncate">
              {user.name}'s Profile
            </h2>
            <button
              onClick={onClose}
              className="p-1 -mr-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Core Details Grid - Tighter Spacing */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <DetailCard label="Username" value={user.username} className="bg-indigo-50 text-indigo-800 font-semibold" />
            <DetailCard label="Main Balance" value={formatToTk(user.main_balance)} className="bg-green-50 text-green-700 font-extrabold" />
            <DetailCard label="Wallet" value={formatToTk(user.wallet_balance)} />
            <DetailCard label="Phone" value={user.phone || "N/A"} />
            <DetailCard label="Working Days" value={user.working_days} />
            <DetailCard label="Referrer" value={user.referrer_username || "None"} />
          </div>
          
          {/* Captcha Settings Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
            <p className="font-bold text-sm text-gray-700 mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-indigo-600" /> Captcha Configuration
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 uppercase text-xs block">Access</span> <span className="font-semibold">{user.captcha_access}</span></div>
                <div><span className="text-gray-500 uppercase text-xs block">Daily Limit</span> <span className="font-semibold">{user.captcha_limit_per_day}</span></div>
                <div><span className="text-gray-500 uppercase text-xs block">Rate</span> <span className="font-semibold">{user.captcha_rate}</span></div>
                <div><span className="text-gray-500 uppercase text-xs block">Verified</span> <span className="font-semibold capitalize">{user.verification_status}</span></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= EDIT MODAL COMPONENT =================

const UserEditModal = ({ user: summaryUser, onClose }) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://alhamarahomesbd.com/captcha_backend/public/api";

  const { data: user } = useQuery({
    queryKey: ["userDetails", summaryUser.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/users/${summaryUser.id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const json = await res.json();
      return json.data;
    },
    initialData: summaryUser,
  });

  const [status, setStatus] = useState(user.status);
  const [captchaAccess, setCaptchaAccess] = useState(user.captcha_access === "enabled");
  const [captchaRate, setCaptchaRate] = useState(user.captcha_rate);
  const [captchaLimit, setCaptchaLimit] = useState(user.captcha_limit_per_day || 0);
  const [workingDays, setWorkingDays] = useState(user.working_days || 0);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentAction, setAdjustmentAction] = useState("credit");
  const [adjustmentReason, setAdjustmentReason] = useState("Admin adjustment");
  const [note, setNote] = useState("Updated by admin");

  // Synchronize local form state when fresh user data is fetched in the background
  useEffect(() => {
    if (user) {
      setStatus(user.status);
      setCaptchaAccess(user.captcha_access === "enabled" || user.captcha_access_enabled);
      setCaptchaRate(user.captcha_rate);
      setCaptchaLimit(user.captcha_limit_per_day || 0);
      setWorkingDays(user.working_days || 0);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, body, method = "POST" }) => {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Operation failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Updated successfully! 🎉");
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["userDetails", user.id]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-gray-900">Manage: {user.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500"><XIcon className="h-5 w-5" /></button>
          </div>

          <div className="space-y-6">
            {/* Note Field */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Action Note</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Reason for change..." />
            </div>

            {/* Account & General Settings */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status Update */}
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                  Status <button onClick={() => updateMutation.mutate({ endpoint: "status", body: { status } })} className="text-indigo-600 hover:underline">Update</button>
                </label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Working Days */}
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                  Working Days <button onClick={() => updateMutation.mutate({ endpoint: "working-days", body: { action: "set", days: parseInt(workingDays), note } })} className="text-indigo-600 hover:underline">Set</button>
                </label>
                <input type="number" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm" />
              </div>
            </div>

            {/* Bulk Captcha Settings */}
            <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-indigo-900">Captcha Settings</h3>
                <button
                  onClick={() => {
                    if (captchaLimit === "" || captchaLimit === null) {
                      return toast.warning("Daily Limit is required!");
                    }
                    updateMutation.mutate({ 
                      endpoint: "captcha-settings", 
                      method: "PATCH",
                      body: {
                        captcha_access_enabled: captchaAccess,
                        captcha_limit_per_day: parseInt(captchaLimit),
                      },
                    });
                  }}
                  className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Sync Settings
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={captchaAccess} onChange={(e) => setCaptchaAccess(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-xs font-medium text-gray-700 uppercase">Access Enabled</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Daily Limit</span>
                  <input
                    type="number"
                    value={captchaLimit}
                    onChange={(e) => setCaptchaLimit(e.target.value)}
                    className="w-16 p-1 border rounded text-xs"
                    required // Make the daily limit mandatory
                  />
                </div>
              </div>
             </div>

            {/* Captcha Rate */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Captcha Rate (BDT)</label>
                <input type="number" step="0.01" value={captchaRate} onChange={(e) => setCaptchaRate(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm" />
              </div>
              <button onClick={() => {
                if (isNaN(parseFloat(captchaRate)) || parseFloat(captchaRate) <= 0) {
                  toast.warning("Captcha Rate must be a valid positive number.");
                  return;
                }
                updateMutation.mutate({ endpoint: "captcha-rate", body: { value: parseFloat(captchaRate), note } });
              }} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition">Set Rate</button>
            </div>

            {/* Balance Adjustment */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <label className="text-xs font-bold text-amber-900 uppercase">Balance Adjustment</label>
              <div className="flex gap-2 mt-2">
                <select value={adjustmentAction} onChange={(e) => setAdjustmentAction(e.target.value)} className="p-2 border rounded-lg text-xs bg-white">
                  <option value="credit">Credit (+)</option>
                  <option value="debit">Debit (-)</option>
                </select>
                <input type="number" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Amount" />
              </div>
              <input 
                type="text" 
                value={adjustmentReason} 
                onChange={(e) => setAdjustmentReason(e.target.value)} 
                className="w-full mt-2 p-2 border rounded-lg text-xs bg-white" 
                placeholder="Adjustment reason..." 
              />
              <button
                onClick={() => updateMutation.mutate({ endpoint: "balance-adjust", body: { action: adjustmentAction, amount: parseFloat(adjustmentAmount), reason: adjustmentReason } })} 
                className="w-full mt-2 bg-amber-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition"
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition">Close</button>
        </div>
      </div>
    </div>
  );
};


// ================= MAIN COMPONENT =================
const Alluser = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const API_BASE = "https://alhamarahomesbd.com/captcha_backend/public/api";
  const token = localStorage.getItem("authToken");

  // --- React Query: Fetch Users ---
  const { data: usersData, isLoading: loading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      return data;
    },
    enabled: !!token,
  });

  // --- React Query: Mutation for Delete ---
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete user.");
      }
      return id;
    },
    onSuccess: () => {
      toast.success("User deleted successfully! 🗑️");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (err) => {
      toast.error(err.message || "Error deleting user.");
    }
  });

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the user. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444", 
      cancelButtonColor: "#6B7280", 
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowFormModal(true);
  };

  const users = usersData?.data || [];

  const filteredUsers = useMemo(() => users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [users, searchTerm]);

  // ================== RENDER (Final Professional Design) ==================
  return (
    // BG color applied to the main content area (left side of the screen)
    <div className="flex h-screen overflow-hidden bg-gray-100"> 
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-6 md:p-10">
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />

          <div className="max-w-7xl mx-auto">
            {/* Header & Add Button */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                User Management <span className="text-indigo-600">Portal</span>
              </h1>
              <button
                onClick={() => toast.info("Manual user creation is handled by registration.")}
                className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200 text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Add User
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search by name, username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
              />
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {loading ? (
                <TableSkeleton />
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-gray-500 text-lg">
                  🔍 No users matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1976D2]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">User Info</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Balances</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredUsers.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-indigo-50/50 transition duration-150 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900">{item.name}</span>
                                <span className="text-xs text-indigo-600 font-mono">@{item.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-700 font-medium">{item.email}</span>
                                <span className="text-xs text-gray-500">{item.phone || "No phone"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-green-600">Main: {formatToTk(item.main_balance)}</span>
                                <span className="text-xs text-gray-500">Wallet: {formatToTk(item.wallet_balance)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                    item.status === 'active' ? 'bg-green-100 text-green-700' : 
                                    item.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {item.status}
                                </span>
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                    item.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 
                                    item.verification_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {item.verification_status}
                                </span>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-center space-x-1">
                            <button
                              title="View User Profile"
                              onClick={() => handleViewDetails(item)}
                              className="text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 p-2 rounded-full transition duration-200 shadow-sm"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Edit User"
                              onClick={() => handleEditUser(item)}
                              className="text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 p-2 rounded-full transition duration-200 shadow-sm"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Delete User"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 p-2 rounded-full transition duration-200 shadow-sm"
                            >
                              <DeleteIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================== MODALS ================== */}
          {showDetailsModal && selectedUser && (
            <UserDetailsModal
              user={selectedUser}
              onClose={() => setShowDetailsModal(false)}
            />
          )}

          {showFormModal && selectedUser && (
            <UserEditModal
              user={selectedUser}
              onClose={() => setShowFormModal(false)}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default Alluser;