import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Assuming you have these paths for your layout components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header"; 

// Import Icons
import { AiOutlineClose } from "react-icons/ai";
import { MdOutlineNumbers } from "react-icons/md"; 
import { FaDollarSign, FaSortNumericUp, FaEye } from "react-icons/fa"; 

// Import Utilities
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css"; 

// --- Custom SVG Icon Components (For UI buttons) ---

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
             <SkeletonPulse className="h-4 w-10" />
             <SkeletonPulse className="h-4 w-1/4" />
             <SkeletonPulse className="h-4 w-1/6" />
             <SkeletonPulse className="h-4 w-1/6" />
             <SkeletonPulse className="h-4 w-1/6" />
             <SkeletonPulse className="h-4 w-20 ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-20" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// --- Utility Functions ---

const formatNumber = (value, decimalPlaces = 2) => {
    if (value === null || value === undefined || value === "") return "N/A";
    const num = parseFloat(value);
    if (isNaN(num)) return "N/A";

    return num.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// --- Detail View Components ---

const DetailItem = ({ label, value, unit = '' }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
        <span className="text-gray-500 font-medium">{label}:</span>
        <span className="text-gray-800 font-semibold text-right">
            {value}
            {unit && <span className="ml-1 text-sm text-gray-400">{unit}</span>}
        </span>
    </div>
);

const DetailViewContent = ({ data }) => {
    
    // Note: API often wraps rank data under 'rank_definition' but uses 'rank' and 'meta' directly.
    const rankDef = data.rank_definition || {};
    const meta = data.meta || {};

    const formatCurrency = (val) => formatNumber(val, 0) + ' BDT';
    const formatPercent = (val) => formatNumber(val, 2) + '%';
    const formatCount = (val) => formatNumber(val, 0);
    const formatMonth = (val) => formatNumber(val, 0) + ' Months';
    const formatOrder = (val) => formatNumber(val, 0);
    const formatShareValue = (val) => val > 0 ? (formatNumber(val / 1000000, 2) + ' Million BDT') : 'N/A'; 

    let directRequirementLabel = null;
    let directRequirementValue = null;

    if (meta.direct_mm_required > 0) {
      directRequirementLabel = 'Direct MM Required';
      directRequirementValue = formatCount(meta.direct_mm_required);
    } else if (meta.direct_pd_required > 0) {
      directRequirementLabel = 'Direct PD Required';
      directRequirementValue = formatCount(meta.direct_pd_required);
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4">Rank Definition</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem label="Code" value={rankDef.code || data.rank || 'N/A'} />
            <DetailItem label="Name" value={rankDef.name || 'N/A'} />
            <DetailItem label="Sequence" value={formatOrder(data.sequence)} />
            <DetailItem label="Description" value={rankDef.description || 'N/A'} />
        </div>

        <h3 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4 pt-4">Incentive Requirements</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem label="Personal Sales Target" value={formatCurrency(data.personal_sales_target)} />
            <DetailItem label="Down Payment Bonus" value={formatPercent(data.bonus_down_payment)} />
            <DetailItem label="Installment Bonus" value={formatPercent(data.bonus_installment)} />
            {(meta.monthly_incentive && meta.monthly_incentive > 0) && (
                <DetailItem label="Monthly Incentive" value={formatCurrency(meta.monthly_incentive)} />
            )}
            {(meta.fund_percentage && meta.fund_percentage > 0) && (
                <DetailItem label="Fund Percentage" value={formatPercent(meta.fund_percentage)} />
            )}
        </div>

        <h3 className="text-xl font-bold text-blue-700 border-b pb-2 mb-4 pt-4">Qualification Metrics (Meta)</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem label="Shares Required" value={formatCount(meta.shares_required)} />
            {meta.share_value > 0 && (
                <DetailItem label="Share Value" value={formatShareValue(meta.share_value)} />
            )}
            <DetailItem label="Min Share/Period" value={formatCount(meta.minimum_share_per_period)} />
            <DetailItem label="Evaluation Period" value={formatMonth(meta.period_months)} />
            
            {directRequirementLabel && (
                <DetailItem label={directRequirementLabel} value={directRequirementValue} />
            )}
        </div>
      </div>
    );
  }

// --- Input Field Component (Includes Label and Right Icons) ---

const InputField = ({ label, icon: Icon, name, placeholder, type = "text", step = "any", disabled, isViewMode, value, handleChange }) => (
    <div className="space-y-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
            {(name === 'code' || name === 'name' || name === 'personal_sales_target' || name === 'sequence') && (
                <span className="text-red-500 ml-1">*</span>
            )}
        </label>
        <div className="relative">
            {/* Left Icon */}
            {Icon && <Icon className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />}
            
            {/* Right Icon/Text */}
            {name.includes('bonus') || name.includes('fund_percentage') ? (
                <span className={`absolute top-1/2 right-3 transform -translate-y-1/2 font-bold ${isViewMode ? 'text-gray-600' : 'text-gray-400'}`}>%</span>
            ) : name.includes('target') || name.includes('incentive') ? (
                <FaDollarSign className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" size={18} />
            ) : null}

            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={e => !isViewMode && handleChange(e)}
                placeholder={placeholder}
                step={step}
                disabled={disabled || isViewMode} 
                className={`border pl-10 pr-10 py-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${
                    (disabled || isViewMode) ? "bg-gray-50 cursor-not-allowed text-gray-600" : "bg-white"
                }`}
            />
        </div>
    </div>
);

// --- Main Component ---

const RankRequirements = () => {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null); 
  const [isViewMode, setIsViewMode] = useState(false); 
  const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/rank-requirements";


  // Form Data Structure matching the API payload fields
  const [formData, setFormData] = useState({
    code: "", 
    name: "", // Assumed field for display name, though not in the raw JSON keys
    personal_sales_target: "",
    bonus_down_payment: "",
    bonus_installment: "",
    sequence: "",
    
    // Fields that will be put into the 'meta' object
    shares_required: "",
    minimum_share_per_period: "",
    period_months: "",
    monthly_incentive: "", 
    direct_mm_required: "", 
    direct_pd_required: "", 
    fund_percentage: "", 
  });

  const token = localStorage.getItem("authToken");

  // --- React Query: Fetch Rank Requirements ---
  const { data: designations = [], isLoading: loading } = useQuery({
    queryKey: ["rankRequirements"],
    queryFn: async () => {
        const res = await fetch(`${API_BASE}?per_page=1000`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load rank requirements");
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
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload),
          });
          
          if (!res.ok) {
              let error = {};
              const contentType = res.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                  try { error = await res.json(); } catch (e) { error.message = "Invalid JSON response"; }
              } else {
                  error.message = `Request failed with status ${res.status}`;
              }
              throw new Error(error.errors ? Object.values(error.errors).flat().join(" ") : (error.message || "Operation failed"));
          }
          return res.json();
      },
      onSuccess: (_, variables) => {
          toast.success(variables.id ? "Rank Requirement updated! 🎉" : "Rank Requirement added! ✨");
          queryClient.invalidateQueries(["rankRequirements"]);
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
          toast.success("Rank Requirement deleted! 🗑️");
          queryClient.invalidateQueries(["rankRequirements"]);
      },
      onError: (err) => toast.error(err.message)
  });

  const filteredDesignations = useMemo(() => designations.filter(
      (item) =>
        item.rank_definition?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rank_definition?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [designations, searchTerm]);

  console.log(filteredDesignations)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const openModal = (requirement = null, viewMode = false) => {
    setIsViewMode(viewMode); 
    
    if (requirement) {
      setEditingDesignation(requirement);
      setFormData({
        code: requirement.rank_definition?.code || requirement.rank || "",
        name: requirement.rank_definition?.name || "",
        personal_sales_target: requirement.personal_sales_target || "",
        bonus_down_payment: requirement.bonus_down_payment || "",
        bonus_installment: requirement.bonus_installment || "",
        sequence: requirement.sequence || "",
        
        // Meta fields mapping from the API response structure
        shares_required: requirement.meta?.shares_required || "",
        minimum_share_per_period: requirement.meta?.minimum_share_per_period || "",
        period_months: requirement.meta?.period_months || "",
        monthly_incentive: requirement.meta?.monthly_incentive || "",
        direct_mm_required: requirement.meta?.direct_mm_required || "",
        direct_pd_required: requirement.meta?.direct_pd_required || "",
        fund_percentage: requirement.meta?.fund_percentage || "",
      });
    } else {
      setEditingDesignation(null);
      setFormData({
        code: "", name: "", personal_sales_target: "", bonus_down_payment: "", bonus_installment: "", sequence: "",
        shares_required: "", minimum_share_per_period: "", period_months: "", monthly_incentive: "",
        direct_mm_required: "", direct_pd_required: "", fund_percentage: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setIsViewMode(false); 
  }

  // 🚨 This function builds the JSON body exactly to your specified format
  const handleSubmit = () => {
    if (isViewMode) return;
    
    if (!formData.code || !formData.name || !formData.personal_sales_target || !formData.sequence) {
      toast.error("Code, Name, Sales Target, and Sequence are required.");
      return;
    }

    // 1. Build the payload adhering to the required structure
    const payload = {
      // Main Rank Fields
      rank: formData.code, // Corresponds to "rank"
      sequence: parseInt(formData.sequence) || 0, // Corresponds to "sequence"
      personal_sales_target: parseFloat(formData.personal_sales_target) || 0, // Corresponds to "personal_sales_target"
      bonus_down_payment: parseFloat(formData.bonus_down_payment) || 0, // Corresponds to "bonus_down_payment"
      bonus_installment: parseFloat(formData.bonus_installment) || 0, // Corresponds to "bonus_installment"
      direct_required: 0, // Corresponds to "direct_required" (always 0 in your sample)
      
      // Nested Meta Object
      meta: {
        shares_required: parseInt(formData.shares_required) || 0,
        minimum_share_per_period: parseInt(formData.minimum_share_per_period) || 1,
        period_months: parseInt(formData.period_months) || 4,
        
        // Conditionally add optional meta fields if they have a value
        ...(formData.monthly_incentive && { monthly_incentive: parseFloat(formData.monthly_incentive) }),
        ...(formData.direct_mm_required && { direct_mm_required: parseInt(formData.direct_mm_required) }),
        ...(formData.direct_pd_required && { direct_pd_required: parseInt(formData.direct_pd_required) }),
        ...(formData.fund_percentage && { fund_percentage: parseFloat(formData.fund_percentage) }),
      },
      // Note: We omit 'share_value' as it seems to be a static value or calculated on the backend.
    };
    
    // 2. Cleanup empty/null values (optional but good practice)
    Object.keys(payload).forEach(key => (payload[key] === null || payload[key] === "") && delete payload[key]);
    if (payload.meta) {
      Object.keys(payload.meta).forEach(key => (payload.meta[key] === null || payload.meta[key] === "") && delete payload.meta[key]);
    }

    saveMutation.mutate({ id: editingDesignation?.id, payload });
  };

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

  const columns = [
    { name: "SL No", selector: (row, index) => index + 1, sortable: false, width: "100px" },
    { name: "Code", selector: (row) => row.rank_definition?.code || row.rank, sortable: true, width: "100px" },
    { name: "Name", selector: (row) => row.rank_definition?.name, sortable: true, grow: 2 },
        { name: "MM Required", selector: (row) => row?.meta?.direct_mm_required, sortable: true, grow: 2 },
    { 
      name: "Target (BDT)", 
      selector: (row) => formatNumber(row.personal_sales_target, 0), 
      sortable: true,
      right: true,
      grow: 1,
    },
    { 
      name: "Shares Req.", 
      selector: (row) => row.meta?.shares_required, 
      sortable: true,
      center: true,
      width: "180px"
    },
    {
      name: "Details", 
      cell: (row) => (
        <button
          className="text-blue-500 hover:text-blue-700 transition duration-150 p-2 rounded-full hover:bg-blue-50"
          onClick={() => openModal(row, true)} 
          title="View Details"
        >
          <FaEye size={20} /> 
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "80px",
      style: { justifyContent: 'center' },
      headerStyle: { justifyContent: 'center' }
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-1 justify-center items-center">
          <button
            className="text-blue-500 hover:text-blue-700 transition duration-150 p-2 rounded-full hover:bg-blue-50"
            onClick={() => openModal(row)}
            title="Edit Rank Requirement"
          >
            <EditIcon size={20} /> 
          </button>
          {/* <button
            className="text-red-500 hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
            title="Delete Rank Requirement"
          >
            <DeleteIcon size={20} />
          </button> */}
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
              <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Rank Requirements Management</h2>
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
                  <PlusIcon /> Add Requirement
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
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 20, 30]}
                highlightOnHover
                striped
                responsive
                customStyles={customStyles}
                noDataComponent={
                  <div className="p-4 text-gray-500">No rank requirements found.</div>
                }
              />
            )}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 transition-opacity duration-300 overflow-y-auto">
              <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl my-8 z-10 transform transition-transform duration-300 scale-100">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition duration-150"
                >
                  <AiOutlineClose size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  {isViewMode ? `Details for ${editingDesignation?.rank_definition?.name || editingDesignation?.rank || 'Rank'}` : (editingDesignation ? "Edit Rank Requirement" : "Add New Rank Requirement")} 
                </h2>
                
                {isViewMode && editingDesignation ? (
                    <DetailViewContent data={editingDesignation} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Rank Definition Fields (Code, Name) */}
                      <InputField
                          label="Rank Code"
                          icon={MdOutlineNumbers}
                          name="code"
                          placeholder="e.g., GM"
                          disabled={!!editingDesignation}
                          value={formData.code}
                          handleChange={handleChange}
                      />
                      <InputField
                          label="Rank Name"
                          icon={MdOutlineNumbers}
                          name="name"
                          placeholder="e.g., General Manager"
                          value={formData.name}
                          handleChange={handleChange}
                      />
                      
                      {/* Sequence (Sort Order) */}
                      {/* <InputField
                          label="Sequence / Sort Order"
                          icon={FaSortNumericUp}
                          type="number"
                          name="sequence"
                          placeholder="e.g., 5"
                          value={formData.sequence}
                          handleChange={handleChange}
                      /> */}

                      {/* Personal Sales Target */}
                      <InputField
                          label="Personal Sales Target (BDT)"
                          icon={FaDollarSign}
                          type="number"
                          name="personal_sales_target"
                          placeholder="e.g., 2000000"
                          value={formData.personal_sales_target}
                          handleChange={handleChange}
                      />

                      {/* Bonus Percentages */}
                      <InputField
                          label="Down Payment Bonus (%)"
                          icon={FaDollarSign} 
                          type="number"
                          name="bonus_down_payment"
                          placeholder="e.g., 30"
                          step="0.01"
                          value={formData.bonus_down_payment}
                          handleChange={handleChange}
                      />
                      <InputField
                          label="Installment Bonus (%)"
                          icon={FaDollarSign} 
                          type="number"
                          name="bonus_installment"
                          placeholder="e.g., 11"
                          step="0.01"
                          value={formData.bonus_installment}
                          handleChange={handleChange}
                      />

                      {/* Meta Fields - Shares & Period */}
                      <InputField
                          label="Shares Required"
                          icon={FaSortNumericUp}
                          type="number"
                          name="shares_required"
                          placeholder="e.g., 10"
                          value={formData.shares_required}
                          handleChange={handleChange}
                      />
                      <InputField
                          label="Min Share/Period"
                          icon={FaSortNumericUp}
                          type="number"
                          name="minimum_share_per_period"
                          placeholder="e.g., 1"
                          value={formData.minimum_share_per_period}
                          handleChange={handleChange}
                      />
                      <InputField
                          label="Evaluation Period (Months)"
                          icon={FaSortNumericUp}
                          type="number"
                          name="period_months"
                          placeholder="e.g., 4"
                          value={formData.period_months}
                          handleChange={handleChange}
                      />
                      <div className="col-span-1"></div> {/* Spacer for alignment */}

                      {/* Optional/Conditional Meta Fields Header */}
                      <div className="col-span-2">
                        <h3 className="text-md font-semibold text-gray-700 mt-2 border-t pt-4">Optional Incentives & Direct Requirements</h3>
                      </div>

                      <InputField
                          label="Monthly Incentive (BDT)"
                          icon={FaDollarSign}
                          type="number"
                          name="monthly_incentive"
                          placeholder="Optional (e.g., 100000)"
                          value={formData.monthly_incentive}
                          handleChange={handleChange}
                      />
                      <InputField
                          label="Fund Percentage (%)"
                          icon={FaDollarSign} 
                          type="number"
                          name="fund_percentage"
                          placeholder="Optional (e.g., 2)"
                          step="0.01"
                          value={formData.fund_percentage}
                          handleChange={handleChange}
                      />
                      
                      {/* Direct Requirements */}
                      <InputField
                          label="Direct MM Required"
                          icon={FaSortNumericUp}
                          type="number"
                          name="direct_mm_required"
                          placeholder="Optional (e.g., 12)"
                          value={formData.direct_mm_required}
                          handleChange={handleChange}
                      />
                      <InputField
                          label="Direct PD Required"
                          icon={FaSortNumericUp}
                          type="number"
                          name="direct_pd_required"
                          placeholder="Optional (e.g., 20)"
                          value={formData.direct_pd_required}
                          handleChange={handleChange}
                      />
                    </div>
                )}


                {/* Buttons */}
                <div className="mt-6">
                  {!isViewMode && ( 
                    <button
                      onClick={handleSubmit}
                      disabled={saveMutation.isLoading}
                      className={`w-full bg-[#1976D2] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-150 flex justify-center items-center ${
                        saveMutation.isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {saveMutation.isLoading && (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      )}
                      {editingDesignation ? "Update Requirement" : "Add Requirement"}
                    </button>
                  )}
                  {isViewMode && ( 
                    <button
                      onClick={closeModal}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-150"
                    >
                      Close Details
                    </button>
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

export default RankRequirements;