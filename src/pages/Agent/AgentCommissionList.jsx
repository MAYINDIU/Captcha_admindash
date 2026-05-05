import React, { useState, useEffect } from 'react';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importing a simple spinner component for a better loading visual
const Spinner = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading commissions...
    </div>
);

// Component for the Total Commission Display
const TotalCommissionCard = ({ totalAmount, currencyFormatter }) => (
    <div className="bg-white shadow-lg rounded-xl p-5 mb-8 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid Commission
                </p>
                <h2 className="text-4xl font-extrabold text-green-700 mt-1">
                    {currencyFormatter(totalAmount)}
                </h2>
            </div>
            <div className="text-green-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1L21 12m-6 0h6"></path></svg>
            </div>
        </div>
    </div>
);

const AgentCommissionList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCommission, setTotalCommission] = useState(0); 
    
    // ⭐ NEW STATE: Tracks the ID of the row currently showing details
    const [expandedRowId, setExpandedRowId] = useState(null); 
    
    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    
    const token = localStorage.getItem("authToken");
    const employee = JSON.parse(localStorage.getItem("user"));
    const agentId = employee?.agent_id;

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return 'N/A';
        
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(numericAmount);
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date)) return "Invalid Date";
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
        });
    };

    // ⭐ NEW FUNCTION: Toggles the details row
    const toggleDetails = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    useEffect(() => {
        const fetchCommissions = async () => {
            // ... (rest of the fetching logic is unchanged)
            if (!token) {
                toast.error("Authentication token missing.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const url = `${API_BASE}/agents/dashboard/commissions?status[]=paid`;
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                if (!res.ok) {
                    const errorBody = await res.text();
                    console.error("API Response Error:", errorBody);
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                
                const filteredCommissions = data?.data?.filter(commission => 
                    commission.recipient_id === agentId
                ) || [];
                
                const total = filteredCommissions.reduce((sum, commission) => {
                    return sum + parseFloat(commission.amount || 0);
                }, 0);

                setCommissions(filteredCommissions);
                setTotalCommission(total); 

            } catch (error) {
                console.error("Failed to fetch commissions:", error);
                toast.error("Failed to load commissions. Check console for details.");
            } finally {
                setLoading(false);
            }
        };

        if (agentId && token) {
            fetchCommissions();
        } else if (!token) {
            setLoading(false);
        } else {
            toast.error("User ID information is incomplete. Cannot load commissions.");
            setLoading(false);
        }
    }, [token, API_BASE, agentId]); 

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        
                        <header className="mb-6 border-b pb-4">
                            <h1 className="text-3xl font-extrabold text-indigo-700">💰 My Paid Commissions</h1>
                            <p className="text-gray-500">A detailed list of all commissions that have been processed and paid.</p>
                        </header>

                        {!loading && <TotalCommissionCard totalAmount={totalCommission} currencyFormatter={formatCurrency} />}

                        <div className="bg-white shadow-xl rounded-xl p-6">
                            
                            {loading ? (
                                <Spinner />
                            ) : (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    {commissions.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Payment Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Sales Order #
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Paid At
                                                    </th>
                                                    {/* ⭐ NEW COLUMN: Action button */}
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Details
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {commissions.map((commission) => (
                                                    <React.Fragment key={commission.id}>
                                                        {/* --- Main Row --- */}
                                                        <tr 
                                                            className={`hover:bg-indigo-50 transition duration-150 ease-in-out ${expandedRowId === commission.id ? 'bg-indigo-50' : ''}`}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-green-600">
                                                                {formatCurrency(commission.amount)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                                    {commission.meta?.payment_type || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                #{commission.sales_order_id || 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(commission.paid_at)}
                                                            </td>
                                                            {/* ⭐ NEW: Eye Button */}
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button 
                                                                    onClick={() => toggleDetails(commission.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                    aria-expanded={expandedRowId === commission.id}
                                                                    aria-controls={`details-${commission.id}`}
                                                                >
                                                                    {expandedRowId === commission.id ? (
                                                                        // Close Icon
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                                                    ) : (
                                                                        // Eye Icon (View)
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                                    )}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        
                                                        {/* --- Details Row (Conditional) --- */}
                                                        {expandedRowId === commission.id && (
                                                            <tr id={`details-${commission.id}`} className="bg-indigo-50 border-t border-indigo-200">
                                                                <td colSpan="5" className="px-6 py-4 text-sm text-gray-700">
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-indigo-100 rounded-lg">
                                                                        <div>
                                                                            <p className="font-semibold text-indigo-700">Commission Rule:</p>
                                                                            <p>{commission.meta?.percentage ? `${commission.meta.percentage}% of Payment` : 'Not Available'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-indigo-700">Payment ID / Method:</p>
                                                                            <p>#{commission.payment_id} / {commission.payment?.method || 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-indigo-700">Customer Name:</p>
                                                                            <p>{commission.sales_order?.customer?.name || 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-indigo-700">Order Total Value:</p>
                                                                            <p>{formatCurrency(commission.sales_order?.total)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-indigo-700">Payment Amount:</p>
                                                                            <p>{formatCurrency(commission.payment?.amount)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-indigo-700">Branch:</p>
                                                                            <p>{commission.branch_name || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        // Empty State (unchanged)
                                        <div className="p-10 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1v10a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v1"></path>
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Paid Commissions</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                You currently do not have any commissions with a 'paid' status.
                                            </p>
                                        </div>
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

export default AgentCommissionList;