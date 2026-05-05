import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ---------------------------------------------------------------- //
//                  HELPER FUNCTION FOR CODE GENERATION             //
// ---------------------------------------------------------------- //
const generateNextAgentCode = (agents) => {
    // 1. Filter for valid AGT-XXXX codes and find the highest number
    const codes = agents
        .map(a => a.agent_code)
        .filter(code => code && code.startsWith('AGT-') && !isNaN(parseInt(code.slice(4))));

    let nextNumber = 1;

    if (codes.length > 0) {
        // 2. Extract the numeric part and find the highest number
        const highestNumber = codes.reduce((max, code) => {
            const num = parseInt(code.slice(4)); // Get number after 'AGT-'
            return num > max ? num : max;
        }, 0);

        // 3. Increment the highest number
        nextNumber = highestNumber + 1;
    }

    // 4. Format the number as a 4-digit string (e.g., 1 -> 0001, 12 -> 0012)
    const paddedNumber = String(nextNumber).padStart(4, '0');

    return `AGT-${paddedNumber}`;
};
// ---------------------------------------------------------------- //


// SVG ICONS 
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.972 9.972 0 011.64-2.857m5.56 5.56c.33.15.705.24 1.12.24 1.657 0 3-1.343 3-3 0-.415-.09-.79-.24-1.12m-2.22-5.56a9.972 9.972 0 014.225-.668c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7a9.972 9.972 0 01-2.857-.64M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14L2 6" />
    </svg>
);
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
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-48" />
                <SkeletonPulse className="h-4 w-24" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

