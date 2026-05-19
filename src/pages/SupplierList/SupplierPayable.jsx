import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these are your components for layout
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { formatDateTime } from "../../utils/Utils";

// =========================
// Icon Components (SVG)
// =========================
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c2.25-4.5 6.75-7.5 9.75-7.5s7.5 3 9.75 7.5c-2.25 4.5-6.75 7.5-9.75 7.5S4.5 16.5 2.25 12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// =========================================================================
// SKELETON LOADERS
// =========================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-indigo-600 flex items-center px-6 space-x-4">
             {[...Array(7)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/12 bg-indigo-400/50" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-16" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-48" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ======================================================
// MAIN COMPONENT: SupplierPayable (Refactored for Supplier Payables)
// ======================================================
const SupplierPayable = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("unpaid"); // Default filter

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // API Setup
    const API_BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
    const API_TOKEN = localStorage.getItem("authToken");

    // ===================================
    // 0. Helper Functions (Money & Date)
    // ===================================
    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 2
        }).format(value || 0);

    const getDetail = (value) => value || "N/A";

    const formatDate = (dateString) => dateString ? formatDateTime(dateString) : "N/A";
        
    const formatDateTimeForAPI = (date) => 
        date.toISOString().slice(0, 19).replace('T', ' ');

    // ===================================
    // 1. Data Fetching (Payables)
    // ===================================
    const { data: payablesData, isLoading: loading } = useQuery({
        queryKey: ["supplierPayables", statusFilter, currentPage, itemsPerPage],
        queryFn: async () => {
            if (!API_TOKEN) throw new Error("Authentication token not found.");
            const endpoint = `${API_BASE_URL}/api/v1/supplier-payables?status=${statusFilter}&page=${currentPage}&per_page=${itemsPerPage}`;
            const response = await fetch(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            });
            if (!response.ok) throw new Error(`Failed to load supplier payables: ${response.statusText}`);
            return response.json();
        },
        keepPreviousData: true,
        onError: (error) => {
            toast.error(`Error loading data: ${error.message}`);
        }
    });

    const payables = payablesData?.data || [];
    const meta = payablesData?.meta || {};
    const totalItemsFromMeta = meta.total || 0;
    const totalPagesFromMeta = meta.last_page || 1;

    const summary = useMemo(() => ({
        total_unpaid_amount: payables.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0),
        total_unpaid_count: payables.length
    }), [payables]);
    
    // ===================================
    // 2. Handle View Details (Modal)
    // ===================================
    const handleView = (payable) => {
        const supplier = payable.supplier || {};

        Swal.fire({
            title: `<span class="text-2xl font-bold text-indigo-700">Payable Details (ID: ${getDetail(payable.id)})</span>`,
            html: `
                <div class="p-4 text-left space-y-6">
                    
                    <div class="bg-indigo-50 p-5 rounded-xl border-2 border-indigo-200"> 
                        <h4 class="text-lg font-extrabold text-indigo-800 mb-3 border-b border-indigo-200 pb-2 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Transaction Details
                        </h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div><p class="font-semibold text-gray-600">Supplier Name:</p><p class="text-gray-800 font-bold">${getDetail(supplier.name)}</p></div>
                            <div><p class="font-semibold text-gray-600">Supplier Phone:</p><p class="text-gray-800">${getDetail(supplier.phone)}</p></div>
                            <div class="col-span-2"><p class="font-semibold text-gray-600">Supplier Address:</p><p class="text-gray-800">${getDetail(supplier.address)}</p></div>
                            <div><p class="font-semibold text-gray-600">Sales Order ID:</p><p class="text-gray-800">${getDetail(payable.sales_order_id)}</p></div>
                            <div><p class="font-semibold text-gray-600">Payment ID:</p><p class="text-gray-800">${getDetail(payable.payment_id)}</p></div>
                            <div class="col-span-2"><p class="font-semibold text-gray-600">Payable Amount:</p><p class="text-red-700 font-extrabold text-xl">${formatCurrency(payable.amount)}</p></div> 
                            <div><p class="font-semibold text-gray-600">Status:</p><p class="text-gray-800 capitalize">${getDetail(payable.status)}</p></div>
                            <div><p class="font-semibold text-gray-600">Created At:</p><p class="text-gray-800">${formatDate(payable.created_at)}</p></div>
                        </div>
                    </div>

                    ${payable.status === 'paid' ? `
                    <div class="bg-green-50 p-5 rounded-xl border-2 border-green-200"> 
                        <h4 class="text-lg font-extrabold text-green-800 mb-3 border-b border-green-200 pb-2">Payment Info</h4>
                        <p class="text-sm font-semibold text-gray-600">Paid On:</p>
                        <p class="text-gray-800 font-bold">${formatDate(payable.paid_at)}</p>
                    </div>` : ''}

                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: '500px',
            customClass: {
                popup: 'shadow-2xl rounded-xl border-t-8 border-indigo-600',
                title: 'pt-4',
                closeButton: 'text-gray-500 hover:text-indigo-600'
            }
        });
    };

    // ===================================
    // 3. Handle Batch Payment Processing (Action to pay)
    // ===================================
    const processMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await fetch(`${API_BASE_URL}/api/v1/supplier-payables/process`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`,
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Batch payment processing failed.");
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success(`Successfully marked payables as paid.`);
            queryClient.invalidateQueries(["supplierPayables"]);
        },
        onError: (error) => {
            console.error("Batch Payment Processing Error:", error);
            toast.error(`Processing failed: ${error.message}`);
        }
    });

    const handleBatchProcessPayments = async () => {
        if (processMutation.isLoading) return;

        // Filter the payables based on the current status filter (must be 'unpaid' for processing)
        const payablesToProcess = payables.filter(p => p.status === 'unpaid');
        const payableIds = payablesToProcess.map(p => p.id);
        const totalAmount = payablesToProcess.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);

        if (payablesToProcess.length === 0) {
            toast.info(`No 'unpaid' payables available to process in the current list.`);
            return;
        }

        const confirm = await Swal.fire({
            title: "Confirm Batch Payment Processing",
            html: `<p>Are you sure you want to mark **${payablesToProcess.length}** payable unit(s) as **PAID**?</p>
                     <p class="mt-2 text-lg font-bold text-green-700">Total Amount: ${formatCurrency(totalAmount)}</p>
                     <p class="text-sm text-red-500 mt-2">This action marks the items as paid and cannot be reversed.</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4F46E5",
            cancelButtonColor: "#EF4444",
            confirmButtonText: "Yes, Mark as Paid",
            cancelButtonText: "No, Cancel"
        });

        if (confirm.isConfirmed) {
            const firstPayable = payablesToProcess[0]; 
            const currentDate = new Date();
            
            const payload = {
                supplier_id: firstPayable.supplier_id, 
                method: "bank",
                from: firstPayable.created_at ? new Date(firstPayable.created_at).toISOString().split('T')[0] : '2025-01-01', 
                to: currentDate.toISOString().split('T')[0], 
                payable_ids: payableIds,
                paid_at: formatDateTimeForAPI(currentDate)
            };

            processMutation.mutate(payload);
        }
    };
    
    // ===================================
    // 4. Search and Pagination
    // ===================================
    const filteredData = useMemo(() => {
        if (!search.trim()) {
            return payables;
        }
        const lowerSearch = search.toLowerCase();
        return payables.filter(
            (item) =>
                String(item.id).includes(lowerSearch) ||
                item.supplier?.name?.toLowerCase().includes(lowerSearch) ||
                item.status?.toLowerCase().includes(lowerSearch)
        );
    }, [search, payables]);
    
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPagesFromMeta) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);


    // ===================================
    // 5. Render Section
    // ===================================
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 md:p-6 w-full max-w-7xl mx-auto">
                    
                    {/* ## Payable List Header 💸 */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 sm:mb-0">
                            Supplier Payables List
                        </h1>
                        
                        {/* BATCH PROCESS BUTTON */}
                        <button
                            onClick={handleBatchProcessPayments}
                            // Only enable if filter is 'unpaid', processing is false, and there are items to process
                            disabled={processMutation.isLoading || payables.filter(p => p.status === 'unpaid').length === 0 || statusFilter !== 'unpaid'}
                            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold shadow-md transition duration-150 ${
                                processMutation.isLoading || payables.filter(p => p.status === 'unpaid').length === 0 || statusFilter !== 'unpaid'
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {processMutation.isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckIcon />
                                    <span>Process All Unpaid ({payables.filter(p => p.status === 'unpaid').length})</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    <hr/>
                    
                    {/* ## Summary, Filter and Search 🔍 */}
                    <div className="flex flex-col md:flex-row justify-between items-center my-6 space-y-4 md:space-y-0 md:space-x-4">
                        
                        {/* Summary Block */}
                        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-lg border border-indigo-200 w-full md:w-auto">
                            <div className="p-2 border-r">
                                <p className="text-xs text-gray-500 font-medium">Total Payables ({statusFilter})</p>
                                <p className="text-lg font-bold text-indigo-700">{totalItemsFromMeta}</p>
                            </div>
                            <div className="p-2">
                                <p className="text-xs text-gray-500 font-medium">Total Amount ({statusFilter.toUpperCase()})</p>
                                <p className="text-xl font-extrabold text-green-700">{formatCurrency(summary.total_unpaid_amount)}</p>
                            </div>
                        </div>
                        
                        {/* Status Filter */}
                        <div className="w-full md:w-1/4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border-2 border-gray-300 focus:border-indigo-500 p-3 rounded-lg transition duration-150 ease-in-out"
                            >
                                <option value="unpaid">Unpaid Payables</option>
                                <option value="paid">Paid Payables</option>
                            </select>
                        </div>
                        
                        {/* Search Input */}
                        <div className="w-full md:w-1/3">
                            <input
                                type="text"
                                placeholder="🔍 Search by Supplier Name, ID..."
                                className="w-full border-2 border-gray-300 focus:border-indigo-500 p-3 rounded-lg transition duration-150 ease-in-out placeholder-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ## Supplier Payables Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                        {loading ? (
                            <TableSkeleton />
                        ) : filteredData.length === 0 ? (
                            <p className="text-center p-8 text-lg text-red-500 font-medium">
                                No {statusFilter} payables found matching your criteria.
                            </p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-indigo-600 text-white">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Payable ID</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Supplier</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Order/Payment ID</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Payable Amount</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Created At</th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredData.map((payable, index) => (
                                                <tr key={payable.id || index} className="hover:bg-gray-50 transition duration-100">
                                                    <td className="py-3 px-4 text-sm text-indigo-600 font-semibold">{getDetail(payable.id)}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-medium">{getDetail(payable.supplier?.name)}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        Order: {getDetail(payable.sales_order_id)} / Pay: {getDetail(payable.payment_id)}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-red-600 font-bold">{formatCurrency(payable.amount)}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(payable.created_at)}</td>
                                                    <td className="py-3 px-4 text-center text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                            payable.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                                                            payable.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {getDetail(payable.status)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <button
                                                            onClick={() => handleView(payable)}
                                                            className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out p-1 rounded-full hover:bg-indigo-100"
                                                            title="View Payable Details"
                                                        >
                                                            <EyeIcon />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls (Using server metadata) */}
                                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                                    <div className="text-sm text-gray-600">
                                        Showing **{totalItemsFromMeta > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}** to **{Math.min(currentPage * itemsPerPage, totalItemsFromMeta)}** of **{totalItemsFromMeta}** entries
                                    </div>
                                    <nav className="flex space-x-1" aria-label="Pagination">
                                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-lg text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}>&laquo; Previous</button>
                                        <div className="flex space-x-1">
                                            <button key={currentPage} className="px-3 py-1 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-md">{currentPage}</button>
                                            {totalPagesFromMeta > currentPage && (
                                                <span className="px-3 py-1 text-sm font-medium rounded-lg text-gray-700">...</span>
                                            )}
                                        </div>
                                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPagesFromMeta || totalItemsFromMeta === 0} className={`p-2 rounded-lg text-sm font-medium ${currentPage === totalPagesFromMeta || totalItemsFromMeta === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}>Next &raquo;</button>
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

export default SupplierPayable;
