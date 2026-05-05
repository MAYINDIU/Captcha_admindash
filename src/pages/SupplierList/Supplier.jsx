import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these are your layout components and their paths are correct
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// =========================================================================
// 2. ICON COMPONENTS (Kept the same)
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
             {[...Array(6)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/6" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-48" />
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
// 3. MAIN COMPONENT (Refactored for /suppliers endpoint)
// =========================================================================

const Supplier = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const token = localStorage.getItem("authToken");

    // --- React Query: Fetch Suppliers ---
    const { data: suppliers = [], isLoading: loading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/suppliers?limit=100`, { 
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (res.status === 401) {
                localStorage.clear();
                window.location.href = "/login"; 
                throw new Error("Unauthorized");
            }
            if (!res.ok) throw new Error("Failed to load suppliers");
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Mutation for Save (Create/Update) ---
    const saveSupplierMutation = useMutation({
        mutationFn: async ({ formValues, isEdit, supplierId }) => {
            const method = isEdit ? "PUT" : "POST";
            const url = isEdit ? `${API_BASE}/suppliers/${supplierId}` : `${API_BASE}/suppliers`;
            
            const payload = {
                name: formValues.name,
                email: formValues.email,
                phone: formValues.phone,
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
                let errorMessage = data.message || `Failed to ${isEdit ? 'update' : 'create'} supplier.`;
                if (data.errors) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    if (firstErrorKey) errorMessage = data.errors[firstErrorKey][0];
                }
                throw new Error(errorMessage);
            }
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success(`Supplier ${variables.isEdit ? 'updated' : 'created'} successfully!`);
            queryClient.invalidateQueries(["suppliers"]);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    // --- React Query: Mutation for Delete ---
    const deleteSupplierMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE}/suppliers/${id}`, { 
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to delete supplier");
            }
            return id;
        },
        onSuccess: () => {
            toast.success("Supplier deleted successfully!");
            queryClient.invalidateQueries(["suppliers"]);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleSaveSupplier = (formValues, isEdit = false, supplierId = null) => {
        saveSupplierMutation.mutate({ formValues, isEdit, supplierId });
    };

    // Handle Supplier Deletion (formerly handleDelete)
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this! The supplier will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444", // Red for Delete
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            deleteSupplierMutation.mutate(id);
        }
    };


    // --- Modal Function (UPDATED for Supplier fields: name, email, phone, address) ---

    const openSupplierModal = async (supplierToEdit = null) => {
        const isEdit = !!supplierToEdit;
        const initialName = supplierToEdit?.name || "";
        const initialEmail = supplierToEdit?.email || "";
        const initialPhone = supplierToEdit?.phone || "";
        const initialAddress = supplierToEdit?.address || "";
            
        const { value: formValues } = await Swal.fire({
            customClass: {
                popup: 'shadow-2xl rounded-xl !max-w-xl', 
                title: '!text-gray-800 !font-extrabold',
                confirmButton: '!shadow-md !font-bold !py-2 !px-4',
                cancelButton: '!shadow-md !font-bold !py-2 !px-4',
            },
            title: `<span class="text-2xl font-bold">${isEdit ? 'Edit Supplier' : 'Add New Supplier'}</span>`,
            
            html: `
                <div class="p-2 pt-0 text-left grid grid-cols-2 gap-4">
                    
                    <div class="col-span-2">
                        <label for="supplier-name" class="block text-sm font-medium text-gray-700 mb-1 mt-3">Supplier Name</label>
                        <input 
                            id="supplier-name" 
                            class="swal2-input !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500" 
                            placeholder="e.g., ABC Developers"
                            value="${initialName}"
                        >
                    </div>

                    <div class="col-span-1">
                        <label for="supplier-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            id="supplier-email" 
                            type="email"
                            class="swal2-input !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500" 
                            placeholder="e.g., contact@supplier.com"
                            value="${initialEmail}"
                        >
                    </div>
                    
                    <div class="col-span-1">
                        <label for="supplier-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input 
                            id="supplier-phone" 
                            type="tel"
                            class="swal2-input !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500" 
                            placeholder="e.g., +8801700000000"
                            value="${initialPhone}"
                        >
                    </div>
                    
                    <div class="col-span-2">
                        <label for="supplier-address" class="block text-sm font-medium text-gray-700 mb-1 mt-3">Address</label>
                        <textarea 
                            id="supplier-address" 
                            rows="3" 
                            class="swal2-textarea !m-0 !w-full !px-4 !py-3 !text-base !border-gray-300 !rounded-lg focus:!border-indigo-500 focus:!ring-indigo-500"
                            placeholder='House 10, Road 5, City, Country'
                        >${initialAddress}</textarea>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: `${isEdit ? 'Update Supplier' : 'Create Supplier'}`,
            cancelButtonText: "Cancel",
            
            confirmButtonColor: "#1976D2",
            cancelButtonColor: "#922a0aff",

            preConfirm: () => {
                const name = document.getElementById("supplier-name").value.trim();
                const email = document.getElementById("supplier-email").value.trim();
                const phone = document.getElementById("supplier-phone").value.trim();
                const address = document.getElementById("supplier-address").value.trim();

                if (!name || !email || !phone || !address) {
                    Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ All fields must be filled out!</span>`);
                    return false;
                }
                
                return {
                    name,
                    email,
                    phone,
                    address,
                };
            },
        });

        if (formValues) {
            handleSaveSupplier(formValues, isEdit, supplierToEdit?.id); 
        }
    };

    // --- Filtering Logic (UPDATED for Suppliers) ---

    const filteredSuppliers = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.id.toString().includes(searchTerm)
    );


    // --- Component Render (UPDATED to reflect Supplier table columns) ---

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
                                All Suppliers 🤝
                            </h2>

                            <button
                                onClick={() => openSupplierModal(null)} // Call openSupplierModal
                                className="flex items-center bg-[#1976D2] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-150 ease-in-out transform hover:scale-[1.02]"
                            >
                                <PlusIcon />
                                <span>Add New Supplier</span>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search by Name, Email, Phone, or Address..."
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
                                    {filteredSuppliers.length === 0 ? ( 
                                        <div className="text-center py-10">
                                            <p className="text-xl text-gray-500">
                                                {searchTerm 
                                                    ? `No suppliers found matching "${searchTerm}".` 
                                                    : "No suppliers found. Click 'Add New Supplier' to create one."}
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
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Phone
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
                                                {filteredSuppliers.map((supplier) => (
                                                    <tr
                                                        key={supplier.id}
                                                        className="hover:bg-gray-50 transition duration-150"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {supplier.id}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate font-semibold">
                                                            {supplier.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 max-w-xs truncate">
                                                            {supplier.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                            {supplier.phone}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                            {supplier.address}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <button
                                                                    onClick={() => openSupplierModal(supplier)} // Call openSupplierModal
                                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                                                                    title="Edit Supplier"
                                                                >
                                                                    <EditIcon />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(supplier.id)}
                                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                                    title="Delete Supplier"
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

export default Supplier;