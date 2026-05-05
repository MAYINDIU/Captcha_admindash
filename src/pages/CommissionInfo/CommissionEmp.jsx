import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlinePlus } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";

const CommissionEmp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [totalCommission, setTotalCommission] = useState("0.00");
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const employee = JSON.parse(localStorage.getItem("employee"));
  const emp_id = employee?.id;

  const fetchCommissions = async () => {
    if (!emp_id) {
      toast.error("Employee not found in localStorage!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://pleasurebd.com/pleasure-backend/public/api/v1/employees/${emp_id}/commissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && data.status) {
        setTotalCommission(data.data.total);
        setCommissions(data.data.ledgers.data || []);
      } else {
        toast.error(data.message || "Failed to load commissions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching commissions");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleOrderClick = async (orderId) => {
    try {
      const res = await fetch(
        `https://pleasurebd.com/pleasure-backend/public/api/v1/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && data.data) {
        setSelectedOrder(data.data);
        setOrderModalOpen(true);
      } else {
        toast.error(data.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching order details");
    }
  };

  const statusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "accrued":
      case "completed":
        return "bg-green-600 text-white font-semibold px-3 py-1 rounded-full text-xs";
      case "pending":
        return "bg-yellow-200 text-yellow-900 font-semibold px-3 py-1 rounded-full text-xs";
      case "cancelled":
        return "bg-red-500 text-white font-semibold px-3 py-1 rounded-full text-xs";
      default:
        return "bg-gray-400 text-white font-semibold px-3 py-1 rounded-full text-xs";
    }
  };

  const columns = [
    { name: "SL NO", selector: (row, index) => index + 1, width: "70px" },
    {
      name: "Order ID",
      selector: (row) => row.order_id,
      cell: (row) => (
        <button
          onClick={() => handleOrderClick(row.order_id)}
          className="text-blue-600 font-medium hover:underline"
        >
          {row.order_id}
        </button>
      ),
    },
    { name: "Amount", selector: (row) => `${row.amount} ৳` },
    { name: "Gap Amount", selector: (row) => `${row.gap_amount} ৳` },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => <span className={statusBadge(row.status)}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span>,
    },
    { name: "Note", selector: (row) => row.note, wrap: true },
    { name: "Created At", selector: (row) => new Date(row.created_at).toLocaleString() },
  ];

  const customStyles = {
    headCells: { style: { backgroundColor: "#0097A7", color: "#fff", fontWeight: "700", border: "1px solid #e2e8f0" } },
    cells: { style: { fontSize: "14px", color: "#374151", border: "1px solid #e2e8f0" } },
    rows: { style: { minHeight: "55px" } },
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Earned Commissions</h2>
            <div className="flex items-center gap-3">
              <span className="bg-green-600 text-white px-4 py-2 rounded-md font-medium shadow">
                Total: {totalCommission} ৳
              </span>
              <button
                className="flex items-center gap-2 bg-[#0097A7] hover:bg-[#00796B] text-white px-4 py-2 rounded shadow"
                onClick={fetchCommissions}
              >
                <AiOutlinePlus /> Refresh
              </button>
            </div>
          </div>

          {/* Loader or Table */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <DataTable columns={columns} data={commissions} pagination highlightOnHover striped responsive customStyles={customStyles} />
          )}

          {/* Order Modal */}
          {orderModalOpen && selectedOrder && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] animate-fadeIn">

                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#0097A7] to-[#00796B] px-6 py-4 flex justify-between items-center rounded-t-xl">
                  <h3 className="text-xl font-bold text-white">Order Details</h3>
                  <button onClick={() => setOrderModalOpen(false)} className="text-white text-lg hover:text-gray-200">✕</button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">

                  {/* Order Info */}
                  <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-blue-700 mb-2">Order Information</h4>
                    <p><strong>Order No:</strong> {selectedOrder.order_no}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={statusBadge(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </p>
                    <p><strong>Total Amount:</strong> {selectedOrder.total_amount} ৳</p>
                    <p><strong>Order Type:</strong> {selectedOrder.order_type}</p>
                    <p><strong>Created At:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>

                  {/* Membership Info */}
                  <div className="mb-6 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-indigo-700 mb-2">Membership</h4>
                    <p><strong>No:</strong> {selectedOrder.membership?.membership_no}</p>
                    <p><strong>Status:</strong> {selectedOrder.membership?.status}</p>
                  </div>

                  {/* Items */}
                  <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-green-700 mb-2">Items</h4>
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-[#0097A7] text-white">
                        <tr>
                          <th className="p-2 text-left">Plan</th>
                          <th className="p-2 text-left">Qty</th>
                          <th className="p-2 text-left">Unit Price</th>
                          <th className="p-2 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                            <td className="p-2">{item.plan_name} ({item.plan_code})</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">{item.unit_price} ৳</td>
                            <td className="p-2 font-semibold">{item.amount} ৳</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 flex justify-end bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => setOrderModalOpen(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium shadow-md"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default CommissionEmp;
