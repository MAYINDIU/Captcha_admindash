import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { 
    FaPlus, FaMoneyBillWave, FaCheckCircle, 
    FaTimesCircle, FaClock, FaEye, FaSearch, 
    FaCloudUploadAlt, FaFileImage, FaTimes 
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { formatDateTime } from "../../utils/Utils";

const AgentPaymentSettelement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalData, setViewModalData] = useState(null);
    const [page, setPage] = useState(1);
    
    // State for the form including the File object
    const [formData, setFormData] = useState({
        amount: "",
        payment_method: "bank",
        reference_no: "",
        attachment: null, // Actual File object
        note: "",
    });

    const queryClient = useQueryClient();
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const STORAGE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/storage";
    const token = localStorage.getItem("authToken");

    // 1. Fetch Pending Balance
    const { data: pendingData } = useQuery({
        queryKey: ["pending-settlement-amount"],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/agent-settlements/my/pending`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            return res.json();
        }
    });

    const pendingBalance = pendingData?.data?.pending_settlement_amount || 0;

    // 2. Fetch Transaction History
    const { data, isLoading } = useQuery({
        queryKey: ["agent-settlements", page],
        queryFn: async () => {
            const response = await fetch(`${BASE_URL}/agent-settlements/my?per_page=15&page=${page}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            return response.json();
        },
        keepPreviousData: true,
    });

    // 3. Create Settlement Mutation (Multipart/Form-Data)
    const createSettlementMutation = useMutation({
        mutationFn: async (dataObject) => {
            const bodyFormData = new FormData();
            bodyFormData.append("amount", dataObject.amount);
            bodyFormData.append("payment_method", dataObject.payment_method);
            bodyFormData.append("reference_no", dataObject.reference_no);
            bodyFormData.append("note", dataObject.note);
            
            if (dataObject.attachment) {
                bodyFormData.append("attachment", dataObject.attachment);
            }

            const response = await fetch(`${BASE_URL}/agent-settlements/my`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Note: Browser automatically sets Content-Type to multipart/form-data with boundary
                    Accept: "application/json",
                },
                body: bodyFormData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Submission failed");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["agent-settlements"]);
            queryClient.invalidateQueries(["pending-settlement-amount"]);
            setIsModalOpen(false);
            setFormData({ amount: "", payment_method: "bank", reference_no: "", attachment: null, note: "" });
            toast.success("Settlement request submitted successfully!");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (parseFloat(formData.amount) > pendingBalance) {
            toast.error(`Insufficient balance. Max available: ৳${pendingBalance}`);
            return;
        }
        createSettlementMutation.mutate(formData);
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className="relative flex flex-col flex-1 overflow-y-auto">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Agent Settlements</h1>
                                <p className="text-slate-500 text-sm">Request and monitor your payouts</p>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <FaMoneyBillWave size={20} />
                                </div>
                                <div className="mr-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Available to Settle</p>
                                    <p className="text-xl font-black text-slate-900">৳{parseFloat(pendingBalance).toLocaleString()}</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg"
                                >
                                    + New Request
                                </button>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#1e293b]"> 
                                        <tr>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300">Date</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300">Ref No</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300">Amount</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300 text-center">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-300 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr><td colSpan="5" className="p-10 text-center animate-pulse">Loading records...</td></tr>
                                        ) : data?.data?.map((item) => (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    {formatDateTime(item.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.reference_no}</td>
                                                <td className="px-6 py-4 font-black text-slate-900">৳{parseFloat(item.amount).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => setViewModalData(item)}
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all"
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

                {/* MODAL: CREATE SETTLEMENT */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[95vh]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900">Submit Payout</h3>
                                <button onClick={() => setIsModalOpen(false)}><FaTimes className="text-slate-400 hover:text-slate-600" /></button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Settlement Amount</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold outline-none text-lg" 
                                        placeholder="0.00"
                                        value={formData.amount} 
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                                        required 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Method</label>
                                        <select 
                                            value={formData.payment_method} 
                                            onChange={(e) => setFormData({...formData, payment_method: e.target.value})} 
                                            className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs outline-none"
                                        >
                                            <option value="bank">Bank</option>
                                            <option value="mobile_banking">Mobile Banking</option>
                                            <option value="cash">Cash</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reference No</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs outline-none" 
                                            placeholder="Ref #"
                                            value={formData.reference_no} 
                                            onChange={(e) => setFormData({...formData, reference_no: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                </div>

                                {/* FILE UPLOAD */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Upload Attachment</label>
                                    <label className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-400 transition-colors cursor-pointer flex flex-col items-center justify-center bg-slate-50/50 group">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})} 
                                        />
                                        {formData.attachment ? (
                                            <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                                <FaFileImage />
                                                <span className="text-xs truncate max-w-[200px]">{formData.attachment.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FaCloudUploadAlt className="text-slate-300 group-hover:text-indigo-400 mb-2" size={28} />
                                                <span className="text-[10px] text-slate-400 font-bold">SELECT RECEIPT IMAGE</span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Note</label>
                                    <textarea 
                                        className="w-full p-4 bg-slate-50 rounded-xl text-xs outline-none" 
                                        rows="2" 
                                        placeholder="Add any extra details here..."
                                        value={formData.note} 
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                    ></textarea>
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="flex-1 py-3 font-bold text-slate-400"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={createSettlementMutation.isLoading}
                                        className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg disabled:bg-indigo-300"
                                    >
                                        {createSettlementMutation.isLoading ? "Sending..." : "Request Payout"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: VIEW DETAILS WITH IMAGE */}
                {viewModalData && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                            <div className="p-6 bg-[#1e293b] text-white flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Transaction ID: {viewModalData.id}</p>
                                    <h3 className="text-xl font-bold">Settlement Details</h3>
                                </div>
                                <button onClick={() => setViewModalData(null)}><FaTimes className="text-slate-400 hover:text-white" /></button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
                                        <p className="text-xl font-black text-slate-900">৳{parseFloat(viewModalData.amount).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                                        <StatusBadge status={viewModalData.status} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Method</p>
                                        <p className="text-sm font-bold text-slate-700 capitalize">{viewModalData.payment_method.replace('_', ' ')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Reference</p>
                                        <p className="text-sm font-bold text-slate-700">{viewModalData.reference_no}</p>
                                    </div>
                                </div>

                                {/* ATTACHMENT DISPLAY LOGIC */}
                                {viewModalData.attachment_url && (
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Receipt</p>
                                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                                            <img 
                                                src={
                                                    viewModalData.attachment_url.startsWith('http') 
                                                    ? viewModalData.attachment_url 
                                                    : `${STORAGE_URL}/${viewModalData.attachment_url}`
                                                } 
                                                alt="Receipt Proof" 
                                                className="max-w-full h-auto max-h-64 object-contain rounded-lg shadow-sm"
                                                onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=Receipt+Not+Available'; }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Agent Note</p>
                                    <p className="text-sm text-slate-600 italic leading-relaxed">"{viewModalData.note || 'No note available'}"</p>
                                </div>

                                <button 
                                    onClick={() => setViewModalData(null)} 
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer position="bottom-right" />
            </div>
        </div>
    );
};

// Reusable Status Badge Component
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

export default AgentPaymentSettelement;
