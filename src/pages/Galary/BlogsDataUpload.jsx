import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const BlogsDataUpload = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  
  // Blog States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
  const token = localStorage.getItem("authToken");
  const queryClient = useQueryClient();

  // 1. Fetch Blogs
  const { data: blogData, isLoading } = useQuery({
    queryKey: ["blogs", currentPage],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/blogs?per_page=15&page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // 2. Submit Mutation (Create/Update)
  const submitMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      if (id) {
        formData.append("_method", "PATCH");
        return await axios.post(`${API_BASE}/blogs/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      } else {
        return await axios.post(`${API_BASE}/blogs`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Blog Updated!" : "Blog Published!");
      queryClient.invalidateQueries(["blogs"]);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Operation failed"),
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await axios.delete(`${API_BASE}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Blog Deleted");
      queryClient.invalidateQueries(["blogs"]);
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImage(null);
    setPreview(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setPreview(item.image_url);
    setImage(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete this blog?",
      text: "This action is permanent.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      background: "#ffffff",
    }).then((res) => { if (res.isConfirmed) deleteMutation.mutate(id); });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
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
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Blog Insights</h1>
              <p className="text-slate-500 font-medium">Create and manage your articles</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
              Create New Blog
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Cover</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Blog Title</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Date</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan="4" className="text-center py-20 text-slate-400 italic font-medium">Fetching Blogs...</td></tr>
                  ) : (
                    blogData?.data?.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <img src={item.image_url} className="h-12 w-20 object-cover rounded-lg border-2 border-white shadow-sm" alt="" />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.title}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center font-bold text-slate-500">
               <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border-2 rounded-xl hover:bg-white disabled:opacity-30 transition-all">Previous</button>
               <span className="text-sm tracking-widest">PAGE {currentPage} / {blogData?.meta?.last_page || 1}</span>
               <button disabled={currentPage === blogData?.meta?.last_page} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border-2 rounded-xl hover:bg-white disabled:opacity-30 transition-all">Next</button>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingId ? "Edit Article" : "Compose Article"}</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm transition-all">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Side: Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Blog Title</label>
                      <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 px-5 py-3 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-700" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="The Future of Housing..." />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Description</label>
                      <textarea rows="6" className="w-full bg-slate-50 border-2 border-slate-100 px-5 py-3 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-700 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Write your blog content here..." />
                    </div>
                  </div>

                  {/* Right Side: Image Upload */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Feature Image</label>
                    <div className="relative border-3 border-dashed border-slate-200 rounded-[2rem] h-full min-h-[250px] flex items-center justify-center overflow-hidden hover:bg-indigo-50/30 transition-all group cursor-pointer">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) { setImage(file); setPreview(URL.createObjectURL(file)); }
                      }} />
                      {preview ? (
                        <div className="w-full h-full relative">
                          <img src={preview} className="h-full w-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-white text-xs">Replace Image</div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="text-indigo-600 mb-2 flex justify-center"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                          <span className="text-slate-400 font-bold text-xs tracking-tight">Upload Thumbnail</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 disabled:bg-slate-200 disabled:text-slate-400 transition-all text-lg uppercase tracking-widest"
                >
                  {submitMutation.isPending ? "Syncing..." : editingId ? "Save Changes" : "Post Article"}
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

export default BlogsDataUpload;