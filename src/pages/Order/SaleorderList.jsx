import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlineClose, AiOutlineEye, AiOutlinePlus } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

// ===================================================================
// 💡 HELPER COMPONENTS
// ===================================================================
const DetailSection = ({ title, children, color }) => (
    <div className={`border-l-4 ${color} pl-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg`}>
        <h3 className="text-xl font-extrabold text-gray-800 mb-4 border-b border-gray-200 pb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-700">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, isCurrency = false }) => (
    <p>
        <strong className="text-gray-600">{label}:</strong>
        <span className={`ml-2 font-semibold ${isCurrency ? 'text-blue-700 text-lg font-extrabold' : 'text-gray-900'}`}>
            {value}
        </span>
    </p>
);

// ===================================================================
// 💀 SKELETON LOADERS
// ===================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-6 space-x-4">
             {[...Array(6)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/6" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

const ViewModalSkeleton = () => (
    <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-100 rounded-xl space-y-4">
                <SkeletonPulse className="h-6 w-1/3 mb-4" />
                <SkeletonPulse className="h-4 w-3/4" />
                <SkeletonPulse className="h-4 w-1/2" />
                <SkeletonPulse className="h-4 w-2/3" />
            </div>
            <div className="p-6 border border-gray-100 rounded-xl space-y-4">
                <SkeletonPulse className="h-6 w-1/3 mb-4" />
                <SkeletonPulse className="h-4 w-3/4" />
                <SkeletonPulse className="h-4 w-1/2" />
                <SkeletonPulse className="h-4 w-2/3" />
            </div>
        </div>
        <div className="p-6 border border-gray-100 rounded-xl space-y-4">
             <SkeletonPulse className="h-6 w-1/4 mb-4" />
             {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex justify-between">
                     <SkeletonPulse className="h-4 w-1/3" />
                     <SkeletonPulse className="h-4 w-1/4" />
                 </div>
             ))}
        </div>
    </div>
);

const EditFormSkeleton = () => (
    <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <SkeletonPulse className="h-4 w-1/2" />
                    <SkeletonPulse className="h-10 w-full rounded-lg" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <SkeletonPulse className="h-4 w-1/3" />
                    <SkeletonPulse className="h-12 w-full rounded-lg" />
                </div>
            ))}
        </div>
        <div className="space-y-4 pt-6 border-t border-gray-100">
             <SkeletonPulse className="h-6 w-1/4" />
             {[...Array(2)].map((_, i) => (
                 <div key={i} className="grid grid-cols-12 gap-4">
                     <SkeletonPulse className="col-span-5 h-10 rounded-lg" />
                     <SkeletonPulse className="col-span-2 h-10 rounded-lg" />
                     <SkeletonPulse className="col-span-3 h-10 rounded-lg" />
                     <SkeletonPulse className="col-span-2 h-10 rounded-lg" />
                 </div>
             ))}
        </div>
    </div>
);

// ===================================================================
// 📌 CREATE COMPONENT: Sales Order Creation Form
// ===================================================================


