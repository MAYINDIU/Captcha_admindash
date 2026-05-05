import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// ===================================================================
// 💀 SKELETON LOADERS
// ===================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const CreateSaleSkeleton = () => (
    <div className="p-8 space-y-8">
        <div className="flex justify-between items-center mb-8">
             <SkeletonPulse className="h-10 w-64" />
             <SkeletonPulse className="h-10 w-40" />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-0 overflow-hidden">
             <div className="h-16 bg-gray-100 border-b border-gray-200"></div>
             <div className="p-8 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-xl bg-gray-50">
                     <div className="space-y-2"><SkeletonPulse className="h-4 w-20" /><SkeletonPulse className="h-10 w-full" /></div>
                     <div className="space-y-2"><SkeletonPulse className="h-4 w-20" /><SkeletonPulse className="h-10 w-full" /></div>
                     <div className="space-y-2"><SkeletonPulse className="h-4 w-20" /><SkeletonPulse className="h-10 w-full" /></div>
                 </div>
                 <div className="space-y-4 border-t pt-6">
                     <SkeletonPulse className="h-6 w-32 mb-4" />
                     <div className="grid grid-cols-12 gap-4">
                         <SkeletonPulse className="col-span-5 h-12" />
                         <SkeletonPulse className="col-span-2 h-12" />
                         <SkeletonPulse className="col-span-3 h-12" />
                         <SkeletonPulse className="col-span-2 h-12" />
                     </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-indigo-50">
                      <div className="space-y-2"><SkeletonPulse className="h-4 w-32" /><SkeletonPulse className="h-12 w-full" /></div>
                      <div className="space-y-2 text-right">
                          <SkeletonPulse className="h-4 w-32 ml-auto" />
                          <SkeletonPulse className="h-10 w-48 ml-auto" />
                      </div>
                 </div>
             </div>
        </div>
    </div>
);


// ======================================================================
// Create Customer Modal Component
// ======================================================================

