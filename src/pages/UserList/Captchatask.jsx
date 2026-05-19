import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= ICONS =================
const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{children}</svg>
);
const PlusIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></Icon>;
const EditIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9" /></Icon>;
const DeleteIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></Icon>;
const EyeIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" /></Icon>;
const XIcon = () => <Icon className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>;

// ================= SKELETON =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

// ================= HELPERS =================
const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case "active": return "bg-green-100 text-green-700 border-green-200";
    case "draft": return "bg-gray-100 text-gray-700 border-gray-200";
    case "inactive": return "bg-amber-100 text-amber-700 border-amber-200";
    case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
    case "archived": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-50 text-gray-600 border-gray-100";
  }
};

// ================= DETAILS MODAL =================
const CaptchaDetailsModal = ({ item, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500"><XIcon /></button>
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase">Title</span>
            <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-[10px] uppercase text-gray-500 block">Reward</span>
              <span className="font-bold text-sm capitalize text-indigo-600">{item.reward} BDT</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-[10px] uppercase text-gray-500 block">Status</span>
              <span className={`font-bold text-[10px] px-2 py-0.5 rounded border uppercase ${getStatusStyles(item.status)}`}>{item.status}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-[10px] uppercase text-gray-500 block">Created</span>
              <span className="font-bold text-[10px]">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">Instructions</span>
            <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border italic">{item.instructions}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase">Expected Answer</span>
            <div className="mt-1 text-sm font-mono font-bold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              {item.expected_answer}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-100 flex justify-end">
        <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Close</button>
      </div>
    </div>
  </div>
);

// ================= CREATE MODAL =================
const CreateCaptchaModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const [formData, setFormData] = useState({
    title: "", description: "", reward: 5, status: "active", instructions: "", expected_answer: ""
  });

  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(`${API_BASE}/admin/captcha-tasks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ ...body, reward: parseFloat(body.reward), status: body.status || "active" }),
      });
      let data = {};
      try { data = await res.json(); } catch (e) { data = { message: "Server error" }; }
      if (!res.ok) throw new Error(data.message || "Failed to create task");
      return data;
    },
    onSuccess: () => {
      toast.success("Captcha Task created successfully! 🚀");
      queryClient.invalidateQueries(["captchaTasks"]);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-gray-900">Create Captcha Task</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500"><XIcon /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                <input name="title" required value={formData.title} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="Demo Captcha" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Reward (BDT)</label>
                <input name="reward" type="number" step="0.01" required value={formData.reward} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" rows="2" placeholder="Task details..." />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Instructions</label>
              <input name="instructions" required value={formData.instructions} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="Type ABC123" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Expected Answer</label>
              <input name="expected_answer" required value={formData.expected_answer} onChange={handleChange} className="w-full mt-1 p-2 border border-indigo-200 rounded-lg text-sm font-mono" placeholder="ABC123" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">
                {createMutation.isPending ? "Creating..." : "Save Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ================= EDIT MODAL =================
const EditCaptchaModal = ({ item, onClose }) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");
  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const [formData, setFormData] = useState({
    title: item.title || "",
    description: item.description || "",
    reward: item.reward || 0,
    status: item.status || "active",
    instructions: item.instructions || "",
    expected_answer: item.expected_answer || ""
  });

  const updateMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(`${API_BASE}/admin/captcha-tasks/${item.id}`, {
        method: "POST", // Using POST with _method spoofing for better compatibility
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          ...body, 
          reward: parseFloat(body.reward),
          _method: "PUT" 
        }),
      });
      let data = {};
      try { data = await res.json(); } catch (e) { data = { message: "Server error" }; }
      if (!res.ok) throw new Error(data.message || "Failed to update task");
      return data;
    },
    onSuccess: () => {
      toast.success("Captcha Task updated successfully! 🛠️");
      queryClient.invalidateQueries(["captchaTasks"]);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-gray-900">Edit Task #{item.id}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500"><XIcon /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                <input name="title" required value={formData.title} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Reward (BDT)</label>
                <input name="reward" type="number" step="0.01" required value={formData.reward} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" rows="2" placeholder="Task details..." />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Instructions</label>
              <input name="instructions" required value={formData.instructions} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm" placeholder="Type ABC123" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Expected Answer</label>
              <input name="expected_answer" required value={formData.expected_answer} onChange={handleChange} className="w-full mt-1 p-2 border border-indigo-200 rounded-lg text-sm font-mono" placeholder="ABC123" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg text-sm bg-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold">Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">
                {updateMutation.isPending ? "Updating..." : "Update Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ================= MAIN COMPONENT =================
const Captchatask = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_BASE = "https://fastwork24.com/captcha_backend/public/api";
  const token = localStorage.getItem("authToken");

  const { data: taskData, isLoading } = useQuery({
    queryKey: ["captchaTasks"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/captcha-tasks`, {
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json" 
        },
      });
      if (!res.ok) throw new Error("Failed to load tasks");
      return await res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/admin/captcha-tasks/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Task removed successfully!");
      queryClient.invalidateQueries(["captchaTasks"]);
    }
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const filteredTasks = useMemo(() => {
    return (taskData?.data || []).filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [taskData, searchTerm]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-6 md:p-10">
          <ToastContainer position="top-right" autoClose={2000} />

          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Captcha <span className="text-indigo-600">Tasks</span>
              </h1>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition">
                <PlusIcon /> <span className="ml-2">Create New</span>
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search tasks by title or instruction..."
                className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => <SkeletonPulse key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1976D2]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Task Title</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Reward</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTasks.map((item) => (
                        <tr key={item.id} className="hover:bg-indigo-50/30 transition">
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{item.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 truncate max-w-xs">{item.title}</div>
                            <span className="text-[10px] text-gray-500 truncate block">{item.instructions}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-indigo-600">{item.reward} BDT</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded shadow-sm border ${getStatusStyles(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                            <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-600 hover:text-white transition shadow-sm"><EyeIcon /></button>
                            <button onClick={() => { setSelectedItem(item); setShowEditModal(true); }} className="p-2 text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-600 hover:text-white transition shadow-sm"><EditIcon /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm"><DeleteIcon /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {showDetails && selectedItem && (
            <CaptchaDetailsModal item={selectedItem} onClose={() => setShowDetails(false)} />
          )}
          {showCreateModal && <CreateCaptchaModal onClose={() => setShowCreateModal(false)} />}
          {showEditModal && selectedItem && <EditCaptchaModal item={selectedItem} onClose={() => setShowEditModal(false)} />}
        </main>
      </div>
    </div>
  );
};

export default Captchatask;