import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { AiOutlineReload, AiOutlineEye } from "react-icons/ai";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const Payoutlist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch withdrawals and filter batched only
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/admin/withdrawals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("Withdrawals API:", data);

      if (res.ok) {
        const allWithdrawals = data.data || [];
        const batchedList = allWithdrawals.filter(
          (item) => item.status === "batched"
        );
        setWithdrawals(batchedList);
      } else {
        toast.error(data.message || "Failed to load withdrawals");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching withdrawals");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchWithdrawals();
  }, [token]);

  const handleViewDetails = (row) => {
    setSelectedWithdrawal(row);
    setDetailModal(true);
  };

  const handleMarkPaid = async (row) => {
    // Console log required fields
    console.log("Withdrawal Data:", {
      id: row.id,
      user_id: row.user_id,
      amount: row.amount,
      status: row.status,
      method: row.method,
    });

    Swal.fire({
      title: "Are you sure?",
      html: `
        <div class="text-left">
          <p><strong>Payout Batch ID:</strong> ${row.id}</p>
          <p><strong>User ID:</strong> ${row.user_id}</p>
          <p><strong>Amount:</strong> ${row.amount} ৳</p>
          <p><strong>Status:</strong> ${row.status}</p>
          <p><strong>Method:</strong> ${row.method}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#078da7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Mark Paid",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(true);
        try {
          const res = await fetch(
            `https://pleasurebd.com/pleasure-backend/public/api/v1/admin/payout-batches/${row.id}/mark-paid`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                id: row.id,
                amount: row.amount,
              }),
            }
          );

          const data = await res.json();
          if (res.ok) {
            toast.success(
              data.message || `Payout Batch #${row.id} marked as Paid`
            );
            fetchWithdrawals(); // refresh list
          } else {
            toast.error(data.message || "Failed to mark paid");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error marking as paid");
        }
        setActionLoading(false);
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-500 text-white";
      case "completed":
        return "bg-green-600 text-white";
      case "failed":
        return "bg-red-600 text-white";
      case "batched":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const columns = [
    { name: "SL NO", selector: (row, index) => index + 1, width: "70px" },
    { name: "Withdrawal ID", selector: (row) => row.id, grow: 1 },
    { name: "User ID", selector: (row) => row.user_id, grow: 1 },
    {
      name: "Amount",
      selector: (row) => `${row.amount} ৳`,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
      grow: 1,
    },
    {
      name: "Created At",
      selector: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-2 rounded-full bg-[#078da7ff] hover:bg-[#056f85] text-white text-lg transition-all duration-200"
          >
            <AiOutlineEye />
          </button>
          <button
            onClick={() => handleMarkPaid(row)}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
              actionLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {actionLoading ? "Processing..." : "Mark Paid"}
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "220px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#078da7ff",
        color: "#fff",
        fontWeight: "700",
        fontSize: "15px",
        border: "1px solid #E2E8F0",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        color: "#4A5568",
        border: "1px solid #E2E8F0",
        padding: "12px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:nth-of-type(odd)": {
          backgroundColor: "#F3F4F6",
        },
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-6 md:p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Page Header */}
          <div className="mb-6 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-sm flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaMoneyCheckAlt /> Batched Withdrawals
            </h2>
            <button
              className="flex items-center justify-center gap-2 bg-[#078da7ff] hover:bg-[#056f85] text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              onClick={fetchWithdrawals}
            >
              <AiOutlineReload /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="w-16 h-16 border-4 border-[#078da7ff] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
              <DataTable
                columns={columns}
                data={withdrawals}
                pagination
                highlightOnHover
                striped
                responsive
                customStyles={customStyles}
                noHeader={true}
                persistTableHead={true}
              />
            </div>
          )}

          {/* Detail Modal */}
          {detailModal && selectedWithdrawal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-2">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Withdrawal #{selectedWithdrawal.id}
                  </h3>
                  <button
                    onClick={() => setDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <p>
                    <strong>User ID:</strong> {selectedWithdrawal.user_id}
                  </p>
                  <p>
                    <strong>Amount:</strong> {selectedWithdrawal.amount} ৳
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-3 py-1 rounded-full ${getStatusColor(
                        selectedWithdrawal.status
                      )}`}
                    >
                      {selectedWithdrawal.status}
                    </span>
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(selectedWithdrawal.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Method:</strong> {selectedWithdrawal.method}
                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setDetailModal(false)}
                    className="bg-gray-600 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-700"
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

export default Payoutlist;
