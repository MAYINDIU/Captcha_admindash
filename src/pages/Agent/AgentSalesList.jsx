import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from "react-data-table-component";
import { AiOutlinePlus, AiOutlineEye, AiOutlineClose } from "react-icons/ai"; // Import necessary icons

// Import components (assuming these are defined elsewhere in your project)
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ---------------------------------------------------------------- //
//                       UTILITY/MOCK COMPONENTS                      //
// ---------------------------------------------------------------- //

// 1. Mock EditSalesOrderForm component
// NOTE: This is a placeholder. You need to implement the actual form logic.
const EditSalesOrderForm = ({ closeModal, onOrderUpdated, orderId, lookupData, BASE_URL, token }) => {
    // For simplicity, this is just a mock modal content
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xl p-6 shadow-xl relative">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    Edit Sales Order #{orderId} 📝
                </h2>
                <p className="mb-4">
                    **This is a mock form.** The actual implementation of
                    `EditSalesOrderForm` is required to fully utilize this component.
                </p>
                <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150">
                        Cancel
                    </button>
                    <button type="button" onClick={() => {
                        toast.info(`Simulated update for Order #${orderId}`);
                        onOrderUpdated(); 
                        closeModal();
                    }} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition duration-150">
                        Simulate Update
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. DetailSection Component for View Modal
const DetailSection = ({ title, color, children }) => (
    <div className={`border-l-4 ${color} pl-4 bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 transition-all hover:shadow-lg`}>
        <h3 className="text-xl font-extrabold text-gray-800 mb-4 border-b border-gray-200 pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-700">
            {children}
        </div>
    </div>
);

// 3. DetailItem Component for View Modal
const DetailItem = ({ label, value, isCurrency = false }) => (
    <p>
        <strong className="block text-sm font-semibold text-gray-600 mb-0.5">{label}</strong>
        <span className={`block text-base ${isCurrency ? 'font-mono text-lg text-blue-700' : 'text-gray-800'}`}>
            {value}
        </span>
    </p>
);

// ---------------------------------------------------------------- //
//                       SKELETON COMPONENTS                      //
// ---------------------------------------------------------------- //
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
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-24" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ---------------------------------------------------------------- //
//                     AGENT SALES LIST COMPONENT                   //
// ---------------------------------------------------------------- //

const AgentSalesList = () => {
    const queryClient = useQueryClient();
    
    // ✅ Agent-specific filter logic
    const employee = JSON.parse(localStorage.getItem("user"));
    const Agent_id = employee?.agent_id;
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewOrder, setViewOrder] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false); 
    const [editOrderId, setEditOrderId] = useState(null); 

    const [perPage, setPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);

