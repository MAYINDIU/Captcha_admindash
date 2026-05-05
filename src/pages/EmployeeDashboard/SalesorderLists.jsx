import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Assuming these are your components for layout
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// =========================
// Eye Icon Component (SVG)
// =========================
const EyeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12c2.25-4.5 6.75-7.5 9.75-7.5s7.5 3 9.75 7.5c-2.25 4.5-6.75 7.5-9.75 7.5S4.5 16.5 2.25 12z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
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
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ======================================================
// MAIN COMPONENT: SalesorderList
// ======================================================
const SalesorderList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    const API_BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
    const API_TOKEN = localStorage.getItem("authToken");

    // Helper function for currency formatting (BDT assumed)
    const formatCurrency = (value) => 
        new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'BDT', 
            minimumFractionDigits: 2 
        }).format(value || 0);
    
    // Helper function for safe data access and defaulting to N/A
    const getDetail = (value) => value || "N/A";

    // Helper function for date formatting
    const formatDateTime = (dateString) => 
        dateString ? new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : "N/A";

    // =========================
    // 1. Fetch Sales Orders
    // =========================
    const { data: salesOrders = [], isLoading: loading } = useQuery({
        queryKey: ["employeeSalesOrders"],
        queryFn: async () => {
            if (!API_TOKEN) throw new Error("Authentication token not found!");
            const response = await fetch(
                    `${API_BASE_URL}/api/v1/employees/dashboard/sales`, 
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${API_TOKEN}`,
                        },
                    }
                );

            if (!response.ok) {
                throw new Error(`Failed to fetch sales list: ${response.statusText}`);
            }

            const result = await response.json();
            // Handle the nested 'data' structure
            return Array.isArray(result?.data)
                ? result.data
                : Array.isArray(result) ? result : [];
        },
        onError: (error) => {
            console.error("Error fetching sales orders:", error);
            toast.error(`Error loading sales list: ${error.message}`);
        }
    });

    // =========================
    // 2. Handle Search Filter (Memoized)
    // =========================
    const filteredData = useMemo(() => {
        if (!search.trim()) {
            return salesOrders;
        }
        const lowerSearch = search.toLowerCase();
        return salesOrders.filter(
            (item) =>
                item.order_no?.toLowerCase().includes(lowerSearch) ||
                item.customer?.name?.toLowerCase().includes(lowerSearch) ||
                item.customer?.contact_number?.toLowerCase().includes(lowerSearch)
        );
    }, [search, salesOrders]);

    // =========================
    // 3. Pagination Logic
    // =========================
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset page when search or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, itemsPerPage]);
    
    // ======================================================
    // 4. View Details Popup (SALES ORDER/CUSTOMER MODAL) - Comprehensive View
    // ======================================================
    const handleView = (order) => {
        // Safely destructure nested objects
        const customer = order.customer || {};
        const branch = order.branch || {};

        Swal.fire({
            title: `<span class="text-2xl font-extrabold text-indigo-700">Sales Order: ${getDetail(order.order_no)}</span>`,
            
            html: `
                <div class="p-2 sm:p-4 text-left space-y-6">
                    
                    <div class="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-200 shadow-md">
                        <h3 class="text-xl font-bold text-indigo-800 mb-3 border-b border-indigo-300 pb-2">
                            💰 Sales & Financial Details
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p class="font-medium text-gray-500">Order No:</p>
                                <p class="text-indigo-700 font-bold">${getDetail(order.order_no)}</p>
                            </div>
                            <div>
                                <p class="font-medium text-gray-500">Sales Type:</p>
                                <p class="text-gray-800 capitalize">${getDetail(order.sales_type)}</p>
                            </div>
                            <div>
                                <p class="font-medium text-gray-500">Status:</p>
                                <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}">
                                    ${getDetail(order.status).toUpperCase()}
                                </span>
                            </div>
                            <div class="col-span-full md:col-span-1">
                                <p class="font-medium text-gray-500">Total Amount:</p>
                                <p class="text-green-600 font-bold text-lg">${formatCurrency(order.total)}</p>
                            </div>
                            <div class="col-span-full md:col-span-1">
                                <p class="font-medium text-gray-500">Down Payment:</p>
                                <p class="text-red-600 font-bold text-lg">${formatCurrency(order.down_payment)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 class="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">👤 Customer Full Profile: **${getDetail(customer.name)}**</h4>
                        <div class="space-y-4">
                            
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                                <p class="col-span-full font-bold text-gray-600 mb-1">Contact & Address:</p>
                                <div class="col-span-2 sm:col-span-1">
                                    <p class="font-medium text-gray-500">Mobile:</p>
                                    <p class="text-gray-800">${getDetail(customer.contact_number)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">Email:</p>
                                    <p class="text-blue-600 break-all">${getDetail(customer.email)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">WhatsApp:</p>
                                    <p class="text-green-600">${getDetail(customer.whatsapp_number)}</p>
                                </div>
                                <div class="col-span-full">
                                    <p class="font-medium text-gray-500">Permanent Address:</p>
                                    <p class="text-gray-800">${getDetail(customer.permanent_address)}</p>
                                </div>
                                <div class="col-span-full">
                                    <p class="font-medium text-gray-500">Present Address:</p>
                                    <p class="text-gray-800">${getDetail(customer.present_address)}</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm p-3 border rounded-lg">
                                <p class="col-span-full font-bold text-gray-600 mb-1">Personal & ID:</p>
                                <div>
                                    <p class="font-medium text-gray-500">Father/Mother:</p>
                                    <p class="text-gray-800">${getDetail(customer.father_name)} / ${getDetail(customer.mother_name)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">Marital Status:</p>
                                    <p class="text-gray-800 capitalize">${getDetail(customer.marital_status)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">Spouse Name:</p>
                                    <p class="text-gray-800">${getDetail(customer.spouse_name)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">Profession:</p>
                                    <p class="text-gray-800">${getDetail(customer.profession)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">NID:</p>
                                    <p class="text-gray-800">${getDetail(customer.national_id)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">Passport:</p>
                                    <p class="text-gray-800">${getDetail(customer.passport_number)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">DOB/Religion:</p>
                                    <p class="text-gray-800">${getDetail(customer.date_of_birth)} / ${getDetail(customer.religion)}</p>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-500">Blood Group:</p>
                                    <p class="text-red-500 font-bold">${getDetail(customer.blood_group)}</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-3 border rounded-lg bg-gray-50">
                                <div>
                                    <p class="font-bold text-indigo-600 mb-1">Nominee Details:</p>
                                    <p><span class="font-medium text-gray-500">Name:</span> <span class="text-gray-800">${getDetail(customer.nominee_name)}</span></p>
                                    <p><span class="font-medium text-gray-500">Relation:</span> <span class="text-gray-800">${getDetail(customer.nominee_relation)}</span></p>
                                    <p><span class="font-medium text-gray-500">Phone:</span> <span class="text-gray-800">${getDetail(customer.nominee_phone)}</span></p>
                                </div>
                                <div>
                                    <p class="font-bold text-indigo-600 mb-1">Authorized Person:</p>
                                    <p><span class="font-medium text-gray-500">Name:</span> <span class="text-gray-800">${getDetail(customer.authorized_person_name)}</span></p>
                                    <p><span class="font-medium text-gray-500">Address:</span> <span class="text-gray-800">${getDetail(customer.authorized_person_address)}</span></p>
                                    <p><span class="font-medium text-gray-500">Joint Applicants:</span> <span class="text-gray-800">${getDetail(customer.joint_applicants)}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 class="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">⚙️ System & Origin Data</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p class="font-medium text-gray-500">Branch Name (Code):</p>
                                <p class="text-gray-800 font-bold">${getDetail(branch.name)} (${getDetail(branch.code)})</p>
                            </div>
                            <div>
                                <p class="font-medium text-gray-500">Employee ID:</p>
                                <p class="text-gray-800">${getDetail(order.employee_id)}</p>
                            </div>
                            <div>
                                <p class="font-medium text-gray-500">Source Me ID:</p>
                                <p class="text-indigo-600 font-bold">${getDetail(customer.source_me_id)}</p>
                            </div>
                            <div>
                                <p class="font-medium text-gray-500">Added by Role/Branch:</p>
                                <p class="text-gray-800">${getDetail(customer.added_by_role)} (ID: ${getDetail(customer.added_by_branch_id)})</p>
                            </div>
                            <div class="col-span-full md:col-span-2">
                                <p class="font-medium text-gray-500">Order Created At:</p>
                                <p class="text-gray-800">${formatDateTime(order.created_at)}</p>
                            </div>
                            <div class="col-span-full md:col-span-2">
                                <p class="font-medium text-gray-500">Last Updated At:</p>
                                <p class="text-gray-800">${formatDateTime(order.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                </div>
            `,
            icon: "info",
            showConfirmButton: false, 
            showCloseButton: true,
            width: '50%', 
            maxWidth: '750px',
            customClass: {
                popup: 'shadow-2xl rounded-xl border-t-4 border-indigo-600',
                title: 'pt-4', 
                closeButton: 'text-gray-400 hover:text-gray-600'
            }
        });
    };

    // =========================
    // 5. Render Section
    // =========================
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 md:p-6 w-full max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 sm:mb-0">
                            <span role="img" aria-label="sales-icon">💰</span> Sales Order List
                        </h1>
                        <div className="text-sm font-medium text-gray-500">
                            Total Orders: <span className="font-bold text-indigo-600">{salesOrders.length}</span>
                        </div>
                    </div>
                    
                    <hr className="mb-6"/>

                    {/* Search and Items Per Page */}
                    <div className="bg-white p-4 shadow-lg rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="w-full sm:w-1/2">
                            <input
                                type="text"
                                placeholder="🔍 Search by order no, customer name or phone..."
                                className="w-full border-2 border-gray-300 focus:border-indigo-500 p-3 rounded-lg transition duration-150 ease-in-out placeholder-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <label htmlFor="itemsPerPage" className="text-gray-600 font-medium">Show:</label>
                            <select
                                id="itemsPerPage"
                                className="border-2 border-gray-300 p-2 rounded-lg cursor-pointer focus:border-indigo-500"
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                        {loading ? (
                            <TableSkeleton />
                        ) : filteredData.length === 0 ? (
                            <p className="text-center p-8 text-lg text-red-500 font-medium">
                                No sales orders found matching your search.
                            </p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-indigo-600 text-white">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">SL</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Order No</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Customer Name</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Total Amount</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Branch</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedData.map((order, index) => (
                                                <tr key={order.id || index} className="hover:bg-gray-50 transition duration-100">
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-medium">{startIndex + index + 1}</td>
                                                    <td className="py-3 px-4 text-sm text-indigo-600 font-semibold">{order.order_no || "-"}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{order.customer?.name || "-"}</td>
                                                    <td className="py-3 px-4 text-sm text-green-600 font-bold">{formatCurrency(order.total || 0)}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{order.branch?.name || "-"}</td>
                                                    <td className="py-3 px-4 text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {order.status || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <button
                                                            onClick={() => handleView(order)} 
                                                            className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out p-1 rounded-full hover:bg-indigo-100"
                                                            title="View Sales Order Details"
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
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded-lg text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                                        >
                                            &laquo; Previous
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1)) 
                                            .map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => goToPage(page)}
                                                    className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                                        currentPage === page
                                                            ? 'bg-indigo-600 text-white shadow-md'
                                                            : 'text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            {totalPages > 3 && currentPage < totalPages - 1 && 
                                                <span className="px-3 py-1 text-sm text-gray-500">...</span>
                                            }
                                            {totalPages > 1 && currentPage < totalPages && (
                                                <button
                                                    onClick={() => goToPage(totalPages)}
                                                    className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                                        currentPage === totalPages
                                                            ? 'bg-indigo-600 text-white shadow-md'
                                                            : 'text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {totalPages}
                                                </button>
                                            )}

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages || filteredData.length === 0}
                                            className={`p-2 rounded-lg text-sm font-medium ${currentPage === totalPages || filteredData.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                                        >
                                            Next &raquo;
                                        </button>
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

export default SalesorderList;