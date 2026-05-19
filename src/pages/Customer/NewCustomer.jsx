import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Assuming these are your layout components and their paths are correct
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { formatDateTime } from "../../utils/Utils";

// =========================================================================
// 1. ICON COMPONENTS
// =========================================================================

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
const EyeIcon = () => ( // View Details Icon
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EditIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
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
const DeleteIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
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
        <div className="h-12 bg-[#1976D2] flex items-center px-6 space-x-4">
             {[...Array(6)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/6 bg-blue-400/50" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-24" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// --- Pagination Component ---
const Pagination = ({ meta, onPageChange, loading }) => {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page, from, to, total } = meta;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= last_page && page !== current_page && !loading) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-200">
            <p className="text-sm text-gray-600">
                Showing <span className="font-bold">{from}</span> to <span className="font-bold">{to}</span> of <span className="font-bold">{total}</span> results
            </p>
            <nav className="flex items-center gap-2">
                <button onClick={() => handlePageChange(current_page - 1)} disabled={current_page === 1 || loading} className="px-3 py-1 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    &laquo; Previous
                </button>
                <span className="text-sm text-gray-600">Page {current_page} of {last_page}</span>
                <button onClick={() => handlePageChange(current_page + 1)} disabled={current_page === last_page || loading} className="px-3 py-1 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next &raquo;
                </button>
            </nav>
        </div>
    );
};

// =========================================================================
// 2. MAIN COMPONENT
// =========================================================================

