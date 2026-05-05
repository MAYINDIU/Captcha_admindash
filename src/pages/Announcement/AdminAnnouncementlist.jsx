import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Label, TextInput, Textarea, Select, Button, FileInput } from "flowbite-react";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= ICON COMPONENTS =================
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const CloseIconMini = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

// ================= SKELETON LOADERS =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const AnnouncementTableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-6 space-x-4">
             <SkeletonPulse className="h-4 w-8" />
             <SkeletonPulse className="h-4 w-1/4" />
             <SkeletonPulse className="h-4 w-1/3" />
             <SkeletonPulse className="h-4 w-24" />
             <SkeletonPulse className="h-4 w-20 ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-8" />
                <SkeletonPulse className="h-4 w-1/4" />
                <SkeletonPulse className="h-4 w-1/3" />
                <SkeletonPulse className="h-6 w-24 rounded-full" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ================= MAIN COMPONENT =================
const AdminAnnouncementlist = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewAnnouncement, setViewAnnouncement] = useState(null);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        image_urls: [],
        target_type: "rank_wise",
        target_ranks: [],
    });

    const token = localStorage.getItem("authToken");
    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const STORAGE_URL_PREFIX = "https://alhamarahomesbd.com/alhamra-backend/storage/";

    // ================= AUTH CHECK & INITIAL FETCH =================
    useEffect(() => {
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first!", "warning").then(() => {
                window.location.href = "/login";
            });
        }
    }, [token]);

    // ================= REACT QUERY: FETCH ANNOUNCEMENTS =================
    const fetchAnnouncements = async (pageParam) => {
        const res = await fetch(`${API_BASE}/announcements?page=${pageParam}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            throw new Error("Unauthorized");
        }

        if (!res.ok) throw new Error("Failed to fetch announcements");
        return res.json();
    };

    const { data: announcementData, isLoading: loading } = useQuery({
        queryKey: ["announcements", page],
        queryFn: () => fetchAnnouncements(page),
        keepPreviousData: true, // Keeps data visible while fetching next page
    });

    const announcements = announcementData?.data || [];
    const meta = announcementData?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 15 };

    // ================= REACT QUERY: FETCH RANKS (DESIGNATIONS) =================
    const fetchRanks = async () => {
        const res = await fetch(`${API_BASE}/ranks`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error("Failed to fetch ranks");
        return res.json();
    };

    const { data: ranksData } = useQuery({
        queryKey: ["ranks"],
        queryFn: fetchRanks,
        staleTime: 1000 * 60 * 60, // Cache ranks for 1 hour
    });

    // ================= REACT QUERY: MUTATIONS =================
    
    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (newAnnouncement) => {
            const res = await fetch(`${API_BASE}/announcements`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: newAnnouncement,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || (data.errors ? Object.values(data.errors)[0][0] : "Failed to create"));
            return data;
        },
        onSuccess: () => {
            toast.success("Announcement created successfully!");
            queryClient.invalidateQueries(["announcements"]);
        },
        onError: (err) => toast.error(err.message),
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`${API_BASE}/announcements/${id}`, {
                method: "POST", // Use POST for FormData updates
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: data,
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || (resData.errors ? Object.values(resData.errors)[0][0] : "Failed to update"));
            return resData;
        },
        onSuccess: () => {
            toast.success("Announcement updated successfully!");
            queryClient.invalidateQueries(["announcements"]);
        },
        onError: (err) => toast.error(err.message),
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE}/announcements/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete");
            }
            return id;
        },
        onSuccess: () => {
            toast.success("Announcement deleted successfully!");
            queryClient.invalidateQueries(["announcements"]);
            // Adjust page if deleting the last item on the current page
            if (announcements.length === 1 && page > 1) {
                setPage(old => old - 1);
            }
        },
        onError: (err) => toast.error(err.message),
    });

    // ================= MODAL AND FORM HANDLERS =================
    const handleOpenCreateModal = () => {
        setEditingAnnouncement(null);
        setFilesToUpload([]);
        setFormData({
            title: "",
            message: "",
            image_urls: [],
            target_type: "rank_wise",
            target_ranks: [],
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (announcement) => {
        setEditingAnnouncement(announcement);
        setFilesToUpload([]);
        let imageUrls = [];
        if (announcement.image_urls && Array.isArray(announcement.image_urls)) {
            imageUrls = announcement.image_urls;
        } else if (announcement.image_url) {
            // Handle single or comma-separated string for backward compatibility
            imageUrls = announcement.image_url.split(',').map(url => url.trim()).filter(url => url);
        }
        setFormData({
            title: announcement.title || "",
            message: announcement.message || "",
            target_type: announcement.target_type || "rank_wise",
            image_urls: imageUrls,
            target_ranks: announcement.target_ranks || [],
        });
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (announcement) => {
        setViewAnnouncement(announcement);
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAnnouncement(null);
    };

    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'target_ranks') {
            const selectedRanks = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
            setFormData(prev => ({ ...prev, target_ranks: selectedRanks }));
        } else if (name === 'images' && files) {
            setFilesToUpload(prev => [...prev, ...Array.from(files)]);
            e.target.value = ''; // Reset file input to allow selecting the same file again
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const removeNewImage = (index) => {
        setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (urlToRemove) => {
        setFormData(prev => ({
            ...prev,
            image_urls: prev.image_urls.filter(url => url !== urlToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.title || !formData.message) {
            toast.error("Title and message are required!");
            setIsSubmitting(false);
            return;
        }
        if (formData.target_type === 'rank_wise' && formData.target_ranks.length === 0) {
            toast.error("At least one designation must be selected for rank-wise targeting.");
            setIsSubmitting(false);
            return;
        }

        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('message', formData.message);
        submissionData.append('target_type', formData.target_type);

        if (formData.target_type === 'rank_wise') {
            formData.target_ranks.forEach(rankId => {
                submissionData.append('target_ranks[]', rankId);
            });
        }

        // Append existing image URLs that are being kept
        formData.image_urls.forEach(url => {
            submissionData.append('image_urls[]', url);
        });

        // Append new files for upload
        filesToUpload.forEach(file => {
            submissionData.append('images[]', file);
        });

        try {
            if (editingAnnouncement) {
                submissionData.append('_method', 'PUT'); // For Laravel to recognize it as a PUT request
                await updateMutation.mutateAsync({ id: editingAnnouncement.id, data: submissionData });
            } else {
                await createMutation.mutateAsync(submissionData);
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error.message || "An error occurred during submission. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This announcement will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444", // Red
            cancelButtonColor: "#6B7280", // Gray
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    // ================= RENDER =================
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-4 md:p-8">
                    <ToastContainer position="top-right" autoClose={5000} theme="colored" />
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Title and Action Button */}
                        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-200">
                            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                                Manage Announcements
                            </h1>
                            <button
                                onClick={handleOpenCreateModal}
                                className="flex items-center bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-[1.02]"
                            >
                                <PlusIcon />
                                <span>Add New Announcement</span>
                            </button>
                        </div>

                        {/* Create/Edit Modal */}
                        <Modal show={isModalOpen} onClose={handleCloseModal} size="4xl">
                            <Modal.Header>{editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}</Modal.Header>
                            <Modal.Body>
                                <form id="announcement-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="title" value="Title" />
                                        </div>
                                        <TextInput id="title" name="title" value={formData.title} onChange={handleFormChange} placeholder="Urgent Branch Notice" required />
                                    </div>
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="message" value="Message" />
                                        </div>
                                        <Textarea id="message" name="message" value={formData.message} onChange={handleFormChange} placeholder="Please attend the meeting at 5 PM." required rows={4} />
                                    </div>
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="images" value="Upload Images (Optional)" />
                                        </div>
                                        <FileInput id="images" name="images" multiple onChange={handleFormChange} helperText="You can select one or more images to upload." />
                                    </div>

                                    {/* Image Previews */}
                                    {(formData.image_urls.length > 0 || filesToUpload.length > 0) && (
                                        <div>
                                            <Label value="Image Previews" />
                                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {/* Existing Images */}
                                                {formData.image_urls.map((url, index) => (
                                                    <div key={`existing-${index}`} className="relative group">
                                                        <img src={url.startsWith('local:') ? `${STORAGE_URL_PREFIX}${url.substring(6)}` : url} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-lg shadow-md" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingImage(url)}
                                                            className="absolute top-0 right-0 -m-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Remove Image"
                                                        >
                                                            <CloseIconMini />
                                                        </button>
                                                    </div>
                                                ))}
                                                {/* New Images */}
                                                {filesToUpload.map((file, index) => (
                                                    <div key={`new-${index}`} className="relative group">
                                                        <img src={URL.createObjectURL(file)} alt={`New Preview ${index}`} className="h-24 w-full object-cover rounded-lg shadow-md" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(index)}
                                                            className="absolute top-0 right-0 -m-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Remove Image"
                                                        >
                                                            <CloseIconMini />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="target_type" value="Target Type" />
                                        </div>
                                        <Select id="target_type" name="target_type" value={formData.target_type} onChange={handleFormChange} required>
                                            <option value="all">All Users</option>
                                            <option value="rank_wise">Rank Wise (Designation)</option>
                                            <option value="individual">Individual</option>
                                        </Select>
                                    </div>
                                    {formData.target_type === 'rank_wise' && (
                                        <div>
                                            <div className="mb-2 block">
                                                <Label htmlFor="target_ranks" value="Target Designations (Hold Ctrl/Cmd to select multiple)" />
                                            </div>
                                            <Select id="target_ranks" name="target_ranks" multiple value={formData.target_ranks.map(String)} onChange={handleFormChange} required className="h-48">
                                                {ranksData?.data?.map(rank => (
                                                    <option key={rank.id} value={rank.id}>
                                                        {rank.name} ({rank.code})
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    )}
                                </form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button type="submit" form="announcement-form" isProcessing={isSubmitting} disabled={isSubmitting}>
                                    {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
                                </Button>
                                <Button color="gray" onClick={handleCloseModal} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {/* View Details Modal */}
                        <Modal show={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="4xl">
                            <Modal.Header>Announcement Details</Modal.Header>
                            <Modal.Body>
                                {viewAnnouncement && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</h3>
                                                <p className="text-gray-900 font-medium text-lg">{viewAnnouncement.title}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Type</h3>
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                    viewAnnouncement.target_type === "rank_wise"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : viewAnnouncement.target_type === "all"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                    {viewAnnouncement.target_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Message</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
                                                {viewAnnouncement.message}
                                            </div>
                                        </div>

                                        {viewAnnouncement.target_type === 'rank_wise' && viewAnnouncement.target_ranks && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Designations</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewAnnouncement.target_ranks.map(rankId => {
                                                        const rank = ranksData?.data?.find(r => r.id === rankId);
                                                        return (
                                                            <span key={rankId} className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full border border-indigo-100">
                                                                {rank ? `${rank.name} (${rank.code})` : `Rank ID: ${rankId}`}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {(viewAnnouncement.image_urls?.length > 0 || viewAnnouncement.image_url) && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Attached Images</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {(viewAnnouncement.image_urls && viewAnnouncement.image_urls.length > 0 
                                                        ? viewAnnouncement.image_urls 
                                                        : (viewAnnouncement.image_url ? viewAnnouncement.image_url.split(',').map(u => u.trim()) : [])
                                                    ).map((url, index) => (
                                                        <div key={index} className="relative group overflow-hidden rounded-lg shadow-sm border border-gray-200">
                                                            <img 
                                                                src={url.startsWith('local:') ? `${STORAGE_URL_PREFIX}${url.substring(6)}` : url} 
                                                                alt={`Attachment ${index + 1}`} 
                                                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" 
                                                            />
                                                            <a 
                                                                href={url.startsWith('local:') ? `${STORAGE_URL_PREFIX}${url.substring(6)}` : url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center"
                                                            >
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Created By:</span>
                                                <span className="ml-2 text-gray-900 font-medium">{viewAnnouncement.creator_name || `ID: ${viewAnnouncement.created_by}`}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-gray-500">Created At:</span>
                                                <span className="ml-2 text-gray-900 font-medium">{new Date(viewAnnouncement.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button color="gray" onClick={() => setIsViewModalOpen(false)}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {/* Announcement Table Card */}
                        <div className="bg-white p-6 rounded-xl shadow-2xl">
                            {loading ? (
                                <AnnouncementTableSkeleton />
                            ) : announcements.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 text-lg">
                                    No announcements found. Click **"Add New Announcement"** to create one.
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-[#1976D2] text-white shadow-md">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase rounded-tl-xl">#</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Message</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Target</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase rounded-tr-xl">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {announcements.map((ann, index) => (
                                                    <tr key={ann.id} className="hover:bg-indigo-50/50 transition duration-150">
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                            {(meta.current_page - 1) * meta.per_page + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{ann.title}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={ann.message}>{ann.message}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                                    ann.target_type === "rank_wise"
                                                                        ? "bg-purple-100 text-purple-800"
                                                                        : ann.target_type === "all"
                                                                        ? "bg-blue-100 text-blue-800"
                                                                        : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                            >
                                                                {ann.target_type.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center space-x-2">
                                                            <button
                                                                onClick={() => handleOpenViewModal(ann)}
                                                                className="inline-flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition duration-150 shadow-sm"
                                                                title="View Details"
                                                            >
                                                                <EyeIcon />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEditModal(ann)}
                                                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition duration-150 shadow-sm"
                                                                title="Edit"
                                                            >
                                                                <EditIcon />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(ann.id)}
                                                                className="inline-flex items-center text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition duration-150 shadow-sm"
                                                                title="Delete"
                                                            >
                                                                <DeleteIcon />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="mt-6 flex justify-between items-center border-t pt-4 border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Showing <span className="font-semibold">{announcements.length}</span> items on page <span className="font-semibold">{meta.current_page}</span> of{" "}
                                            <span className="font-semibold">{meta.last_page}</span> ({meta.total} total items)
                                        </span>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setPage(old => Math.max(old - 1, 1))}
                                                disabled={page === 1 || loading}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                                                    page > 1 && !loading
                                                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setPage(old => (old < meta.last_page ? old + 1 : old))}
                                                disabled={page === meta.last_page || loading}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                                                    page < meta.last_page && !loading
                                                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                                                        : "bg-indigo-300 text-white/80 cursor-not-allowed"
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminAnnouncementlist;