import React, { useEffect, useState } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
} from "@heroicons/react/24/solid";



const CustomerPaymentHistory = () => {
  const BASE_URL =
  "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/customer/payments";
const API_TOKEN = localStorage.getItem("authToken");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  const fetchPayments = async (url = BASE_URL) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch payment history");

      const data = await res.json();
      setPayments(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
      });
    } catch (err) {
      console.error(err);
      toast.error("Error fetching payment history!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    });
  };

  const handleNext = () => {
    if (pagination.next_page_url) fetchPayments(pagination.next_page_url);
  };

  const handlePrev = () => {
    if (pagination.prev_page_url) fetchPayments(pagination.prev_page_url);
  };

  const totalPaid = payments.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 bg-gray-100 min-h-screen">
          <ToastContainer />
          <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-8">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">
              <span className="text-green-600 mr-2">💰</span> Customer Payment
              History
            </h1>

            {/* Summary Card */}
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Paid Amount
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {formatAmount(totalPaid)}
                </p>
              </div>
              <BanknotesIcon className="w-8 h-8 text-green-400 opacity-60" />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                <p className="text-lg text-gray-600">
                  Loading payment history...
                </p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-red-50">
                <p className="text-xl font-medium text-red-600">
                  No payment records found 😔
                </p>
              </div>
            ) : (
              <>
                {/* Payment Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Order ID</th>
                        <th className="px-4 py-3 text-left">Payment Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-left">Method</th>
                        <th className="px-4 py-3 text-left">Reference</th>
                        <th className="px-4 py-3 text-left">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {payments.map((payment, index) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-green-700">
                            #{payment.sales_order_id}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(payment.paid_at)}
                          </td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">
                            {formatAmount(payment.amount)}
                          </td>
                          <td className="px-4 py-3 capitalize">
                            {payment.method || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {payment.meta?.reference || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(payment.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 p-3 bg-white border border-gray-200 rounded-xl">
                  <button
                    onClick={handlePrev}
                    disabled={!pagination.prev_page_url}
                    className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ease-in-out ${
                      pagination.prev_page_url
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-sm font-semibold text-gray-700">
                    Page{" "}
                    <span className="text-green-600">
                      {pagination.current_page}
                    </span>{" "}
                    of{" "}
                    <span className="text-green-600">{pagination.last_page}</span>
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={!pagination.next_page_url}
                    className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ease-in-out ${
                      pagination.next_page_url
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerPaymentHistory;
