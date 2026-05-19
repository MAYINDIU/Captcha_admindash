import React, { useState, useMemo } from "react";
import { formatDateTime } from "../../utils/Utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these paths are correct for your project
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const ASSET_BASE = "https://fastwork24.com/captcha_backend/public/storage/";
const API_BASE = "https://fastwork24.com/captcha_backend/public/api";

// ================= ICONS =================
const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {children}
  </svg>
);
const EditIcon = ({ className }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" /></Icon>;
const DeleteIcon = ({ className }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></Icon>;
const XIcon = ({ className }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>;
const SearchIcon = ({ className }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></Icon>;

// ================= SKELETON LOADERS =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
const TableSkeleton = () => (
  <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
    <div className="h-14 bg-slate-50 border-b border-slate-200 flex items-center px-6 space-x-4">
      <SkeletonPulse className="h-4 w-32" /><SkeletonPulse className="h-4 w-48" /><SkeletonPulse className="h-4 w-24" /><SkeletonPulse className="h-4 w-32" />
    </div>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center px-6 py-5 border-b border-slate-100 space-x-4">
        <SkeletonPulse className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2"><SkeletonPulse className="h-4 w-1/4" /><SkeletonPulse className="h-3 w-1/6" /></div>
        <SkeletonPulse className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

// ================= REVIEW MODAL COMPONENT =================
const VerificationReviewModal = ({ request, onClose }) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const [notes, setNotes] = useState(request.notes || "");

  const updateMutation = useMutation({
    mutationFn: async ({ status }) => {
      const res = await fetch(`${API_BASE}/admin/verification-requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Operation failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Updated successfully!");
      queryClient.invalidateQueries(["verificationRequests"]);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const DocumentImage = ({ path, label }) => (
    <div className="flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
      <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 aspect-square flex items-center justify-center group relative">
        {path ? (
          <img 
            src={`${ASSET_BASE}${path}`} 
            alt={label} 
            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500" 
            onClick={() => window.open(`${ASSET_BASE}${path}`, '_blank')}
          />
        ) : (
          <span className="text-[10px] text-slate-400 italic font-medium tracking-tight">Image not available</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Review Submission</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition"><XIcon className="h-6 w-6 text-gray-400" /></button>
          </div>

          <div className="space-y-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-2 gap-y-4 shadow-inner">
              <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">User Account</p><p className="text-sm font-bold text-slate-800">{request.user?.name}</p></div>
              <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Handle</p><p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">@{request.user?.username}</p></div>
              <div className="col-span-2"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Document Identity</p><p className="text-sm font-mono font-bold text-slate-700 mt-0.5">{request.document_number}</p></div>
            </div>

            <div className="flex gap-4 p-1">
              <DocumentImage path={request.document_front_path} label="Front View" />
              <DocumentImage path={request.document_back_path} label="Back View" />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Admin Response Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" 
                placeholder="Reason for approval or rejection..." 
              />
            </div>

            <div className="flex gap-3">
              <button 
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status: "approved" })}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-sm font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                Approve Submission
              </button>
              <button 
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status: "rejected" })}
                className="flex-1 bg-rose-500 text-white py-4 rounded-2xl text-sm font-black hover:bg-rose-600 transition shadow-lg shadow-rose-200 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= MAIN COMPONENT =================
const VerificationList = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["verificationRequests", page],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/verification-requests`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load data");
      return await res.json();
    },
    keepPreviousData: true,
  });
  console.log("Fetched verification requests:", requestsData);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/admin/verification-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Deleted successfully!");
      queryClient.invalidateQueries(["verificationRequests"]);
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const requests = requestsData?.data || [];
  const filteredRequests = useMemo(() => requests.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [requests, searchTerm]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6 lg:p-10">
          <ToastContainer position="top-right" autoClose={2000} />

          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Identity <span className="text-indigo-600">Verification</span></h1>
                <p className="text-slate-500 mt-1 font-medium italic">Audit and approve user identification documents</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Filter by name or username..."
                    className="bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none w-72 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Document Data</th>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Process Status</th>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Submission Date</th>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRequests.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-700">{item.full_name}</span>
                                <span className="text-xs font-bold text-indigo-500/70">@{item.user?.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded w-fit mb-1">{item.document_type?.replace(/_/g, ' ')}</span>
                                <span className="text-[11px] font-mono font-bold text-slate-400">{item.document_number}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm border ${
                                item.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                item.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-400">
                              {item.submitted_at ? formatDateTime(item.submitted_at) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => setSelectedRequest(item)} className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"><EditIcon className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"><DeleteIcon className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entry {requestsData?.meta?.from}-{requestsData?.meta?.to} of {requestsData?.meta?.total}</p>
                    <div className="flex gap-2">
                      <button 
                        disabled={page === 1}
                        onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                        className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button 
                        disabled={page === requestsData?.meta?.last_page}
                        onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                        className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedRequest && (
            <VerificationReviewModal
              request={selectedRequest}
              onClose={() => setSelectedRequest(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default VerificationList;
