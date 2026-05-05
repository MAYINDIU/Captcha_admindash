import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// NOTE: Since I cannot access your specific partials, I'll assume they are available or define placeholders if necessary.
// For demonstration, I will use generic component names instead of importing partials like "../../partials/Sidebar".
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header"; 


import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { FaMoneyBillWave, FaArrowDown, FaListOl } from 'react-icons/fa';

// ----------------------------------------------------------------------
// API Configuration
// ----------------------------------------------------------------------
// IMPORTANT: Replace with your actual configuration in a real environment
const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/";
const API_TOKEN = localStorage.getItem("authToken");
// ----------------------------------------------------------------------

const Agent_installment_Payment = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // console.log(paymentHistory)
  // NEW STATE: To toggle between 'down_payment' and 'installment'
  const [paymentType, setPaymentType] = useState('installment'); 

  const [paymentForm, setPaymentForm] = useState({
    paid_at: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'cash',
    installment_id: '',
    reference: '',
  });

  const salesOrderObject = location.state?.salesOrderId;
  const saleIdForAPI = salesOrderObject?.id;
  const totalAmount = salesOrderObject?.total;
  const downPaymentAmount = salesOrderObject?.down_payment;
  
  // ----------------------------------------------------------------------
  // React Query: Fetch Data
  // ----------------------------------------------------------------------

  // 1. Fetch Payment History (Filtered for Down Payments)
  const { data: paymentHistory = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments', saleIdForAPI],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}payments`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_TOKEN}`,
          "Accept": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      // Filter by BOTH sales_order_id AND payment type
      return data?.data?.filter((payment) => 
        Number(payment?.sales_order_id) === Number(saleIdForAPI) && 
        payment?.type === "down_payment"
      ) || [];
    },
    enabled: !!saleIdForAPI,
  });

  // 2. Fetch Installments
  const { data: installments = [], isLoading: isLoadingInstallments } = useQuery({
    queryKey: ['installments', saleIdForAPI],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}installments?sales_order_id=${saleIdForAPI}`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to fetch installments.");
      const data = await res.json();
      return data?.data || [];
    },
    enabled: !!saleIdForAPI,
  });

  // Calculate remaining down payment based on history
  const totalDownPaymentPaid = paymentHistory?.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remainingDownPaymentDue = Math.max(0, Number(downPaymentAmount || 0) - totalDownPaymentPaid).toFixed(2);

  // ----------------------------------------------------------------------
  // Initialize Form State when Data Loads
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!saleIdForAPI) {
      toast.error("Sales Order ID is missing. Redirecting to sale creation.");
      navigate('/agent-create-sales');
      return;
    }

    // Only initialize if installments are loaded and form hasn't been set yet (or if we want to reset on load)
    if (installments.length > 0 && !paymentForm.installment_id) {
      const isDPPaid = Number(remainingDownPaymentDue) <= 0;
      const firstDueInstallment = installments.find(inst => Number(inst.amount) > Number(inst.paid));
      const initialType = !isDPPaid ? 'down_payment' : (firstDueInstallment ? 'installment' : 'down_payment');
      
      let initialInstallmentId = '';
      let initialAmount = '';

      if (initialType === 'installment' && firstDueInstallment) {
        initialInstallmentId = firstDueInstallment.id;
        initialAmount = (Number(firstDueInstallment.amount) - Number(firstDueInstallment.paid)).toFixed(2);
      } else if (installments.length > 0) {
        initialInstallmentId = installments[0].id;
        initialAmount = remainingDownPaymentDue;
      }

      setPaymentType(initialType);
      setPaymentForm(prev => ({
        ...prev,
        installment_id: initialInstallmentId,
        amount: initialAmount,
      }));
    }
  }, [saleIdForAPI, navigate, installments, remainingDownPaymentDue, paymentForm.installment_id]);

  // ----------------------------------------------------------------------
  // Form Handlers
  // ----------------------------------------------------------------------
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => {
      let newForm = { ...prev, [name]: value };
      
      // Logic for changing the selected installment (only in 'installment' mode)
      if (paymentType === 'installment' && name === 'installment_id' && value) {
        const selectedInst = installments.find(inst => inst.id === Number(value));
        if (selectedInst) {
          const remainingDue = (Number(selectedInst.amount) - Number(selectedInst.paid));
          newForm.amount = remainingDue.toFixed(2);
        }
      }
      
      return newForm;
    });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setPaymentType(newType);
    
    // Reset or set default amount/installment ID based on the new type
    setPaymentForm(prev => {
      let newForm = { ...prev, amount: '' };
      
      if (newType === 'down_payment') {
        // Set default amount to the full required down payment (or remaining DP, if calculated)
        newForm.amount = remainingDownPaymentDue; 
        // Use the first installment ID for the required allocation structure (amount: 0)
        newForm.installment_id = installments[0]?.id || ''; 
      } else if (newType === 'installment') {
        // Find the first due installment and set it as default
        const firstDue = installments.find(inst => Number(inst.amount) > Number(inst.paid));
        if (firstDue) {
          newForm.installment_id = firstDue.id;
          newForm.amount = (Number(firstDue.amount) - Number(firstDue.paid)).toFixed(2);
        } else {
          newForm.installment_id = '';
          newForm.amount = '';
        }
      }
      return newForm;
    });
  };

  // ----------------------------------------------------------------------
  // React Query Mutation: Submit Payment
  // ----------------------------------------------------------------------
  const paymentMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${BASE_URL}sales-orders/${saleIdForAPI}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // console.log("Payment Submission Response:", JSON.stringify(payload));


      if (res.status !== 201) {
        const errorData = await res.json();
        throw new Error(errorData.message || (errorData.errors && Object.values(errorData.errors).flat().join(', ')) || "Payment failed");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`✅ ${variables.type === 'down_payment' ? 'Down Payment' : 'Installment'} recorded successfully!`);
      queryClient.invalidateQueries(['payments', saleIdForAPI]);
      queryClient.invalidateQueries(['installments', saleIdForAPI]);
      navigate('/agent-sale-list');
    },
    onError: (err) => {
      console.error("Payment Submission Failed:", err);
      toast.error(`Error processing payment: ${err.message}`);
    }
  });

  // ----------------------------------------------------------------------
  // Submit Payment (with confirmation)
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

    let confirmationText = '';
    let allocationPayload = [];

    if (paymentType === 'down_payment') {
      // Down Payment specific validation
      if (amountToPay > Number(remainingDownPaymentDue) + 0.001) {
        toast.error(`Payment cannot exceed the remaining down payment due (${remainingDownPaymentDue} BDT).`);
        return;
      }
      confirmationText = `Do you want to record a DOWN PAYMENT of ${amountToPay.toFixed(2)} BDT?`;
      
    } else { // Installment Payment
      const selectedInst = installments.find(inst => inst.id === Number(paymentForm.installment_id));
      if (!selectedInst) {
        toast.error("Invalid installment selected.");
        return;
      }
      
      const remainingDue = Number(selectedInst.amount) - Number(selectedInst.paid);
      if (amountToPay > remainingDue + 0.001) {
        toast.error(`Payment must be positive and ≤ remaining due (${remainingDue.toFixed(2)}).`);
        return;
      }
      
      confirmationText = `Do you want to record an INSTALLMENT PAYMENT of ${amountToPay.toFixed(2)} BDT?`;

      // Installment Allocation Structure: amount is the amount paid
      allocationPayload = [
        {
          installment_id: Number(paymentForm.installment_id),
          amount: amountToPay,
        },
      ];
    }
    
    // ✅ SweetAlert confirmation before proceeding
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: confirmationText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, make payment!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return; // User canceled

    const payload = {
      paid_at: paymentForm.paid_at,
      amount: amountToPay,
      type: paymentType, // Dynamically set type: 'down_payment' or 'installment'
      method: paymentForm.method,
      meta: {
        reference: paymentForm.reference || null,
      },
    };

    if (paymentType === 'installment') {
      payload.allocations = allocationPayload;
    }

    paymentMutation.mutate(payload);
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  if (!saleIdForAPI) {
    // Error handling block (kept as-is)
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

  const displayTotal = Number(totalAmount || 0).toLocaleString();
  const hasDueInstallments = installments?.some(inst => Number(inst.amount) > Number(inst.paid));
  const isDownPaymentFullyPaid = Number(remainingDownPaymentDue) <= 0;

  // Determine if the form should be enabled at all
  const isFormDisabled = (paymentType === 'down_payment' && isDownPaymentFullyPaid) || 
                         (paymentType === 'installment' && !hasDueInstallments);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark dark:text-white">Payment Recording 💵</h1>
              <p className="text-gray-500 mt-1">
                <strong>Base Sale Order ID:</strong>{" "}
                <span className="text-green-600 font-bold ml-2">{saleIdForAPI}</span> |
                <strong className="ml-2">Total Order Value:</strong>{" "}
                <span className="font-bold">{displayTotal} BDT</span>
              </p>
              <p className="text-gray-500">
                <strong className="ml-2">Initial Down Payment Required:</strong>{" "}
                <span className={`font-bold ${isDownPaymentFullyPaid ? 'text-green-500' : 'text-orange-500'}`}>
                    {remainingDownPaymentDue} BDT {isDownPaymentFullyPaid && "(PAID)"}
                </span>
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-extrabold text-green-700 mb-6 border-b pb-3 flex items-center">
                <FaMoneyBillWave className="mr-3" /> Select Payment Type
              </h2>
              
              {/* === Radio Buttons for Payment Type === */}
              <div className="flex space-x-8 mb-8 p-4 bg-green-50 rounded-xl">
                <label className="flex items-center text-lg font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="down_payment"
                    checked={paymentType === 'down_payment'}
                    onChange={handleTypeChange}
                    disabled={paymentMutation.isLoading || isDownPaymentFullyPaid}
                    className="form-radio h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="ml-3 flex items-center">
                    <FaArrowDown className={`text-xl mr-2 ${isDownPaymentFullyPaid ? 'text-gray-400' : 'text-red-500'}`}/> 
                    Down Payment {isDownPaymentFullyPaid && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Paid</span>}
                  </span>
                </label>
                
                <label className="flex items-center text-lg font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="installment"
                    checked={paymentType === 'installment'}
                    onChange={handleTypeChange}
                    disabled={paymentMutation.isLoading || !isDownPaymentFullyPaid}
                    className={`form-radio h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500 ${!isDownPaymentFullyPaid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <span className={`ml-3 flex items-center ${!isDownPaymentFullyPaid ? 'text-gray-400' : ''}`}>
                    <FaListOl className="text-xl text-green-600 mr-2"/> Installment Payment
                    {!isDownPaymentFullyPaid && <span className="text-xs text-red-500 ml-2 font-bold">(Down Payment Required First)</span>}
                  </span>
                </label>
              </div>

              {/* === Dynamic Form Content === */}
              {isLoadingInstallments ? (
                <p className="text-center text-gray-500 py-6">Loading payment details...</p>
              ) : isFormDisabled ? (
                <p className="text-center text-indigo-600 font-medium py-6 border border-indigo-200 bg-indigo-50 rounded-lg">
                    {paymentType === 'down_payment' 
                      ? "🎉 The initial Down Payment has been fully recorded."
                      : "🎉 All scheduled Installments have been fully paid!"}
                </p>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Select Due Installment (Only visible for 'installment' type) */}
                    {paymentType === 'installment' && (
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Due Installment *
                        </label>
                      <select
  name="installment_id"
  value={paymentForm.installment_id}
  onChange={handlePaymentChange}
  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
  required={paymentType === 'installment'}
  disabled={paymentMutation.isLoading || paymentType === 'down_payment'}
>
  <option value="">-- Select Due Installment --</option>
  {installments
    .filter(inst => Number(inst.amount) > Number(inst.paid))
    .map((inst, index) => { // Added index here
      const remainingDue = (
        Number(inst.amount) - Number(inst.paid)
      ).toFixed(2);
      
      return (
        <option key={inst.id} value={inst.id}>
          {/* index + 1 creates the serial 1, 2, 3... */}
          Installment #{index + 1} | Due: {remainingDue} BDT | Date: {inst.due_date}
        </option>
      );
    })}
</select>
                      </div>
                    )}
                    
                    {/* Payment Amount (BDT) */}
                    <div className={paymentType === 'down_payment' ? "lg:col-span-4" : "lg:col-span-2"}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {paymentType === 'down_payment' ? 'Down Payment Amount (BDT)' : 'Installment Amount (BDT)'} *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={paymentForm.amount}
                        onChange={handlePaymentChange}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                        min="0.01"
                        step="0.01"
                        required
                        disabled={paymentMutation.isLoading}
                      />
                      {paymentType === 'down_payment' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Max payable amount for Down Payment: {remainingDownPaymentDue} BDT (Total required: {downPaymentAmount} BDT)
                        </p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method *
                      </label>
                      <select
                        name="method"
                        value={paymentForm.method}
                        onChange={handlePaymentChange}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                        required
                        disabled={paymentMutation.isLoading}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
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
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                        required
                        disabled={paymentMutation.isLoading}
                      />
                    </div>

                    {/* Reference/Transaction ID */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference/Transaction ID
                      </label>
                      <input
                        type="text"
                        name="reference"
                        value={paymentForm.reference}
                        onChange={handlePaymentChange}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Bank Ref #12345"
                        disabled={paymentMutation.isLoading}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end">
                    <button
                      type="submit"
                      disabled={paymentMutation.isLoading || Number(paymentForm.amount) <= 0 || (paymentType === 'installment' && !paymentForm.installment_id)}
                      className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl flex items-center"
                    >
                      {paymentMutation.isLoading ? (
                        <>Processing Payment...</>
                      ) : (
                        <>
                          <FaMoneyBillWave className="mr-2" /> Record {paymentType === 'down_payment' ? 'Down Payment' : 'Installment'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Down Payment History Table */}
            {paymentHistory.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Down Payment History</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paymentHistory.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paid_at}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{Number(payment.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{payment.method}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Installments Table (Optional - for visibility) */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Installment Breakdown</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {installments?.map((inst) => {
                                const remainingDue = (Number(inst.amount) - Number(inst.paid)).toFixed(2);
                                const status = Number(remainingDue) <= 0 ? 'Paid' : 'Due';
                                return (
                                    <tr key={inst.id} className={Number(remainingDue) > 0 ? 'bg-yellow-50/50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inst.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inst.due_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{Number(inst.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{Number(inst.paid).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-bold">{remainingDue}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Agent_installment_Payment;
