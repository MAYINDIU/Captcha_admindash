import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineReload } from "react-icons/ai";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

const TransactionHistory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState("0.00");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch Wallet (balance + transactions)
  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/wallet/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setBalance(data.balance || "0.00");
        setTransactions(data.transactions || []);
      } else {
        toast.error("Failed to load wallet");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching wallet");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchWallet();
  }, [token]);

  // Table columns
  const columns = [
    {
      name: "SL NO",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Type",
      selector: (row) => row.type,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.type === "credit"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {row.type}
        </span>
      ),
    },
    {
      name: "Amount",
      selector: (row) => `${row.amount} ৳`,
    },
    {
      name: "Transaction Key",
      selector: (row) => row.tx_key,
      wrap: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      wrap: true,
    },
    {
      name: "Created At",
      selector: (row) => new Date(row.created_at).toLocaleString(),
    },
  ];

  // Custom table styles
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
            <h2 className="text-2xl font-semibold">Transaction History</h2>
            <div className="flex items-center gap-3">
              <span className="bg-green-600 text-white px-4 py-2 rounded-md font-medium">
               Total Balance: {balance} ৳
              </span>
              <button
                className="flex items-center gap-2 bg-[#0097A7] hover:bg-[#00838F] text-white px-4 py-2 rounded"
                onClick={fetchWallet}
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
              data={transactions}
              pagination
              highlightOnHover
              striped
              responsive
              customStyles={customStyles}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default TransactionHistory;
