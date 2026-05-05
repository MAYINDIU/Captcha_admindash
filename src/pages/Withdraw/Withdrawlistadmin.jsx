import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineReload, AiOutlineEye } from "react-icons/ai";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";
import { FaMoneyCheckAlt } from "react-icons/fa"; // payout icon
import { useNavigate } from "react-router-dom";

// Helper function to get status colors for the DataTable rows
const getTableStatusColorClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-blue-500";
    case "paid":
      return "bg-green-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const Withdrawlistadmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutBatches, setPayoutBatches] = useState([]);
  const [loadingPayout, setLoadingPayout] = useState(false);

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  console.log(token)

  // Fetch withdrawals
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
      if (res.ok) {
        setWithdrawals(data.data || []);
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

  // Approve withdrawal
  const handleApprove = async (id) => {
    try {
      const res = await fetch(
        `https://pleasurebd.com/pleasure-backend/public/api/v1/admin/withdrawals/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Withdrawal approved");
        fetchWithdrawals();
      } else {
        toast.error(data.message || "Failed to approve");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving withdrawal");
    }
  };

  // Decline withdrawal
  const handleDecline = async (id) => {
    try {
      const res = await fetch(
        `https://pleasurebd.com/pleasure-backend/public/api/v1/admin/withdrawals/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Withdrawal declined");
        fetchWithdrawals();
      } else {
        toast.error(data.message || "Failed to decline");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error declining withdrawal");
    }
  };

  // View withdrawal details
  const handleViewDetails = (row) => {
    setSelectedWithdrawal(row);
    setDetailModal(true);
  };

  // === Payout batches ===
  const fetchPayoutBatches = async () => {
    setLoadingPayout(true);
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/admin/payout-batches",
        {
          method: "POST", // backend অনুযায়ী POST
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await res.json();
 
      if (res.ok) {
        // যেহেতু object আসছে, তাই একে array বানালাম
        setPayoutBatches([data]);
        setPayoutModal(true);
      } else {
        toast.error(data.message || "Failed to load payout batches");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching payout batches");
    }
    setLoadingPayout(false);
  };

const handleMarkPaid = async (batchId) => {
  try {
    const res = await fetch(
      `https://pleasurebd.com/pleasure-backend/public/api/v1/admin/payout-batches/${batchId}/mark-paid`,
      {
        method: "POST", // যদি backend PATCH/PUT চায় তাহলে সেটা দিন
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status: "paid" }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success("Marked as Paid");
      fetchPayoutBatches(); // refresh
      setPayoutModal(false); // ✅ modal close
    } else {
      toast.error(data.message || "Failed to mark paid");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error marking paid");
  }
};


  const handlePayoutClick = () => {
    fetchPayoutBatches();
  };

  // Withdrawals table columns
  const columns = [
    { name: "SL NO", selector: (row, index) => index + 1, width: "70px" },
    {
      name: "User Name",
      selector: (row) => row.user?.name || "N/A",
      wrap: true,
      grow: 2,
    },
    {
      name: "Employee Code",
      selector: (row) => row.user?.employee?.employee_code || "N/A",
      wrap: true,
      grow: 2,
    },
    {
      name: "Rank",
      selector: (row) => row.user?.employee?.rank?.name || "N/A",
      wrap: true,
      grow: 2,
    },
    {
      name: "Amount",
      selector: (row) => `${row.amount} ৳`,
      sortable: true,
      grow: 1,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getTableStatusColorClass(
            row.status
          )} w-24 text-center`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
      grow: 1,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex flex-wrap gap-2 py-2 items-center">
          {row.status === "pending" && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="px-3 py-1 rounded-full text-white text-sm bg-green-600 hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(row.id)}
                className="px-3 py-1 rounded-full text-white text-sm bg-red-600 hover:bg-red-700"
              >
                Decline
              </button>
            </>
          )}
          <button
            onClick={() => handleViewDetails(row)}
            className="p-2 rounded-full bg-[#078da7ff] hover:bg-[#056f85] text-white text-lg"
          >
            <AiOutlineEye />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "200px",
    },
  ];

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesStatus =
      filterStatus === "all" || withdrawal.status === filterStatus;
    const matchesSearch =
      (withdrawal.user?.employee?.employee_code || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (withdrawal.user?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (withdrawal.user?.email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (withdrawal.user?.phone || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
    pagination: {
      style: {
        borderTop: "1px solid #E2E7EB",
        backgroundColor: "#E5E7EB",
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto bg-gray-50">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-6 md:p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Page Header and Controls */}
          <div className="mb-6 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Withdrawal History
              </h2>
              <div className="flex flex-col md:flex-row items-stretch gap-4">
                <input
                  type="text"
                  placeholder="Search by Employee Code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  className="flex items-center gap-2 bg-[#078da7ff] text-white px-4 py-2 rounded-lg shadow-md"
                  onClick={fetchWithdrawals}
                >
                  <AiOutlineReload /> Refresh
                </button>
                <button
                  className="flex items-center gap-2 bg-[#078da7ff] hover:bg-[#056f85] text-white px-4 py-2 rounded-lg shadow-md"
                  onClick={handlePayoutClick}
                >
                  <FaMoneyCheckAlt className="text-lg" />
                  Payout
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="w-16 h-16 border-4 border-[#078da7ff] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
              <DataTable
                columns={columns}
                data={filteredWithdrawals}
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

          {/* === Payout Modal === */}
          {payoutModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-2">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6">
                <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Payout Batches
                  </h3>
                  <button
                    onClick={() => setPayoutModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✖
                  </button>
                </div>

                {loadingPayout ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="w-12 h-12 border-4 border-[#078da7ff] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payoutBatches.length === 0 ? (
                      <p className="text-center text-gray-500">
                        No payout batches found
                      </p>
                    ) : (
                      payoutBatches.map((batch) => (
                        <div
                          key={batch.id}
                          className="border rounded-lg p-4 shadow-md bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-lg">
                                Batch No: {batch.batch_no}
                              </p>
                              <p>Status: {batch.status}</p>
                              <p>Total Amount: {batch.total_amount} ৳</p>
                              <p>
                                Created:{" "}
                                {new Date(batch.created_at).toLocaleString()}
                              </p>
                            </div>
                            {batch.status !== "paid" && (
                              <button
                                onClick={() => handleMarkPaid(batch.id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>

                          {/* Batch items */}
                          {batch.items && batch.items.length > 0 && (
                            <div className="mt-3">
                              <h4 className="font-semibold">Items:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {batch.items.map((item) => (
                                  <li key={item.id}>
                                    Withdrawal #{item.withdrawal_id} →{" "}
                                    {item.amount} ৳
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t-2 border-gray-200">
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg"
                    onClick={() => setPayoutModal(false)}
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

export default Withdrawlistadmin;
