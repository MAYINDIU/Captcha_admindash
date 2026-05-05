import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// NOTE: Assuming these partials are in your project structure
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header"; 

// NOTE: Replace with your actual configuration in a real environment
const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/";
const API_TOKEN = localStorage.getItem("authToken");

const Fullpayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  
  // Access the salesOrder object passed via navigate('/full-payment', { state: { salesOrderId: salesOrderId } });
  const salesOrderObject = location.state?.salesOrderId;
  const saleIdForAPI = salesOrderObject?.id;
  
  // NOTE: You would typically fetch the full order details here, 
  // but for now, we'll use the basic data passed via state.
  const totalAmount = salesOrderObject?.total; 

  // ----------------------------------------------------------------------
  // Fetch Full Order/Payment History (Placeholder for full data)
  // ----------------------------------------------------------------------
  // In a real scenario, you'd fetch all payments here to calculate the final due amount accurately.
  // We'll simulate this with the data available from the state for display.

  useEffect(() => {
    if (!saleIdForAPI) {
      // Handle case where ID is missing (e.g., direct access)
      console.error("Sales Order ID is missing for Full Payment.");
      navigate('/dashboard'); // or wherever appropriate
    } else {
      // Simulate data loading completion
      setOrderData(salesOrderObject);
      setIsLoading(false);
    }
  }, [saleIdForAPI, navigate, salesOrderObject]);

  // ----------------------------------------------------------------------
  // Calculate Due Amount (Crucial for Full Payment)
  // ----------------------------------------------------------------------
  // You would need to fetch all payments (installments, down payments) and sum them up.
  // Since we don't have the payment list here, this is a placeholder. 
  // You must replace this with a proper API call to get all payments for SO-ID.
  
  // Placeholder Calculation: Assumes total amount due is total - down_payment (which might be wrong if partial DP was paid)
  // In a real scenario: Fetch ALL payments -> calculate total paid -> Total - TotalPaid
  const calculateRemainingDue = () => {
      // NOTE: Replace this with your actual logic to fetch/calculate total paid from all payments
      const totalOrder = parseFloat(totalAmount || '0');
      
      // *** PLACEHOLDER for missing total paid logic ***
      // For a real full-payment page, you MUST fetch the actual total paid.
      // E.g., const totalPaid = fetchTotalPaid(saleIdForAPI);
      
      // Using a basic fallback: 
      const totalPaidPlaceholder = parseFloat(salesOrderObject?.down_payment || '0');
      
      return (totalOrder - totalPaidPlaceholder).toFixed(2);
  };

  const remainingDue = calculateRemainingDue();

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  if (isLoading || !orderData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="p-8">
            <p className="text-center text-gray-500 py-6">Loading Order Details...</p>
          </main>
        </div>
      </div>
    );
  }

  const handleFullPaymentSubmit = (e) => {
      e.preventDefault();
      // Implement your full payment submission logic here
      // 1. Final confirmation (e.g., SweetAlert)
      // 2. Construct API payload (full remainingDue amount, type: 'full_payment', method, etc.)
      // 3. API call to record the final payment
      // 4. Success/Error handling & redirection
      alert(`Attempting to record FULL PAYMENT of ${remainingDue} BDT for Order #${saleIdForAPI}. (API logic not implemented)`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Final Settlement (Full Payment) 💰
              </h1>
              <p className="text-gray-500 mt-1">
                Sales Order ID: <span className="text-blue-600 font-bold">{saleIdForAPI}</span>
              </p>
            </div>

            {/* Final Payment Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-green-500">
              <div className="text-center mb-6">
                <p className="text-xl text-gray-700 font-medium">Remaining Amount Due:</p>
                <h2 className="text-5xl font-extrabold text-green-700 my-2">
                  {Number(remainingDue).toLocaleString()} BDT
                </h2>
                <p className="text-sm text-gray-500">
                    Total Order Value: {Number(totalAmount).toLocaleString()} BDT
                </p>
                <blockquote className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 italic">
                    <p className='text-sm font-semibold'>
                        ⚠️ **CRITICAL NOTE:** The Remaining Due amount displayed ({remainingDue} BDT) is a placeholder calculation based only on the initial order data. For production, you **MUST** perform a server-side calculation of **Total Order Value - Total Payments Made** to get the accurate figure.
                    </p>
                </blockquote>
              </div>
              
              <form onSubmit={handleFullPaymentSubmit} className="space-y-6">
                
                {/* Fixed Amount for Full Payment */}
                <div className="bg-green-100 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-800 mb-1">
                        Full Payment Amount
                    </label>
                    <input
                        type="text"
                        name="full_amount"
                        value={remainingDue} // Amount is fixed to the remaining due
                        className="w-full bg-white border-green-300 rounded-lg shadow-sm font-bold text-xl text-green-700"
                        readOnly
                    />
                </div>

                {/* Other Payment Details (Method, Date, Reference) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method *
                        </label>
                        <select
                            name="method"
                            // Use a state for method in a real implementation
                            defaultValue="bank_transfer" 
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                            required
                        >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Paid At *
                        </label>
                        <input
                            type="date"
                            name="paid_at"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference/Transaction ID
                    </label>
                    <input
                        type="text"
                        name="reference"
                        placeholder="e.g., Final Bank Ref #ABC-123"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={Number(remainingDue) <= 0}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                        Process Full Payment
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

export default Fullpayment;