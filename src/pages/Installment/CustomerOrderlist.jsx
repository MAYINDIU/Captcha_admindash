import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";



const CustomerOrderlist = () => {
  const BASE_URL =
  "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/customer/sales-orders";
const API_TOKEN = localStorage.getItem("authToken");
console.log(API_TOKEN)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    });
  };

  const fetchOrders = async (url = `${BASE_URL}`) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch sales orders");

      const data = await res.json();
      setOrders(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
      });
    } catch (err) {
      console.error(err);
      toast.error("Error fetching sales orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleNext = () => {
    if (pagination.next_page_url) fetchOrders(pagination.next_page_url);
  };

  const handlePrev = () => {
    if (pagination.prev_page_url) fetchOrders(pagination.prev_page_url);
  };

  const StatusBadge = ({ status }) => {
    const statusText = status ? status.toUpperCase() : "UNKNOWN";
    let classes = "";
    switch (status) {
      case "paid":
        classes = "bg-emerald-100 text-emerald-800 border-emerald-300";
        break;
      case "due":
        classes = "bg-amber-100 text-amber-800 border-amber-300";
        break;
      case "overdue":
        classes = "bg-red-100 text-red-800 border-red-300";
        break;
      default:
        classes = "bg-gray-100 text-gray-600 border-gray-300";
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${classes}`}
      >
        {statusText}
      </span>
    );
  };

  // Compute total summary across all orders
  const summaryTotals = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    orders.forEach((order) => {
      order.installments?.forEach((inst) => {
        totalDue += Number(inst.amount || 0);
        totalPaid += Number(inst.paid || 0);
      });
    });
    return {
      totalDue,
      totalPaid,
      totalRemaining: totalDue - totalPaid,
    };
  }, [orders]);

  const { totalDue, totalPaid, totalRemaining } = summaryTotals;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 bg-gray-100 min-h-screen">
          <ToastContainer />
          <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-8">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">
              <span className="text-green-600 mr-2">🧾</span> Customer Sales
              Orders & Installments
            </h1>

            {/* Summary Cards */}
            {!loading && orders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 border-l-4 border-red-500 rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Scheduled Dues
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatAmount(totalDue)}
                    </p>
                  </div>
                  <CalendarDaysIcon className="w-8 h-8 text-red-400 opacity-50" />
                </div>

                <div className="bg-gray-50 border-l-4 border-green-500 rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Payments Made
                    </p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {formatAmount(totalPaid)}
                    </p>
                  </div>
                  <BanknotesIcon className="w-8 h-8 text-green-400 opacity-50" />
                </div>

                <div className="bg-gray-50 border-l-4 border-amber-500 rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Balance Remaining
                    </p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        totalRemaining > 0
                          ? "text-amber-700"
                          : "text-gray-700"
                      }`}
                    >
                      {formatAmount(totalRemaining)}
                    </p>
                  </div>
                  <BanknotesIcon className="w-8 h-8 text-amber-400 opacity-50" />
                </div>
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                <p className="text-lg text-gray-600">
                  Fetching sales orders...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-red-50">
                <p className="text-xl font-medium text-red-600">
                  No sales orders found. 😔
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please check your API connection or token.
                </p>
              </div>
            ) : (
              <>
                {orders.map((order, index) => (
                  <div
                    key={order.id}
                    className="mb-10 border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="bg-green-600 text-white px-6 py-3 rounded-t-lg flex justify-between">
                      <div>
                        <h2 className="font-semibold">
                          Order #{order.id} — {order.status.toUpperCase()}
                        </h2>
                        <p className="text-sm text-green-100">
                          Total: {formatAmount(order.total)} | Down Payment:{" "}
                          {formatAmount(order.down_payment)}
                        </p>
                      </div>
                      <span className="text-sm opacity-90">
                        Rank: {order.rank || "-"}
                      </span>
                    </div>

                    {/* Installment Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left">SL</th>
                            <th className="px-4 py-3 text-left">
                              Installment ID
                            </th>
                            <th className="px-4 py-3 text-left">Due Date</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-left">Paid At</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {order.installments?.map((inst, i) => (
                            <tr key={inst.id}>
                              <td className="px-4 py-3">{i + 1}</td>
                              <td className="px-4 py-3">#{inst.id}</td>
                              <td className="px-4 py-3">
                                {formatDate(inst.due_date)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {formatAmount(inst.amount)}
                              </td>
                              <td className="px-4 py-3 text-right text-green-600">
                                {formatAmount(inst.paid)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={inst.status} />
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {inst.status === "paid" ? formatDateTime(inst.updated_at) : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

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
                    <span className="text-green-600">
                      {pagination.last_page}
                    </span>
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

export default CustomerOrderlist;
