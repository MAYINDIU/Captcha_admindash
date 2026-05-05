import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components (Assuming these are available)
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// ================= ICONS =================
// Simplified icon usage for professionalism
const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {children}
  </svg>
);
const PlusIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></Icon> );
const EditIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9" /></Icon> );
const DeleteIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></Icon> );
const EyeIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" /></Icon> );
const XIcon = ({ className = "h-6 w-6" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon> );
const InfoIcon = ({ className = "h-5 w-5" }) => ( <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon> );

// ================= HELPER =================
const formatToTk = (amount) => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return "N/A";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  })
    .format(numericAmount)
    .replace("BDT", "Tk");
};

// ================= SKELETON LOADERS =================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-[#1976D2] flex items-center px-6 space-x-4">
             <SkeletonPulse className="h-4 w-8 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-24 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-32 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-20 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-16 bg-blue-400/50" />
             <SkeletonPulse className="h-4 w-20 ml-auto bg-blue-400/50" />
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-8" />
                <SkeletonPulse className="h-6 w-24 rounded-full" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-12" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ================= FORM MODAL COMPONENT (Small & Material) =================

const ServiceFormModal = ({
  service,
  categories,
  onClose,
  onSave,
  isEdit,
}) => {
  const [formData, setFormData] = useState(() => ({
    name: service?.name || "",
    category_id: service?.category_id || "",
    price: service?.price || "",
    commission_percentage: service?.commission_percentage || "",
    attributes: service?.attributes
      ? JSON.stringify(service.attributes, null, 2)
      : '{\n  "duration": "",\n  "location": "",\n  "includes": []\n}',
  }));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.category_id) newErrors.category_id = "Required";
    if (!formData.price || isNaN(parseFloat(formData.price)))
      newErrors.price = "Invalid";

    if (formData.commission_percentage === "" || isNaN(parseFloat(formData.commission_percentage))) {
      newErrors.commission_percentage = "Invalid";
    } else {
      const commission = parseFloat(formData.commission_percentage);
      if (commission < 0 || commission > 100) {
        newErrors.commission_percentage = "0-100";
      }
    }

    try {
      if (formData.attributes.trim()) JSON.parse(formData.attributes);
    } catch {
      newErrors.attributes = "Invalid JSON";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const parsedAttributes = formData.attributes.trim() ? JSON.parse(formData.attributes) : {};
      
      const formValues = {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        commission_percentage: parseFloat(formData.commission_percentage),
        attributes: parsedAttributes,
      };
      onSave(formValues);
    } else {
        toast.error("Please fill in all required fields and check JSON format.");
    }
  };

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4">
      <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all relative">
        {/* Modal Header */}
        <div className="px-7 py-5 bg-white rounded-t-2xl border-b-2 border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-800">
            {isEdit ? "Edit Service" : "Create New Service"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-full"
            aria-label="Close"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          {/* Section 1: Core Details */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-indigo-700 border-b border-gray-200 pb-3 mb-4">
              Core Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <div className="mb-4">
                <label htmlFor="name" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                  {errors.name && <span className="text-red-500 ml-2 text-xs font-semibold">{`(${errors.name})`}</span>}
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Concierge"
                  className={`mt-1 block w-full px-3 py-2.5 border ${
                    errors.name ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } rounded-lg shadow-sm text-sm focus:border-indigo-500 transition duration-150`}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category_id" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                  {errors.category_id && <span className="text-red-500 ml-2 text-xs font-semibold">({errors.category_id})</span>}
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2.5 border ${
                    errors.category_id ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } rounded-lg shadow-sm text-sm focus:border-indigo-500 bg-white transition duration-150`}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Financials */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-green-700 border-b border-gray-200 pb-3 mb-4">
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <div className="mb-4">
                <label htmlFor="price" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (Tk)
                  {errors.price && <span className="text-red-500 ml-2 text-xs font-semibold">{`(${errors.price})`}</span>}
                </label>
                <input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="15000"
                  className={`mt-1 block w-full px-3 py-2.5 border ${
                    errors.price ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } rounded-lg shadow-sm text-sm focus:border-indigo-500 transition duration-150`}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="commission_percentage" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission (%)
                  {errors.commission_percentage && <span className="text-red-500 ml-2 text-xs font-semibold">{`(${errors.commission_percentage})`}</span>}
                </label>
                <input
                  id="commission_percentage"
                  type="number"
                  value={formData.commission_percentage}
                  onChange={handleChange}
                  placeholder="5"
                  className={`mt-1 block w-full px-3 py-2.5 border ${
                    errors.commission_percentage ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  } rounded-lg shadow-sm text-sm focus:border-indigo-500 transition duration-150`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Attributes */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-3 mb-4">
              Advanced Attributes (JSON)
            </h3>
            <textarea
              id="attributes"
              rows="5"
              value={formData.attributes}
              onChange={handleChange}
              className={`block w-full p-3 font-mono text-xs border ${
                errors.attributes ? "border-red-400 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              } rounded-lg shadow-sm focus:border-indigo-500 transition duration-150 bg-gray-50`}
            ></textarea>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-1.5 text-indigo-400"/>
              Use valid JSON format. Example: `"duration": "3 nights"`.
            </p>
          </div>

          {/* Footer/Actions */}
          <div className="flex justify-end space-x-4 pt-5 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-md hover:shadow-lg"
            >
              {isEdit ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ================= DETAILS MODAL COMPONENT (Small & Material) =================

const ServiceDetailsModal = ({ service, onClose }) => {
  const getAttribute = (key, fallback = "N/A") =>
    service.attributes?.[key] || "N/A";

  // Reusable card for modal details
  const DetailCard = ({ label, value, className = "bg-gray-50 text-gray-700" }) => (
    <div className={`p-3 rounded-lg transition ${className} border border-gray-100`}>
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-base font-bold truncate">{value}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4"> {/* Backdrop blur removed */}
      {/* Reduced max-w-md for a smaller modal */}
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all relative">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 border-b pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 truncate">
              {service.name} Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 -mr-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Core Details Grid - Tighter Spacing */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <DetailCard label="Category" value={service.category?.name || "Uncategorized"} className="bg-indigo-50 text-indigo-800 font-semibold" />
            <DetailCard label="Price" value={formatToTk(service.price)} className="bg-green-50 text-green-700 font-extrabold text-lg" />
            <DetailCard label="Commission" value={`${service.commission_percentage || 0}%`} />
            <DetailCard label="Duration" value={getAttribute("duration")} />
            <DetailCard label="Location" value={getAttribute("location")} />
          </div>
          
          {/* Features Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
            <p className="font-bold text-sm text-gray-700 mb-2 flex items-center">
              <PlusIcon className="h-4 w-4 mr-2 text-indigo-600" /> Features Included
            </p>
            {Array.isArray(service.attributes?.includes) &&
            service.attributes.includes.length > 0 ? (
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {service.attributes.includes.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-500 text-sm">
                No specific features listed.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


// ================= MAIN COMPONENT =================
const Services = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
  const token = localStorage.getItem("authToken");

  // --- React Query: Fetch Categories ---
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories?limit=100`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      return data.data ? data.data.filter((c) => c.type === "service") : [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // --- React Query: Fetch Services ---
  const { data: services = [], isLoading: loading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/services?limit=100`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!token,
  });

  // --- React Query: Mutation for Save (Create/Update) ---
  const saveMutation = useMutation({
    mutationFn: async ({ formValues, isEdit, id }) => {
      const url = isEdit ? `${API_BASE}/services/${id}` : `${API_BASE}/services`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save service.");
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isEdit ? "Service successfully updated! 🎉" : "New service created! ✨");
      queryClient.invalidateQueries(["services"]);
      setShowFormModal(false);
    },
    onError: (err) => {
      toast.error(err.message || "An unexpected error occurred!");
    }
  });

  // CRUD Handlers remain the same
  const openServiceModal = (service = null) => {
    setSelectedService(service);
    setShowFormModal(true);
  };

  const handleSaveService = (formValues) => {
    const isEdit = !!selectedService;
    const id = selectedService?.id;
    saveMutation.mutate({ formValues, isEdit, id });
  };

  // --- React Query: Mutation for Delete ---
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete service.");
      }
      return id;
    },
    onSuccess: () => {
      toast.success("Service deleted successfully! 🗑️");
      queryClient.invalidateQueries(["services"]);
    },
    onError: (err) => {
      toast.error(err.message || "Error deleting service.");
    }
  });

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the service. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444", 
      cancelButtonColor: "#6B7280", 
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const filteredServices = useMemo(() => services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [services, searchTerm]);

  // ================== RENDER (Final Professional Design) ==================
  return (
    // BG color applied to the main content area (left side of the screen)
    <div className="flex h-screen overflow-hidden bg-gray-100"> 
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-6 md:p-10">
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />

          <div className="max-w-7xl mx-auto">
            {/* Header & Add Button */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Service Management <span className="text-indigo-600">Console</span>
              </h1>
              <button
                onClick={() => openServiceModal(null)}
                className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200 text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Add New Service
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search by service name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
              />
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {loading ? (
                <TableSkeleton />
              ) : filteredServices.length === 0 ? (
                <div className="p-10 text-center text-gray-500 text-lg">
                  🔍 No services found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1976D2]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Commission</th>
                        <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredServices.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-indigo-50/50 transition duration-150 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                              {item.category?.name || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-green-600">{formatToTk(item.price)}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-700">{item?.commission_percentage || 0}%</td>
                          <td className="px-6 py-3 whitespace-nowrap text-center space-x-1">
                            <button
                              title="View Details"
                              onClick={() => handleViewDetails(item)}
                              className="text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 p-2 rounded-full transition duration-200 shadow-sm"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Edit Service"
                              onClick={() => openServiceModal(item)}
                              className="text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 p-2 rounded-full transition duration-200 shadow-sm"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Delete Service"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 p-2 rounded-full transition duration-200 shadow-sm"
                            >
                              <DeleteIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================== MODALS ================== */}
          {showDetailsModal && selectedService && (
            <ServiceDetailsModal
              service={selectedService}
              onClose={() => setShowDetailsModal(false)}
            />
          )}

          {showFormModal && (
            <ServiceFormModal
              service={selectedService}
              categories={categories}
              onClose={() => {
                setShowFormModal(false);
                setSelectedService(null);
              }}
              onSave={handleSaveService}
              isEdit={!!selectedService}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Services;