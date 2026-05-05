import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer } from "react-toastify";
import { Modal, Button } from "flowbite-react";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= ICON COMPONENTS =================
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

// ================= SKELETON LOADERS =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>;

const NoticeTableSkeleton = () => (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
        <div className="h-12 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 space-x-4">
             <SkeletonPulse className="h-4 w-8" />
             <SkeletonPulse className="h-4 w-1/3" />
             <SkeletonPulse className="h-4 w-1/4" />
             <SkeletonPulse className="h-4 w-24" />
             <SkeletonPulse className="h-4 w-20" />
             <SkeletonPulse className="h-4 w-20 ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 space-x-4">
                <SkeletonPulse className="h-4 w-8" />
                <SkeletonPulse className="h-4 w-1/3" />
                <SkeletonPulse className="h-4 w-1/4" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
                <div className="flex justify-center w-20 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

const NoticeListEmployee = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewAnnouncement, setViewAnnouncement] = useState(null);

    const token = localStorage.getItem("authToken");
    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const STORAGE_URL_PREFIX = "https://alhamarahomesbd.com/alhamra-backend/storage/";

    useEffect(() => {
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first!", "warning").then(() => {
                window.location.href = "/login";
            });
        }
    }, [token]);

    // Fetch announcements
    const fetchAnnouncements = async (pageParam) => {
        const res = await fetch(`${API_BASE}/employees/dashboard/announcements?unread_only=0&per_page=10&page=${pageParam}`, {
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
        queryKey: ["employeeAnnouncements", page],
        queryFn: () => fetchAnnouncements(page),
        keepPreviousData: true,
    });

    // Fetch unread count
    const { data: unreadCountData } = useQuery({
        queryKey: ["unreadAnnouncementsCount"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/employees/dashboard/announcements/unread-count`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (!res.ok) {
                console.error("Failed to fetch unread count");
                return { count: 0 }; // Default on error
            }
            return res.json(); // Assuming API returns { count: 5 }
        },
        staleTime: 1000 * 60, // Refetch every minute
    });

    const announcements = announcementData?.data || [];
    const meta = announcementData?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 10 };

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (id) => {
            // NOTE: This is an assumed endpoint. Update if your actual API endpoint is different.
            const res = await fetch(`${API_BASE}/employees/dashboard/announcements/${id}/read`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (!res.ok) {
                console.error("Failed to mark as read");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["employeeAnnouncements"]);
            queryClient.invalidateQueries(["unreadAnnouncementsCount"]);
        },
    });

    const handleOpenViewModal = (announcement) => {
        setViewAnnouncement(announcement);
        setIsViewModalOpen(true);
        if (!announcement.is_read) {
            markAsReadMutation.mutate(announcement.id);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-4 md:p-8">
                    <ToastContainer position="top-right" autoClose={3000} theme="colored" />
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
                                    Notice Board
                                </h1>
                                {unreadCountData?.count > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{unreadCountData.count} Unread</span>
                                )}
                            </div>
                        </div>

                        {/* View Details Modal */}
                        <Modal show={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="4xl">
                            <Modal.Header>Announcement Details</Modal.Header>
                            <Modal.Body>
                                {viewAnnouncement && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 dark:text-white uppercase tracking-wider mb-1">Title</h3>
                                                <p className="text-gray-900 dark:text-white font-medium text-lg">{viewAnnouncement.title}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 dark:text-white uppercase tracking-wider mb-1">From</h3>
                                                <p className="text-gray-900 dark:text-white font-medium text-lg">{viewAnnouncement.creator_name}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-white uppercase tracking-wider mb-1">Message</h3>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white whitespace-pre-wrap">
                                                {viewAnnouncement.message}
                                            </div>
                                        </div>

                                        {(viewAnnouncement.image_urls?.length > 0 || viewAnnouncement.image_url) && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 dark:text-white uppercase tracking-wider mb-2">Attached Images</h3>
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
                                                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center"
                                                            >
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 text-sm text-right">
                                            <span className="text-gray-500 dark:text-white">Posted At:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white font-medium">{new Date(viewAnnouncement.created_at).toLocaleString()}</span>
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

                        {/* Announcement Table */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                            {loading ? (
                                <NoticeTableSkeleton />
                            ) : announcements.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-lg">
                                    No announcements found.
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">#</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">From</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {announcements.map((ann, index) => (
                                                    <tr key={ann.id} className={`transition duration-150 ${!ann.is_read ? 'font-bold bg-indigo-50/50 dark:bg-gray-700/50' : 'dark:hover:bg-gray-700/50'}`}>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                            {(meta.current_page - 1) * meta.per_page + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-white">{ann.title}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-white">{ann.creator_name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-white whitespace-nowrap">{new Date(ann.created_at).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                ann.is_read
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                                            }`}>
                                                                {ann.is_read ? "Read" : "Unread"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => handleOpenViewModal(ann)}
                                                                className="inline-flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 p-2 rounded-full transition duration-150 shadow-sm"
                                                                title="View Details"
                                                            >
                                                                <EyeIcon />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="mt-6 flex justify-between items-center border-t pt-4 border-gray-200 dark:border-gray-700">
                                        <span className="text-sm text-gray-600 dark:text-white">
                                            Showing <span className="font-semibold text-gray-900 dark:text-white">{announcements.length}</span> items on page <span className="font-semibold text-gray-900 dark:text-white">{meta.current_page}</span> of{" "}
                                            <span className="font-semibold text-gray-900 dark:text-white">{meta.last_page}</span> ({meta.total} total items)
                                        </span>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setPage(old => Math.max(old - 1, 1))}
                                                disabled={page === 1 || loading}
                                                className="px-4 py-2 text-sm font-medium rounded-lg transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setPage(old => (old < meta.last_page ? old + 1 : old))}
                                                disabled={page === meta.last_page || loading}
                                                className="px-4 py-2 text-sm font-medium rounded-lg transition duration-150 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 shadow-md disabled:bg-indigo-400"
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

export default NoticeListEmployee;