import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import {
  AiOutlineClose,
  AiOutlinePlus,
  AiOutlineSearch,
} from "react-icons/ai";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Hardcoded Bangladesh division and district data
const bangladeshLocations = {
  "Dhaka Division": [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  "Chittagong Division": [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chittagong",
    "Comilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  "Khulna Division": [
    "Bagerhat",
    "Chuadanga",
    "Jessore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  "Sylhet Division": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  "Rajshahi Division": [
    "Bogra",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Nawabganj",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
  ],
  "Barisal Division": [
    "Barguna",
    "Barisal",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
  ],
  "Rangpur Division": [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
  "Mymensingh Division": [
    "Jamalpur",
    "Mymensingh",
    "Netrokona",
    "Sherpur",
  ],
};

const Partnerlist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partners, setPartners] = useState([]);
  const [partnerTypes, setPartnerTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");

  const [formData, setFormData] = useState({
    type_id: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    district: "",
    division: "",
    facilities: "",
    discount_note: "",
    agreement_start_date: "",
    agreement_end_date: "",
    is_active: true,
  });

  // Fetch all partners
  const fetchPartners = async () => {
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/partners"
      );
      const data = await res.json();
      setPartners(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load partners");
    }
  };

  // Fetch all partner types
  const fetchPartnerTypes = async () => {
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/partner-types"
      );
      const data = await res.json();
      setPartnerTypes(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load partner types");
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchPartnerTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "division") {
        newFormData.district = ""; // Reset district when division changes
      }
      return newFormData;
    });
  };

  const openModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        type_id: partner.partner_type_id,
        name: partner.name,
        address: partner.address,
        phone: partner.contact_phone,
        email: partner.email || "",
        district: partner.district || "",
        division: partner.division || "",
        facilities: partner.facilities || "",
        discount_note: partner.discount_note || "",
        agreement_start_date: partner.agreement_start_date?.split("T")[0] || "",
        agreement_end_date: partner.agreement_end_date?.split("T")[0] || "",
        is_active: partner.is_active,
      });
    } else {
      setEditingPartner(null);
      setFormData({
        type_id: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        district: "",
        division: "",
        facilities: "",
        discount_note: "",
        agreement_start_date: "",
        agreement_end_date: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    try {
      const payload = {
        partner_type_id: formData.type_id,
        name: formData.name,
        contact_phone: formData.phone,
        email: formData.email,
        address: formData.address,
        district: formData.district,
        division: formData.division,
        facilities: formData.facilities,
        discount_note: formData.discount_note,
        agreement_start_date:
          formData.agreement_start_date ||
          new Date().toISOString().slice(0, 10),
        agreement_end_date:
          formData.agreement_end_date ||
          new Date().toISOString().slice(0, 10),
        is_active: formData.is_active,
      };

      let res;
      if (editingPartner?.id) { // Check for a valid ID to determine if editing
        res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/partners/${editingPartner.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/partners`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      if (res.ok) {
        toast.success(editingPartner ? "Partner updated!" : "Partner added!");
        fetchPartners();
        closeModal();
      } else {
        const error = await res.json();
        toast.error(error.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `https://pleasurebd.com/pleasure-backend/public/api/v1/partners/${id}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          toast.success("Partner deleted!");
          fetchPartners();
        } else {
          toast.error("Failed to delete");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error occurred");
      }
    }
  };

  // Filtering + Searching
  const filteredPartners = partners.filter((partner) => {
    return (
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (divisionFilter ? partner.division === divisionFilter : true)
    );
  });

  // Extract unique divisions for filter dropdown
  const divisions = [...new Set(partners.map((p) => p.division).filter(Boolean))];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow p-8">
          <ToastContainer position="top-right" autoClose={3000} />

  <div className="flex flex-col md:flex-row justify-between items-center mb-10 p-4 rounded-xl">
  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
    ALL DISCOUNT POINT LIST
  </h2>

  <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
    {/* Search Input */}
    <div className="relative w-full sm:w-auto flex-grow">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <AiOutlineSearch className="text-gray-400 dark:text-gray-500 text-lg" />
      </div>
      <input
        type="text"
        placeholder="Search partners by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-300"
      />
    </div>

    {/* Filter and Add Button Group */}
    <div className="flex items-center gap-4 w-full md:w-auto">
      {/* Division Filter */}
      <select
        value={divisionFilter}
        onChange={(e) => setDivisionFilter(e.target.value)}
        className="flex-grow px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-transparent rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0097A7] transition-all duration-300 cursor-pointer"
      >
        <option value="">All Divisions</option>
        {divisions.map((div, idx) => (
          <option key={idx} value={div}>
            {div}
          </option>
        ))}
      </select>

      {/* Add Partner Button */}
      <button
        className="flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold bg-[#0097A7] hover:bg-[#007b82] rounded-lg shadow-md transition-all duration-300"
        onClick={() => openModal()}
      >
        <AiOutlinePlus className="text-lg" />
        <span className="hidden md:inline">Add Partner</span>
      </button>
    </div>
  </div>
</div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-800"
              >
                {/* Status Bar */}
                <div
                  className={`absolute inset-x-0 top-0 h-2 ${
                    partner.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>

                <div className="p-6 flex-grow">
                  {/* Partner Name and Status */}
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate pr-4">
                      {partner?.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        partner.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {partner.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Type:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner?.type?.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Phone:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.contact_phone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Email:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">
                        {partner.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Division:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.division}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">District:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.district}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <strong className="font-semibold w-24">Address:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.address}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">
                        Agreement:
                      </strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {new Date(
                          partner.agreement_start_date
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          partner.agreement_end_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Facilities Section */}
                  {partner?.facilities && (
                    <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Facilities
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                        {partner.facilities}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="flex justify-end p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <button
                    aria-label="Edit partner"
                    onClick={() => openModal(partner)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400 transition-all duration-200 mx-1"
                    title="Edit Partner"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    aria-label="Delete partner"
                    onClick={() => handleDelete(partner.id)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400 transition-all duration-200 mx-1"
                    title="Delete Partner"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.035 21H7.965a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={closeModal}
              ></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl z-10 overflow-y-auto max-h-[90vh]">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <AiOutlineClose size={24} />
                </button>
                <h2 className="text-xl font-semibold mb-4 text-center">
                  {editingPartner ? "Edit Partner" : "Add Partner"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-sm">
                    Partner Type
                    <select
                      name="type_id"
                      value={formData.type_id}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    >
                      <option value="">-- Select Partner Type --</option>
                      {partnerTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm">
                    Partner Name
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    />
                  </label>

                  {/* Division Dropdown */}
                  <label className="text-sm">
                    Division
                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    >
                      <option value="">-- Select Division --</option>
                      {Object.keys(bangladeshLocations)?.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* District Dropdown */}
                  <label className="text-sm">
                    District
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                      disabled={!formData.division}
                    >
                      <option value="">-- Select District --</option>
                      {formData?.division &&
                        bangladeshLocations[formData?.division]?.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="text-sm">
                    Address
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    />
                  </label>

                  <label className="text-sm">
                    Phone
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    />
                  </label>

                  <label className="text-sm">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    />
                  </label>

                  <label className="text-sm md:col-span-2">
                    Facilities
                    <textarea
                      name="facilities"
                      value={formData.facilities}
                      onChange={handleChange}
                      rows={3}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    />
                  </label>

                  <label className="text-sm">
                    Agreement Start Date
                    <input
                      type="date"
                      name="agreement_start_date"
                      value={formData.agreement_start_date}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    />
                  </label>

                  <label className="text-sm">
                    Agreement End Date
                    <input
                      type="date"
                      name="agreement_end_date"
                      value={formData.agreement_end_date}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded-md w-full mt-1"
                    />
                  </label>

                  <label className="flex items-center gap-2 md:col-span-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    Active
                  </label>

                  <button
                    onClick={handleSubmit}
                    className="bg-[#0097A7] hover:bg-[#007b82] text-white py-2 rounded mt-2 md:col-span-2"
                  >
                    Save Partner
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

export default Partnerlist;