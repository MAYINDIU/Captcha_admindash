import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css"; // This is the ONLY correct import you need.
import {
  AiOutlinePlus,
  AiOutlineClose,
  AiFillEdit,
  AiFillDelete,
  AiOutlineEye,
} from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa"; // Import the PDF icon
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import { useReactToPrint } from "react-to-print"; // Import the hook


const Customer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Ref for the printable component
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Customer Report',
  });

  const [formData, setFormData] = useState({
    full_name_en: "",
    full_name_bn: "",
    phone: "",
    email: "",
    national_id: "",
    dob: "",
    gender: "",
    present_address: "",
    permanent_address: "",
    city: "",
    district: "",
    postal_code: "",
  });

  // Fetch Customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/customers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setCustomers(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        full_name_en: customer.full_name_en || "",
        full_name_bn: customer.full_name_bn || "",
        phone: customer.phone || "",
        email: customer.email || "",
        national_id: customer.national_id || "",
        dob: customer.dob ? customer.dob.split("T")[0] : "",
        gender: customer.gender || "",
        present_address: customer.present_address || "",
        permanent_address: customer.permanent_address || "",
        city: customer.city || "",
        district: customer.district || "",
        postal_code: customer.postal_code || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        full_name_en: "",
        full_name_bn: "",
        phone: "",
        email: "",
        national_id: "",
        dob: "",
        gender: "",
        present_address: "",
        permanent_address: "",
        city: "",
        district: "",
        postal_code: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let res;
      if (editingCustomer) {
        res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/customers/${editingCustomer.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          }
        );
      } else {
        res = await fetch(
          "https://pleasurebd.com/pleasure-backend/public/api/v1/customers",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          }
        );
      }

      if (res.ok) {
        toast.success(
          editingCustomer
            ? "Customer updated successfully!"
            : "Customer added successfully!"
        );
        fetchCustomers();
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

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/customers/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          toast.success("Customer deleted!");
          fetchCustomers();
        } else {
          toast.error("Failed to delete");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error occurred");
      }
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name_en &&
        c.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.full_name_bn &&
        c.full_name_bn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      name: "SL NO",
      selector: (row, index) => index + 1,
      width: "70px",
    },
    { name: "Name", selector: (row) => row.full_name_en },
    { name: "Phone", selector: (row) => row.phone },
    {
      name: "Membership Plan",
      selector: (row) => row.active_membership?.plan.name || "N/A",
      cell: (row) => {
        const type = row.active_membership?.plan.name;
        let typeClasses = "px-3 py-1 rounded-full text-white font-semibold text-xs";

        if (type === "Basic Card") {
          typeClasses += " bg-teal-500";
        } else if (type === "Premium Card") {
          typeClasses += " bg-blue-500";
        } else if (type === "Silver Card") {
          typeClasses += " bg-gray-400";
        } else {
          typeClasses += " bg-gray-500";
        }

        return (
          <span className={typeClasses}>
            {type ? type : "N/A"}
          </span>
        );
      },
    },
    {
      name: "Membership Details",
      width: "200px",
      cell: (row) => {
        if (row.active_membership) {
          const membershipNo = row.active_membership.membership_no || "N/A";
          const physicalCardNo = row.active_membership.physical_card_no || "N/A";
          
          const startDateParts = row.active_membership.start_date.split("T")[0].split("-");
          const endDateParts = row.active_membership.end_date.split("T")[0].split("-");

          const formattedStartDate = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`;
          const formattedEndDate = `${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`;

          return (
            <div className="text-sm">
              <div>
                <strong>Mem. No:</strong> {membershipNo}
              </div>
              <div>
                <strong>Card No:</strong> {physicalCardNo}
              </div>
              <div>
                <strong>Period:</strong> {`${formattedStartDate} - ${formattedEndDate}`}
              </div>
            </div>
          );
        }
        return "N/A";
      },
      sortable: false,
    },
    {
      name: "Status",
      selector: (row) => row.active_membership?.status || "N/A",
      cell: (row) => {
        const status = row.active_membership?.status;
        let statusClasses = "px-3 py-1 rounded-full text-white font-semibold text-xs";

        if (status === "active") {
          statusClasses += " bg-green-500";
        } else if (status === "expired") {
          statusClasses += " bg-red-500";
        } else if (status === "pending") {
          statusClasses += " bg-yellow-500";
        } else {
          statusClasses += " bg-gray-500";
        }

        return (
          <span className={statusClasses}>
            {status ? status.toUpperCase() : "N/A"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2 print:hidden">
          {/* <AiOutlineEye
            size={20}
            className="cursor-pointer text-green-600 hover:text-green-800"
            onClick={() => setViewCustomer(row)}
          /> */}
           <AiOutlineEye
          size={20}
          className="cursor-pointer text-green-600 hover:text-green-800"
          onClick={() => navigate(`/customers/${row.id}`)} // Use navigate with the customer ID
        />
          <AiFillEdit
            size={20}
            className="cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => openModal(row)}
          />
          <AiFillDelete
            size={20}
            className="cursor-pointer text-red-600 hover:text-red-800"
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const customStyles = {
    table: { style: { borderCollapse: "collapse", width: "100%" } },
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
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h2 className="text-2xl font-semibold">ALL CUSTOMERS</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded-md w-64"
              />
             
              <button
                className="flex items-center gap-2 bg-[#0097A7] hover:bg-[#00838F] text-white px-4 py-2 rounded"
                onClick={() => navigate("/card-application")}
              >
                <AiOutlinePlus /> Add Customer
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredCustomers}
              pagination
              highlightOnHover
              striped
              responsive
              customStyles={customStyles}
            />
          )}


          {/* Add/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 print:hidden">
              <div
                className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                onClick={closeModal}
              ></div>
              <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-10 transform transition-transform scale-100 opacity-100 animate-slide-in-up">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingCustomer ? "Edit Customer" : "Add Customer"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>

                <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="full_name_en"
                    value={formData.full_name_en}
                    onChange={handleChange}
                    placeholder="Full Name (EN)"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="text"
                    name="full_name_bn"
                    value={formData.full_name_bn}
                    onChange={handleChange}
                    placeholder="Full Name (BN)"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleChange}
                    placeholder="NID"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-md"
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-md"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    name="present_address"
                    value={formData.present_address}
                    onChange={handleChange}
                    placeholder="Present Address"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="text"
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    placeholder="Permanent Address"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="District"
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    className="border px-3 py-2 rounded-md"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 text-right">
                  <button
                    className="bg-[#0097A7] hover:bg-[#00838F] text-white py-2 px-6 rounded-md font-medium transition-colors duration-200"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : editingCustomer
                      ? "Update Customer"
                      : "Add Customer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Customer Modal */}
          {viewCustomer && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 print:hidden">
              <div
                className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                onClick={() => setViewCustomer(null)}
              ></div>
              <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-10 transform transition-transform scale-100 opacity-100 animate-slide-in-up">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Customer Details
                  </h2>
                  <button
                    onClick={() => setViewCustomer(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>

                <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <p>
                      <strong>Full Name (EN):</strong>{" "}
                      {viewCustomer.full_name_en}
                    </p>
                    <p>
                      <strong>Full Name (BN):</strong>{" "}
                      {viewCustomer.full_name_bn}
                    </p>
                    <p>
                      <strong>Phone:</strong> {viewCustomer.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {viewCustomer.email}
                    </p>
                    <p>
                      <strong>NID:</strong> {viewCustomer.national_id}
                    </p>
                    <p>
                      <strong>DOB:</strong>{" "}
                      {viewCustomer.dob ? viewCustomer.dob.split("T")[0] : ""}
                    </p>
                    <p>
                      <strong>Gender:</strong> {viewCustomer.gender}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
                    <p>
                      <strong>Present Address:</strong>{" "}
                      {viewCustomer.present_address}
                    </p>
                    <p>
                      <strong>Permanent Address:</strong>{" "}
                      {viewCustomer.permanent_address}
                    </p>
                    <p>
                      <strong>City:</strong> {viewCustomer.city}
                    </p>
                    <p>
                      <strong>District:</strong> {viewCustomer.district}
                    </p>
                    <p>
                      <strong>Postal Code:</strong> {viewCustomer.postal_code}
                    </p>
                  </div>

                  {viewCustomer.active_membership && (
                    <div className="md:col-span-2 space-y-2 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Membership Details</h3>
                      <p>
                        <strong>Membership No:</strong>{" "}
                        {viewCustomer.active_membership.membership_no}
                      </p>
                      <p>
                        <strong>Card No:</strong>{" "}
                        {viewCustomer.active_membership.physical_card_no || "N/A"}
                      </p>
                      <p>
                        <strong>Plan Name:</strong>{" "}
                        {viewCustomer.active_membership.plan.name}
                      </p>
                      <p>
                        <strong>Plan Price:</strong>{" "}
                        {viewCustomer.active_membership.plan.price} {viewCustomer.active_membership.plan.currency}
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {viewCustomer.active_membership.start_date.split("T")[0]}
                      </p>
                      <p>
                        <strong>End Date:</strong>{" "}
                        {viewCustomer.active_membership.end_date.split("T")[0]}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {viewCustomer.active_membership.status.toUpperCase()}
                        </span>
                      </p>
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

export default Customer;