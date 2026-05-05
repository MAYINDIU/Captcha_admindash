import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import {
  AiOutlinePlus,
  AiOutlineClose,
  AiFillEdit,
  AiFillDelete,
  AiOutlineSearch,
} from "react-icons/ai";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

const PaymentGateway = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gateways, setGateways] = useState([]);
  const [filteredGateways, setFilteredGateways] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    display_name: "",
    is_active: true,
    callback_url: "",
  });
  const [credentials, setCredentials] = useState({
    store_id: "",
    store_password: "",
    sandbox: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch Payment Gateways
  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/payment-gateways",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setGateways(data || []);
      setFilteredGateways(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment gateways");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  // Filter gateways when search term changes
  useEffect(() => {
    const result = gateways.filter(
      (item) =>
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGateways(result);
  }, [searchTerm, gateways]);

  // Handle main form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle credentials input change
  const handleCredentialsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Open Modal
  const openModal = (gateway = null) => {
    if (gateway) {
      setEditingGateway(gateway);
      setFormData({
        code: gateway.code || "",
        display_name: gateway.display_name || "",
        is_active: gateway.is_active || false,
        callback_url: gateway.callback_url || "",
      });
      setCredentials({
        store_id: gateway.credentials?.store_id || "",
        store_password: gateway.credentials?.store_password || "",
        sandbox: gateway.credentials?.sandbox || false,
      });
    } else {
      setEditingGateway(null);
      setFormData({
        code: "",
        display_name: "",
        is_active: true,
        callback_url: "",
      });
      setCredentials({ store_id: "", store_password: "", sandbox: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Submit Add / Edit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        credentials: credentials,
      };

      let res;
      if (editingGateway) {
        // UPDATE gateway
        res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/payment-gateways/${editingGateway.code}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // CREATE gateway
        res = await fetch(
          "https://pleasurebd.com/pleasure-backend/public/api/v1/payment-gateways",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (res.ok) {
        toast.success(editingGateway ? "Gateway updated!" : "Gateway added!");
        fetchGateways();
        closeModal();
      } else {
        const error = await res.json();
        toast.error(error.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred");
    }
    setSubmitting(false);
  };

  // Delete Gateway
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/payment-gateways/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          toast.success("Gateway deleted!");
          fetchGateways();
        } else {
          toast.error("Failed to delete");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error occurred");
      }
    }
  };

  // Table Columns
  const columns = [
    { name: "SL No", selector: (row, index) => index + 1, width: "80px" },
    { name: "Code", selector: (row) => row.code, sortable: true },
    { name: "Name", selector: (row) => row.display_name, sortable: true },
    { name: "Callback URL", selector: (row) => row.callback_url || "-", sortable: true },
    {
      name: "Credentials",
      cell: (row) =>
        row.credentials ? (
          <div className="text-xs space-y-1">
            <div><strong>ID:</strong> {row.credentials.store_id}</div>
            <div><strong>Pass:</strong> {row.credentials.store_password}</div>
            <div><strong>Sandbox:</strong> {row.credentials.sandbox ? "Yes" : "No"}</div>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        ),
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
          <AiFillEdit
            size={22}
            className="cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => openModal(row)}
          />
          <AiFillDelete
            size={22}
            className="cursor-pointer text-red-600 hover:text-red-800"
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          <div className="bg-white rounded-lg shadow-md border p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-3xl font-bold text-gray-900">Payment Gateways</h2>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
                <div className="relative">
                  <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search gateways..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0097A7]"
                  />
                </div>
                <button
                  className="flex items-center px-6 py-2 bg-[#0097A7] text-white rounded-md hover:bg-[#007b82]"
                  onClick={() => openModal()}
                >
                  <AiOutlinePlus className="mr-2" /> Add Gateway
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="shadow-lg rounded-lg overflow-hidden border">
              <DataTable
                columns={columns}
                data={filteredGateways}
                pagination
                highlightOnHover
                striped
                responsive
              />
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={closeModal}
              ></div>
              <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg z-10">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
                >
                  <AiOutlineClose size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  {editingGateway ? "Edit Gateway" : "Add New Gateway"}
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Code (e.g., bkash, sslcommerz)"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0097A7]"
                  />
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    placeholder="Display Name (e.g., bKash, SSLCommerz)"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0097A7]"
                  />
                  <input
                    type="text"
                    name="callback_url"
                    value={formData.callback_url}
                    onChange={handleChange}
                    placeholder="Callback URL (e.g., https://example.com/callback)"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0097A7]"
                  />
                  <input
                    type="text"
                    name="store_id"
                    value={credentials.store_id}
                    onChange={handleCredentialsChange}
                    placeholder="Store ID"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0097A7]"
                  />
                  <input
                    type="text"
                    name="store_password"
                    value={credentials.store_password}
                    onChange={handleCredentialsChange}
                    placeholder="Store Password"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0097A7]"
                  />

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Active?
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="sandbox"
                        checked={credentials.sandbox}
                        onChange={handleCredentialsChange}
                        className="mr-2"
                      />
                      Sandbox?
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`w-full py-3 mt-6 rounded-lg text-white font-bold ${
                      submitting
                        ? "bg-[#0097A7] opacity-60 cursor-not-allowed"
                        : "bg-[#0097A7] hover:bg-[#007b82]"
                    }`}
                  >
                    {submitting ? "Saving..." : "Save Gateway"}
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

export default PaymentGateway;
