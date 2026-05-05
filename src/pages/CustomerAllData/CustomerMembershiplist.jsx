import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlineClose, AiOutlineEye } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

// Reusable component for the confirmation toast
const CustomConfirmationToast = ({ closeToast, onConfirm, onCancel, title, message }) => (
  <div className="flex flex-col p-2">
    <p className="font-semibold text-gray-900 mb-2">{title}</p>
    <p className="text-sm text-gray-700 mb-4">{message}</p>
    <div className="flex justify-end gap-2">
      <button
        onClick={() => {
          onCancel();
          closeToast();
        }}
        className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
      >
        No
      </button>
      <button
        onClick={() => {
          onConfirm();
          closeToast();
        }}
        className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
      >
        Yes
      </button>
    </div>
  </div>
);

const CustomerMembershiplist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMembership, setViewMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedMembershipToUpgrade, setSelectedMembershipToUpgrade] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const token = localStorage.getItem("token");
  const BASE_URL = "https://pleasurebd.com/pleasure-backend/public/api/v1";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/customers/me/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMemberships(data.memberships || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load memberships");
    }
    setLoading(false);
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${BASE_URL}/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPlans(data.data || []);
      } else {
        toast.error("Failed to load plans");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching plans");
    }
  };

  const fetchPlanDetails = async (planId) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedPlan(data.data);
      } else {
        toast.error(data.message || "Failed to fetch plan details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching plan details");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemberships();
    fetchPlans();
  }, []);

  const openViewModal = (membership) => setViewMembership(membership);
  const closeViewModal = () => setViewMembership(null);

  const openUpgradeModal = (membership) => {
    setSelectedMembershipToUpgrade(membership);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setSelectedMembershipToUpgrade(null);
    setSelectedPlanId("");
  };

  const confirmUpgrade = async (id, planId) => {
    try {
      const res = await fetch(`${BASE_URL}/memberships/${id}/upgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.payment_redirect_url) {
          window.open(data.payment_redirect_url, "_blank");
        } else {
          toast.success("Membership upgrade initiated successfully!");
          fetchMemberships();
          closeUpgradeModal();
        }
      } else {
        toast.error(data.message || "Failed to upgrade membership");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error upgrading membership");
    }
  };

  const handleUpgrade = async () => {
    if (!selectedMembershipToUpgrade || !selectedPlanId) {
      toast.error("Please select a plan to upgrade.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/memberships/${selectedMembershipToUpgrade.id}/upgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ plan_id: selectedPlanId }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.payment_redirect_url) {
          window.open(data.payment_redirect_url, "_blank");
        } else {
          toast.success("Membership upgrade initiated successfully!");
          fetchMemberships();
          closeUpgradeModal();
        }
      } else {
        toast.error(data.message || "Failed to upgrade membership");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error upgrading membership");
    }
  };

  const confirmRenewal = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/memberships/${id}/renew`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) {
        if (data.payment_redirect_url) {
          window.open(data.payment_redirect_url, "_blank");
        } else {
          toast.success("Membership renewed successfully!");
          fetchMemberships();
        }
      } else {
        toast.error(data.message || "Failed to renew membership");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error renewing membership");
    }
  };

  const handleRenew = (id) => {
    toast(
      ({ closeToast }) => (
        <CustomConfirmationToast
          closeToast={closeToast}
          onConfirm={() => confirmRenewal(id)}
          onCancel={() => {}}
          title="Confirm Renewal"
          message="Are you sure you want to renew this membership?"
        />
      ),
      {
        closeButton: false,
        autoClose: false,
        position: "top-center",
        className: "rounded-xl shadow-lg border-2 border-green-500",
      }
    );
  };

  const columns = [
    {
      name: "SL. NO",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Membership No",
      selector: (row) => row.membership_no,
      sortable: true,
    },
    {
      name: "Card No",
      selector: (row) => row.physical_card_no || "N/A",
      sortable: true,
    },
    {
      name: "Card Name",
      selector: (row) => row.plan?.name || "N/A",
      sortable: true,
      cell: (row) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer font-semibold"
          onClick={() => {
            if (row.plan?.id) {
              fetchPlanDetails(row.plan.id);
            }
          }}
        >
          {row.plan?.name || "N/A"}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`py-1 px-3 rounded-full text-xs font-semibold uppercase ${
            row.status === "active"
              ? "bg-green-200 text-green-800"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Issue Date",
      selector: (row) => formatDate(row.issue_date),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <AiOutlineEye
            size={22}
            className="cursor-pointer text-green-600 hover:text-green-800 transition-colors"
            onClick={() => openViewModal(row)}
          />
          <button
            onClick={() => handleRenew(row?.id)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00897B] rounded-md hover:bg-[#00897B] transition-colors"
          >
            Renew
          </button>
          <button
            onClick={() => openUpgradeModal(row)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Upgrade
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#057c7aff",
        color: "#fff",
        fontWeight: "700",
        fontSize: "14px",
        padding: "12px",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        color: "#374151",
        padding: "12px",
      },
    },
    rows: {
      style: {
        minHeight: "50px",
        "&:hover": {
          backgroundColor: "#f0f4f8",
        },
      },
    },
  };

  const filteredMemberships = memberships?.filter(
    (m) =>
      (m.membership_no &&
        m.membership_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.physical_card_no &&
        m.physical_card_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.status && m.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-8 w-full max-w-full mx-auto">
          <ToastContainer position="top-right" autoClose={3000} />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">My Memberships</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 px-4 py-2 pl-10 rounded-full w-80 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredMemberships}
                pagination
                highlightOnHover
                striped
                responsive
                customStyles={customStyles}
                noHeader={true}
              />
            )}
          </div>

          {/* View Membership Modal */}
          {viewMembership && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={closeViewModal}
              ></div>
              <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl z-10 overflow-y-auto max-h-[90vh]">
                <button
                  onClick={closeViewModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <AiOutlineClose size={28} />
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Membership Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Membership Info */}
                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                      Membership Info
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        <strong className="text-gray-900">Membership No:</strong>{" "}
                        {viewMembership.membership_no}
                      </p>
                      <p>
                        <strong className="text-gray-900">Card No:</strong>{" "}
                        {viewMembership.physical_card_no || "N/A"}
                      </p>
                      <p>
                        <strong className="text-gray-900">Plan:</strong>{" "}
                        {viewMembership.plan?.name || "N/A"}
                      </p>
                      <p>
                        <strong className="text-gray-900">Status:</strong>{" "}
                        <span
                          className={`py-1 px-3 rounded-full text-xs font-semibold uppercase ${
                            viewMembership.status === "active"
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {viewMembership.status}
                        </span>
                      </p>
                      <p>
                        <strong className="text-gray-900">Start Date:</strong>{" "}
                        {formatDate(viewMembership.start_date)}
                      </p>
                      <p>
                        <strong className="text-gray-900">End Date:</strong>{" "}
                        {formatDate(viewMembership.end_date)}
                      </p>
                    </div>
                  </div>

                  {/* Nominee Info */}
                  {viewMembership?.nominee && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-blue-800 mb-4 border-b border-blue-300 pb-2">
                        Nominee Details
                      </h3>
                      <div className="space-y-3 text-gray-700">
                        <p>
                          <strong className="text-blue-900">Name:</strong>{" "}
                          {viewMembership.nominee.name}
                        </p>
                        <p>
                          <strong className="text-blue-900">Phone:</strong>{" "}
                          {viewMembership.nominee.phone}
                        </p>
                        <p>
                          <strong className="text-blue-900">Address:</strong>{" "}
                          {viewMembership.nominee.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Employee Info */}
                  {viewMembership?.employee && (
                    <div className="bg-gray-100 border-l-4 border-gray-500 p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                        Sales Officer
                      </h3>
                      <div className="space-y-3 text-gray-700">
                        <p>
                          <strong className="text-gray-900">Employee Code:</strong>{" "}
                          {viewMembership.employee.employee_code}
                        </p>
                        <p>
                          <strong className="text-gray-900">Name:</strong>{" "}
                          {viewMembership.employee.full_name_en}
                        </p>
                        <p>
                          <strong className="text-gray-900">Email:</strong>{" "}
                          {viewMembership.employee.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Orders */}
                  {viewMembership.orders && viewMembership.orders.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-yellow-800 mb-4 border-b pb-2">
                        Associated Orders
                      </h3>
                      <ul className="space-y-4">
                        {viewMembership.orders.map((order) => (
                          <li
                            key={order.id}
                            className="flex justify-between items-center p-4 rounded-lg bg-white shadow-sm"
                          >
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-800">
                                Order No: {order.order_no}
                              </p>
                              <p className="text-sm text-gray-600">
                                Total Amount: {order.total_amount} BDT
                              </p>
                            </div>
                            <span
                              className={`py-1 px-3 rounded-full text-xs font-semibold uppercase ${
                                order.status === "completed"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Membership Modal */}
          {isUpgradeModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={closeUpgradeModal}
              ></div>
              <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg z-10">
                <button
                  onClick={closeUpgradeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <AiOutlineClose size={28} />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Upgrade Membership
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    Current Plan:{" "}
                    <span className="font-semibold">{selectedMembershipToUpgrade?.plan?.name}</span>
                  </p>
                  <div className="flex flex-col">
                    <label htmlFor="plan-select" className="text-sm font-medium text-gray-700 mb-1">
                      Select a new plan:
                    </label>
                    <select
                      id="plan-select"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Please select a plan --</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {plan.price} {plan.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end mt-6 space-x-4">
                    <button
                      onClick={closeUpgradeModal}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpgrade}
                      className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      disabled={!selectedPlanId}
                    >
                      Confirm Upgrade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Details Modal */}
          {selectedPlan && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={() => setSelectedPlan(null)}
              ></div>
              <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg z-10 overflow-y-auto max-h-[90vh]">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <AiOutlineClose size={28} />
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  {selectedPlan.name}
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    <strong className="text-gray-900">Price:</strong>{" "}
                    <span className="font-semibold">{selectedPlan.price} {selectedPlan.currency}</span>
                  </p>
                  <p className="text-lg text-gray-700">
                    <strong className="text-gray-900">Code:</strong>{" "}
                    <span className="font-semibold">{selectedPlan.code}</span>
                  </p>
                  <p className="text-lg text-gray-700">
                    <strong className="text-gray-900">Max Dependents:</strong>{" "}
                    <span className="font-semibold">{selectedPlan.max_dependents}</span>
                  </p>
                  <p className="text-lg text-gray-700">
                    <strong className="text-gray-900">Description:</strong>{" "}
                    <span className="font-normal">{selectedPlan.description || "N/A"}</span>
                  </p>
                  
                  {selectedPlan.benefits && selectedPlan.benefits.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                      <h3 className="text-xl font-bold text-gray-800 mt-2 mb-4 border-b pb-2">
                        Benefits
                      </h3>
                      <ul className="space-y-3 list-disc list-inside text-gray-700">
                        {selectedPlan.benefits.map((benefit) => (
                          <li key={benefit.id}>
                            <strong className="font-semibold text-gray-900">{benefit.benefit_type}:</strong>{" "}
                            {benefit.coverage_amount} {selectedPlan.currency} ({benefit.terms})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerMembershiplist;