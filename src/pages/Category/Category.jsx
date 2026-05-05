import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
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

// ================= SKELETON LOADERS =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const CategoryTableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-6 space-x-4">
             <SkeletonPulse className="h-4 w-8" />
             <SkeletonPulse className="h-4 w-1/3" />
             <SkeletonPulse className="h-4 w-24" />
             <SkeletonPulse className="h-4 w-20 ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-8" />
                <SkeletonPulse className="h-4 w-1/3" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ================= MAIN COMPONENT =================
const Category = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [page, setPage] = useState(1);

    const token = localStorage.getItem("authToken");
    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";

    // ================= AUTH CHECK & INITIAL FETCH =================
    useEffect(() => {
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first!", "warning").then(() => {
                window.location.href = "/login";
            });
        }
    }, [token]);

    // ================= REACT QUERY: FETCH CATEGORIES =================
    const fetchCategories = async (pageParam) => {
        const res = await fetch(`${API_BASE}/categories?page=${pageParam}`, {
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

        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
    };

    const { data: categoryData, isLoading: loading } = useQuery({
        queryKey: ["categories", page],
        queryFn: () => fetchCategories(page),
        keepPreviousData: true, // Keeps data visible while fetching next page
    });

    const categories = categoryData?.data || [];
    const meta = categoryData?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 15 };

    // ================= REACT QUERY: MUTATIONS =================
    
    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (newCategory) => {
            const res = await fetch(`${API_BASE}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(newCategory),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || (data.errors ? Object.values(data.errors)[0][0] : "Failed to create"));
            return data;
        },
        onSuccess: () => {
            toast.success("Category created successfully!");
            queryClient.invalidateQueries(["categories"]);
        },
        onError: (err) => toast.error(err.message),
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const res = await fetch(`${API_BASE}/categories/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || (resData.errors ? Object.values(resData.errors)[0][0] : "Failed to update"));
            return resData;
        },
        onSuccess: () => {
            toast.success("Category updated successfully!");
            queryClient.invalidateQueries(["categories"]);
        },
        onError: (err) => toast.error(err.message),
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE}/categories/${id}`, {
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
            toast.success("Category deleted successfully!");
            queryClient.invalidateQueries(["categories"]);
            // Adjust page if deleting the last item on the current page
            if (categories.length === 1 && page > 1) {
                setPage(old => old - 1);
            }
        },
        onError: (err) => toast.error(err.message),
    });

    // ================= OPEN MODAL (CREATE/EDIT) - Enhanced Design =================
    const openCategoryModal = async (category = null) => {
        const { value: formValues } = await Swal.fire({
            customClass: {
                popup: "shadow-2xl rounded-xl !max-w-md",
                title: "!text-gray-800 !font-extrabold",
                confirmButton: "!bg-indigo-600 hover:!bg-indigo-700 !shadow-md !font-bold !py-2 !px-4",
                cancelButton: "!bg-gray-500 hover:!bg-gray-600 !shadow-md !font-bold !py-2 !px-4",
            },
            title: `<span class="text-2xl font-bold">${
                category ? "Edit Category" : "Add New Category"
            }</span>`,
            html: `
                <style>
                    /* Custom styling for consistency inside SweetAlert */
                    .swal2-html-container input, .swal2-html-container select {
                        margin-top: 5px !important;
                        margin-bottom: 0 !important;
                        box-shadow: none !important;
                    }
                </style>
                <div class="p-2 pt-0 text-left">
                    <label for="category-name" class="block text-sm font-medium text-gray-700 mb-1 mt-3">Category Name</label>
                    <input 
                        id="category-name" 
                        class="swal2-input !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500" 
                        placeholder="e.g., Residential Apartment" 
                        value="${category ? category.name : ""}"
                    >

                    <label class="block text-sm font-medium text-gray-700 mb-2 mt-4">Category Type</label>
                    <div class="flex space-x-6 justify-start pl-1">
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="category-type" id="type-product" value="product" ${
                                category?.type?.toLowerCase() === "product" || !category ? "checked" : ""
                            } class="text-indigo-600 focus:ring-indigo-500 border-gray-300 h-4 w-4" />
                            <span class="text-gray-700">Product</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="category-type" id="type-service" value="service" ${
                                category?.type?.toLowerCase() === "service" ? "checked" : ""
                            } class="text-indigo-600 focus:ring-indigo-500 border-gray-300 h-4 w-4" />
                            <span class="text-gray-700">Service</span>
                        </label>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: category ? "Update Category" : "Create Category",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#4F46E5", // Indigo for primary action
            cancelButtonColor: "#6B7280",

            preConfirm: () => {
                const name = document.getElementById("category-name").value.trim();
                const typeElement = document.querySelector('input[name="category-type"]:checked');
                const type = typeElement ? typeElement.value : "";

                if (!name || !type) {
                    Swal.showValidationMessage(
                        `<span class="text-red-500 font-semibold">⚠️ Category name and type are required!</span>`
                    );
                    return false;
                }
                return { name, type };
            },
        });

        if (formValues) {
            handleSubmit(formValues, category ? category.id : null, !!category);
        }
    };

    // ================= CREATE / UPDATE =================
    const handleSubmit = (formValues, id = null, isEdit = false) => {
        if (isEdit) {
            updateMutation.mutate({ id, ...formValues });
        } else {
            createMutation.mutate(formValues);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This category will be permanently deleted!",
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
                                Manage Categories
                            </h1>
                            <button
                                onClick={() => openCategoryModal()}
                                className="flex items-center bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-[1.02]"
                            >
                                <PlusIcon />
                                <span>Add New Category</span>
                            </button>
                        </div>

                        {/* Category Table Card */}
                        <div className="bg-white p-6 rounded-xl shadow-2xl">
                            {loading ? (
                                <CategoryTableSkeleton />
                            ) : categories.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 text-lg">
                                    No categories found. Click **"Add New Category"** to create one.
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-[#1976D2] text-white shadow-md">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase rounded-tl-xl">#</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Category Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Type</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase rounded-tr-xl">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {categories.map((cat, index) => (
                                                    <tr key={cat.id} className="hover:bg-indigo-50/50 transition duration-150">
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                            {(meta.current_page - 1) * meta.per_page + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{cat.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                                    cat.type.toLowerCase() === "product"
                                                                        ? "bg-blue-100 text-blue-800"
                                                                        : "bg-green-100 text-green-800"
                                                                }`}
                                                            >
                                                                {cat.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center space-x-2">
                                                            <button
                                                                onClick={() => openCategoryModal(cat)}
                                                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition duration-150 shadow-sm"
                                                                title="Edit"
                                                            >
                                                                <EditIcon />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(cat.id)}
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
                                            Showing <span className="font-semibold">{categories.length}</span> items on page <span className="font-semibold">{meta.current_page}</span> of{" "}
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

export default Category;