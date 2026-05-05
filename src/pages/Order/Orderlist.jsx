import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlineClose, AiOutlineEye } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

// 💡 NEW HELPER COMPONENT: For cleaner, more stylized modal details
const DetailSection = ({ title, children, color }) => (
    <div className={`border-l-4 ${color} pl-4 bg-white p-5 rounded-lg shadow-sm border-2 border-gray-100`}>
        <h3 className="text-xl font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600">
            {children}
        </div>
    </div>
);

// 💡 NEW HELPER COMPONENT: For cleaner display of key/value pairs
const DetailItem = ({ label, value, isCurrency = false }) => (
    <p>
        <strong className="text-gray-600">{label}:</strong> 
        <span className={`ml-2 font-medium ${isCurrency ? 'text-blue-700 font-bold' : 'text-gray-900'}`}>
            {value}
        </span>
    </p>
);


const Orderlist = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [salesOrders, setSalesOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewOrder, setViewOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // State for server-side pagination
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem("authToken"); 
    // Defined BASE_URL inside the component for clean copy-paste
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1"; 

    // Helper function to get status color class
    const getStatusColorClass = (status) => {
        switch (status) {
            case "active":
                // Material Design: Indigo/Blue for in-progress
                return "bg-indigo-100 text-indigo-700"; 
            case "completed":
                // Material Design: Green for success
                return "bg-green-100 text-green-700";
            case "canceled":
                // Material Design: Red for danger
                return "bg-red-100 text-red-700";
            default:
                // Neutral Gray
                return "bg-gray-200 text-gray-700";
        }
    };

    // Helper function to format date to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year}`;
    };

    // Fetch all sales orders with pagination parameters
    const fetchSalesOrders = useCallback(async (page, newPerPage) => {
        if (!token) {
            toast.error("Authentication token missing.");
            return;
        }

        setLoading(true);
        try {
            const url = `${BASE_URL}/sales-orders?page=${page}&per_page=${newPerPage}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            
            setSalesOrders(data.data || []);
            setTotalRows(data.total);
            
        } catch (err) {
            console.error("Failed to fetch sales orders:", err);
            toast.error("Failed to load sales orders.");
        }
        setLoading(false);
    }, [token]);

    useEffect(() => {
        fetchSalesOrders(currentPage, perPage);
    }, [fetchSalesOrders, currentPage, perPage]);

    // Handlers for Data Table pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        // Important: Reset to page 1 when perPage changes to prevent API errors
        setCurrentPage(1); 
    };

    // Fetch single order details for modal
    const openViewModal = async (orderFromList) => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/sales-orders/${orderFromList.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            // Combine data from the list and the detail API for the modal
            setViewOrder({ ...orderFromList, ...data.data }); 
        } catch (err) {
            console.error(err);
            toast.error("Failed to load sales order details");
        }
        setLoading(false);
    };

    const closeViewModal = () => setViewOrder(null);

    // Filter orders based on the client-side search term
    const filteredOrders = salesOrders.filter(
        (o) =>
            (o.id && String(o.id).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.sales_type && o.sales_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.status && o.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.agent?.agent_code && o.agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Data Table Columns
    const columns = [
        { 
            name: "SL. NO", 
            selector: (row, index) => (currentPage - 1) * perPage + index + 1, 
            sortable: false,
            width: "80px",
        },
        { name: "Order ID", selector: (row) => row.id, sortable: true, width: "100px" },
        { name: "Sales Type", selector: (row) => row.sales_type, sortable: true },
        { 
            name: "Customer Name", 
            selector: (row) => row.customer?.name || "N/A", 
            sortable: true,
            minWidth: "150px"
        },
        { 
            name: "Agent Code", 
            selector: (row) => row.agent?.agent_code || "N/A", 
            sortable: true 
        },
        { 
            name: "Total (BDT)", 
            selector: (row) => row.total, 
            sortable: true, 
            right: true // Align right for numbers
        },
        { 
            name: "Down Payment", 
            selector: (row) => row.down_payment, 
            sortable: true,
            right: true // Align right for numbers
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span
                    className={`py-1 px-3.5 rounded-full text-xs font-semibold uppercase ${getStatusColorClass(
                        row.status
                    )}`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            name: "Created At",
            selector: (row) => formatDate(row.created_at),
            sortable: true,
            width: "120px"
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-2">
                    <AiOutlineEye
                        size={22}
                        // Material Design Blue for primary action
                        className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => openViewModal(row)}
                    />
                </div>
            ),
            width: "80px"
        },
    ];

    const customStyles = {
        // Material Design Primary Color (Blue-600)
        headCells: {
            style: {
                backgroundColor: "#2563EB", // Blue-600
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                borderBottom: "2px solid #1E40AF", // Darker blue line
                padding: "16px", 
                letterSpacing: "0.5px", // Subtle letter spacing
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                color: "#374151", // Gray-700
                borderLeft: "1px solid #F3F4F6", 
                borderRight: "1px solid #F3F4F6",
                padding: "12px", 
            },
        },
        rows: { 
            style: { 
                minHeight: "50px",
                borderBottom: "1px solid #E5E7EB", // Gray-200
            },
            highlightOnHoverStyle: {
                backgroundColor: '#EFF6FF', // Blue-50 (very soft hover)
                borderBottomColor: '#DBEAFE', // Blue-100
                cursor: 'pointer',
            },
        },
        pagination: {
            style: {
                backgroundColor: 'white', 
                borderTop: '1px solid #E5E7EB',
                padding: '10px 0',
            }
        },
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100"> 
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-4 sm:p-6 md:p-8">
                    <ToastContainer position="top-right" autoClose={3000} />
                    
                    {/* Header and Search Card */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">SALES ORDER MANAGEMENT</h2>
                        <input
                            type="text"
                            placeholder="Search by ID, Customer, Agent, or Status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // Material Design: subtle shadow, blue focus ring
                            className="border border-gray-300 px-4 py-2 rounded-xl w-full sm:w-80 md:w-96 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                    </div>

                    {/* Data Table Container Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={filteredOrders}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            progressPending={loading}
                            highlightOnHover
                            striped
                            responsive
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="p-6 text-gray-500 font-medium text-center">
                                    {loading ? "Loading data..." : "No sales orders found matching your criteria."}
                                </div>
                            }
                        />
                    </div>

                    {/* View Order Modal (Material Design Card) */}
                    {viewOrder && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <div className="absolute inset-0 bg-black opacity-40" onClick={closeViewModal}></div>
                            <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl z-10 overflow-y-auto max-h-[95vh] transform transition-all duration-300 scale-100 opacity-100 border border-gray-200">
                                <button onClick={closeViewModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                    <AiOutlineClose size={24} />
                                </button>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
                                    <span className="text-blue-600">Order Detail</span>: #{viewOrder.id}
                                </h2>

                                <div className="space-y-6">
                                    
                                    {/* Order Information Section */}
                                    <DetailSection title="Order Overview" color="border-blue-500">
                                        <DetailItem label="Sales Type" value={viewOrder.sales_type} />
                                        <DetailItem label="Rank" value={viewOrder.rank} />
                                        <DetailItem label="Total Amount" value={`${viewOrder.total} BDT`} isCurrency />
                                        <DetailItem label="Down Payment" value={`${viewOrder.down_payment} BDT`} isCurrency />
                                        <p>
                                            <strong className="text-gray-600">Status:</strong> 
                                            <span className={`font-semibold capitalize rounded-full py-1 px-3 ml-2 text-xs ${getStatusColorClass(viewOrder.status)}`}>
                                                {viewOrder.status}
                                            </span>
                                        </p>
                                        <DetailItem label="Created At" value={formatDate(viewOrder.created_at)} />
                                        <DetailItem label="Branch" value={`${viewOrder.branch?.name || 'N/A'} (${viewOrder.branch?.code || ''})`} />
                                    </DetailSection>

                                    {/* Customer & Introducing Officer Details Section */}
                                    <DetailSection title="Customer & Referrals" color="border-green-500">
                                        <DetailItem label="Customer" value={viewOrder.customer?.name || 'N/A'} />
                                        <DetailItem label="Customer Email" value={viewOrder.customer?.email || 'N/A'} />
                                        <DetailItem label="Sales Agent" value={`${viewOrder.agent?.user?.name || 'N/A'} (${viewOrder.agent?.agent_code || 'N/A'})`} />
                                        <DetailItem label="Introduced By" value={viewOrder.introducer?.name || 'N/A'} />
                                    </DetailSection>

                                    {/* Order Items Section */}
                                    <div className="border-l-4 border-amber-500 pl-4 bg-white p-5 rounded-lg shadow-sm border-2 border-gray-100">
                                        <h3 className="text-xl font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">Order Items</h3>
                                        {viewOrder.items && viewOrder.items.length > 0 ? (
                                            <ul className="space-y-4">
                                                {viewOrder.items.map((item, index) => (
                                                    <li key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg shadow-inner border-l-4 border-gray-300">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-900 font-bold text-lg">{item.itemable?.name || item.itemable_type.split('\\').pop()}</span>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                Type: <span className="font-medium">{item.itemable_type.split('\\').pop()}</span>
                                                                <span className="ml-4">Qty: <span className="font-bold">{item.qty}</span></span>
                                                            </div>
                                                            {/* Optional: Display attributes if available */}
                                                            {item.itemable?.attributes && Object.keys(item.itemable.attributes).length > 0 && (
                                                                <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                                                                    {Object.entries(item.itemable.attributes).map(([key, value]) => (
                                                                        <span key={key} className="inline-block bg-blue-50 px-2 py-1 rounded-full text-blue-700 font-medium">
                                                                            <span className="capitalize">{key}</span>: {Array.isArray(value) ? value.join(', ') : value}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-xl font-extrabold text-blue-600 mt-3 sm:mt-0">{item.line_total} BDT</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 text-base">No items found for this order.</p>
                                        )}
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


export default Orderlist;