// ===================================================================
// 📌 EDIT COMPONENT: Sales Order EDIT Form
// ===================================================================
const EditSalesOrderForm = ({ closeModal, onOrderUpdated, lookupData, BASE_URL, token, orderId }) => {
    const [formData, setFormData] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectableItems = [
        ...(lookupData.products || []).map(p => ({ ...p, id: p.id.toString(), type: 'product', label: `${p.name} (P - ${p.id})`, price: p.unit_price || 0 })),
        ...(lookupData.services || []).map(s => ({ ...s, id: s.id.toString(), type: 'service', label: `${s.name} (S - ${s.id})`, price: s.unit_price || 0 })),
    ];

    const calculateGrandTotal = (currentItems) => {
        return currentItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unit_price)), 0);
    };

    // --- React Query: Fetch Order Details for Edit ---
    const { data: fetchedOrderData, isLoading: isLoadingData } = useQuery({
        queryKey: ["salesOrder", orderId],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/sales-orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch order details. Status: ${res.status}`);
            return res.json();
        },
        enabled: !!orderId && !!token,
    });

    useEffect(() => {
        if (fetchedOrderData?.data) {
            const orderData = fetchedOrderData.data;
            try {
                setFormData({
                    customer_id: orderData.customer_id.toString(),
                    sales_type: orderData.sales_type,
                    branch_id: orderData.branch_id.toString(),
                    agent_id: orderData.agent_id.toString(),
                    // ⭐ LOAD: Use superior_id from API for source_me_id state
                    source_me_id: orderData.superior_id ? orderData.superior_id.toString() : "", 
                    down_payment: orderData.down_payment,
                    total: orderData.total,
                    items: orderData.items.map(item => ({
                        item_type: item.item_type,
                        item_id: item.item_id.toString(),
                        qty: item.qty,
                        unit_price: item.unit_price,
                    })),
                });
            } catch (error) {
                console.error("Error parsing order data:", error);
                toast.error("Error loading order data.");
                closeModal();
            }
        }
    }, [fetchedOrderData, closeModal]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle source_me_id to be null if empty string is selected
        const val = name === 'source_me_id' ? (value ? value : "") : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };
    
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        
        const val = ['qty', 'unit_price'].includes(name) ? Number(value) : value;

        if (name === 'item_id') {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const itemType = selectedOption.getAttribute('data-item-type');
            newItems[index]['item_type'] = itemType || 'product';
            
            // ⭐ AUTOMATIC PRICE POPULATION LOGIC ⭐
            const selectedItem = selectableItems.find(i => i.id.toString() === value);
            if(selectedItem) {
                 if(newItems[index]['unit_price'] === 0 || newItems[index]['item_id'] !== value) {
                     newItems[index]['unit_price'] = selectedItem.price;
                 }
            } else {
                 newItems[index]['unit_price'] = 0;
            }
        }
        
        newItems[index][name] = val;
        
        // 💰 RECALCULATE GRAND TOTAL
        const grandTotal = calculateGrandTotal(newItems);

        setFormData(prev => ({ 
            ...prev, 
            items: newItems,
            total: grandTotal
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { item_type: "product", item_id: "", qty: 1, unit_price: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
             const newItems = formData.items.filter((_, i) => i !== index);
             const grandTotal = calculateGrandTotal(newItems);
             setFormData(prev => ({ 
                 ...prev, 
                 items: newItems,
                 total: grandTotal
             }));
        }
    };






  const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return;
        setIsSubmitting(true);
        
        // 1. VALIDATION: Customer, Branch, Introducer, and Items are MANDATORY.
        if (!formData.customer_id || !formData.branch_id || !formData.source_me_id || formData.items.some(item => !item.item_id)) {
            toast.error("Please fill out all required header fields and select items.");
            setIsSubmitting(false);
            return;
        }

        // 2. Build the core payload structure explicitly.
        // This avoids spreading `...formData` which includes unnecessary fields like agent_id and source_me_id.
        const payload = {
            customer_id: Number(formData.customer_id),
            sales_type: formData.sales_type,
            branch_id: Number(formData.branch_id),
            down_payment: Number(formData.down_payment),
            source_me_id:"123",
            total: Number(formData.total),
            items: formData.items.map(item => ({
                item_type: item.item_type,
                item_id: Number(item.item_id),
                qty: Number(item.qty),
                unit_price: Number(item.unit_price)
            }))
        };
         console.log(payload)
 

        // The payload now perfectly matches your required structure, e.g.:
        // {
        //   "customer_id": 10,
        //   "sales_type": "order",
        //   "branch_id": 1,
        //   "source_me_id": 2,  <-- This comes from formData.source_me_id
        //   "down_payment": 50000,
        //   "total": 255000,
        //   "items": [...]
        // }
        
        try {
            const res = await fetch(`${BASE_URL}/sales-orders/${orderId}`, {
                method: "PUT", // Use PUT for updating
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            toast.success(`Sales Order #${orderId} updated successfully! ✅`);
            onOrderUpdated(); 
            closeModal();
        } catch (err) {
            console.error("Failed to update sales order:", err);
            toast.error(`Error updating order: ${err.message}`);
        }
        setIsSubmitting(false);
    };

    if (isLoadingData || !formData) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="absolute inset-0 bg-black opacity-60 backdrop-blur-sm" onClick={closeModal}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl z-10 overflow-hidden">
                     <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                        <SkeletonPulse className="h-8 w-1/3" />
                        <button onClick={closeModal}><AiOutlineClose size={24} className="text-gray-400" /></button>
                    </div>
                    <EditFormSkeleton />
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black opacity-60 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl z-10 overflow-y-auto max-h-[95vh] transform transition-all duration-500 ease-out p-0">
                
                <div className="bg-gradient-to-r from-red-600 to-amber-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                    <h2 className="text-2xl font-extrabold">Edit Sales Order <span className="font-mono">#{orderId}</span></h2>
                    <button onClick={closeModal} className="text-white hover:text-red-300 transition-colors p-2 rounded-full">
                        <AiOutlineClose size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Primary Order Details: Changed to 4 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 border rounded-xl shadow-inner bg-gray-50">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
                                <select name="customer_id" value={formData.customer_id} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Select Customer</option>
                                    {lookupData.customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Agent <span className="text-red-500">*</span></label>
                                <select name="agent_id" value={formData.agent_id} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Select Agent</option>
                                    {lookupData.agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.user?.name || `Agent ${a.id}`} ({a.agent_code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
                                <select name="branch_id" value={formData.branch_id} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Select Branch</option>
                                    {lookupData.branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                    ))}
                                </select>
                            </div>
                            {/* ⭐ NEW: Introducer (Employee) Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Introducer (Employee)</label>
                                <select 
                                    name="source_me_id" 
                                    value={formData.source_me_id} 
                                    onChange={handleChange} 
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select Employee</option>
                                    {lookupData.employees.map(e => (
                                        <option key={e.id} value={e.id}>
                                            {e.full_name_en} ({e.employee_code}) - {e.rank}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* ⭐ END NEW FIELD */}
                        </div>

                        {/* Financial Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-indigo-50 border-2 border-indigo-200">
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Down Payment (BDT)</label>
                                <input type="number" name="down_payment" value={formData.down_payment} onChange={handleChange} className="w-full border-indigo-300 rounded-lg shadow-sm font-medium focus:ring-indigo-500 focus:border-indigo-500" min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Grand Total (BDT)</label>
                                <input type="text" name="total" value={formData.total.toLocaleString()} readOnly className="w-full border-indigo-300 rounded-lg shadow-inner bg-indigo-100 font-extrabold text-indigo-700 text-lg" />
                            </div>
                        </div>

                        {/* Order Items Section (Same as Create Form) */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-xl font-extrabold text-gray-800 border-l-4 border-amber-500 pl-3">Line Items</h3>
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm items-end">
                                    <div className="col-span-5">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Product/Service</label>
                                        <select 
                                            name="item_id" 
                                            value={item.item_id} 
                                            onChange={(e) => handleItemChange(index, e)} 
                                            className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Item</option>
                                            {selectableItems.map(si => (
                                                <option 
                                                    key={`${si.type}-${si.id}`} 
                                                    value={si.id} 
                                                    data-item-type={si.type}
                                                >
                                                    {si.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                        <input type="number" name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" min="1" />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price</label>
                                        <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" min="0" />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <span className="text-lg font-bold text-gray-700 mr-2">{(item.qty * item.unit_price).toLocaleString()}</span>
                                        <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors" disabled={formData.items.length === 1}>
                                            <AiOutlineClose size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center p-2 rounded-lg transition-colors hover:bg-blue-50">
                                <AiOutlinePlus size={16} className="mr-1" /> Add Another Item
                            </button>
                        </div>


                        <div className="flex justify-end pt-4 border-t">
                            <button 
                                type="submit" 
                                disabled={isSubmitting || isLoadingData}
                                className="bg-gradient-to-r from-red-500 to-amber-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-red-600 hover:to-amber-600 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl"
                            >
                                {isSubmitting ? "Updating..." : "Update Sales Order"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// 📌 MAIN COMPONENT: CreateSalesorder
// ===================================================================

const SaleorderList = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewOrder, setViewOrder] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [showEditModal, setShowEditModal] = useState(false); 
    const [editOrderId, setEditOrderId] = useState(null); 

    const [perPage, setPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    
    const navigate = useNavigate(); // This must be called inside the component where the column definition lives.
const handlePaymentClick = (row) => {
    // The row object contains the necessary data (like id and total)
    // The component you provided uses location.state?.salesOrderId for navigation state.
    navigate(`/payment-installment`, { 
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
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year}`;
    };

    // --- MODAL & DATA HANDLERS ---
    

    const openEditModal = (orderId) => {
        setEditOrderId(orderId);
        setShowEditModal(true);
    }
    const closeEditModal = () => {
        setEditOrderId(null);
        setShowEditModal(false);
    }

    const openViewModal = (orderFromList) => {
        // Just set the selected row; React Query will fetch details automatically
        setViewOrder(orderFromList);
    };

     


    const closeViewModal = () => setViewOrder(null);
    
    const handleDeleteOrder = async (orderId) => { 
        if (!window.confirm(`Are you sure you want to DELETE Sales Order #${orderId}? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/sales-orders/${orderId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            toast.success(`Sales Order #${orderId} deleted successfully! 🗑️`);
            refetchOrders(); // Refresh the list
            closeViewModal();
        } catch (err) {
            console.error("Failed to delete sales order:", err);
            toast.error(`Error deleting order: ${err.message}`);
        }
    };
    
    // --- REACT QUERY FETCH LOGIC ---

    // 1. Fetch Sales Orders (Paginated)
    const { data: salesOrdersData, isLoading: loading, refetch: refetchOrders } = useQuery({
        queryKey: ["salesOrders", currentPage, perPage, token],
        queryFn: async () => {
            if (!token) return { data: [], total: 0 };
            const res = await fetch(`${BASE_URL}/sales-orders?page=${currentPage}&per_page=${perPage}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        },
        keepPreviousData: true, // Keeps data visible while fetching next page
    });

    const salesOrders = salesOrdersData?.data || [];
    const totalRows = salesOrdersData?.total || 0;

    // 2. Fetch Lookup Data (Combined)
    const { data: lookupDataResult } = useQuery({
        queryKey: ["lookupData", token],
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
        staleTime: 1000 * 60 * 10, // Cache lookup data for 10 minutes
    });

    const lookupData = lookupDataResult || {
        customers: [], agents: [], branches: [], products: [], services: [], payments: [], employees: []
    };

    // 3. Fetch View Order Details (When modal is open)
    const { data: viewOrderDetails, isLoading: isViewLoading } = useQuery({
        queryKey: ["viewOrder", viewOrder?.id],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/sales-orders/${viewOrder.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to load details");
            return res.json();
        },
        enabled: !!viewOrder?.id, // Only run when a viewOrder is selected
    });

    // Merge list data with fetched detail data for display
    const viewOrderDisplay = viewOrder ? { ...viewOrder, ...(viewOrderDetails?.data || {}) } : null;

    // Handlers for refresh
    const handleOrderCreated = () => {
        setCurrentPage(1); 
        refetchOrders();
    };
    const handleOrderUpdated = () => refetchOrders();

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        setCurrentPage(1); 
    };

    // Filter orders
     const filteredOrders = salesOrders.filter(
        (o) => o.sales_type != 'service' && (
            !searchTerm || // Return true if search term is empty
            (o.id && String(o.id).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.sales_type && o.sales_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.status && o.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.agent?.agent_code && o.agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    // Data Table Columns
    const columns = [
        { name: "SL. NO", selector: (row, index) => (currentPage - 1) * perPage + index + 1, sortable: false, width: "80px",},
        { name: "Order ID", selector: (row) => row.id, sortable: true, width: "100px" },
        { name: "Sales Type", selector: (row) => row?.sales_type, sortable: true },
        { name: "Customer Name", selector: (row) => row?.customer?.name || "N/A", sortable: true, minWidth: "150px"},
        { name: "Agent Code", selector: (row) => row.agent?.agent_code || "N/A", sortable: true },
        { name: "Total (BDT)", selector: (row) => row.total?.toLocaleString(), sortable: true, right: true },
        { name: "Down Payment", selector: (row) => row.down_payment?.toLocaleString(), sortable: true, right: true },
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
            {/* End of NEW PAYMENT/INSTALLMENT BUTTON */}
    {/* Edit Button */}
            <svg onClick={() => openEditModal(row.id)} xmlns="http://www.w3.org/2000/svg" className="cursor-pointer text-amber-500 hover:text-amber-700 transition-colors w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} title="Edit Order">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {/* Delete Button */}
            <svg onClick={() => handleDeleteOrder(row.id)} xmlns="http://www.w3.org/2000/svg" className="cursor-pointer text-red-500 hover:text-red-700 transition-colors w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} title="Delete Order">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </div>
    ),
    width: "150px" // Increased width to accommodate the new button
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

    // Derived data for View Modal
    const salesOrderId = viewOrderDisplay?.id;
    const orderPayments = lookupData?.payments?.filter(
        (payment) => payment?.sales_order_id === salesOrderId
    );
    const totalPaid = (orderPayments || []).reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);
    const totalOrderAmount = parseFloat(viewOrderDisplay?.total || '0');
    const remainingBalance = totalOrderAmount - totalPaid;

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
                            {/* <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-400 text-white 
                                    px-5 py-2.5 rounded-xl font-bold hover:from-green-500 hover:to-blue-500 transition-all duration-300 shadow-lg"
                            >
                                <AiOutlinePlus size={20} className="mr-2" />
                                New Order
                            </button> */}
                            <Link 
                            to="/create-sales" // <-- Use 'to' attribute for the destination path
                            className="flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-400 text-white 
                                px-5 py-2.5 rounded-xl font-bold hover:from-green-500 hover:to-blue-500 transition-all duration-300 shadow-lg"
                        >
                            <AiOutlinePlus size={20} className="mr-2" />
                            New Order
                        </Link>
                        </div>
                    </div>

                    {/* Data Table Container Card */}
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={filteredOrders}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            progressPending={loading}
                            progressComponent={<TableSkeleton />}
                            highlightOnHover
                            striped
                            responsive
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="p-8 text-gray-500 font-medium text-lg text-center">
                                    {loading ? "Loading data..." : "No sales orders found matching your criteria. 😔"}
                                </div>
                            }
                        />
                    </div>

                    {/* View Order Modal */}
 {viewOrderDisplay && (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black opacity-70 backdrop-blur-sm" onClick={closeViewModal}></div>
        
        {/* Modal Container: Slightly increased max-w for detail density */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl z-10 overflow-y-auto max-h-[95vh] transform transition-all duration-300 scale-100 opacity-100 border border-gray-100">
            
            {/* Modal Header (Sticky) */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex justify-between items-center z-20 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800">
                    Order Detail: <span className="text-blue-700">#{viewOrderDisplay.id}</span>
                </h2>
                <div className="flex items-center space-x-3">
                    {/* Status Badge: More refined color/shadow */}
                    <span className={`py-1 px-3 rounded-full text-xs font-bold uppercase ${getStatusColorClass(viewOrderDisplay.status)} shadow-sm`}>
                        {viewOrderDisplay.status}
                    </span>
                    <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100">
                        <AiOutlineClose size={20} />
                    </button>
                </div>
            </div>

            {/* Modal Content - Main Body */}
            {isViewLoading ? (
                <ViewModalSkeleton />
            ) : (
            <div className="p-6 space-y-6">
                
                {/* 1. Order Information & Financials - Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DetailSection title="Order Summary" color="border-blue-500">
                        <DetailItem label="Sales Type" value={viewOrderDisplay.sales_type} />
                        <DetailItem label="Rank/Level" value={viewOrderDisplay.rank} />
                        <DetailItem label="Branch" value={`${viewOrderDisplay.branch?.name || 'N/A'} (${viewOrderDisplay.branch?.code || ''})`} />
                        <DetailItem label="Created At" value={formatDate(viewOrderDisplay.created_at)} />
                    </DetailSection>

                    {/* Financial Overview - Highlighted */}
                    <DetailSection title="Financial Overview" color="border-indigo-500">
                        <DetailItem label="Total Amount" value={`${viewOrderDisplay.total.toLocaleString()} BDT`} isCurrency />
                        <DetailItem label="Down Payment" value={`${viewOrderDisplay.down_payment.toLocaleString()} BDT`} isCurrency />
                        <DetailItem 
                            label="Remaining Balance" 
                            // Emphasized font size and color for balance
                            value={<span className="font-extrabold text-lg text-red-600">{(viewOrderDisplay.total - viewOrderDisplay.down_payment).toLocaleString()} BDT</span>} 
                            isCurrency 
                        />
                        <DetailItem label="Payment Method" value={viewOrderDisplay.payment_method || 'N/A'} />
                    </DetailSection>
                </div>

                {/* 2. Customer & Agent/Referrals Section */}
                <DetailSection title="Customer & Sales Team" color="border-green-500">
                    <DetailItem label="Customer Name" value={viewOrderDisplay.customer?.name || 'N/A'} />
                    <DetailItem label="Customer Phone" value={viewOrderDisplay.customer?.phone || 'N/A'} />
                    <DetailItem label="Sales Agent" value={`${viewOrderDisplay.agent?.user?.name || 'N/A'} (${viewOrderDisplay.agent?.agent_code || 'N/A'})`} />
                    <DetailItem label="Introduced By (Superior)" value={viewOrderDisplay.superior?.full_name_en || 'N/A'} /> 
                </DetailSection>

                {/* 3. Order Items Section (Item styling adjusted) */}
                <div className="border-l-4 border-amber-500 pl-4 bg-white p-5 rounded-lg shadow-inner border-2 border-gray-100">
                    <h3 className="text-xl font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">📦 Order Items</h3>
                    {viewOrderDisplay.items && viewOrderDisplay.items.length > 0 ? (
                        <ul className="space-y-3">
                            {viewOrderDisplay?.items?.map((item, index) => {
                                
                                const itemName = item.itemable?.name || 'Item Name N/A';
                                const itemType = item.itemable_type.includes('Product') ? 'Product' : 'Service'; 
                                
                                return (
                                    <li key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                                        <div className="flex-1 min-w-0">
                                            {/* Display Item Name & Type (Name text-base) */}
                                            <p className="font-semibold text-gray-800 text-base">
                                                {itemName}
                                                <span className={`ml-3 text-xs font-medium uppercase py-0.5 px-2 rounded-lg text-white ${itemType === 'Product' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                                    {itemType}
                                                </span>
                                            </p>
                                            
                                            {/* Display ID and Attributes (Text size small) */}
                                            <p className="text-xs text-gray-500 mt-1">
                                                <span className="font-medium text-gray-600">ID:</span> {item.itemable_id} 
                                                {item.itemable?.attributes?.size && (
                                                    <span className="ml-4 font-medium text-gray-600">| Size: {item.itemable.attributes.size}</span>
                                                )}
                                                {item.itemable?.attributes?.location && (
                                                    <span className="ml-4 font-medium text-gray-600">| Location: {item.itemable.attributes.location}</span>
                                                )}
                                            </p>
                                            
                                        </div>
                                        {/* Price and Quantity (Total text-lg) */}
                                        <div className="text-right mt-2 sm:mt-0">
                                            <span className="block text-sm text-gray-600">{item.qty} x {parseFloat(item.unit_price).toLocaleString()} BDT</span>
                                            <span className="block text-lg font-bold text-blue-700">Total: {parseFloat(item.line_total).toLocaleString()} BDT</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">No items found for this order.</p>
                    )}
                </div>
                
                {/* 4. Installments/Payments Section - Placeholder */}
             {/* 4. Installments/Payments Section - Displaying orderPayments */}
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
                <div className="flex justify-end pt-5 border-t border-gray-100">
                    <button
                        onClick={() => handleDeleteOrder(viewOrderDisplay?.id)}
                        className="flex items-center bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Order
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

export default SaleorderList;