const CreateCustomerModal = ({ isVisible, onClose, onCustomerCreated, BASE_URL, API_TOKEN }) => {
    // Password pre-filled as requested
    const [customerData, setCustomerData] = useState({ name: '', email: '', password: 'secret123' });

    if (!isVisible) return null;

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));
    };

    // --- React Query Mutation for Customer Creation ---
    const createCustomerMutation = useMutation({
        mutationFn: async (newCustomer) => {
            const res = await fetch(`${BASE_URL}customers`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCustomer),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create customer!");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast.success("Customer created successfully! 🎉"); 
            onCustomerCreated(data.data); 
            setCustomerData({ name: '', email: '', password: 'secret123' }); 
            onClose(); 
        },
        onError: (err) => {
            toast.error(`Error creating customer: ${err.message}`);
        }
    });

    const handleCustomerSubmit = (e) => {
        e.preventDefault();
        if (!customerData.name || !customerData.email || !customerData.password) {
            toast.error("Please fill out Name, Email, and Password.");
            return;
        }
        createCustomerMutation.mutate(customerData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-indigo-700">Add New Customer</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <AiOutlineClose size={20} />
                    </button>
                </div>
                <form onSubmit={handleCustomerSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={customerData.name} onChange={handleCustomerChange} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input type="email" name="email" value={customerData.email} onChange={handleCustomerChange} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                        <input type="text" name="password" value={customerData.password} onChange={handleCustomerChange} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        <p className="text-xs text-gray-500 mt-1">Default password: `{customerData.password}`</p>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={createCustomerMutation.isLoading}
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                        >
                            {createCustomerMutation.isLoading ? "Creating..." : "Save Customer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ======================================================================
// Installment Confirmation Modal Component
// ======================================================================

const InstallmentConfirmationModal = ({ isVisible, onClose, onOptionSelected }) => {
    const [selection, setSelection] = useState('no'); // 'no' or 'yes'

    if (!isVisible) return null;

    const handleProceed = () => {
        onOptionSelected(selection);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-blue-700">Confirm Sale Type</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <AiOutlineClose size={20} />
                    </button>
                </div>
                <div className="mt-4 space-y-4">
                    <p className="text-lg font-semibold text-gray-700">
                        Do you want to process this sale as an **Installment Payment**?
                    </p>
                    
                    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                        {/* <label className="flex items-center space-x-3 text-gray-800 cursor-pointer">
                            <input 
                                type="radio" 
                                name="installment_option" 
                                value="no" 
                                checked={selection === 'no'}
                                onChange={(e) => setSelection(e.target.value)}
                                className="h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-base font-medium">Full Payment</span>
                        </label> */}
                        <label className="flex items-center space-x-3 text-gray-800 cursor-pointer">
                            <input 
                                type="radio" 
                                name="installment_option" 
                                value="yes" 
                                checked={selection === 'yes'}
                                onChange={(e) => setSelection(e.target.value)}
                                className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-base font-medium">Yes, Proceed to **Installment Plan** (Redirect to next page)</span>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end space-x-4 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleProceed}
                            className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                                selection === 'yes' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {selection === 'yes' ? "Continue to Installment Page" : "Confirm Direct Sale"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ======================================================================
// CreateSale Component
// ======================================================================

const CreateServiceSale = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // ----------------------------------------------------------------------
    // API Configuration
    // ----------------------------------------------------------------------
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/";
    const API_TOKEN = localStorage.getItem("authToken");

    const [showCustomerModal, setShowCustomerModal] = useState(false);
  
    // NEW STATE: For the installment confirmation modal
    const [showInstallmentConfirmation, setShowInstallmentConfirmation] = useState(false); 

    const [formData, setFormData] = useState({
        customer_id: "",
        sales_type: "service", // This will be 'order' for standard sales, or used to build payload for 'installment'
        // branch_id: "",
        // source_me_id: "", 
        down_payment: 0,
        total: 0,
        items: [{ item_type: "product", item_id: "", qty: 1, unit_price: 0 }],
    });

    // --- React Query: Fetch Lookup Data ---
    const { data: lookupData = { customers: [], branches: [], employees: [], products: [], services: [] }, isLoading } = useQuery({
        queryKey: ["createServiceSaleLookup", API_TOKEN],
        queryFn: async () => {
            const fetchData = async (endpoint) => {
                const res = await fetch(`${BASE_URL}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Accept': 'application/json' },
                });
                if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
                return (await res.json()).data || [];
            };

            const [customers, branches, employees, products, services] = await Promise.all([
                fetchData('customers'),
                fetchData('branches'),
                fetchData('employees'),
                fetchData('products'),
                fetchData('services'),
            ]);

            return { customers, branches, employees: employees.filter(e => e.branch_id), products, services };
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Update local cache when a new customer is created via modal
    const handleCustomerDataUpdate = useCallback((newCustomer) => {
        if (newCustomer) {
            queryClient.setQueryData(["createServiceSaleLookup", API_TOKEN], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    customers: [newCustomer, ...oldData.customers.filter(c => c.id !== newCustomer.id)]
                };
            });
            // Automatically select the new customer in the form
            setFormData(prev => ({ ...prev, customer_id: newCustomer.id.toString() }));
        } 
    }, [queryClient, API_TOKEN]);

    const customerOptions = useMemo(() => 
        lookupData.customers?.map(c => ({
            value: c.id.toString(),
            label: `${c.name} (${c.id})`
        })) || []
    , [lookupData.customers]);

    const selectableItems = useMemo(() => [
        ...(lookupData?.services || []).map(s => ({
            ...s, id: s.id.toString(), value: s.id.toString(), type: 'service', label: `${s.name} (S - ${s.id})`, price: s.price || 0
        })),
    ], [lookupData.services]);

    const calculateGrandTotal = useCallback((currentItems) => {
        return currentItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unit_price)), 0);
    }, []);

    useEffect(() => {
        const grandTotal = calculateGrandTotal(formData.items);
        setFormData(prev => ({ ...prev, total: grandTotal }));
    }, [formData.items, calculateGrandTotal]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = name === 'source_me_id' ? (value || "") : value;

        if (name === 'branch_id' && value !== formData.branch_id) {
             setFormData(prev => ({ ...prev, branch_id: value, source_me_id: "" }));
             return;
        }

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleCustomerSelectChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, customer_id: selectedOption ? selectedOption.value : "" }));
    };

    const handleItemSelectChange = (index, selectedOption) => {
        const newItems = [...formData.items];
        if (selectedOption) {
            if(newItems[index]['unit_price'] === 0 || newItems[index]['item_id'] !== selectedOption.value) {
                 newItems[index]['unit_price'] = selectedOption.price;
            }
            newItems[index]['item_id'] = selectedOption.value;
            newItems[index]['item_type'] = selectedOption.type;
        } else {
            newItems[index]['item_id'] = "";
            newItems[index]['unit_price'] = 0;
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];

        const val = ['qty', 'unit_price'].includes(name) ? Number(value) : value;

        if (name === 'item_id') {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const itemType = selectedOption.getAttribute('data-item-type');
            newItems[index]['item_type'] = itemType || 'product';

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

        setFormData(prev => ({
            ...prev,
            items: newItems,
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
            setFormData(prev => ({
                ...prev,
                items: newItems,
            }));
        }
    };

    const handleOrderCreated = () => {
        setFormData({
            customer_id: "", sales_type: "order", down_payment: 0, total: 0,
            items: [{ item_type: "product", item_id: "", qty: 1, unit_price: 0 }],
        });
        
        // Assuming this is the standard order list route
    };
    
    const handleCreateCustomerClick = () => {
        setShowCustomerModal(true); 
    };

    // ----------------------------------------------------------------------
    // NEW: Function to check validation and open the confirmation modal
    // ----------------------------------------------------------------------
    const handleConfirmSaleClick = async (e) => {
        e.preventDefault(); 
        
        // 1. Client-side validation check
        const isItemsValid = !formData.items.some(item => !item.item_id || item.qty <= 0 || item.unit_price < 0);

        if (!formData.customer_id || !isItemsValid) {
            toast.error("Please ensure all required primary fields (Customer, Branch) and all line items are correctly filled (Item selected, Qty > 0, Price >= 0).");
            return;
        }

        // 2. Open the confirmation modal
        const submissionResult = await handleSubmit(null);
        if (submissionResult.success) {
            Swal.fire({
                icon: 'success',
                title: 'Sale Created Successfully!',
                text: 'The new service sale has been recorded.',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate('/admin-service-sale');
            });
        }
    };

    // ----------------------------------------------------------------------
    // NEW: Function to handle option selection from the modal
// ⚠️ USE WITH CAUTION: This creates a sale order via API for *both* choices.
const handleInstallmentOption = async (selection) => {
    setShowInstallmentConfirmation(false);

    // Call handleSubmit for both scenarios to create the base sale order
    const submissionResult = await handleSubmit(null); 

    if (!submissionResult.success) {
        // handleSubmit already showed a toast error
        return; 
    }
    
    // Extract the ID from the successful submission result
    const salesOrderId = submissionResult?.data; 
   console.log(salesOrderId)
    if (selection === 'yes') {
        // Installment Sale: Redirect to installment creation page, passing the ID
        toast.success("Base Sales Order created! Redirecting to Installment setup... 🎉");
        navigate('/create-installment', { state: { salesOrderId: salesOrderId } });
        
    } else {
        // Standard Sale: Proceed with API submission on this page
        // Note: The submission already happened above. We just need to finalize.
        
         navigate('/full-payment', { state: { salesOrderId: salesOrderId } });
       
    }
};

    // --- React Query Mutation for Creating Sales Order ---
    const createSaleMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await fetch(`${BASE_URL}sales-orders`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create order!");
            }
            return res.json();
        },
        onError: (err) => {
            console.error("Failed to create sales order:", err);
            toast.error(`Error creating order: ${err.message}`);
        }
    });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Validation
        const isItemsValid = !formData.items.some(item => !item.item_id || item.qty <= 0 || item.unit_price < 0);
        if (!formData.customer_id || !isItemsValid) {
            toast.error("Validation error. Check customer and item details.");
            return { success: false, error: "Validation failed" };
        }

        const payload = {
            customer_id: Number(formData.customer_id), // Ensure customer_id is included and is a number
            sales_type: "service",
            total: 0,
            down_payment: 0, // Explicitly setting to null as per your structure
            items: formData.items.map((item) => ({
                item_type: "service", // Hardcoding to "service" for this form
                        qty: 1,
                item_id: Number(item.item_id),
                price: Number(item.unit_price), // Matching your required structure key "price"
            })),
        };

        try {
            const data = await createSaleMutation.mutateAsync(payload);
            return { success: true, data: data?.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // ----------------------------------------------------------------------

    // --- RENDER FULL PAGE LAYOUT ---

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

                    <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        New Service Sale Form ✨
                    </h1>

                    <Link to="/add-new-customer">
                        <button
                        onClick={handleCreateCustomerClick}
                        className="flex items-center justify-center bg-blue-500 text-white 
                            px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md text-sm disabled:bg-gray-400"
                        disabled={isLoading || createSaleMutation.isLoading}
                        >
                        <AiOutlinePlus size={16} className="mr-1" />
                        Create New Customer
                        </button>
                    </Link>
                    </div>


                        {isLoading ? (
                            <CreateSaleSkeleton />
                        ) : (
                        <div className="bg-white rounded-2xl shadow-xl w-full p-0">

                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                                <h2 className="text-2xl font-extrabold">Sales Order Details</h2>
                            </div>

                            <div className="p-8">
                                {/* Form only calls the handler to open the modal, or passes event to handleSubmit if directly called */}
                                <form onSubmit={handleConfirmSaleClick} className="space-y-8"> 
                                    
                                    {/* Primary Order Details Fieldset */}
                                    <fieldset 
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-xl shadow-inner bg-gray-50"
                                        disabled={isLoading}
                                    >
                                        
                                        {/* 1. Customer */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isLoading={isLoading}
                                                isClearable={true}
                                                isSearchable={true}
                                                name="customer_id"
                                                options={customerOptions}
                                                value={customerOptions.find(c => c.value === formData.customer_id)}
                                                onChange={handleCustomerSelectChange}
                                                placeholder="Select Customer"
                                            />
                                        </div>
                                    

                                    </fieldset>
                                    
                                    {/* Order Items Section */}
                                    <fieldset 
                                        className="space-y-4 border-t pt-6"
                                        disabled={isLoading}
                                    >
                                        <h3 className="text-xl font-extrabold text-gray-800 border-l-4 border-amber-500 pl-3">Line Items</h3>

                                        {formData.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm items-end">
                                                <div className="col-span-12 sm:col-span-5">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Product/Service <span className="text-red-500">*</span></label>
                                                    <Select
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        isLoading={isLoading}
                                                        isClearable={true}
                                                        isSearchable={true}
                                                        name="item_id"
                                                        options={selectableItems}
                                                        value={selectableItems.find(i => i.value === item.item_id && i.type === item.item_type)}
                                                        onChange={(option) => handleItemSelectChange(index, option)}
                                                        placeholder="Select Item"
                                                        menuPosition="fixed" 
                                                    />
                                                </div>
                                                {/* <div className="col-span-4 sm:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Qty <span className="text-red-500">*</span></label>
                                                    <input type="number" name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200" min="1" required />
                                                </div> */}
                                                <div className="col-span-5 sm:col-span-3">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price <span className="text-red-500">*</span></label>
                                                    <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200" min="0" required />
                                                </div>
                                                <div className="col-span-3 sm:col-span-2 flex justify-end items-center">
                                                    <span className="text-base font-bold text-gray-700 mr-2 hidden sm:inline">{(item.qty * item.unit_price).toLocaleString()}</span>
                                                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors" disabled={formData.items.length === 1 || isLoading}>
                                                        <AiOutlineClose size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addItem} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center p-2 rounded-lg transition-colors hover:bg-blue-50" disabled={isLoading}>
                                            <AiOutlinePlus size={16} className="mr-1" /> Add Another Item
                                        </button>
                                    </fieldset>

                                    {/* Financial Totals Fieldset */}
                                    <fieldset
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-indigo-50 border-2 border-indigo-200"
                                        disabled={isLoading}
                                    >
                                       
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-700">Grand Total (BDT):</p>
                                            <p className="text-4xl font-extrabold text-green-600 mt-1">
                                                {formData.total.toLocaleString()}
                                            </p>
                                        
                                        </div>
                                    </fieldset>

                                    {/* Action Button */}
                                    <div className="pt-6 border-t flex justify-end">
                                        <button
                                            type="submit" // This triggers handleConfirmSaleClick
                                            disabled={createSaleMutation.isLoading || isLoading}
                                            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400"
                                        >
                                            {createSaleMutation.isLoading ? "Processing..." : "Confirm Sale Order"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals */}
            <CreateCustomerModal 
                isVisible={showCustomerModal} 
                onClose={() => setShowCustomerModal(false)} 
                onCustomerCreated={handleCustomerDataUpdate} 
                BASE_URL={BASE_URL}
                API_TOKEN={API_TOKEN}
            />

            <InstallmentConfirmationModal
                isVisible={showInstallmentConfirmation}
                onClose={() => { setShowInstallmentConfirmation(false); }}
                onOptionSelected={() => {}}
            />
        </div>
    );
};

export default CreateServiceSale;