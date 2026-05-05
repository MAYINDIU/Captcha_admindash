import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useNavigate } from "react-router-dom";
import {
  AiOutlinePlus,
  AiOutlineClose,
  AiFillDelete,
  AiOutlineEye,
} from "react-icons/ai";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";

const CustomerApplyClaim = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewClaim, setViewClaim] = useState(null);

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

  const filteredClaims = claims.filter(
    (c) =>
      (c.service_name &&
        c.service_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.invoice_reference &&
        c.invoice_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.status && c.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function to get status badge color
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

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">My Claims</h2>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-md w-64 text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <button
                className="flex items-center gap-2 bg-[#00897B] hover:bg-[#00897B] text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow"
                onClick={() => navigate("/add-claim")}
              >
                <AiOutlinePlus /> Apply Claim
              </button>
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
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div
                className="absolute inset-0 bg-gray-900 bg-opacity-70 "
                onClick={() => setViewClaim(null)}
              ></div>

              <div
                className="relative bg-white border-l-4 border-yellow-500 p-6 rounded-lg shadow-md w-full max-w-2xl z-10 transform scale-100 transition-transform duration-300 ease-in-out"
              >
                <button
                  onClick={() => setViewClaim(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <AiOutlineClose size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-300 pb-3">
                  Claim Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-500 text-sm">Service</p>
                    <p className="text-lg">{viewClaim.service_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-500 text-sm">Service Date</p>
                    <p className="text-lg">{viewClaim.service_date?.split("T")[0]}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-500 text-sm">Invoice Ref</p>
                    <p className="text-lg">{viewClaim.invoice_reference}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-500 text-sm">Billed Amount</p>
                    <p className="text-lg">{viewClaim.billed_amount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-500 text-sm">Net Payable</p>
                    <p className="text-lg">{viewClaim.net_payable}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-500 text-sm">Status</p>
                    <span
                      className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full capitalize ${getStatusColorClass(
                        viewClaim.status
                      )}`}
                    >
                      {viewClaim.status}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <p className="font-semibold text-gray-500 text-sm">Notes</p>
                    <p className="text-base text-gray-600">{viewClaim.notes || "N/A"}</p>
                  </div>

                  {/* Documents Section */}
                  {viewClaim.documents && viewClaim.documents.length > 0 && (
                    <div className="col-span-1 sm:col-span-2">
                      <p className="font-semibold text-gray-500 text-sm mb-2">Documents</p>
                      <div className="flex flex-wrap gap-4">
                        {viewClaim.documents.map((doc, idx) => {
                          const fileUrl = `https://pleasurebd.com/pleasure-backend/storage/app/public/${doc.file_path}`;
                          const isImage = doc.mime_type.startsWith("image/");

                          return (
                            <div key={idx} className="flex flex-col items-center">
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt={doc.file_name}
                                  className="w-24 h-24 object-cover border rounded-md shadow-sm"
                                />
                              ) : (
                                <div className="w-24 h-24 flex items-center justify-center bg-gray-200 border rounded-md shadow-sm">
                                  <span className="text-sm text-gray-600">📄 File</span>
                                </div>
                              )}
                              <a
                                href={fileUrl}
                                download={doc.file_name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 text-indigo-600 hover:underline text-sm"
                              >
                                Download
                              </a>
                            </div>
                          );
                        })}
                      </div>
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

export default CustomerApplyClaim;
