import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { formatDateTime } from "../../utils/Utils";

// =========================
// Icon Components (SVG)
// =========================
const PayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h4.5m-4.5 3H18a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.154.4a1.471 1.471 0 01-1.293.582c-.44 0-.87-.215-1.154-.582a1.471 1.471 0 00-1.293-.582c-.44 0-.902.055-1.154.4l-4.423 1.106c-.5.125-.852.575-.852 1.091v1.372c0 1.242 1.007 2.25 2.25 2.25h15M17.25 12a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c2.25-4.5 6.75-7.5 9.75-7.5s7.5 3 9.75 7.5c-2.25 4.5-6.75 7.5-9.75 7.5S4.5 16.5 2.25 12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// =========================
// Helper Functions
// =========================
const formatDate = (dateString) => dateString ? formatDateTime(dateString) : "N/A";
    
const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'BDT', 
        minimumFractionDigits: 2 
    }).format(value || 0);

const getDetail = (value) => value || "N/A";

// =========================================================================
// SKELETON LOADERS
// =========================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-green-600 flex items-center px-6 space-x-4">
             {[...Array(9)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/12 bg-green-400/50" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-16" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-20" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ======================================================
// MAIN COMPONENT: ServiceCommissionPendingList
// ======================================================
const ServiceCommissionPendingList = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    
    // State for filtering by month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 
    
    // API Setup
    const API_BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
    const API_TOKEN = localStorage.getItem("authToken");

    // ===================================
    // 1. Data Fetching
    // ===================================
    const { data: apiData, isLoading: loading } = useQuery({
        queryKey: ["serviceCommissions", selectedMonth],
        queryFn: async () => {
            if (!API_TOKEN) throw new Error("Authentication token not found.");
            const response = await fetch(`${API_BASE_URL}/api/v1/service-commissions/pending?month=${selectedMonth}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            });
            if (!response.ok) throw new Error(`Failed to load service commission list: ${response.statusText}`);
            return response.json();
        },
        keepPreviousData: true,
        onError: (error) => {
            toast.error(`Error loading data: ${error.message}`);
        }
    });

    const commissions = Array.isArray(apiData?.commissions) ? apiData.commissions : [];
    const summary = {
        count: apiData?.count || 0,
        total_amount: apiData?.total_amount || 0
    };
    
    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    // ===================================
    // 2. Handle View Details (Modal)
    // ===================================
    const handleView = (commission) => {
        Swal.fire({
            title: `<span class="text-2xl font-bold text-indigo-700">Commission Details (SVC ID: ${getDetail(commission.commission_id)})</span>`,
            html: `
                <div class="p-4 text-left space-y-5">
                    
                    <div class="bg-indigo-50 p-5 rounded-xl border-2 border-indigo-200"> 
                        <h4 class="text-lg font-extrabold text-indigo-800 mb-3 border-b border-indigo-200 pb-2">
                            Transaction & Service
                        </h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div><p class="font-semibold text-gray-600">Sales Order ID:</p><p class="text-gray-800 font-bold">${getDetail(commission.sales_order_id)}</p></div>
                            <div><p class="font-semibold text-gray-600">Payment ID:</p><p class="text-gray-800 font-bold">${getDetail(commission.payment_id)}</p></div>
                            <div class="col-span-2"><p class="font-semibold text-gray-600">Payment Date:</p><p class="text-gray-800">${formatDate(commission.payment_date)}</p></div>
                            <div class="col-span-2"><p class="font-semibold text-gray-600">Service Name:</p><p class="text-green-700 font-bold text-lg">${getDetail(commission.service_name)}</p></div>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-xl shadow-xl border border-gray-100"> 
                        <h4 class="text-xl font-extrabold text-red-700 mb-3 border-b-2 border-red-200 pb-2">
                            Recipient & Commission
                        </h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="font-semibold text-gray-600">Recipient Type/ID:</p>
                                <p class="text-gray-800 font-bold capitalize">${getDetail(commission.recipient_type)} (${getDetail(commission.recipient_id)})</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-600">Recipient Name:</p>
                                <p class="text-gray-800 font-bold">${getDetail(commission.recipient_name)}</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-600">Payment Amount (Base):</p>
                                <p class="text-blue-600 font-extrabold text-lg">${formatCurrency(commission.payment_amount)}</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-600">Commission Rate:</p>
                                <p class="text-red-600 font-extrabold text-lg">${getDetail(commission.commission_percentage)}%</p>
                            </div>
                            <div class="col-span-2">
                                <p class="font-semibold text-gray-600">Commission Due:</p>
                                <p class="text-green-700 font-extrabold text-2xl">${formatCurrency(commission.commission_amount)}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="font-semibold text-gray-600">Status:</p>
                                <p class="text-gray-800 font-bold capitalize">${getDetail(commission.status)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false, 
            showCloseButton: true,
            width: '45%',
            maxWidth: '600px',
            customClass: {
                popup: 'shadow-2xl rounded-xl border-t-8 border-indigo-600',
                title: 'pt-4', 
                closeButton: 'text-gray-500 hover:text-indigo-600'
            }
        });
    };


    // ===================================
    // 3. Handle Commission Processing (Payment) - UPDATED API
    // ===================================
    const payMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${API_BASE_URL}/api/v1/service-commissions/process?month=${selectedMonth}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`,
                },
                body: JSON.stringify({})
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Commission processing failed.");
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success(`Successfully processed commissions for ${selectedMonth}!`);
            queryClient.invalidateQueries(["serviceCommissions"]);
        },
        onError: (error) => {
            console.error("Commission Processing Error:", error);
            toast.error(`Processing failed: ${error.message}`);
        }
    });

    const handlePayCommissions = async () => {
        if (payMutation.isLoading) return;
        
        // Filter out only the 'unpaid' commissions in the current list
        const pendingCommissionsCount = commissions.filter(c => c.status === 'unpaid').length;
        if (pendingCommissionsCount === 0) {
            toast.info("No unpaid service commissions available for payment in the selected month.");
            return;
        }

        const confirm = await Swal.fire({
            title: "Confirm Bulk Commission Payment",
            html: `<p>Are you sure you want to **PROCESS & PAY** all **${pendingCommissionsCount}** unpaid service commission(s) for the month of **${selectedMonth}**?</p>
                    <p class="text-sm text-red-500 mt-2">This action will mark all unpaid commissions for this month as paid.</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#10B981", // Emerald Green
            cancelButtonColor: "#EF4444",
            confirmButtonText: `Yes, Process Commissions for ${selectedMonth}`,
            cancelButtonText: "No, Cancel"
        });

        if (confirm.isConfirmed) {
            payMutation.mutate();
        }
    };
    
    // ===================================
    // 4. Search, Filter, and Pagination
    // ===================================
    const filteredData = useMemo(() => {
        if (!search.trim()) {
            return commissions;
        }
        const lowerSearch = search.toLowerCase();
        return commissions.filter(
            (item) =>
                String(item.commission_id).includes(lowerSearch) || 
                String(item.sales_order_id).includes(lowerSearch) || 
                item.service_name?.toLowerCase().includes(lowerSearch) ||
                item.recipient_name?.toLowerCase().includes(lowerSearch) 
        );
    }, [search, commissions]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search, itemsPerPage, selectedMonth]);

    // ===================================
    // 5. Render Section
    // ===================================
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 md:p-6 w-full max-w-full mx-auto">
                    
                    {/* ## Commission List Header & Action 💸 */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 sm:mb-0">
                            Pending Service Commissions
                        </h1>
                        <button
                            onClick={handlePayCommissions}
                            // Calculate count of truly unpaid items for button text/disabling
                            disabled={payMutation.isLoading || commissions.filter(c => c.status === 'unpaid').length === 0}
                            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold shadow-md transition duration-150 ${
                                payMutation.isLoading || commissions.filter(c => c.status === 'unpaid').length === 0
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {payMutation.isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <PayIcon />
                                    <span>Process & Pay Commissions ({commissions.filter(c => c.status === 'unpaid').length})</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    <hr/>
                    
                    {/* ## Summary, Month Picker, and Search 📅 */}
                    <div className="flex flex-col md:flex-row justify-between items-center my-6 space-y-4 md:space-y-0 md:space-x-4">
                        
                        {/* Summary Block */}
                        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-lg border border-green-200 w-full md:w-auto">
                            <div className="p-2 border-r">
                                <p className="text-xs text-gray-500 font-medium">Pending Commissions</p>
                                <p className="text-lg font-bold text-green-700">{summary.count}</p>
                            </div>
                            <div className="p-2">
                                <p className="text-xs text-gray-500 font-medium">Total Pending Amount</p>
                                <p className="text-xl font-extrabold text-red-700">{formatCurrency(summary.total_amount)}</p>
                            </div>
                        </div>

                        {/* Month Picker and Search Input */}
                        <div className="flex space-x-4 w-full md:w-1/2 justify-end">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="border-2 border-gray-300 focus:border-green-500 p-3 rounded-lg transition duration-150 ease-in-out font-medium"
                                max={currentMonth}
                            />
                            <input
                                type="text"
                                placeholder="🔍 Search by Recipient, Service Name..."
                                className="w-full border-2 border-gray-300 focus:border-green-500 p-3 rounded-lg transition duration-150 ease-in-out placeholder-gray-500 max-w-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ## Commission List Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                        {loading ? (
                            <TableSkeleton />
                        ) : filteredData.length === 0 ? (
                            <p className="text-center p-8 text-lg text-gray-500 font-medium">
                                No **pending** service commissions found for **{selectedMonth}** matching your criteria.
                            </p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-green-600 text-white">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Comm ID</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Payment Date</th>
                                                 <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Service Name</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Recipient</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Base Amount</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Rate</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Commission Due</th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedData?.map((commission, index) => (
                                                <tr key={commission.commission_id || index} className="hover:bg-gray-50 transition duration-100">
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-medium">SVC-{commission?.commission_id}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(commission?.payment_date)}</td>
                                                           <td className="py-3 px-4 text-center text-sm">
                                                            {/* Conditional Status Styling */}
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                                commission.status === 'unpaid' 
                                                                    ? 'bg-red-500 text-white' // Applied Red Background & White Text
                                                                    : commission.status === 'paid' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {commission.status || 'Unknown'}
                                                            </span>
                                                        </td>
                                                                                                <td className="py-3 px-4 text-sm text-indigo-600 font-semibold">{commission.service_name || 'N/A'}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        <span className="font-semibold">{commission.recipient_name}</span> 
                                                        <span className="text-xs text-gray-500 ml-2">({commission.recipient_type?.substring(0, 1).toUpperCase()}-{commission.recipient_id})</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-blue-600 font-medium">{formatCurrency(commission.payment_amount)}</td>
                                                    <td className="py-3 px-4 text-sm text-red-600 font-medium">{commission.commission_percentage}%</td>
                                                    <td className="py-3 px-4 text-sm text-red-700 font-bold">{formatCurrency(commission.commission_amount)}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <button
                                                            onClick={() => handleView(commission)} 
                                                            className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out p-1 rounded-full hover:bg-indigo-100"
                                                            title="View Commission Details"
                                                        >
                                                            <EyeIcon />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls */}
                                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                                    <div className="text-sm text-gray-600">
                                        Showing **{startIndex + 1}** to **{Math.min(startIndex + itemsPerPage, filteredData.length)}** of **{filteredData.length}** entries
                                    </div>
                                    <nav className="flex space-x-1" aria-label="Pagination">
                                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-lg text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-100'}`}>&laquo; Previous</button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button key={page} onClick={() => goToPage(page)} className={`px-3 py-1 text-sm font-medium rounded-lg ${currentPage === page ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}>{page}</button>
                                        ))}
                                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || filteredData.length === 0} className={`p-2 rounded-lg text-sm font-medium ${currentPage === totalPages || filteredData.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-100'}`}>Next &raquo;</button>
                                    </nav>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default ServiceCommissionPendingList;
