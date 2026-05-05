import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useNavigate } from "react-router-dom";
import {
    AiOutlinePlus,
    AiOutlineClose,
    AiOutlineEye,
    AiOutlineMail,
    AiOutlineIdcard,
    AiOutlineUser,
    AiOutlineSearch,
    AiOutlineArrowRight, 
    AiOutlineArrowLeft,
} from "react-icons/ai";
import { HiOutlineOfficeBuilding, HiOutlineUserGroup, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineFilter } from "react-icons/hi"; 
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
// Corrected to use the minified path, which is often more reliable
import 'react-toastify/dist/ReactToastify.min.css'; 

// API Endpoints
const API_BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employees";
const BRANCH_API_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/branches";
const AGENT_API_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/agents";

// Calendar icon component (Custom SVG for AiOutlineCalendar)
const AiOutlineCalendar = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
);

// Custom Styles for DataTable
const customStyles = {
    header: { 
        style: { 
            minHeight: '66px' 
        } 
    },
    headRow: {
        style: {
            backgroundColor: '#1976D2', // Deep Blue background for header
            borderBottomColor: '#e2e8f0',
        },
    },
    headCells: {
        style: {
            paddingTop: '16px',
            paddingBottom: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
            
            fontSize: '15px',
            fontWeight: '800', 
            color: '#ffffff',
            
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
    },
    cells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '12px',
            paddingBottom: '12px',
            fontSize: '14px',
            color: '#334155', // Slate-700 text
        },
    },
    pagination: {
        style: {
            color: '#334155', // Dark text color (Slate-700)
            fontSize: '14px',
        },
    },
};

// Custom Next/Previous Icons for a professional look
const CustomNextIcon = (
    <AiOutlineArrowRight size={20} className="text-indigo-600 hover:text-indigo-800 transition duration-150" />
);

const CustomPrevIcon = (
    <AiOutlineArrowLeft size={20} className="text-indigo-600 hover:text-indigo-800 transition duration-150" />
);

// =========================================================================
// SKELETON LOADERS
// =========================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-16 bg-[#1976D2] flex items-center px-6 space-x-4">
             {[...Array(7)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/6 bg-blue-400/50" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-8" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-48" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-6 w-16 rounded-full" />
                <SkeletonPulse className="h-4 w-24" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-lg" />
                    <SkeletonPulse className="h-8 w-8 rounded-lg" />
                    <SkeletonPulse className="h-8 w-8 rounded-lg" />
                </div>
            </div>
        ))}
    </div>
);