const navigate = useNavigate();
const handlePaymentClick = (row) => {
    // The row object contains the necessary data (like id and total)
    // The component you provided uses location.state?.salesOrderId for navigation state.
    navigate(`/agent-payment-installment`, { 
        state: { 
            salesOrderId: row 
        } 
    });
};

    
    // NOTE: Replace these with actual context or environment variables
    const token = localStorage.getItem("authToken"); 
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1"; 

    // Helper function to get status color class
    const getStatusColorClass = (status) => {
        switch (status) {
            case "active":
                return "bg-indigo-100 text-indigo-700"; 
            case "completed":
                return "bg-green-100 text-green-700";
            case "canceled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-200 text-gray-700";
        }
    };

    // Helper function to format date to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        // Handle dates that might include a time component
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year}`;
    };

    // --- MODAL & DATA HANDLERS ---
    
    const handleOrderCreated = () => {
        queryClient.invalidateQueries(['sales-orders']);
        setCurrentPage(1);
    }
    const handleOrderUpdated = handleOrderCreated; // Alias for refresh
    const handleOrderDeleted = handleOrderCreated; // Alias for refresh

    const openEditModal = (orderId) => {
        setEditOrderId(orderId);
        setShowEditModal(true);
    }
    const closeEditModal = () => {
        setEditOrderId(null);
        setShowEditModal(false);
    }

    const openViewModal = (orderFromList) => {
        setViewOrder(orderFromList);
    };

    const closeViewModal = () => setViewOrder(null);
    
    // --- REACT QUERY: DELETE MUTATION ---
    const deleteMutation = useMutation({
        mutationFn: async (orderId) => {
            const res = await fetch(`${BASE_URL}/sales-orders/${orderId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }
            return orderId;
        },
        onSuccess: (orderId) => {
            toast.success(`Sales Order #${orderId} deleted successfully! 🗑️`);
            handleOrderDeleted();
            closeViewModal();
        },
        onError: (err) => {
            console.error("Failed to delete sales order:", err);
            toast.error(`Error deleting order: ${err.message}`);
        }
    });

    const handleDeleteOrder = (orderId) => { 
        if (!window.confirm(`Are you sure you want to DELETE Sales Order #${orderId}? This action cannot be undone.`)) {
            return;
        }
        deleteMutation.mutate(orderId);
    };
    
    // --- REACT QUERY: LOOKUP DATA ---
    const { data: lookupData = {
        customers: [], agents: [], branches: [], products: [], services: [], employees: [], payments: []
    } } = useQuery({
        queryKey: ['lookupData'],
        queryFn: async () => {
            if (!token) return {};
            const endpoints = [
                { key: 'customers', url: `${BASE_URL}/customers` },
                { key: 'agents', url: `${BASE_URL}/agents` }, 
                { key: 'branches', url: `${BASE_URL}/branches` },
                { key: 'products', url: `${BASE_URL}/products` },
                { key: 'services', url: `${BASE_URL}/services` },
                { key: 'payments', url: `${BASE_URL}/payments` },
                { key: 'employees', url: `${BASE_URL}/employees` }, 
            ];
            const results = await Promise.all(
                endpoints.map(async (endpoint) => {
                    const res = await fetch(endpoint.url, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error(`Failed to fetch ${endpoint.key}`);
                    const data = await res.json();
                    return { [endpoint.key]: data.data || [] }; 
                })
            );
            return Object.assign({}, ...results);
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // --- REACT QUERY: VIEW ORDER DETAILS ---
    const { data: detailedOrderData, isLoading: loadingDetails } = useQuery({
        queryKey: ['sales-order-details', viewOrder?.id],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/sales-orders/${viewOrder.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res?.status}`);
            const data = await res.json();
            return data.data;
        },
        enabled: !!viewOrder?.id,
    });

    // Merge list data with detailed data for the modal
    const displayOrder = viewOrder ? { ...viewOrder, ...(detailedOrderData || {}) } : null;

    const salesOrderId = displayOrder?.id;
    const orderPayments = lookupData?.payments?.filter(
        (payment) => payment?.sales_order_id === salesOrderId
    );

    // --- REACT QUERY: SALES ORDERS ---
    const { data: salesOrders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['sales-orders', Agent_id],
        queryFn: async () => {
            if (!token) {
                toast.error("Authentication token missing.");
                return;
            }
            
            // Fetch ALL orders
            const url = `${BASE_URL}/sales-orders`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            // ✅ Filter only sales belonging to current agent
            return (data?.data || []).filter(
                (order) => Number(order.agent_id) === Number(Agent_id)
            );
        },
        enabled: !!token && !!Agent_id,
    });

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        setCurrentPage(1); 
    };
    
    // Calculations for Modal
    const totalPaid = (orderPayments || []).reduce((sum, payment) => {
        // Add the amount of each payment, converting it to a float
        return sum + parseFloat(payment.amount || '0'); 
    }, 0);

    const totalOrderAmount = parseFloat(displayOrder?.total || '0');
    const remainingBalance = totalOrderAmount - totalPaid;

    // Filter orders
    const filteredOrders = salesOrders.filter(
        (o) =>
            (o.id && String(o.id).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.sales_type && o.sales_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.status && o.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.customer?.contact_number && String(o.customer.contact_number).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.agent?.agent_code && o.agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Data Table Columns
    const columns = [
        { name: "SL. NO", selector: (row, index) => (currentPage - 1) * perPage + index + 1, sortable: false, width: "80px",},
        { name: "Order ID", selector: (row) => row.id, sortable: true, width: "100px" },
        { name: "Sales Type", selector: (row) => row.sales_type, sortable: true },
        { name: "Customer Name", selector: (row) => row.customer?.name || "N/A", sortable: true, minWidth: "150px"},
        { name: "Agent Code", selector: (row) => row.agent?.agent_code || "N/A", sortable: true },
        { name: "Total (BDT)", selector: (row) => row.total.toLocaleString(), sortable: true, right: true },
        { name: "Down Payment", selector: (row) => row.down_payment.toLocaleString(), sortable: true, right: true },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span className={`py-1 px-3.5 rounded-full text-xs font-semibold uppercase ${getStatusColorClass(row.status)}`}>
                    {row.status}
                </span>
            ),
        },
        { name: "Created At", selector: (row) => formatDate(row.created_at), sortable: true, width: "120px" },
       {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-2 items-center">
                    {/* View Button */}
                    <AiOutlineEye
                        size={22}
                        className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => openViewModal(row)}
                        title="View Details"
                    />

                    {/* 💸 NEW PAYMENT/INSTALLMENT BUTTON 💸 */}
                    {/* {row.customer?.contact_number && (
                        <svg 
                            onClick={() => handlePaymentClick(row)} 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="cursor-pointer text-green-600 hover:text-green-800 transition-colors w-5 h-5" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={2} 
                            title="Generate Installment Plan"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v-2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21h7a2 2 0 002-2V5a2 2 0 00-2-2h-7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    )} */}
                    
                   
                </div>
            ),
            width: "150px" 
        },
        
    ];

    // Data Table Custom Styles
    const customStyles = {
        headCells: {
            style: {
                background: "#1976D2",
                color: "#fff",
                fontWeight: "800",
                fontSize: "14px",
                borderBottom: "3px solid #3730A3",
                padding: "16px", 
                letterSpacing: "0.5px", 
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                color: "#374151", 
                borderLeft: "1px solid #F3F4F6", 
                borderRight: "1px solid #F3F4F6",
                padding: "12px", 
            },
        },
        rows: { 
            style: { 
                minHeight: "50px",
                borderBottom: "1px solid #E5E7EB", 
            },
            highlightOnHoverStyle: {
                backgroundColor: '#F0F9FF', 
                borderBottomColor: '#BAE6FD', 
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

    // The rest of your return structure is already complete and correct.
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100"> 
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-4 sm:p-6 md:p-8">
                    <ToastContainer position="top-right" autoClose={3000} />
                    
                    {/* Header, Search, and Create Button Card */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-6 
                        bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl border border-blue-400">
                        <h2 className="text-3xl font-extrabold mb-4 sm:mb-0 drop-shadow-md">SALES ORDER MANAGEMENT</h2>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by ID, Customer, Agent, or Status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 px-4 py-2 rounded-xl w-full sm:w-64 md:w-80 shadow-md text-gray-800
                                  focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200"
                            />
                            {/* NOTE: You swapped the button with a Link, which is correct for navigation */}
                            <Link 
                            to="/agent-create-sales" 
                            className="flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-400 text-white 
                                px-5 py-2.5 rounded-xl font-bold hover:from-green-500 hover:to-blue-500 transition-all duration-300 shadow-lg"
                        >
                            <AiOutlinePlus size={20} className="mr-2" />
                            New Order
                        </Link>
                        </div>
                    </div>

                    {/* Data Table Container Card */}
                    {loadingOrders ? (
                        <TableSkeleton />
                    ) : (
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={filteredOrders}
                            pagination
                            paginationPerPage={perPage}
                            paginationRowsPerPageOptions={[10, 15, 20, 30, 50]}
                            onChangePage={handlePageChange}
                            highlightOnHover
                            striped
                            responsive
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="p-8 text-gray-500 font-medium text-lg text-center">
                                    No sales orders found matching your criteria. 😔
                                </div>
                            }
                        />
                    </div>
                    )}

                    {/* View Order Modal */}
                  {displayOrder && (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="absolute inset-0 bg-black opacity-70 backdrop-blur-sm" onClick={closeViewModal}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 overflow-y-auto max-h-[95vh] transform transition-all duration-300 scale-100 opacity-100 border border-gray-100">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center z-20 shadow-md">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    Order Detail: <span className="text-blue-600">#{displayOrder.id}</span>
                </h2>
                <div className="flex items-center space-x-3">
                    <span className={`py-1 px-4 rounded-full text-sm font-bold uppercase shadow-sm ${getStatusColorClass(displayOrder.status)}`}>
                        {displayOrder.status}
                    </span>
                    <button onClick={closeViewModal} className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50">
                        <AiOutlineClose size={24} />
                    </button>
                </div>
            </div>

            {/* Modal Content - Grid Layout */}
            {loadingDetails ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading full order details...</p>
                </div>
            ) : (
            <div className="p-8 space-y-8">
                
                {/* 1. Order Information & Financials - Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailSection title="Order Summary" color="border-blue-500">
                        <DetailItem label="Sales Type" value={displayOrder.sales_type} />
                        <DetailItem label="Rank/Level" value={displayOrder.rank} />
                        <DetailItem label="Branch" value={`${displayOrder.branch?.name || 'N/A'} (${displayOrder.branch?.code || ''})`} />
                        <DetailItem label="Created At" value={formatDate(displayOrder.created_at)} />
                    </DetailSection>

                    <DetailSection title="Financial Overview" color="border-indigo-500">
                        <DetailItem label="Total Amount" value={`${displayOrder.total.toLocaleString()} BDT`} isCurrency />
                        <DetailItem label="Down Payment" value={`${displayOrder.down_payment.toLocaleString()} BDT`} isCurrency />
                        <DetailItem label="Remaining Balance" value={`${(displayOrder.total - displayOrder.down_payment).toLocaleString()} BDT`} isCurrency />
                        <DetailItem label="Payment Method" value={displayOrder.payment_method || 'N/A'} />
                    </DetailSection>
                </div>

                {/* 2. Customer & Agent/Referrals Section */}
                <DetailSection title="Customer & Sales Team" color="border-green-500">
                    <DetailItem label="Customer Name" value={displayOrder.customer?.name || 'N/A'} />
                    <DetailItem label="Customer Phone" value={displayOrder.customer?.contact_number || 'N/A'} />
                    <DetailItem label="Sales Agent" value={`${displayOrder.agent?.user?.name || 'N/A'} (${displayOrder.agent?.agent_code || 'N/A'})`} />
                    <DetailItem label="Introduced By (Superior)" value={displayOrder.source_me?.full_name_en || 'N/A'} /> 
                </DetailSection>

                {/* 3. Order Items Section (Using the corrected logic) */}
                <div className="border-l-4 border-amber-500 pl-4 bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 transition-all hover:shadow-lg">
                    <h3 className="text-xl font-extrabold text-gray-800 mb-4 border-b border-gray-200 pb-2">📦 Order Items</h3>
                    {displayOrder.items && displayOrder.items.length > 0 ? (
                        <ul className="space-y-4">
                            {displayOrder?.items?.map((item, index) => {
                                
                                const itemName = item.itemable?.name || 'Item Name N/A';
                                // Checks for App\Models\Product or App\Models\Service
                                const itemType = item.itemable_type.includes('Product') ? 'Product' : 'Service'; 
                                
                                return (
                                    <li key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl shadow-inner border-l-4 border-gray-300">
                                        <div className="flex-1 min-w-0">
                                            {/* Display Item Name & Type */}
                                            <p className="font-bold text-gray-800 text-lg">
                                                {itemName}
                                                <span className={`ml-3 text-xs font-medium uppercase py-0.5 px-2 rounded text-white ${itemType === 'Product' ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                                                    {itemType}
                                                </span>
                                            </p>
                                            
                                            {/* Display ID and Attributes */}
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="font-semibold text-gray-600">ID:</span> {item.itemable_id} 
                                                {item.itemable?.attributes?.size && (
                                                    <span className="ml-4 font-medium text-gray-600">| Size: {item.itemable.attributes.size}</span>
                                                )}
                                                {item.itemable?.attributes?.location && (
                                                    <span className="ml-4 font-medium text-gray-600">| Location: {item.itemable.attributes.location}</span>
                                                )}
                                            </p>
                                            
                                        </div>
                                        {/* Price and Quantity */}
                                        <div className="text-right mt-3 sm:mt-0">
                                            <span className="block text-sm text-gray-600">{item.qty} x {parseFloat(item.unit_price).toLocaleString()} BDT</span>
                                            <span className="block text-xl font-extrabold text-blue-700">Total: {parseFloat(item.line_total).toLocaleString()} BDT</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">No items found for this order.</p>
                    )}
                </div>
                
              <DetailSection title="Installment & Payment History" color="border-red-500">
    <div className="col-span-2 space-y-3">
        {/* Current Balance Due */}
      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
    <p className="text-red-800 font-medium text-sm">
        💰 **Total Order Value:** <span className="text-base font-bold text-gray-700">
            {totalOrderAmount.toLocaleString()} BDT
        </span>
    </p>
    <p className="text-red-800 font-medium text-sm mt-1">
        ✅ **Total Paid:** <span className="text-base font-bold text-green-700">
            {totalPaid.toLocaleString()} BDT
        </span>
    </p>
    <p className="text-red-800 font-medium text-lg mt-2 pt-2 border-t border-red-300">
        **Current Balance Due:** <span className="text-xl font-extrabold text-red-700">
            {remainingBalance.toLocaleString()} BDT
        </span>
    </p>
</div>

        {/* Payment List Container - Added max-h and overflow for scrollability */}
        <div className="max-h-60 overflow-y-auto space-y-2 p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h4 className="font-semibold text-gray-700 border-b pb-2 mb-2">Transaction Details</h4>
            
            {/* Check if orderPayments exists and has items. Assuming orderPayments is passed as a prop or available in the scope */}
            {orderPayments && orderPayments.length > 0 ? (
                orderPayments.map((payment, index) => (
                    <div 
                        key={payment.id} 
                        className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm grid grid-cols-2 gap-2"
                    >
                        {/* Left Column */}
                        <div className="space-y-1">
                            <p><strong>Type:</strong> <span className="font-mono">{payment.type.toUpperCase()}</span></p>
                            <p><strong>Method:</strong> {payment.method}</p>
                            <p><strong>Ref:</strong> {payment.meta.reference || 'N/A'}</p>
                        </div>
                        
                        {/* Right Column */}
                        <div className="text-right space-y-1">
                            <p className="text-lg font-bold text-green-700">{parseFloat(payment.amount).toLocaleString()} BDT</p>
                            <p className="text-xs text-gray-600">Paid At: {formatDate(payment.paid_at, true)}</p>
                            <p className="text-xs text-gray-500">Recorded: {formatDate(payment.created_at, true)}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 italic p-4 text-center">No payment transactions found for this order yet.</p>
            )}
        </div>
    </div>
</DetailSection>
                

                {/* Action Button Section (Delete button) */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        onClick={() => handleDeleteOrder(displayOrder?.id)}
                        className="flex items-center bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
                        disabled={deleteMutation.isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deleteMutation.isLoading ? "Deleting..." : "Delete Order"}
                    </button>
                </div>

            </div>
            )}
        </div>
    </div>
)}
                    
                
                    {/* Edit Order Modal */}
                    {showEditModal && editOrderId && (
                        <EditSalesOrderForm
                            closeModal={closeEditModal}
                            onOrderUpdated={handleOrderUpdated}
                            lookupData={lookupData}
                            BASE_URL={BASE_URL}
                            token={token}
                            orderId={editOrderId}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default AgentSalesList;