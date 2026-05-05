import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineReload, AiOutlinePlus } from "react-icons/ai";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

const WithdrawalHistory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);

  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    method: "",
    account_no: "",
    account_name: "",
    note: "",
  });

  const token = localStorage.getItem("token");

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/withdrawals",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data || []);
      } else {
        toast.error("Failed to load withdrawals");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching withdrawals");
    }
    setLoading(false);
  };



  useEffect(() => {
    if (token) {
      fetchWithdrawals();

    }
  }, [token]);

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate amount
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    toast.error("Please enter a valid amount");
    return;
  }

  try {
    const payload = {
      amount: parseFloat(formData.amount),
      method: formData.method,       // bkash, nagad, rocket, bank
      account_no: formData.account_no,
      account_name: formData.account_name,
      note: formData.note || "",
    };

    const res = await fetch(
      "https://pleasurebd.com/pleasure-backend/public/api/v1/withdrawals",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",  // Added Accept header
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Server returned non-JSON response:", text);
      toast.error("Server error. Check console for details.");
      return;
    }

    const data = await res.json();

    if (res.ok) {
      toast.success("Withdrawal request submitted!");
      setModalOpen(false);
      setFormData({
        amount: "",
        method: "bkash",
        account_no: "",
        account_name: "",
        note: "",
      });
      fetchWithdrawals();
      // fetchBalance();
    } else {
      toast.error(data.message || "Failed to submit request");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error submitting request");
  }
};




  // Table columns
  const columns = [
    { name: "SL NO", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Amount",
      selector: (row) => `${row.amount} ৳`,
    },
    {
      name: "Method",
      selector: (row) => row.method,
      cell: (row) => {
        let bgClass = "bg-gray-500";
        if (row.method === "bkash") bgClass = "bg-purple-500";
        else if (row.method === "nagad") bgClass = "bg-pink-500";
        else if (row.method === "rocket") bgClass = "bg-orange-500";
        else if (row.method === "bank") bgClass = "bg-blue-500";
        return (
          <span className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${bgClass}`}>
            {row.method.charAt(0).toUpperCase() + row.method.slice(1)}
          </span>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => {
        let bgClass = "bg-gray-500";
        if (row.status === "pending") bgClass = "bg-blue-500";
        else if (row.status === "paid") bgClass = "bg-green-500";
        else if (row.status === "rejected") bgClass = "bg-red-500";
        return (
          <span className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${bgClass}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      },
    },
    { name: "Account No", selector: (row) => row.account_no, wrap: true },
    { name: "Account Name", selector: (row) => row.account_name, wrap: true },
    { name: "Note", selector: (row) => row.note, wrap: true },
    {
      name: "Created At",
      selector: (row) => new Date(row.created_at).toLocaleString(),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#0097A7",
        color: "#fff",
        fontWeight: "700",
        border: "1px solid #e2e8f0",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        color: "#374151",
        border: "1px solid #e2e8f0",
      },
    },
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Withdrawal History</h2>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 bg-[#0097A7] hover:bg-[#00838F] text-white px-4 py-2 rounded"
                onClick={() => setModalOpen(true)}
              >
                <AiOutlinePlus /> Withdraw Request
              </button>
              <button
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
                onClick={fetchWithdrawals}
              >
                <AiOutlineReload /> Refresh
              </button>
            
            </div>
          </div>

          {/* Loader or Table */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-12 h-12 border-4 border-[#0097A7] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={withdrawals}
              pagination
              highlightOnHover
              striped
              responsive
              customStyles={customStyles}
            />
          )}

          {/* Withdraw Request Modal */}
          {modalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
                <h3 className="text-xl font-bold mb-4">Withdraw Request</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Amount</label>
                    <input
                      type="number"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Method</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={formData.method}
                      onChange={(e) =>
                        setFormData({ ...formData, method: e.target.value })
                      }
                    >
                      <option value="bkash">Bkash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="bank">Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Account No</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={formData.account_no}
                      onChange={(e) =>
                        setFormData({ ...formData, account_no: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Account Name</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={formData.account_name}
                      onChange={(e) =>
                        setFormData({ ...formData, account_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Note</label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WithdrawalHistory;
