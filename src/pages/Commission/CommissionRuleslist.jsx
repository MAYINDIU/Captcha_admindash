import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlineClose, AiOutlineEye, AiOutlineEdit, AiOutlineCloseCircle } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import 'react-toastify/dist/ReactToastify.css';

// =========================================================================
// 💡 CONSTANTS
// =========================================================================

const RECIPIENT_TYPES = [
    { label: "Agent (Global)", value: "agent" },
    { label: "Branch (Global)", value: "branch" },
    { label: "Specific User ID (e.g., Owner/Director)", value: "specific_user" },
];

const SCOPE_OPTIONS = [
    { label: "Down Payment", value: "down_payment" },
    { label: "Installment", value: "installment" },
    { label: "Any (All Payments)", value: "any" },
];

const COMMISSION_BASE_OPTIONS = [
    { label: "Payment Amount", value: "amount" },
    { label: "Line Item Quantity", value: "quantity" },
];

// Helper to map API recipient type model back to form value
const RECIVERSE_RECIPIENT_MAP = {
    "App\\Models\\Agent": "agent",
    "App\\Models\\Branch": "branch",
    "App\\Models\\User": "specific_user",
};

// =========================================================================
// 💡 HELPER COMPONENTS (DetailSection & DetailItem)
// =========================================================================

const DetailSection = ({ title, children, color }) => (
    <div className={`border-l-4 ${color} pl-4 bg-white p-5 rounded-lg shadow-sm border-2 border-gray-100`}>
        <h3 className="text-xl font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, isPercentage = false }) => (
    <p>
        <strong className="text-gray-600">{label}:</strong> 
        <span className={`ml-2 font-medium ${isPercentage ? 'text-green-700 font-bold' : 'text-gray-900'}`}>
            {value}
        </span>
    </p>
);

// =========================================================================
// 💡 NEW COMMISSION RULE CREATE FORM COMPONENT (Already Exists)
// =========================================================================

