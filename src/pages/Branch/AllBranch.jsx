import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these are your layout components and their paths are correct
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// =========================================================================
// 2. ICON COMPONENTS
// =========================================================================

const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const EditIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9"
        />
    </svg>
);
const DeleteIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
    </svg>
);

// =========================================================================
// SKELETON LOADERS
// =========================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-6 space-x-4">
             {[...Array(5)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/5" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-48" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// =========================================================================
// 3. MAIN COMPONENT (Refactored for /branches endpoint with simplified fields)
// =========================================================================

const AllBranch = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const token = localStorage.getItem("authToken");

    // --- React Query: Fetch Branches ---
    const { data: branches = [], isLoading: loading } = useQuery({
        queryKey: ["branches"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/branches?limit=100`, { 
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (res.status === 401) {
                localStorage.clear();
                window.location.href = "/login"; 
                throw new Error("Unauthorized");
            }
            if (!res.ok) throw new Error("Failed to load branches");
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Mutation for Save (Create/Update) ---
    const saveBranchMutation = useMutation({
        mutationFn: async ({ formValues, isEdit, branchId }) => {
            const method = isEdit ? "PUT" : "POST";
            const url = isEdit ? `${API_BASE}/branches/${branchId}` : `${API_BASE}/branches`;
            
            const payload = {
                name: formValues.name,
                code: formValues.code,
                address: formValues.address,
            };
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                let errorMessage = data.message || `Failed to ${isEdit ? 'update' : 'create'} branch.`;
                if (data.errors) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    if (firstErrorKey) errorMessage = data.errors[firstErrorKey][0];
                }
                throw new Error(errorMessage);
            }
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success(`Branch ${variables.isEdit ? 'updated' : 'created'} successfully!`);
            queryClient.invalidateQueries(["branches"]);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    // --- React Query: Mutation for Delete ---
    const deleteBranchMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE}/branches/${id}`, { 
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to delete branch");
            }
            return id;
        },
        onSuccess: () => {
            toast.success("Branch deleted successfully!");
            queryClient.invalidateQueries(["branches"]);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleSaveBranch = (formValues, isEdit = false, branchId = null) => {
        saveBranchMutation.mutate({ formValues, isEdit, branchId });
    };

    // Handle Branch Deletion
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this! The branch will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444", // Red for Delete
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            deleteBranchMutation.mutate(id);
        }
    };


    // --- Modal Function (UPDATED for simplified Branch fields: name, code, address) ---

    const openBranchModal = async (branchToEdit = null) => {
        const isEdit = !!branchToEdit;
        const initialName = branchToEdit?.name || "";
        const initialCode = branchToEdit?.code || "";
        const initialAddress = branchToEdit?.address || "";
            
        const { value: formValues } = await Swal.fire({
            customClass: {
                popup: 'shadow-2xl rounded-xl !max-w-xl', 
                title: '!text-gray-800 !font-extrabold',
                confirmButton: '!shadow-md !font-bold !py-2 !px-4',
                cancelButton: '!shadow-md !font-bold !py-2 !px-4',
            },
            title: `<span class="text-2xl font-bold">${isEdit ? 'Edit Branch' : 'Add New Branch'}</span>`,
            
            html: `
                <div class="p-2 pt-0 text-left grid grid-cols-2 gap-4">
                    
                    <div class="col-span-2">
                        <label for="branch-name" class="block text-sm font-medium text-gray-700 mb-1 mt-3">Branch Name</label>
                        <input 
                            id="branch-name" 
                            class="swal2-input !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500" 
                            placeholder="e.g., Downtown Branch"
                            value="${initialName}"
                        >
                    </div>

                    <div class="col-span-2">
                        <label for="branch-code" class="block text-sm font-medium text-gray-700 mb-1">Code</label>
                        <input 
                            id="branch-code" 
                            class="swal2-input !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500" 
                            placeholder="e.g., DT-001"
                            value="${initialCode}"
                        >
                    </div>
                    
                    <div class="col-span-2">
                        <label for="branch-address" class="block text-sm font-medium text-gray-700 mb-1 mt-3">Address</label>
                        <textarea 
                            id="branch-address" 
                            rows="3" 
                            class="swal2-textarea !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500"
                            placeholder='123 Main Street, City, Country'
                        >${initialAddress}</textarea>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: `${isEdit ? 'Update Branch' : 'Create Branch'}`,
            cancelButtonText: "Cancel",
            
            confirmButtonColor: "#1976D2",
            cancelButtonColor: "#922a0aff",

            preConfirm: () => {
                const name = document.getElementById("branch-name").value.trim();
                const code = document.getElementById("branch-code").value.trim();
                const address = document.getElementById("branch-address").value.trim();

                if (!name || !code || !address) {
                    Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ All fields must be filled out!</span>`);
                    return false;
                }
                
                return {
                    name,
                    code,
                    address,
                };
            },
        });

        if (formValues) {
            handleSaveBranch(formValues, isEdit, branchToEdit?.id); 
        }
    };

    // --- Filtering Logic (UPDATED for Branches - simplified fields) ---

    const filteredBranches = branches.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.id.toString().includes(searchTerm)
    );


    // --- Component Render (UPDATED to reflect table columns) ---

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <main className="grow p-4 md:p-8">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                        {/* Title and Action Buttons */}
                        <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200">
                            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                                All Branches 🏢
                            </h2>

                            <button
                                onClick={() => openBranchModal(null)} 
                                className="flex items-center bg-[#1976D2] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-150 ease-in-out transform hover:scale-[1.02]"
                            >
                                <PlusIcon />
                                <span>Add New Branch</span>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search by Name, Code, or Address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        {/* Table View */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                <div className="overflow-x-auto">
                                    {filteredBranches.length === 0 ? ( 
                                        <div className="text-center py-10">
                                            <p className="text-xl text-gray-500">
                                                {searchTerm 
                                                    ? `No branches found matching "${searchTerm}".` 
                                                    : "No branches found. Click 'Add New Branch' to create one."}
                                            </p>
                                        </div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-[#1976D2] text-white">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
                                                        ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Code
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Address
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider rounded-tr-lg">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredBranches.map((branch) => (
                                                    <tr
                                                        key={branch.id}
                                                        className="hover:bg-gray-50 transition duration-150"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {branch.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-mono">
                                                            <span className="font-medium bg-gray-100 px-2 py-1 rounded-md text-xs">{branch.code}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate font-semibold">
                                                            {branch.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                            {branch.address}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <button
                                                                    onClick={() => openBranchModal(branch)} 
                                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                                                                    title="Edit Branch"
                                                                >
                                                                    <EditIcon />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(branch.id)}
                                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                                    title="Delete Branch"
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AllBranch;