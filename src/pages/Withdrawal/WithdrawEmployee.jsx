import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from 'react-data-table-component';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useQuery } from '@tanstack/react-query';

const MySwal = withReactContent(Swal);

const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
const GET_WITHDRAW_REQUESTS_URL = `${BASE_URL}/api/v1/wallet/withdraw-requests`;
const POST_WITHDRAW_REQUEST_URL = `${BASE_URL}/api/v1/wallet/withdraw-request`;

const WithdrawEmployee = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("authToken");

    // --- Totals Calculation ---
    const totals = useMemo(() => {
        const initial = { totalPending: 0, totalApproved: 0 };
        return withdrawals.reduce((acc, current) => {
            const amount = Number(current.amount) || 0;
            if (current.status === 'pending') acc.totalPending += amount;
            else if (current.status === 'approved') acc.totalApproved += amount;
            return acc;
        }, initial);
    }, [withdrawals]);

    // --- React Query: Wallet Balance ---
    const { data: walletData, refetch: refetchWallet } = useQuery({
        queryKey: ['wallet'],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/v1/employees/dashboard/wallet`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            return result.data || { balance: 0 };
        },
        enabled: !!token,
    });

    const availableBalance = walletData?.balance || 0;

    const fetchWithdrawals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(GET_WITHDRAW_REQUESTS_URL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const result = await response.json();
            setWithdrawals(result.data || []);
        } catch (error) {
            toast.error("Failed to load history.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchWithdrawals();
    }, [fetchWithdrawals, token]);

    // --- 1. Eye Button Logic (Details Popup) ---
    const handleViewDetails = (row) => {
        MySwal.fire({
            title: <div className="text-left border-b pb-3 text-xl font-bold text-gray-800">Withdrawal Details</div>,
            html: (
                <div className="text-left mt-4 space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                        <span className="text-xs text-gray-500 uppercase font-bold">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            row.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {row.status.toUpperCase()}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                            <p className="text-xs text-gray-400">Amount</p>
                            <p className="text-lg font-bold text-green-600">{row.amount} BDT</p>
                        </div>
                        <div className="p-3 bg-white border rounded-lg shadow-sm text-center">
                            <p className="text-xs text-gray-400">Method</p>
                            <p className="text-lg font-bold text-indigo-600 capitalize">{row.method}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-bold text-gray-700 border-b pb-1">Account Information</p>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm border border-dashed border-gray-300">
                            {row.method === 'cash' ? (
                                <p className="text-gray-600 italic">Self-collection at office counter.</p>
                            ) : (
                                Object.entries(row.method_details || {}).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-1 border-b last:border-0 border-gray-200">
                                        <span className="font-semibold capitalize text-gray-500">{key.replace(/_/g, ' ')}:</span>
                                        <span className="text-gray-900 font-medium">{value}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ),
            showCloseButton: true, // Professional X Button
            showConfirmButton: false,
            width: '500px',
            customClass: { popup: 'rounded-2xl shadow-2xl' }
        });
    };

    // --- 2. New Request Logic (Dynamic Cash Condition) ---
    const showWithdrawForm = () => {
        MySwal.fire({
            title: <div className="text-left border-b pb-3 text-xl font-bold text-gray-800">New Withdrawal Request</div>,
            html: (
                <div className="text-left mt-4 space-y-4">
                    <div className="p-4 bg-indigo-600 rounded-xl text-white shadow-lg flex justify-between items-center">
                        <span className="text-sm opacity-80 uppercase font-bold">Balance</span>
                        <span className="text-xl font-bold">{Number(availableBalance).toLocaleString()} BDT</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Amount</label>
                            <input id="swal-amount" type="number" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 mt-1" placeholder="Enter amount" />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Method</label>
                            <select id="swal-method" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white mt-1" 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const isBank = val === 'bank';
                                    const isCash = val === 'cash';

                                    // Hide Account field if Cash
                                    document.getElementById('acc-wrapper').style.display = isCash ? 'none' : 'block';
                                    // Show Bank fields only if Bank
                                    document.getElementById('bank-wrapper').style.display = isBank ? 'block' : 'none';
                                    
                                    if (!isCash) {
                                        document.getElementById('acc-label').innerText = isBank ? "Bank Account Number" : "Mobile Number";
                                    }
                                }}>
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="cash">Cash (In-Hand)</option>
                            </select>
                        </div>

                        <div id="acc-wrapper">
                            <label id="acc-label" className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile Number</label>
                            <input id="swal-account" type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 mt-1" placeholder="01XXXXXXXXX" />
                        </div>

                        <div id="bank-wrapper" style={{ display: 'none' }} className="space-y-3">
                            <input id="swal-bank-name" type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="Bank Name" />
                            <input id="swal-acc-name" type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="Account Holder Name" />
                            <input id="swal-branch" type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="Branch" />
                        </div>
                    </div>
                </div>
            ),
            showCloseButton: true,
            confirmButtonText: 'Submit Request',
            confirmButtonColor: '#4f46e5',
            showCancelButton: true,
            customClass: { popup: 'rounded-2xl', confirmButton: 'px-6 py-2.5 rounded-lg' },
            preConfirm: () => {
                const amount = document.getElementById('swal-amount').value;
                const method = document.getElementById('swal-method').value;
                
                if (!amount) { Swal.showValidationMessage('Amount is required'); return false; }
                if (Number(amount) > availableBalance) { Swal.showValidationMessage('Insufficient balance'); return false; }

                let method_details = {};
                if (method === 'cash') {
                    method_details = { type: 'Counter Cash' };
                } else if (method === 'bank') {
                    const acc = document.getElementById('swal-account').value;
                    if (!acc) { Swal.showValidationMessage('Account number required'); return false; }
                    method_details = {
                        account_number: acc,
                        bank_name: document.getElementById('swal-bank-name').value,
                        account_name: document.getElementById('swal-acc-name').value,
                        branch: document.getElementById('swal-branch').value
                    };
                } else {
                    const acc = document.getElementById('swal-account').value;
                    if (!acc) { Swal.showValidationMessage('Mobile number required'); return false; }
                    method_details = { account: acc };
                }

                return { amount, method, method_details, wallet_type: 'commission' };
            }
        }).then((result) => {
            if (result.isConfirmed) handlePostSubmission(result.value);
        });
    };

    const handlePostSubmission = async (payload) => {
        try {
            const response = await fetch(POST_WITHDRAW_REQUEST_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                toast.success("Request Submitted Successfully!");
                fetchWithdrawals();
                refetchWallet();
            } else {
                toast.error("Submission failed.");
            }
        } catch (e) {
            toast.error("Network Error.");
        }
    };

    const columns = [
        { name: 'ID', selector: row => row.id, width: '70px', sortable: true },
        { name: 'Amount', selector: row => row.amount, cell: row => <b className="text-green-600">{row.amount} BDT</b>, sortable: true },
        { name: 'Method', selector: row => row.method, cell: row => <span className="capitalize font-medium">{row.method}</span>, sortable: true },
        { name: 'Status', selector: row => row.status, cell: row => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {row.status.toUpperCase()}
            </span>
        ), sortable: true },
        { name: 'Action', cell: row => (
            <button onClick={() => handleViewDetails(row)} className="text-indigo-600 hover:bg-indigo-100 transition p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
        ), width: '80px'}
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="p-6 sm:p-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">💰 WALLET PAYOUTS</h1>
                        <button onClick={showWithdrawForm} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl shadow-xl font-bold transition-all transform hover:scale-105 active:scale-95">
                            + New Request
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-indigo-500">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">My Balance</p>
                            <p className="text-3xl font-black text-gray-800">{Number(availableBalance).toLocaleString()} <span className="text-lg font-normal">BDT</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-yellow-500">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Processing</p>
                            <p className="text-3xl font-black text-yellow-600">{totals.totalPending.toLocaleString()} <span className="text-lg font-normal">BDT</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-green-500">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Withdrawn</p>
                            <p className="text-3xl font-black text-green-600">{totals.totalApproved.toLocaleString()} <span className="text-lg font-normal">BDT</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                            <h2 className="font-bold text-gray-700">Withdrawal History</h2>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">{withdrawals.length} entries</span>
                        </div>
                        <DataTable columns={columns} data={withdrawals} progressPending={loading} pagination highlightOnHover customStyles={{ headRow: { style: { backgroundColor: '#f9fafb', color: '#374151', fontSize: '13px' } } }} />
                    </div>
                </main>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default WithdrawEmployee;