const CommissionRuleCreateForm = ({ BASE_URL, token, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        scope: "any",
        trigger: "on_payment",
        recipient_type: "agent",
        recipient_id: "",
        percentage: "",
        flat_amount: "",
        active: true,
        commission_base: "amount",
    });
    const [loading, setLoading] = useState(false);

    const getRecipientTypeModel = (type) => {
        switch (type) {
            case "agent": return "App\\Models\\Agent";
            case "branch": return "App\\Models\\Branch";
            case "specific_user": return "App\\Models\\User";
            default: return "App\\Models\\Agent";
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isPercentageSet = parseFloat(formData.percentage) > 0;
        const isFlatAmountSet = parseFloat(formData.flat_amount) > 0;

        // Validation
        if (!formData.name || (!isPercentageSet && !isFlatAmountSet)) {
            toast.error("Please provide a name and a value for Percentage or Flat Amount.");
            setLoading(false);
            return;
        }

        const payload = {
            name: formData.name,
            scope: formData.scope,
            trigger: formData.trigger,
            recipient_type: getRecipientTypeModel(formData.recipient_type), 
            percentage: isPercentageSet ? parseFloat(formData.percentage).toFixed(2) : null,
            flat_amount: isFlatAmountSet ? parseFloat(formData.flat_amount).toFixed(2) : null,
            active: formData.active,
            recipient_id: formData.recipient_type === 'specific_user' && formData.recipient_id 
                ? parseInt(formData.recipient_id) 
                : null,
            meta: {
                commission_base: formData.commission_base,
                applies_to: formData.scope 
            },
        };
        
        if (formData.recipient_type !== 'specific_user') {
            payload.recipient_id = null;
        }

        try {
            const url = `${BASE_URL}/commission-rules`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            toast.success(`Rule "${payload.name}" created successfully!`);
            onSuccess();
            onClose();

        } catch (err) {
            console.error("Commission Rule Creation Failed:", err);
            toast.error(`Failed to create rule: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-10 max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Create New Commission Rule</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Rule Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            placeholder="e.g., Agent Down Payment Commission"
                        />
                    </div>

                    <div>
                        <label htmlFor="recipient_type" className="block text-sm font-medium text-gray-700">Recipient Type <span className="text-red-500">*</span></label>
                        <select
                            name="recipient_type"
                            id="recipient_type"
                            value={formData.recipient_type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                        >
                            {RECIPIENT_TYPES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {formData.recipient_type === 'specific_user' && (
                        <div>
                            <label htmlFor="recipient_id" className="block text-sm font-medium text-gray-700">Recipient User ID</label>
                            <input
                                type="number"
                                name="recipient_id"
                                id="recipient_id"
                                value={formData.recipient_id}
                                onChange={handleChange}
                                placeholder="Enter specific User ID (e.g., 5)"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="scope" className="block text-sm font-medium text-gray-700">Applies To (Scope) <span className="text-red-500">*</span></label>
                            <select
                                name="scope"
                                id="scope"
                                value={formData.scope}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                            >
                                {SCOPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="commission_base" className="block text-sm font-medium text-gray-700">Base Calculation <span className="text-red-500">*</span></label>
                            <select
                                name="commission_base"
                                id="commission_base"
                                value={formData.commission_base}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                            >
                                {COMMISSION_BASE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">Percentage (%)</label>
                            <input
                                type="number"
                                name="percentage"
                                id="percentage"
                                value={formData.percentage}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="e.g., 5.00"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="flat_amount" className="block text-sm font-medium text-gray-700">Flat Amount (BDT)</label>
                            <input
                                type="number"
                                name="flat_amount"
                                id="flat_amount"
                                value={formData.flat_amount}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="e.g., 1000.00"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={formData.active}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-700">
                            Active Rule
                        </label>
                    </div>

                    <div className="pt-4 border-t mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                loading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            } transition-colors`}
                        >
                            {loading ? "Creating Rule..." : "Create Commission Rule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =========================================================================
// 💡 NEW COMMISSION RULE EDIT FORM COMPONENT
// =========================================================================

const CommissionRuleEditForm = ({ BASE_URL, token, onClose, onSuccess, initialRule }) => {
    const [formData, setFormData] = useState(() => ({
        id: initialRule.id,
        name: initialRule.name || "",
        scope: initialRule.scope || "any",
        trigger: initialRule.trigger || "on_payment",
        // Map API model to form value
        recipient_type: RECIVERSE_RECIPIENT_MAP[initialRule.recipient_type] || "agent", 
        recipient_id: initialRule.recipient_id || "",
        percentage: initialRule.percentage || "",
        flat_amount: initialRule.flat_amount || "",
        active: initialRule.active,
        commission_base: initialRule.meta?.commission_base || "amount",
    }));
    const [loading, setLoading] = useState(false);

    const getRecipientTypeModel = (type) => {
        switch (type) {
            case "agent": return "App\\Models\\Agent";
            case "branch": return "App\\Models\\Branch";
            case "specific_user": return "App\\Models\\User";
            default: return "App\\Models\\Agent";
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isPercentageSet = parseFloat(formData.percentage) > 0;
        const isFlatAmountSet = parseFloat(formData.flat_amount) > 0;

        // Validation
        if (!formData.name || (!isPercentageSet && !isFlatAmountSet)) {
            toast.error("Please provide a name and a value for Percentage or Flat Amount.");
            setLoading(false);
            return;
        }

        const payload = {
            _method: "PUT", // Important for Laravel PUT method via form data
            name: formData.name,
            scope: formData.scope,
            trigger: formData.trigger,
            recipient_type: getRecipientTypeModel(formData.recipient_type), 
            percentage: isPercentageSet ? parseFloat(formData.percentage).toFixed(2) : null,
            flat_amount: isFlatAmountSet ? parseFloat(formData.flat_amount).toFixed(2) : null,
            active: formData.active,
            recipient_id: formData.recipient_type === 'specific_user' && formData.recipient_id 
                ? parseInt(formData.recipient_id) 
                : null,
            meta: {
                commission_base: formData.commission_base,
                applies_to: formData.scope 
            },
        };
        
        if (formData.recipient_type !== 'specific_user') {
            payload.recipient_id = null;
        }

        try {
            const url = `${BASE_URL}/commission-rules/${formData.id}`;
            const res = await fetch(url, {
                method: "POST", // Use POST with _method:PUT for some APIs
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            toast.success(`Rule "${payload.name}" updated successfully!`);
            onSuccess();
            onClose();

        } catch (err) {
            console.error("Commission Rule Update Failed:", err);
            toast.error(`Failed to update rule: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-10 max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Commission Rule #{formData.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form fields are identical to the create form but pre-populated */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Rule Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            placeholder="e.g., Agent Down Payment Commission"
                        />
                    </div>

                    <div>
                        <label htmlFor="recipient_type" className="block text-sm font-medium text-gray-700">Recipient Type <span className="text-red-500">*</span></label>
                        <select
                            name="recipient_type"
                            id="recipient_type"
                            value={formData.recipient_type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                        >
                            {RECIPIENT_TYPES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {formData.recipient_type === 'specific_user' && (
                        <div>
                            <label htmlFor="recipient_id" className="block text-sm font-medium text-gray-700">Recipient User ID</label>
                            <input
                                type="number"
                                name="recipient_id"
                                id="recipient_id"
                                value={formData.recipient_id}
                                onChange={handleChange}
                                placeholder="Enter specific User ID (e.g., 5)"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="scope" className="block text-sm font-medium text-gray-700">Applies To (Scope) <span className="text-red-500">*</span></label>
                            <select
                                name="scope"
                                id="scope"
                                value={formData.scope}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                            >
                                {SCOPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="commission_base" className="block text-sm font-medium text-gray-700">Base Calculation <span className="text-red-500">*</span></label>
                            <select
                                name="commission_base"
                                id="commission_base"
                                value={formData.commission_base}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                            >
                                {COMMISSION_BASE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">Percentage (%)</label>
                            <input
                                type="number"
                                name="percentage"
                                id="percentage"
                                value={formData.percentage}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="e.g., 5.00"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="flat_amount" className="block text-sm font-medium text-gray-700">Flat Amount (BDT)</label>
                            <input
                                type="number"
                                name="flat_amount"
                                id="flat_amount"
                                value={formData.flat_amount}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="e.g., 1000.00"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={formData.active}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-700">
                            Active Rule
                        </label>
                    </div>

                    <div className="pt-4 border-t mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                loading 
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            } transition-colors`}
                        >
                            {loading ? "Saving Changes..." : "Update Commission Rule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =========================================================================
// 💡 NEW COMMISSION RULE DELETE CONFIRMATION COMPONENT
// =========================================================================

const CommissionRuleDeleteConfirmation = ({ BASE_URL, token, onClose, onSuccess, rule }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const url = `${BASE_URL}/commission-rules/${rule.id}`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            toast.success(`Rule "${rule.name}" (ID: ${rule.id}) deleted successfully!`);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Commission Rule Deletion Failed:", err);
            toast.error(`Failed to delete rule: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm z-10">
                <div className="text-center">
                    <AiOutlineCloseCircle size={40} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete the rule: <br />
                        <strong className="text-red-600">"{rule.name}" (ID: {rule.id})</strong>?
                    </p>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                            loading 
                            ? 'bg-red-300 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                        }`}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};


// =========================================================================
// 💡 MAIN COMMISSION RULES LIST COMPONENT (UPDATED)
// =========================================================================

const CommissionRulesList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [commissionRules, setCommissionRules] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [viewRule, setViewRule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 

    // 💡 NEW STATES for Edit and Delete
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [ruleToEdit, setRuleToEdit] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState(null);
    
    // State for server-side pagination
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem("authToken"); 
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1"; 
    const RULES_ENDPOINT = "/commission-rules"; 

    // Helper functions
    const getStatusColorClass = (isActive) => isActive 
        ? "bg-green-100 text-green-700" 
        : "bg-red-100 text-red-700";

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year}`;
    };

    // Fetch all Commission Rules with pagination parameters
    const fetchCommissionRules = useCallback(async (page, newPerPage) => {
        if (!token) {
            toast.error("Authentication token missing.");
            return;
        }

        setLoading(true);
        try {
            const url = `${BASE_URL}${RULES_ENDPOINT}?page=${page}&per_page=${newPerPage}`; 

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            
            setCommissionRules(data.data || []); 
            setTotalRows(data.meta.total);
            
        } catch (err) {
            console.error("Failed to fetch commission rules:", err);
            toast.error("Failed to load commission rules.");
        }
        setLoading(false);
    }, [token]);

    useEffect(() => {
        fetchCommissionRules(currentPage, perPage); 
    }, [fetchCommissionRules, currentPage, perPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1); 
    };

    // 💡 NEW ACTION MODAL FUNCTIONS

    const openViewModal = async (ruleFromList) => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}${RULES_ENDPOINT}/${ruleFromList.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            // Fetch the full rule details before showing the modal
            setViewRule({ ...ruleFromList, ...data.data }); 
        } catch (err) {
            console.error(err);
            toast.error("Failed to load commission rule details");
        }
        setLoading(false);
    };

    const openEditModal = async (ruleFromList) => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}${RULES_ENDPOINT}/${ruleFromList.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            // Fetch the full rule details before showing the modal
            setRuleToEdit({ ...ruleFromList, ...data.data });
            setIsEditModalOpen(true); 
        } catch (err) {
            console.error(err);
            toast.error("Failed to load rule for editing.");
        }
        setLoading(false);
    };

    const openDeleteModal = (rule) => {
        setRuleToDelete(rule);
        setIsDeleteModalOpen(true);
    };

    // Callback after a successful create, edit, or delete action
    const handleActionSuccess = () => {
        // Close all modals
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        // Re-fetch data for the current page
        fetchCommissionRules(currentPage, perPage);
    };

    const filteredRules = commissionRules.filter(
        (rule) =>
            (rule.id && String(rule.id).toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rule.name && rule.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rule.scope && rule.scope.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rule.trigger && rule.trigger.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rule.recipient_type && rule.recipient_type.split('\\').pop().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Data Table Columns for Commission Rules (UPDATED with Edit/Delete)
    const columns = [
        { 
            name: "SL. NO", 
            selector: (row, index) => (currentPage - 1) * perPage + index + 1, 
            sortable: false,
            width: "80px",
        },
        { name: "ID", selector: (row) => row.id, sortable: true, width: "70px" },
        { name: "Rule Name", selector: (row) => row.name, sortable: true, minWidth: "200px" },
        { 
            name: "Applies To", 
            selector: (row) => row.meta?.applies_to || "N/A", 
            sortable: true,
        },
        { 
            name: "Recipient Type", 
            selector: (row) => row.recipient_type.split('\\').pop(), 
            sortable: true 
        },
        { 
            name: "Value", 
            selector: (row) => row.percentage || row.flat_amount, 
            sortable: true, 
            right: true, 
            cell: (row) => (
                <span className="font-bold text-blue-700">
                    {row.percentage ? `${parseFloat(row.percentage).toFixed(2)} %` : `${parseFloat(row.flat_amount).toFixed(2)} BDT (Flat)`}
                </span>
            )
        },
        {
            name: "Status",
            selector: (row) => (row.active ? "Active" : "Inactive"),
            sortable: true,
            cell: (row) => (
                <span
                    className={`py-1 px-3.5 rounded-full text-xs font-semibold uppercase ${getStatusColorClass(
                        row.active
                    )}`}
                >
                    {row.active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            name: "Created At",
            selector: (row) => formatDate(row.created_at),
            sortable: true,
            width: "120px"
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-2">
                    <AiOutlineEye
                        size={22}
                        className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                        onClick={() => openViewModal(row)}
                    />
                    <AiOutlineEdit
                        size={22}
                        className="cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="Edit Rule"
                        onClick={() => openEditModal(row)}
                    />
                    <AiOutlineCloseCircle
                        size={22}
                        className="cursor-pointer text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Rule"
                        onClick={() => openDeleteModal(row)}
                    />
                </div>
            ),
            width: "120px"
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: "#2563EB", 
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                borderBottom: "2px solid #1E40AF",
                padding: "16px", 
                letterSpacing: "0.5px",
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                color: "#374151", 
                borderLeft: "1px solid #F3F4F6", 
                borderRight: "1px solid #F3F4F6",
                padding: "12px", 
            },
        },
        rows: { 
            style: { 
                minHeight: "50px",
                borderBottom: "1px solid #E5E7EB", 
            },
            highlightOnHoverStyle: {
                backgroundColor: '#EFF6FF', 
                borderBottomColor: '#DBEAFE', 
                cursor: 'pointer',
            },
        },
        pagination: {
            style: {
                backgroundColor: 'white', 
                borderTop: '1px solid #E5E7EB',
                padding: '10px 0',
            }
        },
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100"> 
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-4 sm:p-6 md:p-8">
                    <ToastContainer position="top-right" autoClose={3000} />
                    
                    {/* Header and Search Card */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">COMMISSION RULE MANAGEMENT</h2>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            {/* Create New Rule Button */}
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-200 w-full sm:w-auto text-sm"
                            >
                                + Create New Rule
                            </button>
                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search by Name, Recipient, or Trigger..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 px-4 py-2 rounded-xl w-full sm:w-80 md:w-96 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Data Table Container Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={filteredRules} 
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            progressPending={loading}
                            highlightOnHover
                            striped
                            responsive
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="p-6 text-gray-500 font-medium text-center">
                                    {loading ? "Loading data..." : "No commission rules found matching your criteria."}
                                </div>
                            }
                        />
                    </div>

                    {/* View Rule Modal */}
                    {viewRule && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setViewRule(null)}></div>
                            <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl z-10 overflow-y-auto max-h-[95vh] transform transition-all duration-300 scale-100 opacity-100 border border-gray-200">
                                <button onClick={() => setViewRule(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                    <AiOutlineClose size={24} />
                                </button>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
                                    <span className="text-blue-600">Rule Detail</span>: #{viewRule.id}
                                </h2>

                                <div className="space-y-6">
                                    <DetailSection title="Rule Overview" color="border-blue-500">
                                        <DetailItem label="Rule Name" value={viewRule.name} />
                                        <DetailItem label="Rule ID" value={viewRule.id} />
                                        <DetailItem label="Scope" value={viewRule.scope} />
                                        <DetailItem label="Trigger" value={viewRule.trigger} />
                                        <DetailItem label="Created At" value={formatDate(viewRule.created_at)} />
                                        <DetailItem label="Last Updated" value={formatDate(viewRule.updated_at)} />
                                    </DetailSection>

                                    <DetailSection title="Commission Details" color="border-green-500">
                                        <DetailItem 
                                            label="Recipient Type" 
                                            value={viewRule.recipient_type.split('\\').pop() + (viewRule.recipient_id ? ` (ID: ${viewRule.recipient_id})` : ' (Global)')} 
                                        />
                                        <DetailItem 
                                            label="Applies To" 
                                            value={viewRule.meta?.applies_to || 'Entire Order'} 
                                        />
                                        <DetailItem 
                                            label="Percentage" 
                                            value={viewRule.percentage ? `${parseFloat(viewRule.percentage).toFixed(2)} %` : 'N/A'} 
                                            isPercentage
                                        />
                                        <DetailItem 
                                            label="Flat Amount" 
                                            value={viewRule.flat_amount ? `${parseFloat(viewRule.flat_amount).toFixed(2)} BDT` : 'N/A'} 
                                        />
                                        <p className="sm:col-span-2">
                                            <strong className="text-gray-600">Status:</strong> 
                                            <span className={`font-semibold capitalize rounded-full py-1 px-3 ml-2 text-xs ${getStatusColorClass(viewRule.active)}`}>
                                                {viewRule.active ? "Active" : "Inactive"}
                                            </span>
                                        </p>
                                    </DetailSection>

                                    {viewRule.meta && Object.keys(viewRule.meta).length > 0 && (
                                        <div className="border-l-4 border-amber-500 pl-4 bg-white p-5 rounded-lg shadow-sm border-2 border-gray-100">
                                            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">Rule Metadata</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600">
                                                {Object.entries(viewRule.meta).map(([key, value]) => (
                                                    <DetailItem 
                                                        key={key}
                                                        label={key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} 
                                                        value={String(value)} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create Rule Modal Render */}
                    {isCreateModalOpen && (
                        <CommissionRuleCreateForm
                            BASE_URL={BASE_URL}
                            token={token}
                            onClose={() => setIsCreateModalOpen(false)}
                            onSuccess={handleActionSuccess} 
                        />
                    )}

                    {/* 💡 Edit Rule Modal Render */}
                    {isEditModalOpen && ruleToEdit && (
                        <CommissionRuleEditForm
                            BASE_URL={BASE_URL}
                            token={token}
                            initialRule={ruleToEdit}
                            onClose={() => setIsEditModalOpen(false)}
                            onSuccess={handleActionSuccess} 
                        />
                    )}

                    {/* 💡 Delete Confirmation Modal Render */}
                    {isDeleteModalOpen && ruleToDelete && (
                        <CommissionRuleDeleteConfirmation
                            BASE_URL={BASE_URL}
                            token={token}
                            rule={ruleToDelete}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onSuccess={handleActionSuccess} 
                        />
                    )}
                </main>
            </div>
        </div>
    );
};


export default CommissionRulesList;