const Employeelist = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [viewEmployee, setViewEmployee] = useState(null); 

    // --- Rank Filter State ---
    const [selectedRank, setSelectedRank] = useState("");

    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        user_id: "",
        branch_id: "",
        agent_id: "",
        rank: "",
    });

    // Debounce Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- React Query: Fetch Employees ---
    const { data: allEmployees = [], isLoading: loading } = useQuery({
        queryKey: ["employees", selectedRank], // Fetch based on rank
        queryFn: async () => {
            // Fetch all employees; server-side filtering by rank is efficient.
            let url = `${API_BASE_URL}?per_page=10000`; // Fetch a large number to get all
            if (selectedRank) url += `&rank=${encodeURIComponent(selectedRank)}`;
            
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token,
    });

    // --- Client-side search filtering ---
    const filteredEmployees = React.useMemo(() => {
        if (!debouncedSearchTerm) {
            return allEmployees;
        }
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        return allEmployees.filter(employee => 
            employee.user?.name?.toLowerCase().includes(lowercasedTerm) ||
            employee.employee_code?.toLowerCase().includes(lowercasedTerm) ||
            (employee.mobile && String(employee.mobile).toLowerCase().includes(lowercasedTerm))
        );
    }, [allEmployees, debouncedSearchTerm]);

    // --- React Query: Fetch Ranks List ---
    const { data: ranksList = [] } = useQuery({
        queryKey: ["ranksList"],
        queryFn: async () => {
            const res = await fetch("https://alhamarahomesbd.com/alhamra-backend/public/api/v1/ranks", { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Fetch Branches & Agents (for Edit Modal) ---
    const { data: branches = [], isLoading: branchesLoading } = useQuery({
        queryKey: ["branches"],
        queryFn: async () => {
            const res = await fetch(BRANCH_API_URL, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token && isEditModalOpen,
        staleTime: 1000 * 60 * 10,
    });

    const { data: agents = [], isLoading: agentsLoading } = useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const res = await fetch(AGENT_API_URL, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token && isEditModalOpen,
        staleTime: 1000 * 60 * 10,
    });

    const isDataLoading = branchesLoading || agentsLoading;

    // --- React Query: Mutations ---
    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(error.errors ? Object.values(error.errors).flat().join(' ') : error.message);
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Employee updated successfully! 🚀");
            queryClient.invalidateQueries(["employees"]);
            closeEditModal();
        },
        onError: (err) => toast.error(err.message || "Update failed"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Delete failed");
            return id;
        },
        onSuccess: () => {
            toast.success("Employee deleted successfully! 🗑️");
            queryClient.invalidateQueries(["employees"]);
        },
        onError: () => toast.error("Error during deletion"),
    });

    // Handler for rank filter change
    const handleRankChange = (e) => {
        setSelectedRank(e.target.value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const processedValue = (name === 'user_id' || name === 'branch_id' || name === 'agent_id') 
            ? (value === "" ? "" : Number(value)) : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const openEditModal = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            user_id: employee.user_id ?? "",
            branch_id: employee.branch_id ?? "",
            agent_id: employee.agent_id ?? "",
            rank: employee.rank ?? "",
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => { setIsEditModalOpen(false); setEditingEmployee(null); };

    const navigateToAddEmployee = () => {
        navigate("/add-employee"); 
    };

    // --- Edit Employee Submission (Unchanged) ---
    const handleSubmit = () => {
        if (!editingEmployee) {
             toast.error("Invalid state: Not in edit mode.");
             return;
        }

        const payload = Object.entries(formData).reduce((acc, [key, value]) => {
            // Remove agent_id if empty/zero to handle nullable field correctly
            if (key === 'agent_id' && (value === "" || value === 0)) return acc;
            // Convert numerical IDs, handling empty string for nulling
            acc[key] = (key === 'user_id' || key === 'branch_id' || key === 'agent_id') ? (value === "" ? null : Number(value)) : value;
            return acc;
        }, {});
        
        updateMutation.mutate({ id: editingEmployee.id, payload });
    };

    // Delete employee (Unchanged)
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the employee record.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            customClass: {
                popup: 'rounded-xl shadow-2xl',
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded-lg transition duration-150',
                cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-5 rounded-lg transition duration-150'
            },
            buttonsStyling: false,
        });

        if (confirm.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };


    // --- DataTable Columns (Updated for Serial Number) ---
    const columns = [
        { 
            name: "SL", 
            // The 'cell' function provides the row data and the zero-based index for the current page
            cell: (row, index) => (
                <span className="font-semibold text-gray-700">
                    {/* Calculation for index + 1 */}
                    {index + 1}
                </span>
            ), 
            width: '60px', 
            center: true,
            sortable: false, 
        },
        { name: "Code", selector: row => row.employee_code || 'N/A', sortable: true, width: '120px', center: true },
        { name: "Employee Name", selector: row => row.user?.name || 'N/A', sortable: true, grow: 2, minWidth: '180px' },
        { name: "Email", selector: row => row.user?.email || 'N/A', sortable: true, grow: 3 },
        { name: "Mobile", selector: row => row.mobile || 'N/A', sortable: true, grow: 2 },
        { name: "Rank", selector: row => <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs">{row.rank || 'N/A'}</span>, width: '100px', center: true },
        { name: "Branch", selector: row => row.branch?.name || 'N/A', grow: 2, minWidth: '150px' },
        { 
            name: "Actions",
            cell: row => (
                <div className="flex gap-1">
                    <button title="View Details" className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition duration-150" onClick={() => setViewEmployee(row)}>
                        <AiOutlineEye size={18} />
                    </button>
                    <button title="Edit Employee" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-150" onClick={() => openEditModal(row)}>
                        <HiOutlinePencilAlt size={18} />
                    </button>
                    <button title="Delete Employee" className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition duration-150" onClick={() => handleDelete(row.id)}>
                        <HiOutlineTrash size={18} />
                    </button>
                </div>
            ),
            allowOverflow: true,
            button: true,
            width: '120px'
        }
    ];

    // --- Detail Row Component for View Modal (Unchanged) ---
    const DetailRow = ({ icon: Icon, label, value }) => (
        <div className="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition duration-150">
            <div className="flex items-center mb-1 space-x-2">
                <Icon className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-gray-900 text-lg font-bold break-words">{value || 'N/A'}</span>
        </div>
    );

    // --- Main Component Render ---
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto bg-gray-50">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-6 sm:p-8">
                    <ToastContainer position="top-right" autoClose={3000} newestOnTop />

                    {/* Header with polished design */}
                    <div className="flex justify-between items-center mb-6 p-6 bg-white rounded-xl shadow-2xl border-l-4 border-indigo-600">
                        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <HiOutlineUserGroup className="text-indigo-600" size={32} /> Employee List
                        </h2>
                        <div className="flex gap-4 items-center">
                            
                            {/* Rank Filter Dropdown */}
                            <div className="relative flex items-center gap-2">
                                <HiOutlineFilter className="text-gray-400" size={18} />
                                <select 
                                    value={selectedRank}
                                    onChange={handleRankChange}
                                    className="border border-gray-300 pr-4 py-2 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-inner text-gray-700 font-medium transition duration-150"
                                >
                                    <option value="">Filter by Rank (All)</option>
                                    {ranksList.map(rank => (
                                        <option key={rank.id} value={rank.code}>{rank.name} ({rank.code})</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Search Input */}
                            <div className="relative">
                                <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by Name, Code, or Mobile..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border border-gray-300 pl-10 pr-4 py-2 rounded-xl w-80 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-150"
                                />
                            </div>
                            
                            {/* Add Button */}
                            <button
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-lg hover:shadow-xl transition duration-150 transform hover:-translate-y-0.5"
                                onClick={navigateToAddEmployee}
                            >
                                <AiOutlinePlus size={20} /> Add New Employee
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white p-4 rounded-xl shadow-2xl">
                        {loading ? ( 
                            <TableSkeleton />
                        ) : (
                            <DataTable
                                columns={columns}
                                data={filteredEmployees} 
                                pagination
                                progressPending={loading} 
                                highlightOnHover
                                striped
                                customStyles={customStyles}
                                noHeader
                                className="rounded-xl"
                                dense
                                paginationIconNext={CustomNextIcon}
                                paginationIconPrevious={CustomPrevIcon}
                                paginationIconFirst={CustomPrevIcon} 
                                paginationIconLast={CustomNextIcon}  
                            />
                        )}
                    </div>

                    {/* --- Modals (Unchanged) --- */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm" onClick={closeEditModal}></div>
                            <div className="relative bg-white rounded-2xl shadow-3xl p-8 w-full max-w-lg z-10 overflow-y-auto max-h-[90vh]">
                                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-900" onClick={closeEditModal}>
                                    <AiOutlineClose size={24} />
                                </button>
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-2 border-indigo-100">Edit Employee: {editingEmployee.user?.name}</h2>

                                {isDataLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="flex flex-col">
                                            <label className="font-semibold text-gray-700 mb-1">User (Read-only)</label>
                                            <input 
                                                value={editingEmployee.user?.name || ''} 
                                                disabled 
                                                className="border border-gray-200 px-4 py-2 rounded-xl bg-gray-50 text-gray-500"
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
                                            <select name="branch_id" value={formData.branch_id} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-inner">
                                                <option value="">Select Branch</option>
                                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold text-gray-700 mb-1">Agent (optional)</label>
                                            <select name="agent_id" value={formData.agent_id} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-inner">
                                                <option value="">Select Agent</option>
                                                {agents.map(a => <option key={a.id} value={a.id}>{a.user?.name || `Agent ${a.id}`}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold text-gray-700 mb-1">Rank <span className="text-red-500">*</span></label>
                                            <input name="rank" value={formData.rank} onChange={handleChange} className="border border-gray-300 px-4 py-2 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-inner" placeholder="e.g., MM, ME, PD" />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t mt-6 border-gray-100">
                                            <button onClick={closeEditModal} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition duration-150">Cancel</button>
                                            <button onClick={handleSubmit} disabled={updateMutation.isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition duration-150 shadow-md">
                                                {updateMutation.isLoading ? (
                                                    <div className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        Updating...
                                                    </div>
                                                ) : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {viewEmployee && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm" onClick={() => setViewEmployee(null)}></div>
                            <div className="relative bg-gray-50 rounded-2xl shadow-2xl p-8 w-full max-w-4xl z-10 overflow-y-auto max-h-[90vh]">
                                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-900" onClick={() => setViewEmployee(null)}>
                                    <AiOutlineClose size={24} />
                                </button>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-2 border-indigo-200">Employee Profile: {viewEmployee.user?.name}</h2>

                                {/* Row 1: Photo and Key Details */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    {/* Photo/Signature Card */}
                                    <div className="col-span-1 flex flex-col items-center justify-start p-6 bg-white rounded-xl shadow-lg border border-indigo-100">
                                        <div className="relative w-36 h-36 mb-4">
                                            <img 
                                                src={viewEmployee.photo?.path || 'https://via.placeholder.com/150?text=No+Photo'} 
                                                alt="Employee Photo" 
                                                className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-xl" 
                                            />
                                        </div>
                                        {viewEmployee.signature ? (
                                            <div className="text-center w-full mt-4 border-t pt-4">
                                                <p className="text-sm font-semibold text-gray-500 mb-2">Signature:</p>
                                                <img 
                                                    src={viewEmployee.signature} 
                                                    alt="Signature" 
                                                    className="w-32 h-16 object-contain mx-auto" 
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 mt-4">No Signature Available</span>
                                        )}
                                    </div>
                                    
                                    {/* Key Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 md:col-span-3">
                                        <DetailRow icon={AiOutlineUser} label="Full Name (EN)" value={viewEmployee.full_name_en} />
                                        <DetailRow icon={AiOutlineUser} label="Full Name (BN)" value={viewEmployee.full_name_bn} />
                                        <DetailRow icon={AiOutlineMail} label="Email" value={viewEmployee.user?.email} />
                                        <DetailRow icon={AiOutlineIdcard} label="Employee Code" value={viewEmployee.employee_code} />
                                        <DetailRow icon={HiOutlineOfficeBuilding} label="Branch" value={viewEmployee.branch?.name} />
                                        <DetailRow icon={AiOutlineIdcard} label="Rank" value={viewEmployee.rank} />
                                        <DetailRow icon={HiOutlineUserGroup} label="Agent" value={viewEmployee.agent?.user?.name || 'N/A'} />
                                        <DetailRow
                                        icon={AiOutlineUser}
                                        label="Superior"
                                        value={`${viewEmployee.superior?.full_name_en || 'N/A'} (${viewEmployee.superior?.rank || 'N/A'})`}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Addresses and Extended Info */}
                                <h3 className="font-extrabold text-xl text-gray-700 mb-4 border-b pb-2 border-indigo-100">Contact & Base Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                    <div className="col-span-1">
                                        <DetailRow icon={HiOutlineOfficeBuilding} label="Present Address" value={viewEmployee?.present_address} />
                                    </div>
                                    <div className="col-span-1">
                                        <DetailRow icon={HiOutlineOfficeBuilding} label="Permanent Address" value={viewEmployee.permanent_address} />
                                    </div>
                                    <div className="col-span-1">
                                        <DetailRow icon={AiOutlineMail} label="Mobile Number" value={viewEmployee.mobile} />
                                    </div>
                                    <div className="col-span-1">
                                        <DetailRow icon={AiOutlineCalendar} label="Date of Birth" value={viewEmployee.date_of_birth?.split('T')[0]} />
                                    </div>
                                    <div className="col-span-1">
                                        <DetailRow icon={AiOutlineIdcard} label="National ID" value={viewEmployee.national_id} />
                                    </div>
                                    <div className="col-span-1">
                                        <DetailRow icon={AiOutlineCalendar} label="Created On" value={new Date(viewEmployee.created_at).toLocaleDateString()} />
                                    </div>
                                </div>

                                {/* Row 3: Educations & Nominees Card Container (Unchanged) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Educations Section */}
                                    <div className="p-6 bg-white rounded-xl shadow-lg border border-indigo-200">
                                        <h3 className="font-extrabold text-xl text-indigo-700 mb-4 border-b pb-2">🎓 Educations</h3>
                                        {viewEmployee.educations?.length > 0 ? (
                                            <ul className="space-y-3">
                                                {viewEmployee.educations.map(e => (
                                                    <li key={e.id} className="p-3 border rounded-lg bg-indigo-50/50 text-sm">
                                                        <div className="font-bold text-gray-800 flex justify-between items-center">
                                                            <span>{e.level} in {e.subject || 'N/A'}</span>
                                                            <span className="text-xs text-indigo-600 font-extrabold ml-4">Year: {e.passing_year}</span>
                                                        </div>
                                                        <p className="text-gray-600 mt-1">
                                                            <span className="font-medium">Institution:</span> {e.institution || 'N/A'}
                                                        </p>
                                                        <p className="text-gray-600 mt-1">
                                                            <span className="font-medium">Result/GPA:</span> <span className="text-green-600 font-bold">{e.result || 'N/A'}</span>
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (<p className="text-gray-500">No education records found.</p>)}
                                    </div>

                                    {/* Nominees Section */}
                                    <div className="p-6 bg-white rounded-xl shadow-lg border border-indigo-200">
                                        <h3 className="font-extrabold text-xl text-indigo-700 mb-4 border-b pb-2">👨‍👩‍👧‍👦 Nominees</h3>
                                        {viewEmployee.nominees?.length > 0 ? (
                                            <ul className="space-y-3">
                                                {viewEmployee.nominees.map(n => (
                                                    <li key={n.id} className="p-3 border rounded-lg bg-indigo-50/50 text-sm">
                                                        <div className="font-bold text-gray-800 flex justify-between items-center mb-1">
                                                            <span className="text-base">{n.name}</span>
                                                            <span className="text-xs text-indigo-600 font-extrabold ml-4">Relation: {n.relation}</span>
                                                        </div>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Phone:</span> {n.phone || 'N/A'}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Email:</span> {n.email || 'N/A'}
                                                        </p>
                                                        <p className="text-gray-600 mt-1 break-words">
                                                            <span className="font-medium">Address:</span> {n.address || 'N/A'}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (<p className="text-gray-500">No nominee records found.</p>)}
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

export default Employeelist;