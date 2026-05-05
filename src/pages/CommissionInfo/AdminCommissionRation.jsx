import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineReload, AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

const AdminCommissionRation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalRows, setTotalRows] = useState(0);

  const [formData, setFormData] = useState({
    plan_id: "",
    rank_id: "",
    percent: "",
    fixed_amount: "",
    effective_from: "",
    effective_to: "",
    is_active: true,
  });

  const token = localStorage.getItem("token");

  // Fetch commission rules
  const fetchCommissions = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://pleasurebd.com/pleasure-backend/public/api/v1/commission-rules?page=${pageNum}&per_page=${perPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setCommissions(data.data || []);
        setTotalRows(data.meta?.total || 0);
      } else {
        toast.error("Failed to load commissions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching commissions");
    }
    setLoading(false);
  };

  // Fetch plans
  const fetchPlans = async () => {
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/plans",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setPlans(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch ranks
  const fetchRanks = async () => {
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/sales-ranks",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setRanks(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCommissions(page);
      fetchPlans();
      fetchRanks();
    }
  }, [token, page, perPage]);

  // Submit Commission Rule (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rank_id) {
      toast.error("Rank is required");
      return;
    }
    if (!formData.percent && !formData.fixed_amount) {
      toast.error("Either Percent or Fixed Amount is required");
      return;
    }

    try {
      const payload = {
        plan_id: formData.plan_id || null,
        rank_id: parseInt(formData.rank_id),
        percent: formData.percent ? parseFloat(formData.percent) : null,
        fixed_amount: formData.fixed_amount
          ? parseFloat(formData.fixed_amount)
          : null,
        effective_from: formData.effective_from || null,
        effective_to: formData.effective_to || null,
        is_active: formData.is_active,
      };

      const url = isEditing
        ? `https://pleasurebd.com/pleasure-backend/public/api/v1/commission-rules/${editId}`
        : "https://pleasurebd.com/pleasure-backend/public/api/v1/commission-rules";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(isEditing ? "Commission rule updated!" : "Commission rule added!");
        setModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
          plan_id: "",
          rank_id: "",
          percent: "",
          fixed_amount: "",
          effective_from: "",
          effective_to: "",
          is_active: true,
        });
        fetchCommissions(page);
      } else {
        toast.error(data.message || "Failed to submit commission rule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting commission rule");
    }
  };

  // Edit handler
  const handleEdit = (row) => {
    setFormData({
      plan_id: row.plan_id || "",
      rank_id: row.rank_id || "",
      percent: row.percent || "",
      fixed_amount: row.fixed_amount || "",
      effective_from: row.effective_from || "",
      effective_to: row.effective_to || "",
      is_active: row.is_active,
    });
    setEditId(row.id);
    setIsEditing(true);
    setModalOpen(true);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this commission rule?")) return;

    try {
      const res = await fetch(
        `https://pleasurebd.com/pleasure-backend/public/api/v1/commission-rules/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Commission rule deleted!");
        fetchCommissions(page);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete commission rule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting commission rule");
    }
  };

  // Table columns
  const columns = [
    { name: "SL NO", selector: (row, index) => index + 1, width: "80px" },
    { name: "Plan", selector: (row) => row.plan?.name || "N/A" },
    { name: "Rank", selector: (row) => row.rank?.name || "N/A" },
    { name: "Percent", selector: (row) => row.percent || "-" },
    { name: "Fixed Amount", selector: (row) => row.fixed_amount || "-" },
    { name: "Effective From", selector: (row) => row.effective_from || "-" },
    { name: "Effective To", selector: (row) => row.effective_to || "-" },
    {
      name: "Status",
      selector: (row) => row.is_active,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${
            row.is_active ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <AiOutlineEdit />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <AiOutlineDelete />
          </button>
        </div>
      ),
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
            <h2 className="text-2xl font-semibold">Rank Wise Commission Ratio</h2>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 bg-[#0097A7] hover:bg-[#00838F] text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsEditing(false);
                  setEditId(null);
                  setFormData({
                    plan_id: "",
                    rank_id: "",
                    percent: "",
                    fixed_amount: "",
                    effective_from: "",
                    effective_to: "",
                    is_active: true,
                  });
                  setModalOpen(true);
                }}
              >
                <AiOutlinePlus /> Add Commission Ratio
              </button>
              <button
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
                onClick={() => fetchCommissions(page)}
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
              data={commissions}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangePage={(p) => setPage(p)}
              onChangeRowsPerPage={(newPerPage) => {
                setPerPage(newPerPage);
                setPage(1);
              }}
              paginationPerPage={perPage}
              highlightOnHover
              striped
              responsive
              customStyles={customStyles}
            />
          )}

          {/* Add/Edit Commission Modal */}
          {modalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 animate-fadeIn">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                  {isEditing ? "Edit Commission Rule" : "Create Commission Rule"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        Plan
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200"
                        value={formData.plan_id}
                        onChange={(e) =>
                          setFormData({ ...formData, plan_id: e.target.value })
                        }
                      >
                        <option value="">Select Plan</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        Rank <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200"
                        value={formData.rank_id}
                        onChange={(e) =>
                          setFormData({ ...formData, rank_id: e.target.value })
                        }
                      >
                        <option value="">Select Rank</option>
                        {ranks.map((rank) => (
                          <option key={rank.id} value={rank.id}>
                            {rank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        Percent
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200"
                        value={formData.percent}
                        onChange={(e) =>
                          setFormData({ ...formData, percent: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        Fixed Amount
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200"
                        value={formData.fixed_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fixed_amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        Effective From
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200"
                        value={formData.effective_from}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            effective_from: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        Effective To
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200"
                        value={formData.effective_to}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            effective_to: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="h-4 w-4 text-[#0097A7] focus:ring-[#0097A7] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_active"
                      className="font-medium text-gray-700"
                    >
                      Active
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      type="button"
                      className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition-colors duration-200"
                      onClick={() => {
                        setModalOpen(false);
                        setIsEditing(false);
                        setEditId(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 font-medium transition-colors duration-200"
                    >
                      {isEditing ? "Update" : "Submit"}
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

export default AdminCommissionRation;
