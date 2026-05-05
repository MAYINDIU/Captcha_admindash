import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineClose,
  AiFillDelete,
  AiOutlineEye,
} from "react-icons/ai";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

const Claimlistforadmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewClaim, setViewClaim] = useState(null);
  const [editClaim, setEditClaim] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    partner_cap: "",
    approved_amount: "",
    admin_note: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch Claims from API
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/claims",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setClaims(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load claims");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this claim!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        confirmButton:
          "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",
        cancelButton:
          "bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded",
      },
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/claims/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          toast.success("Claim deleted!");
          fetchClaims();
        } else {
          toast.error("Failed to delete claim");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error occurred");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `https://pleasurebd.com/pleasure-backend/public/api/v1/claims/${editClaim.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (res.ok) {
        toast.success("Claim updated successfully!");
        setEditClaim(null);
        fetchClaims();
      } else {
        toast.error("Failed to update claim");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while updating");
    }
  };

  const filteredClaims = claims.filter(
    (c) =>
      (c.service_name &&
        c.service_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.invoice_reference &&
        c.invoice_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.status && c.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColorClass = (status) => {
    switch (status) {
      case "pending":
      case "submitted":
        return "bg-amber-100 text-amber-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true },
    { name: "Service Name", selector: (row) => row.service_name },
    {
      name: "Service Date",
      selector: (row) => row.service_date?.split("T")[0],
      sortable: true,
    },
    { name: "Invoice Ref", selector: (row) => row.invoice_reference },
    { name: "Billed Amount", selector: (row) => `${row.billed_amount}` },
    { name: "Net Payable", selector: (row) => `${row.net_payable}` },
    { name: "Eligible Amount", selector: (row) => row.eligible_amount ?? "N/A" },
    { name: "Approved Amount", selector: (row) => row.approved_amount ?? "N/A" },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColorClass(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <AiOutlineEye
            size={20}
            className="cursor-pointer text-gray-500 hover:text-indigo-600 transition-colors"
            onClick={() => setViewClaim(row)}
          />
          <button
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            onClick={() => {
              setEditClaim(row);
              setFormData({
                status: row.status || "",
                partner_cap: row.partner_cap || "",
                approved_amount: row.approved_amount || "",
                admin_note: row.admin_note || "",
              });
            }}
          >
            Update
          </button>
          <AiFillDelete
            size={20}
            className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#048da2ff",
        color: "#fefefeff",
        fontWeight: "600",
        border: "1px solid #E5E7EB",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        color: "#4B5563",
        border: "1px solid #E5E7EB",
        padding: "12px",
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: "#F9FAFB",
        transition: "background-color 0.2s ease-in-out",
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Table and search */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">All Claims List</h2>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-md w-64 text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredClaims}
                pagination
                highlightOnHover
                striped
                responsive
                customStyles={customStyles}
                noHeader
              />
            )}
          </div>

          {/* View Claim Modal */}
          {viewClaim && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="absolute inset-0 bg-gray-900 bg-opacity-70"
                onClick={() => setViewClaim(null)}
              ></div>
              <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-2xl z-10">
                <button
                  onClick={() => setViewClaim(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                >
                  <AiOutlineClose size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">Claim Details</h2>
                <p><strong>Service:</strong> {viewClaim.service_name}</p>
                <p><strong>Invoice Ref:</strong> {viewClaim.invoice_reference}</p>
                <p><strong>Billed Amount:</strong> {viewClaim.billed_amount}</p>
                <p><strong>Net Payable:</strong> {viewClaim.net_payable}</p>
                <p><strong>Eligible Amount:</strong> {viewClaim.eligible_amount ?? "N/A"}</p>
                <p><strong>Approved Amount:</strong> {viewClaim.approved_amount ?? "N/A"}</p>
                <p><strong>Status:</strong> {viewClaim.status}</p>
              </div>
            </div>
          )}

          {/* Update Claim Modal */}
          {editClaim && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="absolute inset-0 bg-gray-900 bg-opacity-70"
                onClick={() => setEditClaim(null)}
              ></div>
              <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-lg z-10">
                <button
                  onClick={() => setEditClaim(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                >
                  <AiOutlineClose size={24} />
                </button>
                <h2 className="text-xl font-bold mb-4">Update Claim</h2>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md p-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Partner Cap
                    </label>
                    <input
                      type="number"
                      value={formData.partner_cap}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          partner_cap: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Approved Amount
                    </label>
                    <input
                      type="number"
                      value={formData.approved_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          approved_amount: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Admin Note
                    </label>
                    <textarea
                      value={formData.admin_note}
                      onChange={(e) =>
                        setFormData({ ...formData, admin_note: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md p-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditClaim(null)}
                      className="px-4 py-2 bg-gray-300 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md"
                    >
                      Save Changes
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

export default Claimlistforadmin;