const NewCustomer = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    
    // NOTE: Replace this with your actual API details
    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1"; 
    const token = localStorage.getItem("authToken");

    // Helper function to safely get value for pre-population
    const getVal = (customer, key) => customer?.[key] || "";

    // --- React Query: Fetch Customers ---
    const { data: customerData, isLoading: loading } = useQuery({
        queryKey: ["customers", currentPage],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/customers?per_page=${itemsPerPage}&page=${currentPage}`, { 
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (res.status === 401) {
                localStorage.clear();
                throw new Error("Unauthorized");
            }
            if (!res.ok) throw new Error("Failed to load customers");
            return await res.json();
        },
        keepPreviousData: true,
        enabled: !!token,
    });
    const customers = customerData?.data || [];
    const meta = customerData?.meta;

    // --- React Query: Fetch Employees ---
    const { data: employees = [] } = useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/employees?per_page=10000`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Failed to load employees");
            const data = await res.json();
            return data.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Mutation for Save (Create/Update) ---
    const saveMutation = useMutation({
        mutationFn: async ({ formValues, isEdit, customerId }) => {
            const method = isEdit ? "PUT" : "POST";
            const url = isEdit ? `${API_BASE}/customers/${customerId}` : `${API_BASE}/customers`;

            // Comprehensive Payload
            const payload = {
                name: formValues.name,
                email: formValues.email,
                source_me_id: formValues.source_me_id,
                ...(!isEdit && formValues.password ? { password: formValues.password } : {}),
                father_name: formValues.father_name,
                mother_name: formValues.mother_name,
                marital_status: formValues.marital_status,
                spouse_name: formValues.spouse_name,
                profession: formValues.profession,
                permanent_address: formValues.permanent_address,
                present_address: formValues.present_address,
                contact_number: formValues.contact_number,
                residence_phone: formValues.residence_phone,
                whatsapp_number: formValues.whatsapp_number,
                national_id: formValues.national_id,
                passport_number: formValues.passport_number,
                nationality: formValues.nationality,
                religion: formValues.religion,
                date_of_birth: formValues.date_of_birth,
                blood_group: formValues.blood_group,
                nominee_name: formValues.nominee_name,
                nominee_relation: formValues.nominee_relation,
                nominee_phone: formValues.nominee_phone,
                authorized_person_name: formValues.authorized_person_name,
                authorized_person_address: formValues.authorized_person_address,
                joint_applicants: formValues.joint_applicants,
            };

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                let errorMessage = data.message || `Failed to ${isEdit ? 'update' : 'create'} customer.`;
                if (data.errors) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    if (firstErrorKey) errorMessage = data.errors[firstErrorKey][0];
                }
                throw new Error(errorMessage);
            }
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success(`Customer ${variables.isEdit ? 'updated' : 'created'} successfully!`);
            queryClient.invalidateQueries(["customers"]);
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    // --- React Query: Mutation for Delete ---
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_BASE}/customers/${id}`, { 
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to delete customer");
            }
            return id;
        },
        onSuccess: () => {
            toast.success("Customer deleted successfully!");
            queryClient.invalidateQueries(["customers"]);
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    // Handle Customer Creation/Update (UPDATED: Added Loading State)
  const handleSaveCustomer = async (formValues, isEdit = false, customerId = null) => {
    // --- VALIDATION START ---
    // Check if source_me_id is empty, null, or undefined
    if (!formValues.source_me_id) {
        toast.error("You must select an introducer!");
        // If you want a SweetAlert popup instead of a toast:
        // Swal.fire("Required Field", "Please select an introducer before saving.", "warning");
        return; // Stop the function execution here
    }
    // --- VALIDATION END ---

    // Show loading spinner after form confirmation
    Swal.showLoading();

    try {
        await saveMutation.mutateAsync({ formValues, isEdit, customerId });
        // Hide loading spinner before showing result
        Swal.hideLoading();
    } catch (err) {
        Swal.hideLoading(); 
        // Error toast handled in onError
    }
};

    // Handle Customer Deletion 
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this! The customer will be permanently deleted.",
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


    // --- Form Modal Function (Creation/Edit) ---

     // --- Core Function: openCustomerModal ---
        const openCustomerModal = async (customerToEdit = null) => {
            const isEdit = !!customerToEdit;

            // Helper function to safely get value for pre-population (from component scope)
            const getVal = (customer, key) => customer?.[key] || ""; 
            
            const InputField = (id, label, type = 'text', value = '', placeholder = '', required = false, colSpan = 'col-span-2') => `
                <div class="${colSpan}">
                    <label for="${id}" class="block text-xs font-medium text-gray-600 mb-0.5 mt-2">${label} ${required ? '<span class="text-red-500">*</span>' : ''}</label>
                    <input 
                        id="${id}" 
                        type="${type}"
                        class="swal2-input !m-0 !w-full !px-3 !py-2 !text-sm !border-gray-300 !rounded-md focus:!border-blue-500 focus:!ring-blue-500" 
                        placeholder="${placeholder}"
                        value="${getVal(customerToEdit, id.replace('customer-', '')) || value}"
                        ${required ? 'data-required="true"' : ''}
                    >
                </div>
            `;

            // Global scope এ ফাংশনগুলো রেজিস্টার করা
window.handleSearch = (e, selectId) => {
    const filter = e.value.toLowerCase();
    const select = document.getElementById(selectId);
    if (!select) return;
    const options = select.options;

    for (let i = 0; i < options.length; i++) {
        const text = options[i].text.toLowerCase();
        if (options[i].value === "") continue; 
        options[i].style.display = text.includes(filter) ? "block" : "none";
    }
};

window.updateInput = (select, inputId) => {
    const input = document.getElementById(inputId);
    if (!select || !input) return;
    const selectedText = select.options[select.selectedIndex].text;
    if (select.value !== "") {
        input.value = selectedText;
    }
};

            // [MODIFIED] Helper function for the employee dropdown
            // Added onchange event to console log the selected value (this.value is the employee ID)
        const DropdownField = (id, label, options = [], selectedValue = '', required = false, colSpan = 'col-span-2') => {
    // আগে থেকে ডাটা থাকলে সেটি বের করা
    const selectedEmp = options?.find(opt => opt.id == selectedValue);
    const initialName = selectedEmp ? `${selectedEmp.full_name_en} (${selectedEmp.employee_code})` : '';

    return `
    <div class="${colSpan} mb-3">
        <label class="block text-xs font-semibold text-gray-700 mb-1">
            ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
        </label>
        
        <div class="flex flex-col border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white">
            <input 
                type="text" 
                id="${id}-input" 
                placeholder="নাম অথবা আইডি দিয়ে খুঁজুন..." 
                value="${initialName}"
                oninput="handleSearch(this, '${id}')"
                class="!w-full !px-3 !py-2 !text-sm !border-0 !border-b !border-gray-100 focus:!ring-0 outline-none bg-gray-50"
                autocomplete="off"
            />

            <select 
                id="${id}" 
                size="4"
                onchange="updateInput(this, '${id}-input')"
                class="swal2-select !m-0 !w-full !px-3 !py-1 !text-sm !border-0 focus:!ring-0 outline-none cursor-pointer scrollbar-thin" 
                ${required ? 'data-required="true"' : ''}
            >
                <option value="">-- তালিকার উপর ক্লিক করে সিলেক্ট করুন --</option>
                ${options?.map(option => `
                    <option 
                        value="${option?.id}" 
                        ${(selectedValue == option?.id) ? 'selected' : ''}
                        class="py-1 border-b border-gray-50 last:border-0"
                    >
                        ${option?.full_name_en} (${option?.employee_code}) - ${option?.rank || 'N/A'}
                    </option>
                `).join('')}
            </select>
        </div>
    </div>
    `;
};
            
            const { value: formValues } = await Swal.fire({
                customClass: {
                    popup: 'shadow-2xl rounded-xl !max-w-4xl', 
                    title: '!text-gray-800 !font-extrabold',
                    confirmButton: '!shadow-md !font-bold !py-2 !px-4',
                    cancelButton: '!shadow-md !font-bold !py-2 !px-4',
                    closeButton: 'hover:bg-red-500/10 !text-gray-700 hover:!text-red-600 !p-1 !rounded-full !absolute !top-3 !right-3' 
                },
                title: `<span class="text-2xl font-bold text-[#1976D2]">${isEdit ? 'Edit Customer' : 'Add New Customer'}</span>`,
                width: '800px',
                showCloseButton: true, 
                
                html: `
                    <div class="p-1 pt-0 text-left">
                        
                        <h3 class="text-base font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">👤 Basic & Contact Information</h3>
                        <div class="grid grid-cols-4 gap-x-4 gap-y-1">
                            ${InputField('customer-name', 'Customer Name', 'text', '', 'e.g., Jane Doe', true, 'col-span-2')}
                            ${InputField('customer-email', 'Email Address', 'email', '', 'e.g., jane@example.com', true, 'col-span-2')}
                            ${!isEdit ? InputField('customer-password', 'Password', 'password', '', 'Enter a password (required)', true, 'col-span-2') : ''}
                            ${InputField('customer-contact_number', 'Contact Number', 'tel', '', 'e.g., 017xxxxxxxx', false, 'col-span-2')}
                            ${InputField('customer-residence_phone', 'Residence Phone', 'tel', '', 'Optional', false, 'col-span-2')}
                            ${InputField('customer-whatsapp_number', 'WhatsApp Number', 'tel', '', 'Optional', false, 'col-span-2')}
                        </div>

                        <h3 class="text-base font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">💼 Employee Assignment</h3>
                       <div class="grid grid-cols-4 gap-x-4 gap-y-1">
    ${DropdownField(
        'customer-source_me_id', 
        'Introducer Employee', 
        employees, 
        getVal(customerToEdit, 'source_me_id'), 
        false, 
        'col-span-4'
    )}
</div>

                        <h3 class="text-base font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">📚 Personal & Identification Details</h3>
                        <div class="grid grid-cols-4 gap-x-4 gap-y-1">
                            ${InputField('customer-father_name', 'Father\'s Name', 'text', '', 'e.g., John Doe', false, 'col-span-2')}
                            ${InputField('customer-mother_name', 'Mother\'s Name', 'text', '', 'e.g., Mary Doe', false, 'col-span-2')}
                            ${InputField('customer-profession', 'Profession', 'text', '', 'e.g., Doctor, Engineer', false, 'col-span-2')}
                            ${InputField('customer-date_of_birth', 'Date of Birth', 'date', '', 'YYYY-MM-DD', false, 'col-span-2')}
                            ${InputField('customer-marital_status', 'Marital Status', 'text', '', 'e.g., Married/Single', false, 'col-span-2')}
                            ${InputField('customer-spouse_name', 'Spouse Name', 'text', '', 'Required if Married', false, 'col-span-2')}
                            ${InputField('customer-nationality', 'Nationality', 'text', '', 'e.g., Bangladeshi', false, 'col-span-2')}
                            ${InputField('customer-religion', 'Religion', 'text', '', 'e.g., Islam, Hinduism', false, 'col-span-2')}
                            ${InputField('customer-blood_group', 'Blood Group', 'text', '', 'e.g., A+', false, 'col-span-2')}
                            ${InputField('customer-national_id', 'National ID', 'text', '', 'NID Number', false, 'col-span-2')}
                            ${InputField('customer-passport_number', 'Passport Number', 'text', '', 'Optional', false, 'col-span-2')}
                        </div>

                        <h3 class="text-base font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">📍 Address Details</h3>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                            ${InputField('customer-permanent_address', 'Permanent Address', 'text', '', 'Full Permanent Address', false, 'col-span-1')}
                            ${InputField('customer-present_address', 'Present Address', 'text', '', 'Full Present Address', false, 'col-span-1')}
                        </div>

                        <h3 class="text-base font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">🤝 Nominee & Joint Information</h3>
                        <div class="grid grid-cols-4 gap-x-4 gap-y-1">
                            ${InputField('customer-nominee_name', 'Nominee Name', 'text', '', 'Nominee Full Name', false, 'col-span-2')}
                            ${InputField('customer-nominee_relation', 'Nominee Relation', 'text', '', 'e.g., Brother, Wife', false, 'col-span-2')}
                            ${InputField('customer-nominee_phone', 'Nominee Phone', 'tel', '', 'Nominee Contact Number', false, 'col-span-2')}
                            ${InputField('customer-authorized_person_name', 'Authorized Person Name', 'text', '', 'Optional', false, 'col-span-2')}
                            ${InputField('customer-authorized_person_address', 'Authorized Person Address', 'text', '', 'Optional', false, 'col-span-2')}
                            ${InputField('customer-joint_applicants', 'Joint Applicants', 'text', '', 'Comma separated names (Optional)', false, 'col-span-2')}
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: `${isEdit ? 'Update Customer' : 'Create Customer'}`,
                cancelButtonText: "Cancel",
                
                confirmButtonColor: "#1976D2",
                cancelButtonColor: "#922a0aff",

                preConfirm: () => {
                    const name = document.getElementById("customer-name").value.trim();
                    const email = document.getElementById("customer-email").value.trim();
                    const passwordInput = document.getElementById("customer-password");
                    const password = isEdit ? null : passwordInput?.value.trim() || ""; 

                    if (!name || !email || (!isEdit && !password)) {
                        Swal.showValidationMessage(`<span class="text-red-500 font-semibold">⚠️ Customer Name, Email, and Password (for new customers) are required!</span>`);
                        return false;
                    }
                    
                    // Collect all field values (source_me_id is correctly captured here for submission)
                    return { 
                        name, 
                        email, 
                        password,
                        source_me_id: document.getElementById('customer-source_me_id').value || null, 
                        father_name: document.getElementById('customer-father_name').value.trim(),
                        mother_name: document.getElementById('customer-mother_name').value.trim(),
                        marital_status: document.getElementById('customer-marital_status').value.trim(),
                        spouse_name: document.getElementById('customer-spouse_name').value.trim(),
                        profession: document.getElementById('customer-profession').value.trim(),
                        permanent_address: document.getElementById('customer-permanent_address').value.trim(),
                        present_address: document.getElementById('customer-present_address').value.trim(),
                        contact_number: document.getElementById('customer-contact_number').value.trim(),
                        residence_phone: document.getElementById('customer-residence_phone').value.trim(),
                        whatsapp_number: document.getElementById('customer-whatsapp_number').value.trim(),
                        national_id: document.getElementById('customer-national_id').value.trim(),
                        passport_number: document.getElementById('customer-passport_number').value.trim(),
                        nationality: document.getElementById('customer-nationality').value.trim(),
                        religion: document.getElementById('customer-religion').value.trim(),
                        date_of_birth: document.getElementById('customer-date_of_birth').value.trim(),
                        blood_group: document.getElementById('customer-blood_group').value.trim(),
                        nominee_name: document.getElementById('customer-nominee_name').value.trim(),
                        nominee_relation: document.getElementById('customer-nominee_relation').value.trim(),
                        nominee_phone: document.getElementById('customer-nominee_phone').value.trim(),
                        authorized_person_name: document.getElementById('customer-authorized_person_name').value.trim(),
                        authorized_person_address: document.getElementById('customer-authorized_person_address').value.trim(),
                        joint_applicants: document.getElementById('customer-joint_applicants').value.trim(),
                    };
                },
            });

            if (formValues) {
                console.log(formValues)
                handleSaveCustomer(formValues, isEdit, customerToEdit?.id); 
            }
        };
    
    // Open Customer Details Modal (UPDATED: Nice Design)
    const openCustomerDetailsModal = (customer) => {
        // Function to create a detail row with a label and value, handling null values
        const DetailRow = (label, value, colSpan = 1) => `
            <div class="col-span-${colSpan} border-b border-gray-100 py-2">
                <p class="text-sm font-medium text-gray-500">${label}</p>
            </div>
            <div class="col-span-${colSpan} border-b border-gray-100 py-2">
                <p class="text-sm text-gray-900 font-semibold">${value || '<span class="text-gray-400">N/A</span>'}</p>
            </div>
        `;

        // Format dates for display
        const formatDate = (dateString) => dateString ? formatDateTime(dateString) : null;

        Swal.fire({
            customClass: {
                popup: 'shadow-2xl rounded-xl !max-w-4xl', 
                title: '!text-gray-800 !font-extrabold',
                confirmButton: '!shadow-md !font-bold !py-2 !px-4',
                closeButton: 'hover:bg-gray-500/10 !text-gray-700 hover:!text-gray-900 !p-1 !rounded-full !absolute !top-3 !right-3'
            },
            title: `<span class="text-2xl font-bold text-[#1976D2]">Customer Details: ${customer.name}</span>`,
            width: '800px',
            showCloseButton: true,
            
            html: `
                <div class="p-4 text-left">
                    
                    <h3 class="text-lg font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">Primary Information</h3>
                    <div class="grid grid-cols-4 gap-x-4">
                        ${DetailRow("Customer Name", customer.name, 2)}
                        ${DetailRow("Email", customer.email, 2)}
                        ${DetailRow("Contact Number", customer.contact_number, 2)}
                        ${DetailRow("Date of Birth", formatDate(customer.date_of_birth), 2)}
                    </div>

                    <h3 class="text-lg font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">Personal & Identification</h3>
                    <div class="grid grid-cols-4 gap-x-4">
                        ${DetailRow("Father's Name", customer.father_name)}
                        ${DetailRow("Mother's Name", customer.mother_name)}
                        ${DetailRow("Marital Status", customer.marital_status)}
                        ${DetailRow("Spouse Name", customer.spouse_name)}
                        ${DetailRow("Profession", customer.profession)}
                        ${DetailRow("Nationality", customer?.nationality)}
                        ${DetailRow("Religion", customer?.religion)}
                        ${DetailRow("Blood Group", customer?.blood_group)}
                        ${DetailRow("National ID", customer?.national_id)}
                        ${DetailRow("Source Me ID", customer?.source_me_id)}
                        ${DetailRow("Passport Number", customer?.passport_number)}
                    </div>

                    <h3 class="text-lg font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">Address & Contact</h3>
                    <div class="grid grid-cols-4 gap-x-4">
                        ${DetailRow("Permanent Address", customer.permanent_address, 2)}
                        ${DetailRow("Present Address", customer.present_address, 2)}
                        ${DetailRow("Residence Phone", customer.residence_phone)}
                        ${DetailRow("Whatsapp Number", customer.whatsapp_number)}
                    </div>

                    <h3 class="text-lg font-extrabold text-[#1976D2] mt-4 mb-2 border-b pb-1">Nominee & Joint</h3>
                    <div class="grid grid-cols-4 gap-x-4">
                        ${DetailRow("Nominee Name", customer.nominee_name)}
                        ${DetailRow("Nominee Relation", customer.nominee_relation)}
                        ${DetailRow("Nominee Phone", customer.nominee_phone)}
                        ${DetailRow("Authorized Person Name", customer.authorized_person_name)}
                        ${DetailRow("Authorized Person Address", customer.authorized_person_address, 2)}
                        ${DetailRow("Joint Applicants", customer.joint_applicants, 2)}
                    </div>

                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: "Close",
            confirmButtonColor: "#6B7280", 
        });
    };



    // --- Filtering Logic ---

    const filteredCustomers = customers.filter(customer => {
        const name = customer.name?.toLowerCase() || "";
        const email = customer.email?.toLowerCase() || "";
        const role = customer.role?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();

        return (
            name.includes(term) ||
            email.includes(term) ||
            role.includes(term) ||
            customer.id.toString().includes(searchTerm)
        );
    });


    // --- Component Render ---

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <main className="grow p-4 md:p-8">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                        {/* Title and Action Buttons */}
                        <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200">
                            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                                All Customers 🤝
                            </h2>

                            <button
                                onClick={() => openCustomerModal(null)} 
                                className="flex items-center bg-[#1976D2] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-150 ease-in-out transform hover:scale-[1.02]"
                            >
                                <PlusIcon />
                                <span>Add New Customer</span>
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search by Name, Email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        {/* Table View */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                <div className="overflow-x-auto">
                                    {filteredCustomers.length === 0 ? ( 
                                        <div className="text-center py-10">
                                            <p className="text-xl text-gray-500">
                                                {searchTerm 
                                                    ? `No customers found matching "${searchTerm}".` 
                                                    : "No customers found. Click 'Add New Customer' to create one."}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-[#1976D2] text-white">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
                                                        ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                        Created At
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider rounded-tr-lg">
                                                        Actions
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredCustomers.map((customer) => (
                                                        <tr
                                                            key={customer.id}
                                                            className="hover:bg-gray-50 transition duration-150"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {customer.id}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-800 font-semibold max-w-xs truncate">
                                                                {customer.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                                {customer.email}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">
                                                                    {customer.role || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDateTime(customer.created_at)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    {/* View Details Button */}
                                                                    <button
                                                                        onClick={() => openCustomerDetailsModal(customer)} 
                                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition"
                                                                        title="View Details"
                                                                    >
                                                                        <EyeIcon />
                                                                    </button>
                                                                    {/* Edit Button */}
                                                                    <button
                                                                        onClick={() => openCustomerModal(customer)} 
                                                                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                                                                        title="Edit Customer"
                                                                    >
                                                                        <EditIcon />
                                                                    </button>
                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={() => handleDelete(customer.id)}
                                                                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                                        title="Delete Customer"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <Pagination meta={meta} onPageChange={setCurrentPage} loading={loading} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NewCustomer;
