import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ----------------------------------------------------------------------
// API Configuration
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const CreateInstallment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/";
        const API_TOKEN = localStorage.getItem("authToken");
        console.log(API_TOKEN)
            
    // 1. Retrieve the entire sales order OBJECT from location.state
    const salesOrderObject = location.state?.salesOrderId;
    
    // 2. Extract the primitive 'id' and 'total'
    const saleIdForAPI = salesOrderObject?.id;
    const totalAmount = salesOrderObject?.total; 

    // 3. Set Dynamic Initial Frequency (e.g., from a property on the sales object)
    // Fallback to "monthly" if salesOrderObject or frequency_preference is missing
    const initialFrequency = salesOrderObject?.frequency_preference ?? "monthly";

    const [installmentConfig, setInstallmentConfig] = useState({
        // The frequency value is now dynamically initialized
        frequency: initialFrequency, 
        count: 12,
        start_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        grace_days: 5,
        installment_tenure_months: 12,
    });
//    console.log(installmentConfig)

    // ----------------------------------------------------------------------
    // Initial Check and Side Effects
    // ----------------------------------------------------------------------
    useEffect(() => {
        // If the necessary ID is missing, redirect the user
        if (!saleIdForAPI) {
            toast.error("Sales Order ID is missing. Redirecting to sale creation.");
            navigate('/create-sales');
        }
    }, [saleIdForAPI, navigate]); 


    // ----------------------------------------------------------------------
    // Form Handlers
    // ----------------------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInstallmentConfig(prev => ({ 
            ...prev, 
            // Convert count and grace_days to Number
            [name]: (name === 'count' || name === 'grace_days' || name === 'installment_tenure_months') ? Number(value) : value 
        }));
    };

    const handleInstallmentSubmit = async (e) => {
        e.preventDefault();

        if (!saleIdForAPI) {
            toast.error("Sales Order ID not found.");
            return;
        }

        if (installmentConfig.count <= 0 || installmentConfig.grace_days < 0) {
            toast.error("Installment count must be positive and grace days must be zero or positive.");
            return;
        }

        setIsSubmitting(true);
        const endpoint = `sales-orders/${saleIdForAPI}/installments/generate`;

        try {
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(installmentConfig),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to generate installments for Order #${saleIdForAPI}`);
            }

            // Successfully generated installments
            toast.success(`Installment plan generated successfully for Order #${saleIdForAPI}! 🎉`);
            navigate('/all-sale-list'); 

        } catch (err) {
            console.error("❌ Installment Generation Failed:", err);
            toast.error(`Error generating installments: ${err.message || 'An unknown error occurred'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ----------------------------------------------------------------------
    // Render Logic
    // ----------------------------------------------------------------------

    // Display error if the necessary ID is missing before rendering the form
    if (!saleIdForAPI) {
        return (
            <div className="flex h-screen overflow-hidden">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <main className="p-8">
                        <h1 className="text-3xl font-bold text-red-600">Error: Missing Sales Order ID</h1>
                        <p className="mt-4 text-gray-600">The page could not load because the necessary Sales Order details were not passed.</p>
                    </main>
                </div>
            </div>
        );
    }

    // Format the total amount for display
    const displayTotal = Number(totalAmount || 0).toLocaleString();

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-6xl mx-auto">

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Installment Plan Configuration 📝</h1>
                            <p className="text-gray-500 mt-1">
                                Base Sale Order ID: 
                                <span className={`font-bold ml-2 text-green-600`}>
                                    {/* Using the primitive ID is correct */}
                                    {saleIdForAPI} 
                                </span>
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 border-b pb-3">
                                Plan Details for Total Amount: {displayTotal} BDT
                            </h2>
                            
                            <form onSubmit={handleInstallmentSubmit} className="space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    
                                    {/* Frequency Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency *</label>
                                        <select 
                                            name="frequency" 
                                            value={installmentConfig.frequency} 
                                            onChange={handleChange} 
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200" 
                                            required
                                            disabled={isSubmitting} 
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>

                                    {/* Installment Tenure Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Installment Tenure (Months)</label>
                                        <select
                                            name="installment_tenure_months"
                                            value={installmentConfig.installment_tenure_months}
                                            onChange={handleChange}
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200"
                                            disabled={isSubmitting}
                                        >
                                              <option value="2">2 Months</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">12 Months</option>
                                            <option value="24">24 Months</option>
                                            <option value="36">36 Months</option>
                                            <option value="48">48 Months</option>
                                            <option value="60">60 Months</option>
                                            <option value="72">72 Months</option>
                                         
                                        </select>
                                    </div>

                                    {/* Count Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments *</label>
                                        <input 
                                            type="number" 
                                            name="count" 
                                            value={installmentConfig.count} 
                                            onChange={handleChange} 
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200" 
                                            min="1" 
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Start Date Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Installment Date *</label>
                                        <input 
                                            type="date" 
                                            name="start_date" 
                                            value={installmentConfig.start_date} 
                                            onChange={handleChange} 
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200" 
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    {/* Grace Days Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Grace Days</label>
                                        <input 
                                            type="number" 
                                            name="grace_days" 
                                            value={installmentConfig.grace_days} 
                                            onChange={handleChange} 
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200" 
                                            min="0"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Submission Button */}
                                <div className="pt-6 border-t flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting} 
                                        className="bg-gradient-to-r from-teal-500 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-teal-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl"
                                    >
                                        {isSubmitting ? "Generating Plan..." : "Generate Installment Schedule"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateInstallment;