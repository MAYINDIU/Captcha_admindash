import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from 'react-data-table-component';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useQuery } from '@tanstack/react-query';

// Initialize SweetAlert with React Content
const MySwal = withReactContent(Swal);

// --- API Configuration ---
const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
const GET_WITHDRAW_REQUESTS_URL = `${BASE_URL}/api/v1/wallet/withdraw-requests`;
const POST_WITHDRAW_REQUEST_URL = `${BASE_URL}/api/v1/wallet/withdraw-request`;
const GET_WALLET_URL = `${BASE_URL}/api/v1/agents/dashboard/wallet`;


// --- Helper Components/Functions for UI ---

// Function to format JSON details for display
const formatMethodDetails = (details) => {
    if (!details) return "N/A";
    return Object.entries(details)
        .map(([key, value]) => (
            <div key={key} className="flex justify-between border-b py-1">
                <span className="font-semibold capitalize text-gray-600">{key.replace(/_/g, ' ')}:</span>
                <span className="text-gray-900">{value}</span>
            </div>
        ));
};

// --- Component Definition ---
const WithdrawAgentList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("authToken");

    // --- Totals Calculation ---
    const totals = useMemo(() => {
        const initial = { totalRequested: 0, totalPending: 0, totalApproved: 0 };
        return withdrawals.reduce((acc, current) => {
            const amount = current.amount || 0;
            acc.totalRequested += amount;
            if (current.status === 'pending') {
                acc.totalPending += amount;
            } else if (current.status === 'approved') {
                acc.totalApproved += amount;
            }
            return acc;
        }, initial);
    }, [withdrawals]);

    // --- React Query: Fetch Wallet Balance ---
    const { data: walletData } = useQuery({
        queryKey: ['agentWallet'],
        queryFn: async () => {
            const res = await fetch(GET_WALLET_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Network response was not ok');
            const result = await res.json();
            return result.data || {};
        },
        enabled: !!token,
    });

    const availableBalance = walletData?.balance || 0;

    // Function to fetch withdrawal requests
    const fetchWithdrawals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(GET_WITHDRAW_REQUESTS_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setWithdrawals(result.data || []);
            // toast.success("Withdrawal requests loaded successfully!");
        } catch (error) {
            console.error("Failed to fetch withdrawal data:", error);
            toast.error("Failed to load withdrawal requests.");
            setWithdrawals([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchWithdrawals();
        } else {
            setLoading(false);
            toast.error("Authorization token not found. Please log in.");
        }
    }, [fetchWithdrawals, token]);

    // --- View Details Popup Handler ---
    const handleViewDetails = (row) => {
        MySwal.fire({
            title: <strong className="text-2xl text-indigo-600">Withdrawal Request Details</strong>,
            html: (
                <div className="text-left p-4 space-y-3 bg-gray-50 rounded-lg shadow-inner">
                    <h3 className="text-xl font-bold border-b pb-2 text-gray-700">Request ID: {row.id}</h3>
                    
                    <div className="flex justify-between border-b py-1">
                        <span className="font-semibold text-gray-600">Requested By:</span>
                        <span className="text-gray-900">{row.user_name} (ID: {row.user_id})</span>
                    </div>

                    <div className="flex justify-between border-b py-1">
                        <span className="font-semibold text-gray-600">Amount:</span>
                        <span className="text-lg font-bold text-green-600">{row.amount} BDT</span>
                    </div>

                    <div className="flex justify-between border-b py-1">
                        <span className="font-semibold text-gray-600">Wallet Type:</span>
                        <span className="text-gray-900 capitalize">{row.wallet_type}</span>
                    </div>

                    <div className="flex justify-between border-b py-1">
                        <span className="font-semibold text-gray-600">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            row.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                            row.status === 'approved' ? 'bg-green-200 text-green-800' :
                            'bg-red-200 text-red-800'
                        }`}>
                            {row.status.toUpperCase()}
                        </span>
                    </div>
                    
                    <h4 className="text-lg font-bold mt-4 pt-2 border-t text-gray-700">Payment Details:</h4>
                    {formatMethodDetails(row.method_details)}

                    <h4 className="text-lg font-bold mt-4 pt-2 border-t text-gray-700">Timeline:</h4>
                    <div className="text-sm space-y-1">
                        <p><strong>Requested At:</strong> {new Date(row.created_at).toLocaleString()}</p>
                        {row.reviewed_at && <p><strong>Reviewed At:</strong> {new Date(row.reviewed_at).toLocaleString()}</p>}
                        {row.reviewed_by && <p><strong>Reviewed By:</strong> {row.reviewed_by}</p>}
                        {row.reject_reason && <p className='text-red-500'><strong>Reason for Rejection:</strong> {row.reject_reason}</p>}
                    </div>
                </div>
            ),
            showConfirmButton: true,
            confirmButtonText: 'Close',
            width: 500,
        });
    };


    // --- Datatable Columns Definition ---
    const columns = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
            width: '60px',
        },
        {
            name: 'Agent Name',
            selector: row => row.user_name,
            sortable: true,
        },
        {
            name: 'Amount',
            selector: row => row.amount,
            sortable: true,
            cell: row => <span className='font-bold text-green-600'>{row.amount} BDT</span>,
            width: '120px',
        },
        {
            name: 'Method',
            selector: row => row.method,
            sortable: true,
            width: '100px',
        },
        {
            name: 'Account',
            selector: row => row.method_details?.account || "N/A",
            grow: 1,
            cell: row => <span className='text-gray-600'>{row.method === 'cash' ? 'Counter Cash' : (row.method_details?.account || 'N/A')}</span>,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    row.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {row.status.toUpperCase()}
                </span>
            ),
            width: '120px',
        },
        {
            name: 'Actions',
            cell: row => (
                <button 
                    onClick={() => handleViewDetails(row)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 transition duration-150"
                    title="View Details"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '80px',
        },
    ];
    
    // --- Custom Styles for DataTable Header ---
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#374151', // Dark Gray/Slate color (e.g., bg-gray-700)
                color: '#ffffff', // White text
                fontSize: '14px',
                fontWeight: 'bold',
            },
        },
        rows: {
            highlightOnHoverStyle: {
                backgroundColor: '#f3f4f6', // Light gray on hover
                borderBottomColor: '#FFFFFF',
                borderRadius: '5px',
                outline: '1px solid #e5e7eb',
            },
        },
    };


    // --- Popup Form Implementation (SweetAlert2) for new request ---
    const showWithdrawForm = () => {
        // ... (showWithdrawForm and submitWithdrawRequest functions remain the same as previous response)
        // [omitted for brevity, assume they are pasted from the last response]
        MySwal.fire({
            title: <strong className='text-xl text-indigo-600'>Submit New Withdrawal Request</strong>,
            html: (
                <form id="withdraw-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="text-left mt-4 space-y-4 p-2 bg-white rounded-lg">
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-800 mb-4">
                            Available Balance: <strong className="text-lg">{Number(availableBalance).toLocaleString()} BDT</strong>
                        </div>
                        <input type="hidden" id="wallet_type" value="commission" />

                        <div className='flex flex-col'>
                            <label htmlFor="amount" className="font-medium text-sm text-gray-700">Amount (BDT):</label>
                            <input 
                                id="amount" 
                                type="number" 
                                min="100" 
                                placeholder="e.g. 500" 
                                className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                                required
                            />
                        </div>
                        
                        <div className='flex flex-col'>
                            <label htmlFor="method" className="font-medium text-sm text-gray-700">Withdrawal Method:</label>
                            <select 
                                id="method" 
                                className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 bg-white" 
                                required
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const isCash = val === 'cash';
                                    const accWrapper = document.getElementById('acc-wrapper');
                                    if (accWrapper) {
                                        accWrapper.style.display = isCash ? 'none' : 'flex';
                                    }
                                }}
                            >
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="cash">Cash (In-Hand)</option>
                            </select>
                        </div>

                        <div id="acc-wrapper" className='flex flex-col'>
                            <label htmlFor="account" className="font-medium text-sm text-gray-700">Account Number:</label>
                            <input 
                                id="account" 
                                type="text" 
                                placeholder="e.g. 017XXXXXXXX" 
                                className="mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                            />
                        </div>
                    </div>
                </form>
            ),
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const amount = document.getElementById('amount').value;
                const method = document.getElementById('method').value;
                const account = document.getElementById('account').value;
                const wallet_type = document.getElementById('wallet_type').value;

                if (!amount || !method || (method !== 'cash' && !account)) {
                    Swal.showValidationMessage(`Please fill in all fields`);
                    return false;
                }

                if (Number(amount) > Number(availableBalance)) {
                    Swal.showValidationMessage(`Insufficient balance. Your request cannot exceed your available balance.`);
                    return false;
                }

                const payload = {
                    wallet_type: wallet_type,
                    amount: Number(amount),
                    method: method,
                    method_details: method === 'cash' ? { type: 'Counter Cash' } : { account: account }
                };
                
                return submitWithdrawRequest(payload);
            }
        }).then((result) => {
            // ... (success/failure logic remains the same)
        });
    };

    // Function to submit withdrawal request
    const submitWithdrawRequest = async (payload) => {
        try {
            const response = await fetch(POST_WITHDRAW_REQUEST_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.message || "Something went wrong while submitting the request.";
                MySwal.fire('Error', errorMessage, 'error');
                return false;
            }

            MySwal.fire('Success!', 'Withdrawal request submitted successfully.', 'success');
            toast.success("Withdrawal request submitted!");
            fetchWithdrawals(); 
            return true;
        } catch (error) {
            console.error("Submission failed:", error);
            MySwal.fire('Error', 'Network or unexpected error occurred.', 'error');
            return false;
        }
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
                        
                        {/* Page header and Add Request Button */}
                        <div className="sm:flex sm:justify-between sm:items-center mb-6">
                            {/* Left: Title */}
                            <h1 className="text-2xl md:text-3xl text-gray-800 font-extrabold">
                                💰 Employee Withdrawal Management
                            </h1>
                            {/* Right: Add Request Button */}
                            <button
                                className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center"
                                onClick={showWithdrawForm}
                            >
                                <svg className="w-4 h-4 fill-current opacity-50 shrink-0 mr-2" viewBox="0 0 16 16"><path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z"></path></svg>
                                <span>New Withdrawal</span>
                            </button>
                        </div>

                        {/* --- Summary Cards (Top Totals) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            
                            {/* Available Balance (Replaces Total Requested) */}
                            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Available Balance</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{Number(availableBalance).toLocaleString()} BDT</p>
                            </div>

                            {/* Total Pending */}
                            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Total Pending</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-1">{totals.totalPending.toLocaleString()} BDT</p>
                            </div>

                            {/* Total Approved */}
                            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Total Approved</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{totals.totalApproved.toLocaleString()} BDT</p>
                            </div>
                        </div>


                        {/* Withdrawal Requests List */}
                        <div className="bg-white shadow-xl rounded-lg border border-gray-200">
                            <header className="px-5 py-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                                <h2 className="font-bold text-lg text-gray-800">Current Withdrawal History ({withdrawals.length})</h2>
                            </header>
                            <div className="p-3">
                                <DataTable
                                    columns={columns}
                                    data={withdrawals}
                                    progressPending={loading}
                                    pagination
                                    highlightOnHover
                                    responsive
                                    noDataComponent={<div className="p-6 text-center text-gray-500">No withdrawal requests found for this employee.</div>}
                                    customStyles={customStyles} // Applied custom styles here
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {/* Toast Container for notifications */}
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default WithdrawAgentList;