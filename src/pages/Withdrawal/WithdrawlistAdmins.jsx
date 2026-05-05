import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from 'react-data-table-component';
import { AiOutlineReload, AiOutlineEye } from "react-icons/ai";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Icons for actions

// --- IMPORTS FOR LAYOUT (Adjust paths as per your project structure) ---
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// Initialize SweetAlert with React Content
const MySwal = withReactContent(Swal);

// --- API Configuration ---
// Base URL from the JSON structure
const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
const GET_WITHDRAW_REQUESTS_URL = `${BASE_URL}/api/v1/admin/withdraw-requests`;
const POST_APPROVE_URL = (id) => `${BASE_URL}/api/v1/admin/withdraw-requests/${id}/approve`;
const POST_REJECT_URL = (id) => `${BASE_URL}/api/v1/admin/withdraw-requests/${id}/reject`;


// Status options for filtering
const STATUS_OPTIONS = [
    { label: 'All', value: 'all', color: 'indigo' },
    { label: 'Pending', value: 'pending', color: 'yellow' },
    { label: 'Approved', value: 'approved', color: 'green' },
    { label: 'Rejected', value: 'rejected', color: 'red' },
];

// --- Helper Functions ---

// Function to format JSON details for display in the modal
const formatMethodDetails = (details) => {
    if (!details) return <p className="text-gray-500 italic">N/A</p>;
    return Object.entries(details)
        .map(([key, value]) => (
            <div key={key} className="flex justify-between py-1">
                <span className="font-semibold capitalize text-gray-700">{key.replace(/_/g, ' ')}:</span>
                <span className="text-gray-900 font-medium">{value}</span>
            </div>
        ));
};

const getStatusColorClass = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-500";
        case "approved":
            return "bg-green-100 text-green-800 border-green-500";
        case "rejected":
            return "bg-red-100 text-red-800 border-red-500";
        default:
            return "bg-gray-100 text-gray-800 border-gray-500";
    }
};

// =========================================================================
// SKELETON LOADERS
// =========================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-[#374151] flex items-center px-6 space-x-4">
             {[...Array(7)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/6 bg-gray-400/50" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-lg" />
                    <SkeletonPulse className="h-8 w-8 rounded-lg" />
                </div>
            </div>
        ))}
    </div>
);

