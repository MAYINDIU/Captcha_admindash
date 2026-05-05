import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header"; 
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { FaMoneyBillWave, FaCoins, FaCheckCircle, FaExchangeAlt } from 'react-icons/fa';

// ----------------------------------------------------------------------
// API Configuration
// ----------------------------------------------------------------------
const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/";
const API_TOKEN = localStorage.getItem("authToken");
// ----------------------------------------------------------------------

const SalesOrderPaymentRecording = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State to hold the *actual* remaining balance due (Total Order - Total Paid)
  const [remainingBalanceDue, setRemainingBalanceDue] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    paid_at: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'cash', 
    reference: '', 
    // Defaulting to 'partial_payment'
    type: 'partial_payment', 
  });

  const salesOrderObject = location.state?.salesOrderId;
  const saleIdForAPI = salesOrderObject?.id;
  const totalOrderAmount = salesOrderObject?.total;
  const downPaymentAmountRequired = salesOrderObject?.down_payment;
  
  // ----------------------------------------------------------------------
  // Fetch Logic (Simulating fetching the true remaining general balance)
  // ----------------------------------------------------------------------
  const fetchPaymentStatus = async (salesOrderId) => {
    setIsLoading(true);
    if (!salesOrderId) return;
    
    // ⚠️ Placeholder Logic: Replace with API call to get actual paid total
    try {
      const mockTotalPaid = 0; 
      const actualRemainingDue = Number(totalOrderAmount || 0) - mockTotalPaid;

      setRemainingBalanceDue(actualRemainingDue.toFixed(2));
      
      const defaultAmount = actualRemainingDue > 0 ? actualRemainingDue.toFixed(2) : '';
      
      setPaymentForm(prev => ({
        ...prev,
        amount: defaultAmount,
        // If suggested amount is full, suggest 'full_payment', otherwise 'partial_payment'
        type: actualRemainingDue > 0 && defaultAmount === actualRemainingDue.toFixed(2) ? 'full_payment' : 'partial_payment',
      }));
      
    } catch (err) {
      console.error("❌ Payment Status Fetch Failed:", err);
      toast.error(`Error fetching order status.`);
      setRemainingBalanceDue(0); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!saleIdForAPI) {
      toast.error("Sales Order ID is missing. Redirecting to sale creation.");
      navigate('/create-sales');
    } else {
      fetchPaymentStatus(saleIdForAPI);
    }
  }, [saleIdForAPI, navigate, totalOrderAmount]);

  // ----------------------------------------------------------------------
  // Form Handlers
  // ----------------------------------------------------------------------
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    
    setPaymentForm(prev => {
      let newState = { ...prev, [name]: value };

      // Automatic type switching based on amount input (if amount field is changed)
      if (name === 'amount' && remainingBalanceDue !== null) {
          const newAmount = Number(value);
          const remaining = Number(remainingBalanceDue);
          
          if (newAmount >= remaining && remaining > 0) {
              newState.type = 'full_payment';
          } else {
              // If partial, revert to the last selected non-full type (or a default partial)
              if (newState.type === 'full_payment') {
                  newState.type = 'partial_payment'; 
              }
          }
      }
      return newState;
    });
  };

  // ----------------------------------------------------------------------
  // Submit Payment (Generalized)
  // ----------------------------------------------------------------------
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!saleIdForAPI || !paymentForm.amount) {
      toast.error("Sales ID and Amount must be provided.");
      return;
    }

    const amountToPay = Number(paymentForm.amount);
    if (amountToPay <= 0) {
      toast.error("Payment amount must be positive.");
      return;
    }
    
    const maxAmount = Number(remainingBalanceDue);
    if (amountToPay > maxAmount) {
        toast.error(`Payment amount (${amountToPay}) cannot exceed the remaining balance due (${maxAmount}).`);
        return;
    }

    // Determine the final type before submission
    let finalPaymentType = paymentForm.type;
    // Overrule user selection if amount covers the balance
    if (amountToPay >= maxAmount && maxAmount > 0) {
        finalPaymentType = 'full_payment';
    } 

    // Handle the 'omitted' default rule: 'full_payment' is omitted. Others are included.
    let payload = {
      sales_order_id: saleIdForAPI,
      amount: amountToPay,
      paid_at: paymentForm.paid_at,
    };

    // Include 'type' only if it is NOT 'full_payment'. This handles 'partial_payment'.
    if (finalPaymentType !== 'full_payment') {
        payload.type = finalPaymentType;
    }


    // ✅ SweetAlert confirmation before proceeding
    const confirm = await Swal.fire({
      title: "Confirm Payment",
      text: `Do you want to record a ${finalPaymentType.toUpperCase().replace('_', ' ')} Payment of ${amountToPay.toFixed(2)} BDT for Order #${saleIdForAPI}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: finalPaymentType === 'full_payment' ? "#22c55e" : "#1d4ed8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, record payment!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return; // User canceled

    setIsSubmitting(true);
    const endpoint = `sales-orders/${saleIdForAPI}/payments`;
    
    console.log("PAYLOAD SENT:", payload); // Log the final payload for verification

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        // ✅ Success logic: Display message and redirect to the previous page
        toast.success(`✅ ${finalPaymentType.toUpperCase().replace('_', ' ')} of ${amountToPay.toFixed(2)} recorded successfully!`);
        navigate(-1, { state: { successMessage: `Payment for Order #${saleIdForAPI} recorded.` } });
        
      } else {
        const errorData = await res.json();
        const errorMessage =
          errorData.message ||
          (errorData.errors && Object.values(errorData.errors).flat().join(', ')) ||
          `Payment submission failed for Order #${saleIdForAPI}`;
        throw new Error(errorMessage);
      }

    } catch (err) {
      console.error("❌ Payment Submission Failed:", err);
      toast.error(`Error processing payment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  const displayTotal = Number(totalOrderAmount || 0).toLocaleString();
  const isFullyPaid = Number(remainingBalanceDue) <= 0;

  if (!saleIdForAPI) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="p-8">
            <h1 className="text-3xl font-bold text-red-600">Error: Missing Sales Order ID</h1>
            <p className="mt-4 text-gray-600">
              The page could not load because the necessary Sales Order details were not passed.
            </p>
          </main>
        </div>
      </div>
    );
  }

  // Determine if the amount/type combination suggests a full payment for rendering hints
  const isFullPaymentSelected = paymentForm.type === 'full_payment' || 
                               (Number(paymentForm.amount) >= Number(remainingBalanceDue) && Number(remainingBalanceDue) > 0);
  
  const paymentTypeHint = paymentForm.type;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Record Sales Order Payment 💰</h1>
              <p className="text-gray-500 mt-1">
                <strong>Sale Order ID:</strong>{" "}
                <span className="text-green-600 font-bold ml-2">{saleIdForAPI}</span> |
                <strong className="ml-2">Total Order Value:</strong>{" "}
                <span className="font-bold">{displayTotal} BDT</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-extrabold text-blue-700 mb-6 border-b pb-3 flex items-center">
                <FaCoins className="mr-3" /> Current Balance Status
              </h2>
              
              {isLoading ? (
                <p className="text-center text-gray-500 py-6">Loading payment status...</p>
              ) : isFullyPaid ? (
                <p className="text-center text-green-600 font-medium py-6 border border-green-200 bg-green-50 rounded-lg">
                  ✅ The Sales Order has been **fully paid**.
                </p>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-lg font-bold text-blue-700 flex items-center">
                        <FaMoneyBillWave className="mr-2"/> Remaining Order Balance Due: 
                        <span className="ml-2 text-2xl text-red-600">
                           {remainingBalanceDue} BDT
                        </span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Payment Amount (BDT) */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Amount (BDT) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={paymentForm.amount}
                        onChange={handlePaymentChange}
                        className={`w-full border-gray-300 rounded-lg shadow-sm text-lg p-3 ${isFullPaymentSelected ? 'border-green-500 ring-green-500' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                        min="0.01"
                        step="0.01"
                        max={remainingBalanceDue}
                        required
                        disabled={isSubmitting}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Max amount you can record is **{remainingBalanceDue} BDT**.
                      </p>
                    </div>
                    
                    {/* Payment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Type *
                      </label>
                      <select
                        name="type"
                        value={paymentForm.type}
                        onChange={handlePaymentChange}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="partial_payment">Partial Payment</option>
                        <option value="full_payment">Full Payment (Final)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500 flex items-center">
                        {isFullPaymentSelected ? (
                            <><FaCheckCircle className="mr-1 text-green-500" /> **{paymentTypeHint.toUpperCase().replace('_', ' ')}** chosen. The 'type' field will be **omitted** (defaults to full).</>
                        ) : (
                            <><FaExchangeAlt className="mr-1 text-blue-500" /> **{paymentTypeHint.toUpperCase().replace('_', ' ')}** chosen. The 'type' field will be **included** in the API payload.</>
                        )}
                      </p>
                    </div>

                    {/* Date Paid At */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Paid At *
                      </label>
                      <input
                        type="date"
                        name="paid_at"
                        value={paymentForm.paid_at}
                        onChange={handlePaymentChange}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {/* Payment Method (UI only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        name="method"
                        value={paymentForm.method}
                        onChange={handlePaymentChange}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>

                    {/* Reference/Transaction ID (UI only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference/Transaction ID
                      </label>
                      <input
                        type="text"
                        name="reference"
                        value={paymentForm.reference}
                        onChange={handlePaymentChange}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Bank Ref #12345"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || Number(paymentForm.amount) <= 0}
                      className={`px-8 py-3 rounded-full font-bold text-lg text-white shadow-lg hover:shadow-xl flex items-center transition-all duration-300 ${isFullPaymentSelected 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500'
                      }`}
                    >
                      {isSubmitting ? (
                        <>Processing Payment...</>
                      ) : (
                        <>
                          <FaMoneyBillWave className="mr-2" /> Record Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalesOrderPaymentRecording;