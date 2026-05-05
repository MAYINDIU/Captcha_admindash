import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header"; 
import { AiOutlineClose, AiOutlineCalendar, AiOutlineEdit, AiOutlineTrophy } from "react-icons/ai";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import Swal from "sweetalert2";

// DatePicker & Formatting
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const PromotionSessionsList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Initial Data Structure based on your format
  const initialFormState = {
    name: "",
    session_type: "monthly",
    start_date: new Date(),
    end_date: new Date(),
    target_metric: "down_payment_count",
    target_value: 20,
    min_product_or_share_sales: 2,
    rules: [
      { slot_no: 1, eligibility_basis: "personal", finance_verified_only: true, incentive_type: "" }
    ],
  };

  const [formData, setFormData] = useState(initialFormState);

  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/promotions/sessions";

  // --- 1. Fetch Data ---
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["promotionSessions"],
    queryFn: async () => {
      const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!token,
  });

  const sessions = apiResponse?.data || [];
  const filteredSessions = useMemo(
    () => sessions.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [sessions, searchTerm]
  );

  // --- 2. Helper for JSON Formatting ---
  const formatPayload = (data) => ({
    name: data.name,
    session_type: data.session_type,
    start_date: format(new Date(data.start_date), "yyyy-MM-dd"),
    end_date: format(new Date(data.end_date), "yyyy-MM-dd"),
    target_metric: data.target_metric,
    target_value: Number(data.target_value),
    min_product_or_share_sales: Number(data.min_product_or_share_sales),
    rules: data.rules.map(rule => ({
      slot_no: Number(rule.slot_no),
      eligibility_basis: rule.eligibility_basis,
      finance_verified_only: true,
      incentive_type: rule.incentive_type,
      ...(rule.fund_amount ? { fund_amount: Number(rule.fund_amount), currency: "BDT" } : {})
    }))
  });

  // --- 3. Mutations (Create, Patch, Delete) ---
  const formMutation = useMutation({
    mutationFn: async (payload) => {
      const url = isEditing ? `${API_BASE}/${selectedSession.id}` : API_BASE;
      const method = isEditing ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formatPayload(payload)),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Operation failed");
      return result;
    },
    onSuccess: () => {
      toast.success(isEditing ? "Updated Successfully!" : "Created Successfully!");
      queryClient.invalidateQueries(["promotionSessions"]);
      setIsFormModalOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Session deleted successfully");
      queryClient.invalidateQueries(["promotionSessions"]);
    },
  });

  // --- 4. Handlers ---
  const handleEdit = (row) => {
    setSelectedSession(row);
    setFormData({
      ...row,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      rules: row.rules.length > 0 ? row.rules : initialFormState.rules
    });
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "All data related to this session will be removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const activateMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/${id}/activate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Activation failed");
    },
    onSuccess: () => {
      toast.success("Session activated successfully");
      queryClient.invalidateQueries(["promotionSessions"]);
    },
    onError: (err) => toast.error(err.message),
  });

  const closeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/${id}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Closing failed");
    },
    onSuccess: () => {
      toast.success("Session closed successfully");
      queryClient.invalidateQueries(["promotionSessions"]);
    },
    onError: (err) => toast.error(err.message),
  });

  const commonButtonClasses = "px-2 py-1 rounded-lg text-white text-xs font-bold transition duration-200";
  const activateButtonClasses = `bg-green-600 hover:bg-green-700 ${commonButtonClasses}`;
  const closeButtonClasses = `bg-red-600 hover:bg-red-700 ${commonButtonClasses}`;
  const editButtonClasses = `bg-amber-500 hover:bg-amber-600 ${commonButtonClasses}`;
  const deleteButtonClasses = `bg-red-500 hover:bg-red-600 ${commonButtonClasses}`;

 const columns = [
    { 
      name: "SL", 
      selector: (_, i) => i + 1, 
      width: "40px",
      center: true 
    },
    { 
      name: "Campaign Name", 
      selector: (row) => row.name, 
      sortable: true, 
      grow: 2,
      minWidth: '210px',
      wrap: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{row.name}</span>
          <span className="text-xs text-slate-400">ID: #{row.id}</span>
        </div>
      )
    },
    { 
      name: "Status", 
      selector: (row) => row.status, 
      width: "100px",
      center: true,
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          row.status === 'active' ? 'bg-green-100 text-green-700' : 
          row.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      name: "Duration", 
      selector: (row) => row.start_date,
      minWidth: "180px",
      cell: (row) => (
        <div className="text-xs">
          <span className="text-blue-600 font-medium">{format(new Date(row.start_date), "dd MMM yyyy")}</span>
          <br />
          <span className="text-slate-500">to {format(new Date(row.end_date), "dd MMM yyyy")}</span>
        </div>
      )
    },
    { 
      name: "Target & Rules", 
      selector: (row) => row.target_value, 
      minWidth: "160px",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{row.target_value} {row.target_metric.replace(/_/g, ' ')}</span>
          <span className="text-[10px] text-blue-500 font-bold">{row.rules?.length || 0} Incentive Tiers</span>
        </div>
      )
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => { setSelectedSession(row); setIsDetailModalOpen(true); }} 
            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"
            title="View Details"
          >
            <FaEye size={16}/>
          </button>
          <button 
            onClick={() => handleEdit(row)} 
            className="text-amber-500 hover:bg-amber-50 p-2 rounded-lg transition"
            title="Edit"
          >
            <AiOutlineEdit size={16}/>
          </button>
          {row.status !== 'active' && <button onClick={() => activateMutation.mutate(row.id)} className={activateButtonClasses} disabled={activateMutation.isLoading}>Activate</button>}
          {row.status === 'active' && <button onClick={() => closeMutation.mutate(row.id)} className={closeButtonClasses} disabled={closeMutation.isLoading}>Close</button>}
          <button 
            onClick={() => handleDelete(row.id)} 
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
            title="Delete"
          >
            <FaTrash size={14}/>
          </button>
        </div>
      ),
      right: true,
      minWidth: '250px',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto bg-slate-50">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 md:p-8 grow">
          <ToastContainer position="top-right" autoClose={2000} />
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Promotions Dashboard</h2>
              <button onClick={() => { setIsEditing(false); setFormData(initialFormState); setIsFormModalOpen(true); }} 
                className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg">
                <FaPlus /> New Campaign
              </button>
            </div>

            <div className="mb-4">
              <input type="text" placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"/>
            </div>

            {isLoading ? <Skeleton count={8} height={55} className="mb-2" /> : <DataTable columns={columns} data={filteredSessions} pagination highlightOnHover responsive dense />}
          </div>

          {/* --- FORM MODAL (CREATE & PATCH) --- */}
          {isFormModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-auto animate-in zoom-in duration-300 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">{isEditing ? "Update Campaign Details" : "Launch New Campaign"}</h3>
                  <button onClick={() => setIsFormModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition"><AiOutlineClose size={20} /></button>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Campaign Title</label>
                      <input type="text" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Monthly Promotion - Mar 2026" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                      <DatePicker selected={formData.start_date} onChange={d => setFormData({...formData, start_date: d})} dateFormat="dd-MM-yyyy" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                      <DatePicker selected={formData.end_date} onChange={d => setFormData({...formData, end_date: d})} dateFormat="dd-MM-yyyy" minDate={formData.start_date} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Metric</label>
                      <input type="text" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.target_metric} onChange={(e) => setFormData({...formData, target_metric: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Value</label>
                      <input type="number" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.target_value} onChange={(e) => setFormData({...formData, target_value: e.target.value})} />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-tighter">Reward Rules</h4>
                      <button onClick={() => setFormData({...formData, rules: [...formData.rules, { slot_no: formData.rules.length + 1, eligibility_basis: "personal", incentive_type: "" }]})} 
                        className="text-blue-600 text-xs font-bold hover:underline">+ Add New Tier</button>
                    </div>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {formData.rules.map((rule, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
                          <input type="text" placeholder="Eligibility" className="bg-slate-50 border-none rounded-lg p-2 text-[10px]" value={rule.eligibility_basis} onChange={(e) => { const r = [...formData.rules]; r[idx].eligibility_basis = e.target.value; setFormData({...formData, rules: r}); }} />
                          <input type="text" placeholder="Type" className="bg-slate-50 border-none rounded-lg p-2 text-[10px]" value={rule.incentive_type} onChange={(e) => { const r = [...formData.rules]; r[idx].incentive_type = e.target.value; setFormData({...formData, rules: r}); }} />
                          <input type="number" placeholder="Amount" className="bg-slate-50 border-none rounded-lg p-2 text-[10px]" value={rule.fund_amount || ""} onChange={(e) => { const r = [...formData.rules]; r[idx].fund_amount = e.target.value; setFormData({...formData, rules: r}); }} />
                          <div className="flex justify-end">{formData.rules.length > 1 && <button onClick={() => setFormData({...formData, rules: formData.rules.filter((_, i) => i !== idx)})} className="text-red-400 hover:text-red-600 transition"><FaTrash size={12}/></button>}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => formMutation.mutate(formData)} disabled={formMutation.isLoading}
                    className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all disabled:opacity-50">
                    {formMutation.isLoading ? "Saving Changes..." : isEditing ? "Update Campaign" : "Launch Campaign"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- DETAIL MODAL --- */}
          {isDetailModalOpen && selectedSession && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60  p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold">{selectedSession.name}</h3>
                  <button onClick={() => setIsDetailModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition"><AiOutlineClose size={20} /></button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Target Metric</p>
                      <p className="font-bold text-slate-800">{selectedSession.target_metric}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Target Value</p>
                      <p className="font-bold text-slate-800">{selectedSession.target_value} Units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <AiOutlineCalendar size={24} className="text-blue-500" />
                    <p className="text-sm font-bold text-blue-900">{format(new Date(selectedSession.start_date), "dd MMM")} - {format(new Date(selectedSession.end_date), "dd MMM, yyyy")}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><AiOutlineTrophy className="text-orange-500"/> Reward Tiers</h4>
                    <div className="space-y-2">
                      {selectedSession.rules?.map((r, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                          <span className="text-xs font-bold text-slate-700 capitalize">Tier {r.slot_no}: {r.incentive_type}</span>
                          <span className="text-xs font-black text-green-600">{r.fund_amount ? `${r.fund_amount} BDT` : 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PromotionSessionsList;