// --- Component Definition ---
const Withdrawlistadmin = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('pending'); // Default filter
    const [searchQuery, setSearchQuery] = useState('');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

    const token = localStorage.getItem("authToken"); // Assuming token is stored here

    // --- React Query: Fetch Withdrawals ---
    const { data: withdrawals = [], isLoading: loading, refetch } = useQuery({
        queryKey: ["adminWithdrawals", filterStatus],
        queryFn: async () => {
            const statusParam = filterStatus !== 'all' ? `status=${filterStatus}` : '';
            const url = `${GET_WITHDRAW_REQUESTS_URL}?${statusParam}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Server returned non-JSON response (Status: ${response.status})`);
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            return result.data || [];
        },
        enabled: !!token,
        onError: (error) => {
            toast.error(`Failed to load withdrawal requests: ${error.message}`);
        }
    });

    // --- React Query: Mutation for Approve/Reject ---
    const actionMutation = useMutation({
        mutationFn: async ({ id, type, payload }) => {
            const url = type === 'approve' ? POST_APPROVE_URL(id) : POST_REJECT_URL(id);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Server returned non-JSON response (Status: ${response.status})`);
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || `Failed to ${type} request.`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["adminWithdrawals"]);
        }
    });

    // --- Filtering and Totals ---
    const filteredWithdrawals = useMemo(() => {
        return withdrawals?.filter((item) => {
            const searchLower = searchQuery?.toLowerCase();
            return (
                item.user_name?.toLowerCase().includes(searchLower) ||
                (item.method_details.account || '').includes(searchLower)
            );
        });
    }, [withdrawals, searchQuery]);

    const totals = useMemo(() => {
        const totalAmount = filteredWithdrawals.reduce((sum, current) => sum + (current.amount || 0), 0);
        return { totalCount: filteredWithdrawals.length, totalAmount };
    }, [filteredWithdrawals]);


    // --- Admin Action Handlers (Approve/Reject) ---

    const executeAction = async (id, type, payload = {}) => {
        try {
            await actionMutation.mutateAsync({ id, type, payload });
            toast.success(`Request #${id} ${type}ed successfully.`);
            return true;
        } catch (error) {
            Swal.showValidationMessage(`Error: ${error.message}`);
            return false;
        }
    };
    
    // Handler for Reject button click (requires reason input)
    const handleRejectClick = (id) => {
        MySwal.fire({
            title: 'Reject Withdrawal Request',
            html: `
                <div class="text-left">
                    <label for="reject-reason" class="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection:</label>
                    <textarea 
                        id="reject-reason" 
                        rows="3"
                        class="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" 
                        placeholder="e.g. Insufficient balance, Incorrect account details, etc."
                    ></textarea>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm Reject',
            confirmButtonColor: '#EF4444',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const reason = document.getElementById('reject-reason').value;
                if (!reason.trim()) {
                    Swal.showValidationMessage(`Rejection reason is required.`);
                    return false;
                }
                const payload = { reason: reason };
                return executeAction(id, 'reject', payload);
            }
        });
    };

    const handleApproveClick = (id) => {
        MySwal.fire({
            title: 'Approve Withdrawal Request?',
            text: `Are you sure you want to approve request #${id}? This action is irreversible.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            confirmButtonColor: '#10B981',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return executeAction(id, 'approve');
            }
        });
    };

    // --- View Details Modal Handler ---
    const handleViewDetails = (row) => {
        setSelectedWithdrawal(row);
        setDetailModalOpen(true);
    };

    // --- Datatable Columns Definition ---
    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '60px' },
        { name: 'User Name', selector: row => row.user_name, sortable: true, grow: 2 },
        { name: 'Amount', selector: row => row.amount, sortable: true, 
            cell: row => <span className='font-bold text-lg text-teal-600'>{row.amount.toLocaleString()} ৳</span>, 
            width: '120px' 
        },
        { name: 'Method', selector: row => row.method, sortable: true, width: '100px' },
        { 
            name: 'Account No.', 
            selector: row => row.method_details.account, 
            grow: 1, 
            cell: row => <span className='text-gray-600 font-mono'>{row.method_details.account}</span> 
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColorClass(row.status)}`}>
                    {row.status.toUpperCase()}
                </span>
            ),
            width: '120px',
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex space-x-2">
                    {/* Admin Action Buttons (only for pending status) */}
                    {row.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleApproveClick(row.id)}
                                className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition duration-150"
                                title="Approve Request"
                            >
                                <FaCheckCircle className='w-4 h-4' />
                            </button>
                            <button
                                onClick={() => handleRejectClick(row.id)}
                                className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition duration-150"
                                title="Reject Request"
                            >
                                <FaTimesCircle className='w-4 h-4' />
                            </button>
                        </>
                    )}
                    {/* View Details Button */}
                    <button 
                        onClick={() => handleViewDetails(row)}
                        className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition duration-150"
                        title="View Details"
                    >
                        <AiOutlineEye className='w-4 h-4' />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px',
        },
    ];
    
    // --- Custom Styles for DataTable Header ---
    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#374151', // Dark Gray/Slate
                color: '#ffffff', 
                fontSize: '14px',
                fontWeight: 'bold',
            },
        },
        rows: {
            highlightOnHoverStyle: {
                backgroundColor: '#f3f4f6', 
                borderBottomColor: '#FFFFFF',
                borderRadius: '5px',
                outline: '1px solid #e5e7eb',
            },
        },
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        
                        {/* Page header and controls */}
                        <div className="mb-6 border-b pb-4">
                            <h1 className="text-2xl md:text-3xl text-gray-800 font-extrabold">
                                💼 Withdrawal Request Review (Admin)
                            </h1>
                        </div>

                        {/* --- Filtering and Search Controls --- */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <div className="flex space-x-2">
                                {STATUS_OPTIONS.map((status) => (
                                    <button
                                        key={status.value}
                                        onClick={() => setFilterStatus(status.value)}
                                        className={`py-2 px-4 text-sm font-medium border-b-2 transition duration-150 ease-in-out rounded-t-lg
                                            ${filterStatus === status.value
                                                ? `text-${status.color}-600 border-${status.color}-600 font-bold bg-white shadow-sm`
                                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Search user name or account..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                />
                                <button
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition"
                                    onClick={() => refetch()}
                                    disabled={loading || actionMutation.isLoading}
                                >
                                    <AiOutlineReload className={loading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>
                        </div>


                        {/* --- Summary Cards (Top Totals for Current Filtered View) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            
                            {/* Total Count */}
                            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Total Requests Shown</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{totals.totalCount.toLocaleString()}</p>
                            </div>

                            {/* Total Amount */}
                            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-teal-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Total Amount Requested</p>
                                <p className="text-3xl font-bold text-teal-600 mt-1">{totals.totalAmount.toLocaleString()} ৳</p>
                            </div>
                        </div>


                        {/* Withdrawal Requests List */}
                        <div className="bg-white shadow-xl rounded-lg border border-gray-200">
                            <header className="px-5 py-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                                <h2 className="font-bold text-lg text-gray-800">
                                    {filterStatus.toUpperCase()} Requests
                                </h2>
                            </header>
                            <div className="p-3">
                                {loading ? (
                                    <TableSkeleton />
                                ) : (
                                    <DataTable
                                        columns={columns}
                                        data={filteredWithdrawals}
                                        progressPending={false}
                                        pagination
                                        highlightOnHover
                                        responsive
                                        noDataComponent={<div className="p-6 text-center text-gray-500">No {filterStatus} withdrawal requests found.</div>}
                                        customStyles={customStyles}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Toast Container for notifications */}
            <ToastContainer position="bottom-right" autoClose={3000} />

            {/* === Detail Modal === */}
            {detailModalOpen && selectedWithdrawal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-2">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                        <div className="flex justify-between items-center mb-6 border-b pb-3">
                            <h3 className="text-xl font-bold text-indigo-700">Withdrawal Request #{selectedWithdrawal.id}</h3>
                            <button
                                onClick={() => setDetailModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-4 text-left">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <p className="text-lg font-extrabold text-teal-600 mb-2">Amount: {selectedWithdrawal.amount.toLocaleString()} ৳</p>
                                <p className={`font-semibold text-sm px-3 py-1 rounded border inline-block ${getStatusColorClass(selectedWithdrawal.status)}`}>
                                    Status: {selectedWithdrawal.status.toUpperCase()}
                                </p>
                            </div>
                            
                            <h4 className="font-bold text-gray-800 border-b pb-1">User & Wallet Info:</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">User Name:</span>
                                    <span className="font-medium">{selectedWithdrawal.user_name} (ID: {selectedWithdrawal.user_id})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">User Type:</span>
                                    <span className="font-medium capitalize">{selectedWithdrawal.user_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Wallet Type:</span>
                                    <span className="font-medium capitalize">{selectedWithdrawal.wallet_type}</span>
                                </div>
                            </div>
                            
                            <h4 className="font-bold text-gray-800 border-b pb-1 mt-4">Payment Method:</h4>
                            <div className="space-y-1 text-sm bg-blue-50 p-3 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method:</span>
                                    <span className="font-medium uppercase">{selectedWithdrawal.method}</span>
                                </div>
                                {formatMethodDetails(selectedWithdrawal.method_details)}
                            </div>

                            <h4 className="font-bold text-gray-800 border-b pb-1 mt-4">Review History:</h4>
                            <div className="space-y-1 text-xs">
                                <p><strong>Requested At:</strong> {new Date(selectedWithdrawal.created_at).toLocaleString()}</p>
                                {selectedWithdrawal.reviewed_at && <p><strong>Reviewed At:</strong> {new Date(selectedWithdrawal.reviewed_at).toLocaleString()}</p>}
                                {selectedWithdrawal.reviewed_by && <p><strong>Reviewed By:</strong> {selectedWithdrawal.reviewed_by}</p>}
                                {selectedWithdrawal.reject_reason && <p className='text-red-600 font-semibold'><strong>Rejection Reason:</strong> {selectedWithdrawal.reject_reason}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 pt-4 border-t">
                            <button
                                className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg"
                                onClick={() => setDetailModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Withdrawlistadmin;