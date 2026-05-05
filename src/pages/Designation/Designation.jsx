import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlineClose } from "react-icons/ai";
import { MdOutlineNumbers } from "react-icons/md"; // Only keeping MdOutlineNumbers for Code/Name inputs
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

// Custom SVG Icon Components
const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const EditIcon = ({ size = 20 }) => ( 
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-${size / 5} w-${size / 5}`} 
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9"
        />
    </svg>
);
const DeleteIcon = ({ size = 20 }) => ( 
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-${size / 5} w-${size / 5}`} 
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
    </svg>
);

// =========================================================================
// SKELETON LOADERS
// =========================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-6 space-x-4">
             <SkeletonPulse className="h-4 w-10" />
             <SkeletonPulse className="h-4 w-1/4" />
             <SkeletonPulse className="h-4 w-1/2" />
             <SkeletonPulse className="h-4 w-20 ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-48" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/ranks";

const Designation = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    sort_order: "",
  });

  const token = localStorage.getItem("authToken");

  // --- React Query: Fetch Designations ---
  const { data: designations = [], isLoading: loading } = useQuery({
    queryKey: ["designations"],
    queryFn: async () => {
        const res = await fetch(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load designations");
        const data = await res.json();
        return data?.data || [];
    },
    enabled: !!token,
  });

  // --- React Query: Mutations ---
  const saveMutation = useMutation({
      mutationFn: async ({ id, payload }) => {
          const url = id ? `${API_BASE}/${id}` : API_BASE;
          const method = id ? "PUT" : "POST";
          const res = await fetch(url, {
              method,
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
          });
          if (!res.ok) {
              const error = await res.json();
              throw new Error(error.errors ? Object.values(error.errors).flat().join(" ") : (error.message || "Something went wrong."));
          }
          return res.json();
      },
      onSuccess: (_, variables) => {
          toast.success(variables.id ? "Designation updated! 🎉" : "Designation added! ✨");
          queryClient.invalidateQueries(["designations"]);
          closeModal();
      },
      onError: (err) => {
          toast.error(err.message);
      }
  });

  const deleteMutation = useMutation({
      mutationFn: async (id) => {
          const res = await fetch(`${API_BASE}/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to delete.");
          return id;
      },
      onSuccess: () => {
          toast.success("Designation deleted! 🗑️");
          queryClient.invalidateQueries(["designations"]);
      },
      onError: (err) => {
          toast.error(err.message);
      }
  });

  // Derived state for filtering
  const filteredDesignations = useMemo(() => {
      return designations.filter(
        (item) =>
          item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [designations, searchTerm]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Modal
  const openModal = (designation = null) => {
    if (designation) {
      setEditingDesignation(designation);
      setFormData({
        code: designation.code || "",
        name: designation.name || "",
        description: designation.description || "",
        sort_order: designation.sort_order || "", 
      });
    } else {
      setEditingDesignation(null);
      setFormData({ code: "", name: "", description: "", sort_order: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Submit Add / Edit
  const handleSubmit = () => {
    // Basic validation
    if (!formData.code || !formData.name) {
      toast.error("Code and Name are required.");
      return;
    }

    const payload = {
      ...formData,
      // Since inputs are removed, these fields will be empty/null, which should be fine if backend allows
      sort_order: formData.sort_order !== "" ? parseInt(formData.sort_order) : null,
    };

    saveMutation.mutate({ id: editingDesignation?.id, payload });
  };

  // Delete Designation
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1976D2", 
      cancelButtonColor: "#EF4444", 
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true, 
    });

    if (confirm.isConfirmed) {
        deleteMutation.mutate(id);
    }
  };

  // 🚨 MODIFIED: Table Columns (Description and Sort Order removed)
  const columns = [
    { name: "SL No", selector: (row, index) => index + 1, sortable: false },
    { name: "Code", selector: (row) => row.code, sortable: true},
    { name: "Name", selector: (row) => row.name, sortable: true, grow: 1 }, // Name takes up the remaining space

    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-1 justify-center items-center">
          <button
            className="text-blue-500 hover:text-blue-700 transition duration-150 p-2 rounded-full hover:bg-blue-50"
            onClick={() => openModal(row)}
            title="Edit Designation"
          >
            <EditIcon size={20} /> 
          </button>
          <button
            className="text-red-500 hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
            title="Delete Designation"
          >
            <DeleteIcon size={20} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "120px",
      style: { justifyContent: 'center' },
      headerStyle: { justifyContent: 'center' }
    },
  ];

  // Custom styles for a cleaner Material look
  const customStyles = {
    table: {
      style: {
        borderRadius: "8px", 
        overflow: "hidden",
        backgroundColor: "#fff",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#1976D2", 
        color: "#fff",
        fontWeight: "600",
        fontSize: "15px", 
        textTransform: "uppercase",
        borderBottom: "none", 
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        color: "#374151",
      },
    },
    rows: {
      style: {
        minHeight: "50px",
        borderBottom: "1px solid #e5e7eb", 
      },
      highlightOnHoverStyle: {
        backgroundColor: "#e3f2fd", 
        transition: "background-color 0.2s",
        borderBottomColor: "#1E40AF",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb",
        fontSize: "14px",
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow p-4 md:p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Designation Management</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                    <input
                      type="text"
                      placeholder="Search code or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-4 py-2 rounded-lg w-full sm:w-64 transition duration-150"
                    />
                </div>
                <button
                  className="flex items-center justify-center gap-2 bg-[#1976D2] hover:bg-blue-600 active:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-md transition duration-150 transform hover:scale-[1.02]"
                  onClick={() => openModal()}
                >
                  <PlusIcon /> Add Designation
                </button>
              </div>
            </div>

            {loading ? (
              <TableSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={filteredDesignations}
                pagination
                highlightOnHover
                striped
                responsive
                customStyles={customStyles}
                noDataComponent={
                  <div className="p-4 text-gray-500">No designations found.</div>
                }
              />
            )}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 transition-opacity duration-300">
              <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-10 transform transition-transform duration-300 scale-100">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition duration-150"
                >
                  <AiOutlineClose size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  {editingDesignation ? "Edit Designation" : "Add New Designation"}
                </h2>
                <div className="flex flex-col gap-4">
                  
                  {/* Code Input */}
                  <div className="relative">
                    <MdOutlineNumbers className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Code (e.g., MG)"
                      className="border pl-10 pr-3 py-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Name Input */}
                  <div className="relative">
                    <MdOutlineNumbers className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name (e.g., Manager)"
                      className="border pl-10 pr-3 py-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* 🚨 REMOVED Description Input */}
                  {/* 🚨 REMOVED Sort Order Input */}

                  <button
                    onClick={handleSubmit}
                    disabled={saveMutation.isLoading}
                    className={`bg-[#1976D2] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-4 shadow-md transition duration-150 flex justify-center items-center ${
                      saveMutation.isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {saveMutation.isLoading && (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    )}
                    {editingDesignation ? "Update Designation" : "Add Designation"}
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

export default Designation;