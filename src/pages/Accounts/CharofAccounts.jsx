import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlinePlus } from "react-icons/ai";

// ---------------------------------------------------------------- //
//                            SVG ICONS                           //
// ---------------------------------------------------------------- //
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7 1l4-4m-9 9h9" />
    </svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const customStyles = {
    headCells: {
        style: {
            background: "#1976D2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
        },
    },
    rows: {
        highlightOnHoverStyle: {
            backgroundColor: 'rgb(230, 244, 255)',
            borderBottomColor: '#FFFFFF',
            outline: '1px solid #FFFFFF',
        },
    },
};


// ---------------------------------------------------------------- //
//                         CHART OF ACCOUNTS LIST                     //
// ---------------------------------------------------------------- //

const CharofAccounts = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Filter and Pagination States ---
    const [searchTerm, setSearchTerm] = useState("");

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/accounting";
    const token = localStorage.getItem("authToken");

    // --- API Fetch Functions ---

    const fetchAccounts = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const url = `${API_BASE}/accounts`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                setAccounts(data);
            } else if (data?.data) {
                setAccounts(data.data);
            } else {
                toast.error("Failed to load chart of accounts");
            }
        } catch (error) {
            toast.error("Error fetching accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAccount = async (formValues, isEdit = false, accountId = null) => {
        Swal.showLoading();

        try {
            const method = isEdit ? "PUT" : "POST";
            const url = isEdit ? `${API_BASE}/accounts/${accountId}` : `${API_BASE}/accounts`;

            const payload = {
                code: formValues.code,
                name: formValues.name,
                type: formValues.type,
                meta: {
                    note: formValues.note,
                },
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
            Swal.hideLoading();

            if (res.ok) {
                toast.success(`Account ${isEdit ? 'updated' : 'created'} successfully!`);
                fetchAccounts();
            } else {
                toast.error(data.message || `Failed to ${isEdit ? 'update' : 'create'} account.`);
            }
        } catch (err) {
            Swal.hideLoading();
            toast.error(`An unexpected error occurred.`);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE}/accounts/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    toast.success("Account deleted successfully!");
                    fetchAccounts();
                } else toast.error("Failed to delete account.");
            } catch (err) { toast.error("Error deleting account."); }
        }
    };
    // --- Effects and Memo ---

    useEffect(() => {
        if (token) {
            fetchAccounts();
        }
    }, [token]);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm) return accounts;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return accounts.filter(account => {
            const name = account.name?.toLowerCase() || "";
            const code = String(account.code) || "";
            const type = account.type?.toLowerCase() || "";

            return (
                name.includes(lowerCaseSearch) ||
                code.includes(lowerCaseSearch) ||
                type.includes(lowerCaseSearch)
            );
        });
    }, [accounts, searchTerm]);

    // --- Render Functions (Modal/View/Pagination) ---
    const getVal = (account, key) => account?.[key] || "";
    const getMetaVal = (account, key) => account?.meta?.[key] || "";


    const openDetailsModal = (account) => {
        const DetailRow = (label, value) => `
            <div class="col-span-1 border-b border-gray-100 py-2">
                <p class="text-sm font-medium text-gray-500">${label}</p>
            </div>
            <div class="col-span-2 border-b border-gray-100 py-2">
                <p class="text-sm text-gray-900 font-semibold">${value || '<span class="text-gray-400">N/A</span>'}</p>
            </div>
        `;

        const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

        Swal.fire({
            customClass: {
                popup: 'shadow-2xl rounded-xl !max-w-2xl',
                title: '!text-gray-800 !font-extrabold',
                confirmButton: '!shadow-md !font-bold !py-2 !px-4',
                closeButton: 'hover:bg-gray-500/10 !text-gray-700 hover:!text-gray-900 !p-1 !rounded-full !absolute !top-3 !right-3'
            },
            title: `<span class="text-2xl font-bold text-[#1976D2]">Account Details: ${account.name}</span>`,
            width: '700px',
            showCloseButton: true,
            html: `
                <div class="p-4 text-left">
                    <div class="grid grid-cols-3 gap-x-4">
                        ${DetailRow("Account ID", account.id)}
                        ${DetailRow("Account Code", account.code)}
                        ${DetailRow("Account Name", account.name)}
                        ${DetailRow("Account Type", `<span class="font-bold capitalize">${account.type}</span>`)}
                        ${DetailRow("Meta Key", account.meta?.key)}
                        ${DetailRow("Created At", formatDate(account.created_at))}
                        ${DetailRow("Last Updated At", formatDate(account.updated_at))}
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: "Close",
            confirmButtonColor: "#6B7280",
        });
    };

    const openAccountModal = async (accountToEdit = null) => {
        const isEdit = !!accountToEdit;

        const InputField = (id, label, type = 'text', value = '', required = false) => `
            <label for="${id}" class="block text-xs font-medium text-gray-600 mb-1 mt-3">${label} ${required ? '<span class="text-red-500">*</span>' : ''}</label>
            <input id="${id}" type="${type}" class="swal2-input !m-0 !w-full" value="${value}" ${required ? 'required' : ''}>
        `;

        const SelectField = (id, label, options, selectedValue = '', required = false) => `
            <label for="${id}" class="block text-xs font-medium text-gray-600 mb-1 mt-3">${label} ${required ? '<span class="text-red-500">*</span>' : ''}</label>
            <select id="${id}" class="swal2-select !m-0 !w-full" ${required ? 'required' : ''}>
                ${options.map(opt => `<option value="${opt.value}" ${selectedValue === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
        `;

        const { value: formValues } = await Swal.fire({
            customClass: {
                popup: 'shadow-2xl rounded-xl !max-w-lg',
                title: '!text-gray-800 !font-extrabold',
                confirmButton: '!shadow-md !font-bold !py-2 !px-4',
            },
            title: `<span class="text-2xl font-bold text-[#1976D2]">${isEdit ? 'Edit Account' : 'Create New Account'}</span>`,
            html: `
                <div class="p-2 text-left">
                    ${InputField('account-code', 'Account Code', 'text', getVal(accountToEdit, 'code'), true)}
                    ${InputField('account-name', 'Account Name', 'text', getVal(accountToEdit, 'name'), true)}
                    ${SelectField('account-type', 'Account Type', [
                        { value: 'asset', label: 'Asset' },
                        { value: 'liability', label: 'Liability' },
                        { value: 'equity', label: 'Equity' },
                        { value: 'revenue', label: 'Revenue' },
                        { value: 'expense', label: 'Expense' },
                    ], getVal(accountToEdit, 'type'), true)}
                    ${InputField('account-note', 'Note (Optional)', 'text', getMetaVal(accountToEdit, 'note'))}
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: isEdit ? 'Update Account' : 'Create Account',
            confirmButtonColor: "#1976D2",
            preConfirm: () => {
                const code = document.getElementById("account-code").value.trim();
                const name = document.getElementById("account-name").value.trim();
                const type = document.getElementById("account-type").value;

                if (!code || !name || !type) {
                    Swal.showValidationMessage(`All fields are required.`);
                    return false;
                }

                return {
                    code,
                    name,
                    type,
                    note: document.getElementById("account-note").value.trim(),
                };
            },
        });

        if (formValues) {
            handleSaveAccount(formValues, isEdit, accountToEdit?.id);
        }
    };


    const formatDateForTable = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const renderPagination = () => {
        // Pagination is handled by react-data-table-component
        return null;
    };

    const columns = [
        { name: "ID", selector: row => row.id, sortable: true, width: '80px' },
        { name: "Code", selector: row => row.code, sortable: true, width: '120px' },
        { name: "Name", selector: row => row.name, sortable: true, grow: 2 },
        {
            name: "Type",
            selector: row => row.type,
            sortable: true,
            cell: row => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                    row.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                    row.type === 'liability' ? 'bg-red-100 text-red-800' :
                    row.type === 'expense' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`
                }>
                    {row.type}
                </span>
            ),
        },
        { name: "Created At", selector: row => formatDateForTable(row.created_at), sortable: true },
        {
            name: "Actions",
            width: '150px',
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => openDetailsModal(row)} className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition" title="View Details">
                        <EyeIcon />
                    </button>
                    <button onClick={() => openAccountModal(row)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition" title="Edit Account">
                        <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition" title="Delete Account">
                        <DeleteIcon />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow p-6">
                    <div className="w-full bg-white p-6 rounded-xl shadow-lg">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                        {/* Header, Search, Filters, and Action Buttons */}
                        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">Chart of Accounts 🧾</h2>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder="Search by name, code, or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-[#1976D2]"
                                />
                                <button
                                    onClick={() => openAccountModal(null)}
                                    className="flex items-center bg-[#1976D2] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-150 w-full sm:w-auto justify-center"
                                >
                                    <AiOutlinePlus size={18} className="mr-2" /> Create Account
                                </button>
                            </div>
                        </div>

                        {/* Accounts Table */}
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <DataTable
                                    columns={columns}
                                    data={filteredAccounts}
                                    pagination
                                    highlightOnHover
                                    responsive
                                    customStyles={customStyles}
                                    noDataComponent={
                                        <div className="p-8 text-gray-500 font-medium text-lg text-center">
                                            No accounts found 🙁
                                        </div>
                                    }
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CharofAccounts;