const AllAgents = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // ⭐ STATE FOR PASSWORD TOGGLES
    const [showPassword, setShowPassword] = useState(false); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

    // --- Search and Pagination States ---
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [agentsPerPage] = useState(10); 

    const [showModal, setShowModal] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    
    const [formData, setFormData] = useState({
        name: "", 
        email: "", 
        branch_id: "", 
        agent_code: "", 
        mobile: "", 
        address: "",
        password: "",
        password_confirmation: "", // ⭐ ADDED for confirmation
    });
    const [editMode, setEditMode] = useState(false);

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const token = localStorage.getItem("authToken");

    // --- React Query: Fetch Agents ---
    const { data: agents = [], isLoading: loading } = useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/agents`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load agents");
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Fetch Branches ---
    const { data: branches = [], isLoading: loadingBranches } = useQuery({
        queryKey: ["branches"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/branches`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load branches");
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    // --- React Query: Mutation for Save (Create/Update) ---
    const saveMutation = useMutation({
        mutationFn: async ({ url, method, payload }) => {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to save agent");
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            toast.success(variables.method === "PUT" ? "Agent updated! ✅" : "Agent created! ✨");
            queryClient.invalidateQueries(["agents"]);
            closeModal();
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    // --- React Query: Mutation for Delete ---
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE}/agents/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete agent.");
            return id;
        },
        onSuccess: () => {
            toast.success("Agent deleted! 👋");
            queryClient.invalidateQueries(["agents"]);
        },
        onError: () => {
            toast.error("Error deleting agent.");
        }
    });

    // --- Filter and Pagination Logic (Same as before) ---

    const filteredAgents = useMemo(() => {
        if (!searchTerm) return agents;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return agents.filter(agent => {
            const name = agent.user?.name.toLowerCase() || "";
            const email = agent.user?.email.toLowerCase() || "";
            const code = agent.agent_code.toLowerCase() || "";
            const branchName = agent.branch?.name.toLowerCase() || "";

            return (
                name.includes(lowerCaseSearch) ||
                email.includes(lowerCaseSearch) ||
                code.includes(lowerCaseSearch) ||
                branchName.includes(lowerCaseSearch)
            );
        });
    }, [agents, searchTerm]);

    // Get current agents for the page
    const indexOfLastAgent = currentPage * agentsPerPage;
    const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
    const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);

    // Calculate page numbers
    const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset page to 1 whenever search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // --- CRUD Handlers (Same as before) ---
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure? ⚠️",
            text: "You won’t be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    const handleView = (agent) => {
        setSelectedAgent(agent);
        setShowView(true);
    };

    // --- Modal Handlers ---

    // Close modal helper to reset all states
    const closeModal = () => {
        setShowModal(false);
        setShowPassword(false); 
        setShowConfirmPassword(false);
        setSelectedAgent(null);
    }
    
    const openCreateModal = () => {
        setEditMode(false);
        const newAgentCode = generateNextAgentCode(agents); 
        
        setFormData({ 
            name: "", 
            email: "", 
            branch_id: "", 
            agent_code: newAgentCode, 
            mobile: "", 
            address: "",
            password: "",
            password_confirmation: "", // Reset confirmation on open
        });
        setShowModal(true);
    };

    const openEditModal = (agent) => {
        setEditMode(true);
        setFormData({
            name: agent.user?.name || "",
            email: agent.user?.email || "",
            branch_id: agent.branch_id || "",
            agent_code: agent.agent_code || "",
            mobile: agent.mobile || "",
            address: agent.address || "",
            password: "", // Always reset password fields on edit open
            password_confirmation: "", 
        });
        setSelectedAgent(agent);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ---------------------------------------------------------------- //
    //                         SUBMIT HANDLER LOGIC                     //
    // ---------------------------------------------------------------- //
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let payload = { ...formData, branch_id: Number(formData.branch_id) };
        
        // --- Validation Logic ---

        // 1. Check if both password fields are filled (for create or update)
        if (payload.password || payload.password_confirmation) {
            if (payload.password !== payload.password_confirmation) {
                toast.error("Password and confirmation must match.");
                return;
            }
            // If they match and one is filled, ensure both are sent to the backend.
        }
        
        // 2. Logic for Edit Mode:
        if (editMode) {
            if (payload.password === "") {
                // If the user left password blank, remove both fields from payload to keep old password
                delete payload.password;
                delete payload.password_confirmation;
            } else if (payload.password && payload.password.length < 6) { // Add minimum length check if needed
                 toast.error("New password must be at least 6 characters.");
                 return;
            }
        } else {
             // 3. Logic for Create Mode: Must have password and confirmation
             if (payload.password.length < 6) {
                 toast.error("Password must be at least 6 characters.");
                 return;
            }
        }
        
        // If everything is fine, proceed to API call.
        const method = editMode ? "PUT" : "POST";
        const url = editMode ? `${API_BASE}/agents/${selectedAgent.id}` : `${API_BASE}/agents`;

        saveMutation.mutate({ url, method, payload });
    };
    // ---------------------------------------------------------------- //


    // --- Render Functions ---

    // ---------------------------------------------------------------- //
    //                         UPDATED RENDER MODAL                     //
    // ---------------------------------------------------------------- //
    const renderModal = () => {
        if (!showModal) return null;

        const passwordInputType = showPassword ? "text" : "password";
        const confirmInputType = showConfirmPassword ? "text" : "password"; 

        const passwordPlaceholder = editMode ? "New Password (Leave blank to keep old)" : "Password";
        const confirmPlaceholder = editMode ? "Confirm New Password" : "Confirm Password"; 

        // Visual warning for mismatch
        const showMismatchWarning = formData.password_confirmation && 
                                    formData.password !== formData.password_confirmation;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-[400px] p-6 shadow-xl relative transform transition-all duration-300 scale-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                        {editMode ? "Edit Agent ✍️" : "Create Agent ➕"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-3">

                        <input type="text" placeholder="Name" name="name" value={formData.name}
                            onChange={handleInputChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" required />

                        <input type="email" placeholder="Email" name="email" value={formData.email}
                            onChange={handleInputChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" required />

                        {/* Branch Dropdown */}
                        <select name="branch_id" value={formData.branch_id} onChange={handleInputChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white appearance-none" required
                            disabled={loadingBranches}>
                            <option value="" disabled>{loadingBranches ? "Loading Branches..." : "Select Branch"}</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>

                        {/* Agent Code Input - Disabled on create for auto-generation */}
                        <input 
                            type="text" 
                            placeholder="Agent Code" 
                            name="agent_code" 
                            value={formData.agent_code}
                            onChange={handleInputChange} 
                            className={`w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent ${editMode ? 'border-gray-300' : 'border-blue-400 bg-blue-50'}`}
                            required 
                            disabled={!editMode} 
                        />
                        
                        {/* PASSWORD FIELD with Eye Toggle */}
                        <div className="relative">
                            <input 
                                type={passwordInputType} 
                                placeholder={passwordPlaceholder} 
                                name="password" 
                                value={formData.password}
                                onChange={handleInputChange} 
                                className="w-full border border-gray-300 px-3 py-2 pr-10 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" 
                                required={!editMode} // Only required when creating
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition duration-150"
                            >
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        {/* CONFIRM PASSWORD FIELD with Eye Toggle */}
                        <div className="relative">
                            <input 
                                type={confirmInputType} 
                                placeholder={confirmPlaceholder} 
                                name="password_confirmation" 
                                value={formData.password_confirmation}
                                onChange={handleInputChange} 
                                className={`w-full border px-3 py-2 pr-10 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent ${
                                    showMismatchWarning ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required={!editMode} // Only required when creating
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition duration-150"
                            >
                                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {/* Display Mismatch Error */}
                        {showMismatchWarning && (
                            <p className="text-sm text-red-500 -mt-2">
                                Passwords do not match.
                            </p>
                        )}
                        
                        <input type="text" placeholder="Mobile" name="mobile" value={formData.mobile}
                            onChange={handleInputChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" />

                        <textarea placeholder="Address" name="address" value={formData.address}
                            onChange={handleInputChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" rows="2" />

                        <div className="flex justify-end gap-3 pt-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150">Cancel</button>
                            <button 
                                type="submit" 
                                disabled={saveMutation.isLoading}
                                className="px-4 py-2 bg-[#1976D2] text-white rounded-lg hover:bg-blue-700 transition duration-150 disabled:opacity-70"
                            >
                                {saveMutation.isLoading ? "Saving..." : (editMode ? "Update" : "Create")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderViewModal = () => {
        if (!showView || !selectedAgent) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 w-full max-w-sm md:max-w-md shadow-2xl transform transition-all duration-300 scale-100">
                    <h3 className="text-2xl font-extrabold mb-5 text-[#1976D2] border-b pb-3">Agent Details</h3>
                    <div className="space-y-3 text-gray-700 text-base">
                        <p className="flex justify-between border-b pb-1"><strong>Code:</strong> <span>{selectedAgent.agent_code}</span></p>
                        <p className="flex justify-between border-b pb-1"><strong>Name:</strong> <span>{selectedAgent.user?.name}</span></p>
                        <p className="flex justify-between border-b pb-1"><strong>Email:</strong> <span>{selectedAgent.user?.email}</span></p>
                        <p className="flex justify-between border-b pb-1"><strong>Mobile:</strong> <span>{selectedAgent.mobile || "N/A"}</span></p>
                        <p className="flex justify-between border-b pb-1"><strong>Branch:</strong> <span>{selectedAgent.branch?.name || "N/A"}</span></p>
                        <p className="flex justify-between border-b pb-1"><strong>Orders:</strong> <span>{selectedAgent.sales_orders_count || 0}</span></p>
                        <div className="pt-2">
                            <strong className="block mb-1">Address:</strong>
                            <span className="block p-2 bg-gray-100 rounded-lg text-sm">{selectedAgent.address || "N/A"}</span>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setShowView(false)} className="bg-[#1976D2] text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-md">Close</button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Pagination Buttons Component (Same as before) ---
    const renderPagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        if (totalPages <= 1) return null;

        return (
            <nav className="flex justify-between items-center pt-4" aria-label="Pagination">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{indexOfFirstAgent + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastAgent, filteredAgents.length)}</span> of <span className="font-semibold text-gray-900">{filteredAgents.length}</span> results
                </div>
                <ul className="inline-flex items-center -space-x-px">
                    <li>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                    </li>
                    {pageNumbers.map(number => (
                        <li key={number}>
                            <button
                                onClick={() => paginate(number)}
                                className={`px-3 py-2 leading-tight border border-gray-300 ${number === currentPage ? 'text-white bg-[#1976D2] hover:bg-blue-700' : 'text-gray-500 bg-white hover:bg-gray-100'}`}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };


    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow p-6">
                    <div className="w-full bg-white p-6 rounded-xl shadow-lg">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                        {/* Header, Search Input, and Add Button */}
                        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">All Agents 👥</h2>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search agents by name, email or code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-[#1976D2]"
                                />
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center bg-[#1976D2] text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-150 whitespace-nowrap"
                                >
                                    <PlusIcon /> Add Agent
                                </button>
                            </div>
                        </div>

                        {/* Agent Table */}
                        {loading ? (
                            <TableSkeleton />
                        ) : (
                            <div className="w-full overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#1976D2] text-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Branch</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {currentAgents.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-8 text-gray-500 text-lg">No agents found 🙁</td></tr>
                                        ) : (
                                            currentAgents.map((a) => (
                                                <tr key={a.id} className="hover:bg-gray-50 transition duration-150">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{a.agent_code}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{a.user?.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{a.user?.email}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{a.branch?.name || "N/A"}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-3">
                                                            <button title="View Details" onClick={() => handleView(a)} className="p-1 rounded-full text-indigo-600 hover:bg-indigo-100 transition duration-150">
                                                                <EyeIcon />
                                                            </button>
                                                            <button title="Edit Agent" onClick={() => openEditModal(a)} className="p-1 rounded-full text-green-600 hover:bg-green-100 transition duration-150">
                                                                <EditIcon />
                                                            </button>
                                                            <button title="Delete Agent" onClick={() => handleDelete(a.id)} className="p-1 rounded-full text-red-600 hover:bg-red-100 transition duration-150">
                                                                <DeleteIcon />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                {/* Pagination Controls */}
                                {renderPagination()}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals */}
            {renderModal()}
            {renderViewModal()}
        </div>
    );
};

export default AllAgents;