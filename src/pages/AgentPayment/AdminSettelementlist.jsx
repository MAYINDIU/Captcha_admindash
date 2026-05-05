import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { 
    FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaUserAlt 
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AdminSettlementList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewModalData, setViewModalData] = useState(null);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("pending");
    
    // States for Rejection Logic
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const queryClient = useQueryClient();
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const STORAGE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/storage";
    const token = localStorage.getItem("authToken");

    // 1. Fetch Admin Settlements
    const { data, isLoading } = useQuery({
        queryKey: ["admin-agent-settlements", page, statusFilter],
        queryFn: async () => {
            const response = await fetch(`${BASE_URL}/admin/agent-settlements?status=${statusFilter}&page=${page}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            return response.json();
        },
    });

    // 2. Approve Mutation
    const approveMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${BASE_URL}/admin/agent-settlements/${id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Approval failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-agent-settlements"]);
            closeModal();
            toast.success("Settlement approved successfully!");
        },
    });

    // 3. Reject Mutation (Updated to handle Reason body)
    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }) => {
            const res = await fetch(`${BASE_URL}/admin/agent-settlements/${id}/reject`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    "Content-Type": "application/json",
                    Accept: "application/json" 
                },
                body: JSON.stringify({ reason }),
            });
            if (!res.ok) throw new Error("Rejection failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-agent-settlements"]);
            closeModal();
            toast.warn("Settlement has been rejected.");
        },
    });

    const closeModal = () => {
        setViewModalData(null);
        setIsRejecting(false);
        setRejectionReason("");
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agent Settlements</h1>
                                <p className="text-slate-500 text-sm">Review and manage agent payout requests</p>
                            </div>
                            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                                {["pending", "approved", "rejected"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setStatusFilter(s); setPage(1); }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === s ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#1e293b]">
                                        <tr>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300">Agent</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300">Reference</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300">Amount</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300 text-center">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr><td colSpan="5" className="p-20 text-center text-slate-400">Loading requests...</td></tr>
                                        ) : data?.data?.map((item) => (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><FaUserAlt size={12}/></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-700 leading-none">{item.agent?.name}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1">{item.agent?.agent_code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.reference_no}</td>
                                                <td className="px-6 py-4 font-black text-slate-900">৳{parseFloat(item.amount).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => setViewModalData(item)}
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                                                    >
                                                        <FaEye size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>

                {/* MODAL: VIEW & PROCESS SETTLEMENT */}
                {viewModalData && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 bg-[#1e293b] text-white flex justify-between items-center">
                                <h3 className="text-xl font-bold">Review Settlement</h3>
                                <button onClick={closeModal} className="text-2xl opacity-50 hover:opacity-100">×</button>
                            </div>
                            
                            <div className="p-8 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Agent Name</p>
                                        <p className="font-bold text-slate-800">{viewModalData.agent?.name} ({viewModalData.agent?.agent_code})</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Requested Amount</p>
                                        <p className="text-xl font-black text-indigo-600">৳{parseFloat(viewModalData.amount).toLocaleString()}</p>
                                    </div>
                                </div>

                                {viewModalData.attachment_url && (
                                    <div className="mb-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Receipt Attachment</p>
                                        <div className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-50 p-2">
                                            <img 
                                                src={viewModalData.attachment_url.startsWith('http') ? viewModalData.attachment_url : `${STORAGE_URL}/${viewModalData.attachment_url}`} 
                                                alt="Receipt" 
                                                className="w-full h-auto max-h-72 object-contain rounded-xl"
                                                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Receipt+Not+Available'; }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-8">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Agent's Note</p>
                                    <p className="text-sm text-slate-600 italic leading-relaxed">"{viewModalData.note || 'No note provided'}"</p>
                                </div>

                                {/* ACTION BUTTONS SECTION */}
                                {viewModalData.status === "pending" ? (
                                    <div className="space-y-4">
                                        {isRejecting ? (
                                            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                                                <p className="text-[10px] font-bold text-rose-500 uppercase mb-2">Reason for Rejection</p>
                                                <textarea 
                                                    className="w-full p-3 text-sm rounded-xl border-rose-200 focus:ring-rose-500 focus:border-rose-500 mb-3"
                                                    placeholder="e.g. Transaction not found in bank statement"
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    rows="3"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button 
                                                        onClick={() => {setIsRejecting(false); setRejectionReason("");}}
                                                        className="py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                                                    >
                                                        Back
                                                    </button>
                                                    <button 
                                                        disabled={!rejectionReason.trim() || rejectMutation.isLoading}
                                                        onClick={() => rejectMutation.mutate({ id: viewModalData.id, reason: rejectionReason })}
                                                        className="py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all"
                                                    >
                                                        {rejectMutation.isLoading ? "Rejecting..." : "Confirm Rejection"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <button 
                                                    onClick={() => setIsRejecting(true)}
                                                    disabled={approveMutation.isLoading}
                                                    className="py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all border border-rose-200"
                                                >
                                                    Reject Request
                                                </button>
                                                <button 
                                                    onClick={() => approveMutation.mutate(viewModalData.id)}
                                                    disabled={approveMutation.isLoading}
                                                    className="py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                                >
                                                    {approveMutation.isLoading ? "Approving..." : "Approve & Payout"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {viewModalData.status === "rejected" && viewModalData.rejection_reason && (
                                            <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 mb-4">
                                                <p className="text-[10px] font-bold uppercase opacity-60">Rejection Reason</p>
                                                <p className="text-sm font-medium">{viewModalData.rejection_reason}</p>
                                            </div>
                                        )}
                                        <button 
                                            onClick={closeModal}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer position="bottom-right" />
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const colors = {
        approved: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        rejected: "bg-rose-500/10 text-rose-600 border-rose-200",
        pending: "bg-amber-500/10 text-amber-600 border-amber-200"
    }[s] || "bg-slate-50 text-slate-600 border-slate-200";

    const Icon = { approved: FaCheckCircle, rejected: FaTimesCircle, pending: FaClock }[s] || FaClock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${colors}`}>
            <Icon size={10} /> {status}
        </span>
    );
};

export default AdminSettlementList;