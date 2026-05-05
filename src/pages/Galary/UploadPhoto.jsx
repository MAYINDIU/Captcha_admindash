import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const UploadPhoto = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
  const token = localStorage.getItem("authToken");
  const queryClient = useQueryClient();

  const { data: galleryData, isLoading } = useQuery({
    queryKey: ["galleries", currentPage],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/galleries?per_page=15&page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      if (id) {
        formData.append("_method", "PATCH");
        return await axios.post(`${API_BASE}/galleries/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      } else {
        return await axios.post(`${API_BASE}/galleries`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Successfully Updated!" : "Successfully Uploaded!");
      queryClient.invalidateQueries(["galleries"]);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Operation failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await axios.delete(`${API_BASE}/galleries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Image Deleted");
      queryClient.invalidateQueries(["galleries"]);
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTitle("");
    setImage(null);
    setPreview(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setPreview(item.image_url);
    setImage(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove this asset?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      background: "#ffffff",
    }).then((res) => { if (res.isConfirmed) deleteMutation.mutate(id); });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    if (image) formData.append("image", image);
    submitMutation.mutate({ id: editingId, formData });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6 lg:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gallery Library</h1>
              <p className="text-slate-500 font-medium">Manage your digital portfolio assets</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
              Add New Photo
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                {/* NICE TABLE HEAD BG COLOR */}
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Preview</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Asset Title</th>
                           <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Uploaded Date</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan="3" className="text-center py-20 text-slate-400 font-medium italic">Loading your gallery...</td></tr>
                  ) : (
                    galleryData?.data?.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <img src={item.image_url} className="h-14 w-24 object-cover rounded-lg border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.title}</td>
                   <td className="px-6 py-4 font-bold text-slate-700">
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(item)} className="p-2.5 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9"/></svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-all">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* PAGINATION */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center font-bold text-slate-500">
               <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 border-2 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
               >Previous</button>
               <span className="text-sm">Page {currentPage} / {galleryData?.meta?.last_page || 1}</span>
               <button 
                disabled={currentPage === galleryData?.meta?.last_page}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 border-2 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
               >Next</button>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-slate-900/60 " />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800">{editingId ? "Update Photo" : "New Photo"}</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Asset Title</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 px-5 py-3 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Main Living Space" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Photo File</label>
                  <div className="relative border-3 border-dashed border-slate-200 rounded-[2rem] h-52 flex items-center justify-center overflow-hidden hover:bg-indigo-50/30 transition-all group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) { setImage(file); setPreview(URL.createObjectURL(file)); }
                      }}
                    />
                    {preview ? (
                      <div className="w-full h-full relative">
                        <img src={preview} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-white text-sm">Click to Change</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-indigo-600 mb-2 flex justify-center"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round" /></svg></div>
                        <span className="text-slate-400 font-bold text-sm tracking-tight">Select High Res Image</span>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                >
                  {submitMutation.isPending ? "Syncing Database..." : "Publish to Gallery"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default UploadPhoto;