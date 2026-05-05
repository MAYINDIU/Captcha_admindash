import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Assuming these are your components for layout
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
// If you use Link/useNavigate from react-router-dom, ensure it's installed.

// =========================
// Eye Icon Component (SVG)
// =========================
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12c2.25-4.5 6.75-7.5 9.75-7.5s7.5 3 9.75 7.5c-2.25 4.5-6.75 7.5-9.75 7.5S4.5 16.5 2.25 12z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const Customerlist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  // NOTE: In a real app, API_BASE_URL and API_TOKEN should be in .env or context
  const API_BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
  const API_TOKEN = localStorage.getItem("authToken");

  // =========================
  // 1. Fetch All Customers
  // =========================
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      if (!API_TOKEN) {
        toast.error("Authentication token not found!");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/employees/dashboard/customers`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch customer list: ${response.statusText}`);
        }

        const result = await response.json();

        // Handle the nested 'data' structure
        const validData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        setCustomers(validData);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error(`Error loading customer list: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [API_BASE_URL, API_TOKEN]);

  // =========================
  // 2. Handle Search Filter (Memoized)
  // =========================
  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return customers;
    }
    const lowerSearch = search.toLowerCase();
    return customers.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.email?.toLowerCase().includes(lowerSearch) ||
        item.contact_number?.toLowerCase().includes(lowerSearch)
    );
  }, [search, customers]);

  // =========================
  // 3. Pagination Logic
  // =========================
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when search or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);
  
  // ======================================================
  // 4. View Details Popup (LARGE MODAL with ALL DATA)
  // ======================================================
  const handleView = (item) => {
    // Helper function for safe data access and defaulting to N/A
    const getDetail = (value) => value || "N/A";
    
    // Format the date nicely
    const formatDateTime = (dateString) => 
        dateString ? new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : "N/A";

    Swal.fire({
      title: `<span class="text-2xl font-extrabold text-indigo-700">Customer Full Profile</span>`,
      
      html: `
        <div class="p-2 sm:p-4 text-left space-y-6">
          
          <div class="border-b-2 pb-3 mb-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">${getDetail(item.name)}</h3>
            <span class="text-sm font-semibold text-white bg-indigo-500 px-4 py-1 rounded-full uppercase shadow-md">
              ${getDetail(item.role)}
            </span>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">📞 Contact & Address</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="col-span-2 sm:col-span-1">
                <p class="font-medium text-gray-500">Email:</p>
                <p class="text-blue-600 break-all">${getDetail(item.email)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Mobile Phone:</p>
                <p class="text-gray-800">${getDetail(item.contact_number)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Residence Phone:</p>
                <p class="text-gray-800">${getDetail(item.residence_phone)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">WhatsApp No:</p>
                <p class="text-green-600">${getDetail(item.whatsapp_number)}</p>
              </div>
              <div class="col-span-full">
                <p class="font-medium text-gray-500">Permanent Address:</p>
                <p class="text-gray-800">${getDetail(item.permanent_address)}</p>
              </div>
              <div class="col-span-full">
                <p class="font-medium text-gray-500">Present Address:</p>
                <p class="text-gray-800">${getDetail(item.present_address)}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">👤 Personal Information</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="font-medium text-gray-500">Father's Name:</p>
                <p class="text-gray-800">${getDetail(item.father_name)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Mother's Name:</p>
                <p class="text-gray-800">${getDetail(item.mother_name)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Marital Status:</p>
                <p class="text-gray-800 capitalize">${getDetail(item.marital_status)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Spouse Name:</p>
                <p class="text-gray-800">${getDetail(item.spouse_name)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Profession:</p>
                <p class="text-gray-800">${getDetail(item.profession)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Date of Birth:</p>
                <p class="text-gray-800">${getDetail(item.date_of_birth)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Religion:</p>
                <p class="text-gray-800">${getDetail(item.religion)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Blood Group:</p>
                <p class="text-red-500 font-bold">${getDetail(item.blood_group)}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">🆔 Identification & Origin</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="font-medium text-gray-500">National ID:</p>
                <p class="text-gray-800">${getDetail(item.national_id)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Passport Number:</p>
                <p class="text-gray-800">${getDetail(item.passport_number)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Nationality:</p>
                <p class="text-gray-800">${getDetail(item.nationality)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-500">Source Me ID:</p>
                <p class="text-indigo-600 font-bold">${getDetail(item.source_me_id)}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h4 class="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">🤝 Nominee & Authorized Person</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div class="space-y-2 md:border-r md:pr-4">
                  <p class="font-bold text-indigo-600">Nominee:</p>
                  <p><span class="font-medium text-gray-500">Name:</span> <span class="text-gray-800">${getDetail(item.nominee_name)}</span></p>
                  <p><span class="font-medium text-gray-500">Relation:</span> <span class="text-gray-800">${getDetail(item.nominee_relation)}</span></p>
                  <p><span class="font-medium text-gray-500">Phone:</span> <span class="text-gray-800">${getDetail(item.nominee_phone)}</span></p>
                </div>
                <div class="space-y-2 pt-4 md:pt-0">
                  <p class="font-bold text-indigo-600">Authorized Person:</p>
                  <p><span class="font-medium text-gray-500">Name:</span> <span class="text-gray-800">${getDetail(item.authorized_person_name)}</span></p>
                  <p><span class="font-medium text-gray-500">Address:</span> <span class="text-gray-800">${getDetail(item.authorized_person_address)}</p>
                  <p><span class="font-medium text-gray-500">Joint Applicants:</span> <span class="text-gray-800">${getDetail(item.joint_applicants)}</span></p>
                </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t text-xs text-gray-500 flex justify-between">
              <div class="space-y-1">
                <p>
                    <span class="font-medium">Added by Role:</span> 
                    <span class="font-bold text-gray-700">${getDetail(item.added_by_role)}</span> (Branch ID: ${getDetail(item.added_by_branch_id)})
                </p>
                <p>
                    <span class="font-medium">Agent ID:</span> 
                    <span class="font-bold text-gray-700">${getDetail(item.added_by_agent_id)}</span>
                </p>
              </div>
              <div class="space-y-1 text-right">
                <p>
                    <span class="font-medium">Created:</span> 
                    <span class="font-bold text-gray-700">${formatDateTime(item.created_at)}</span>
                </p>
                <p>
                    <span class="font-medium">Last Updated:</span> 
                    <span class="font-bold text-gray-700">${formatDateTime(item.updated_at)}</span>
                </p>
              </div>
          </div>

        </div>
      `,
      icon: "info",
      showConfirmButton: false, 
      showCloseButton: true,
      width: '50%', // Make the modal large
      maxWidth: '600px', // Set a maximum width
      customClass: {
        popup: 'shadow-2xl rounded-xl border-t-4 border-indigo-600',
        title: 'pt-4', 
        closeButton: 'text-gray-400 hover:text-gray-600'
      }
    });
  };

  // =========================
  // 5. Render Section
  // =========================
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6 w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2 sm:mb-0">
              <span role="img" aria-label="customer-icon">👥</span> Customer List
            </h1>
            <div className="text-sm font-medium text-gray-500">
              Total Customers: <span className="font-bold text-indigo-600">{customers.length}</span>
            </div>
          </div>
          
          <hr className="mb-6"/>

          {/* Search and Items Per Page */}
          <div className="bg-white p-4 shadow-lg rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  placeholder="🔍 Search by name, email, or phone..."
                  className="w-full border-2 border-gray-300 focus:border-indigo-500 p-3 rounded-lg transition duration-150 ease-in-out placeholder-gray-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <div className="flex items-center space-x-2">
                <label htmlFor="itemsPerPage" className="text-gray-600 font-medium">Show:</label>
                <select
                    id="itemsPerPage"
                    className="border-2 border-gray-300 p-2 rounded-lg cursor-pointer focus:border-indigo-500"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            {loading ? (
              <p className="text-center p-8 text-lg font-medium text-indigo-600">
                <svg className="animate-spin h-5 w-5 mr-3 inline text-indigo-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading customer data...
              </p>
            ) : filteredData.length === 0 ? (
              <p className="text-center p-8 text-lg text-red-500 font-medium">
                No customers found matching your search.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">SL</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Phone</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Address</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50 transition duration-100">
                          <td className="py-3 px-4 text-sm text-gray-700 font-medium">{startIndex + index + 1}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.name || "-"}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.email || "-"}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.contact_number || item.phone || "-"}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate">{item.permanent_address || item.address || "-"}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleView(item)}
                              className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out p-1 rounded-full hover:bg-indigo-100"
                              title="View Details"
                            >
                              <EyeIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-600">
                        Showing **{startIndex + 1}** to **{Math.min(startIndex + itemsPerPage, filteredData.length)}** of **{filteredData.length}** entries
                    </div>
                    <nav className="flex space-x-1" aria-label="Pagination">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                        >
                            &laquo; Previous
                        </button>

                        {/* Simplified Page Number Display */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1)) 
                            .map(page => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                        currentPage === page
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            {totalPages > 3 && currentPage < totalPages - 1 && 
                                <span className="px-3 py-1 text-sm text-gray-500">...</span>
                            }
                            {totalPages > 1 && currentPage < totalPages && (
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                        currentPage === totalPages
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {totalPages}
                                </button>
                            )}

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages || filteredData.length === 0}
                            className={`p-2 rounded-lg text-sm font-medium ${currentPage === totalPages || filteredData.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                        >
                            Next &raquo;
                        </button>
                    </nav>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Customerlist;