import React, { useState, useEffect, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import Datepicker from 'flowbite-datepicker/Datepicker';

// ---------------------------------------------------------------- //
//                            SVG ICONS                           //
// ---------------------------------------------------------------- //

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
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
const CogIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// ---------------------------------------------------------------- //
//                         MONTHLY INCENTIVE LIST                     //
// ---------------------------------------------------------------- //

const MonthlyIncentiveList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [incentives, setIncentives] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);


    const hasDraft = incentives.some(i => i.status === 'draft');

    // --- Filter and Pagination States ---
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [incentivesPerPage] = useState(20);

    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [selectedStatus, setSelectedStatus] = useState("draft");

    const monthFilterRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [showView, setShowView] = useState(false);
    const [selectedIncentive, setSelectedIncentive] = useState(null);

    const [formData, setFormData] = useState({
        employee_id: "",
        period_start: `${selectedMonth}-01`,
        period_end: `${selectedMonth}-30`,
        total_incentive_amount: 0,
        note: "",
    });

    const [editMode, setEditMode] = useState(false);

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const token = localStorage.getItem("authToken");

    // --- API Fetch Functions ---

    const fetchIncentives = async () => {
        if (!token) return;
        try {
            setLoading(true);
            let url = `${API_BASE}/monthly-incentives?date=${selectedMonth}`;
            if (selectedStatus) {
                url += `&status=${selectedStatus}`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await res.json();

            // Note: The incentive amount is now under 'amount' in the JSON, not 'total_incentive_amount'.
            // For compatibility with the existing UI, we'll map 'amount' to 'total_incentive_amount' if needed, 
            // but the safer approach is updating the UI to use 'amount'.
            // However, the original code used 'total_incentive_amount', so we'll check for both.
            // Based on your JSON, I'll update the display to check for `i.amount` first.
            if (data?.data) setIncentives(data.data);
            else toast.error("Failed to load monthly incentives");
        } catch (error) {
            toast.error("Error fetching incentives");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        if (!token) return;
        try {
            setLoadingEmployees(true);
            const res = await fetch(`${API_BASE}/employees`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await res.json();
            if (data?.data) setEmployees(data.data);
            else toast.warn("Failed to load employee list");
        } catch (error) {
            toast.error("Error fetching employees");
        } finally {
            setLoadingEmployees(false);
        }
    };

    // --- Action Handlers (Generate, Process, Approve, Reject, CRUD) ---

    const handleGenerate = async () => {
        if (!token) return;

        const { value: frequency } = await Swal.fire({
            title: "Select Frequency",
            input: "radio",
            inputOptions: {
                monthly: "Monthly",
                weekly: "Weekly",
            },
            inputValue: "monthly",
            showCancelButton: true,
            confirmButtonText: "Next",
            confirmButtonColor: "#1976D2",
        });

        if (!frequency) return;

        let selectedDate = "";
        let datepickerInstance = null;

        if (frequency === "monthly") {
            const { value: month } = await Swal.fire({
                title: "Select Month",
                html: `
                    <input type="text" id="swal-monthpicker" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1976D2] focus:border-[#1976D2] block w-full p-2.5 mt-2" placeholder="Select Month" readonly>
                    <style>.datepicker { z-index: 9999 !important; }</style>
                `,
                showCancelButton: true,
                confirmButtonText: "Generate",
                confirmButtonColor: "#1976D2",
                didOpen: () => {
                    const input = document.getElementById('swal-monthpicker');
                    datepickerInstance = new Datepicker(input, {
                        pickLevel: 1,
                        format: 'yyyy-mm',
                        autohide: true,
                        todayBtn: true,
                        todayBtnMode: 1,
                        orientation: 'bottom',
                    });
                    datepickerInstance.setDate(selectedMonth || new Date());
                },
                willClose: () => {
                    if (datepickerInstance) datepickerInstance.destroy();
                },
                preConfirm: () => {
                    return document.getElementById('swal-monthpicker').value;
                }
            });
            if (!month) return;
            selectedDate = month;
        } else {
            const { value: date } = await Swal.fire({
                title: "Select Week",
                text: "Select a date within the week",
                html: `
                    <input type="text" id="swal-datepicker" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1976D2] focus:border-[#1976D2] block w-full p-2.5 mt-2" placeholder="Select Date" readonly>
                    <style>.datepicker { z-index: 9999 !important; }</style>
                `,
                showCancelButton: true,
                confirmButtonText: "Generate",
                confirmButtonColor: "#1976D2",
                didOpen: () => {
                    const input = document.getElementById('swal-datepicker');
                    datepickerInstance = new Datepicker(input, {
                        pickLevel: 0,
                        format: 'yyyy-mm-dd',
                        autohide: true,
                        todayBtn: true,
                        todayBtnMode: 1,
                        orientation: 'bottom',
                        weekStart: 1,
                    });
                    datepickerInstance.setDate(new Date());
                },
                willClose: () => {
                    if (datepickerInstance) datepickerInstance.destroy();
                },
                preConfirm: () => {
                    return document.getElementById('swal-datepicker').value;
                }
            });
            if (!date) return;
            selectedDate = date;
        }

        setIsGenerating(true);
        try {
            const payload = {
                frequency,
                [frequency === "monthly" ? "month" : "week"]: selectedDate,
            };

            const res = await fetch(`${API_BASE}/monthly-incentives/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(`Incentives generated successfully!`);
                fetchIncentives();
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to generate incentives.");
            }
        } catch (error) {
            toast.error("Error generating incentives.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleProcess = async () => {
        if (!token) return;

        const { value: frequency } = await Swal.fire({
            title: "Process Incentives",
            input: "radio",
            inputOptions: {
                monthly: "Monthly",
                weekly: "Weekly",
            },
            inputValue: "monthly",
            showCancelButton: true,
            confirmButtonText: "Next",
            confirmButtonColor: "#38A169",
        });

        if (!frequency) return;

        let selectedDate = "";
        let datepickerInstance = null;

        if (frequency === "monthly") {
            const { value: month } = await Swal.fire({
                title: "Select Month",
                html: `
                    <input type="text" id="swal-monthpicker-process" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1976D2] focus:border-[#1976D2] block w-full p-2.5 mt-2" placeholder="Select Month" readonly>
                    <style>.datepicker { z-index: 9999 !important; }</style>
                `,
                showCancelButton: true,
                confirmButtonText: "Process",
                confirmButtonColor: "#38A169",
                didOpen: () => {
                    const input = document.getElementById('swal-monthpicker-process');
                    datepickerInstance = new Datepicker(input, {
                        pickLevel: 1,
                        format: 'yyyy-mm',
                        autohide: true,
                        todayBtn: true,
                        todayBtnMode: 1,
                        orientation: 'bottom',
                    });
                    datepickerInstance.setDate(selectedMonth || new Date());
                },
                willClose: () => {
                    if (datepickerInstance) datepickerInstance.destroy();
                },
                preConfirm: () => {
                    return document.getElementById('swal-monthpicker-process').value;
                }
            });
            if (!month) return;
            selectedDate = month;
        } else {
            const { value: date } = await Swal.fire({
                title: "Select Week",
                text: "Select a date within the week",
                html: `
                    <input type="text" id="swal-datepicker-process" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1976D2] focus:border-[#1976D2] block w-full p-2.5 mt-2" placeholder="Select Date" readonly>
                    <style>.datepicker { z-index: 9999 !important; }</style>
                `,
                showCancelButton: true,
                confirmButtonText: "Process",
                confirmButtonColor: "#38A169",
                didOpen: () => {
                    const input = document.getElementById('swal-datepicker-process');
                    datepickerInstance = new Datepicker(input, {
                        pickLevel: 0,
                        format: 'yyyy-mm-dd',
                        autohide: true,
                        todayBtn: true,
                        todayBtnMode: 1,
                        orientation: 'bottom',
                        weekStart: 1,
                    });
                    datepickerInstance.setDate(new Date());
                },
                willClose: () => {
                    if (datepickerInstance) datepickerInstance.destroy();
                },
                preConfirm: () => {
                    return document.getElementById('swal-datepicker-process').value;
                }
            });
            if (!date) return;
            selectedDate = date;
        }

        setIsProcessing(true);
        try {
            const payload = {
                frequency,
                [frequency === "monthly" ? "month" : "week"]: selectedDate,
            };

            const res = await fetch(`${API_BASE}/monthly-incentives/process`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(`Incentives processed successfully!`);
                setSelectedStatus("processed");
                fetchIncentives();
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to process incentives.");
            }
        } catch (error) {
            toast.error("Error processing incentives.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure? ⚠️",
            text: "This will delete the monthly incentive record!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE}/monthly-incentives/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    toast.success("Incentive record deleted! 👋");
                    fetchIncentives();
                } else {
                    toast.error("Failed to delete incentive.");
                }
            } catch (err) {
                toast.error("Error deleting incentive.");
            }
        }
    };

    const handleView = (incentive) => {
        setSelectedIncentive(incentive);
        setShowView(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedIncentive(null);
    }

   

    const openEditModal = (incentive) => {
        setEditMode(true);
        // Using 'amount' from the JSON structure for the form if 'total_incentive_amount' is absent
        const amountToEdit = incentive.total_incentive_amount || incentive.amount || 0;

        setFormData({
            employee_id: incentive.employee_id || "",
            period_start: incentive.period_start ? incentive.period_start.substring(0, 10) : "",
            period_end: incentive.period_end ? incentive.period_end.substring(0, 10) : "",
            total_incentive_amount: Number(amountToEdit), // Ensure it's treated as a number
            note: incentive.review_note || incentive.note || "",
        });
        setSelectedIncentive(incentive);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'total_incentive_amount' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use 'amount' for payload if 'total_incentive_amount' is not defined in the backend model (based on JSON provided)
        let payload = { 
            ...formData, 
            employee_id: Number(formData.employee_id),
            amount: formData.total_incentive_amount // Use 'amount' as per provided JSON
        };
        // Remove the form-specific temporary field
        delete payload.total_incentive_amount;


        if (!payload.employee_id || payload.employee_id === 0) {
            toast.error("Please select an employee.");
            return;
        }
        if (payload.amount <= 0) {
            toast.error("Total incentive amount must be greater than zero.");
            return;
        }

        const method = editMode ? "PUT" : "POST";
        const url = editMode ? `${API_BASE}/monthly-incentives/${selectedIncentive.id}` : `${API_BASE}/monthly-incentives`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editMode ? "Incentive updated! ✅" : "Incentive created! ✨");
                closeModal();
                fetchIncentives();
            } else {
                const errorData = await res.json();
                const errorMessage = errorData.message || "Failed to save incentive";
                toast.error(errorMessage);
            }
        } catch {
            toast.error("Error saving incentive. Check network or server status.");
        }
    };

    // --- Datepicker Initialization Effects ---

    // Initialize Main Month Filter Picker
    useEffect(() => {
        let dp = null;
        if (monthFilterRef.current) {
            dp = new Datepicker(monthFilterRef.current, {
                pickLevel: 0, // Normal Date picker
                format: 'yyyy-mm-dd',
                autohide: true,
                todayBtn: true,
                todayBtnMode: 1,
                orientation: 'bottom',
            });

            if (selectedMonth) {
                dp.setDate(selectedMonth);
            }

            monthFilterRef.current.addEventListener('changeDate', (e) => {
                const date = new Date(e.detail.date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setSelectedMonth(`${year}-${month}-${day}`);
            });
        }
        return () => {
            if (dp) dp.destroy();
        };
    }, []);

    // Initialize Modal Date Pickers
    useEffect(() => {
        if (showModal) {
            const timer = setTimeout(() => {
                const initPicker = (id, field) => {
                    const el = document.getElementById(id);
                    if (el) {
                        const dp = new Datepicker(el, {
                            pickLevel: 0,
                            format: 'yyyy-mm-dd',
                            autohide: true,
                            todayBtn: true,
                            todayBtnMode: 1,
                            orientation: 'bottom',
                        });
                        if (formData[field]) dp.setDate(formData[field]);
                        el.addEventListener('changeDate', (e) => {
                            const d = new Date(e.detail.date);
                            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                            setFormData(prev => ({ ...prev, [field]: val }));
                        });
                    }
                };
                initPicker('modal-period-start', 'period_start');
                initPicker('modal-period-end', 'period_end');
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showModal]);

    // --- Effects and Memo ---

    useEffect(() => {
        if (token) {
            fetchIncentives();
            fetchEmployees();
        }
    }, [token, selectedMonth, selectedStatus]);

    useEffect(() => {
        const dateParts = selectedMonth.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const lastDay = new Date(year, month, 0).getDate();
        const monthStr = String(month).padStart(2, '0');

        setFormData(prev => ({
            ...prev,
            period_start: `${year}-${monthStr}-01`,
            period_end: `${year}-${monthStr}-${lastDay}`,
        }));
    }, [selectedMonth]);

    const filteredIncentives = useMemo(() => {
        if (!searchTerm) return incentives;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return incentives.filter(incentive => {
            const name = incentive.employee_name?.toLowerCase() || "";
            const id = String(incentive.employee_id) || "";

            return (
                name.includes(lowerCaseSearch) ||
                id.includes(lowerCaseSearch)
            );
        });
    }, [incentives, searchTerm]);

    const indexOfLastIncentive = currentPage * incentivesPerPage;
    const indexOfFirstIncentive = indexOfLastIncentive - incentivesPerPage;
    const currentIncentives = filteredIncentives.slice(indexOfFirstIncentive, indexOfLastIncentive);
    const totalPages = Math.ceil(filteredIncentives.length / incentivesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedMonth, selectedStatus]);

    // --- Render Functions (Modal/View/Pagination) ---

    const renderModal = () => {
        if (!showModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-[450px] p-6 shadow-xl relative transform transition-all duration-300 scale-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                        {editMode ? "Edit Incentive ✍️" : "Create Incentive ➕"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-3">

                        {/* Employee Dropdown */}
                        <label className="block text-sm font-medium text-gray-700 pt-1">Employee</label>
                        <select name="employee_id" value={formData.employee_id} onChange={handleInputChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white appearance-none" required
                            disabled={loadingEmployees}>
                            <option value="" disabled>{loadingEmployees ? "Loading Employees..." : "Select Employee"}</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.user?.name || emp.name}
                                </option>
                            ))}
                        </select>

                        {/* Period Start */}
                        <label className="block text-sm font-medium text-gray-700 pt-1">Period Start</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="modal-period-start" placeholder="Select Start Date" name="period_start"
                                className="w-full border border-gray-300 pl-10 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" required autoComplete="off" readOnly />
                        </div>

                        {/* Period End */}
                        <label className="block text-sm font-medium text-gray-700 pt-1">Period End</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="modal-period-end" placeholder="Select End Date" name="period_end"
                                className="w-full border border-gray-300 pl-10 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" required autoComplete="off" readOnly />
                        </div>

                        {/* Total Incentive Amount (using the temporary field name for form input) */}
                        <label className="block text-sm font-medium text-gray-700 pt-1">Incentive Amount (BDT)</label>
                        <input type="number" placeholder="Total Incentive Amount" name="total_incentive_amount" value={formData.total_incentive_amount}
                            onChange={handleInputChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" required min="1" />

                        {/* Note/Comment */}
                        <label className="block text-sm font-medium text-gray-700 pt-1">Note (Optional)</label>
                        <textarea placeholder="Note or Comment" name="note" value={formData.note}
                            onChange={handleInputChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-transparent" rows="2" />

                        <div className="flex justify-end gap-3 pt-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-[#1976D2] text-white rounded-lg hover:bg-blue-700 transition duration-150">
                                {editMode ? "Update Record" : "Create Record"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderViewModal = () => {
        if (!showView || !selectedIncentive) return null;

        const i = selectedIncentive;
        const employee = employees.find(e => e.id === i.employee_id);
        const meta = i.meta || {};
        const stepSales = meta.step_sales || [];
        const stepCounts = meta.step_counts || [];
        const maxLevels = meta.max_levels || 0;

        // Determine the actual amount to display (using 'amount' from JSON or falling back to older field)
        const displayAmount = (i.amount || i.total_incentive_amount || 0);
        const commissionableSales = (i.total_commissionable_sales || 0);


        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 w-full max-w-sm md:max-w-xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-extrabold mb-5 text-[#1976D2] border-b pb-3">Incentive Details 🧾</h3>
                    
                    {/* --- Summary Details --- */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-700 text-base mb-6 border-b pb-4">
                        <p className="col-span-2 flex justify-between"><strong>Employee Name:</strong> <span>{i.employee_name || employee?.user?.name || "N/A"}</span></p>
                        <p className="flex justify-between"><strong>Employee ID:</strong> <span>{i.employee_id}</span></p>
                        <p className="flex justify-between"><strong>Period:</strong> <span>{i.period_start ? i.period_start.substring(0, 7) : "N/A"}</span></p>

                        <p className="col-span-2 pt-2 border-t mt-2 flex justify-between">
                            <strong>Status:</strong> 
                            <span className={`font-semibold 
                                ${i.status === 'processed' ? 'text-green-500' : 
                                i.status === 'approved' || i.status === 'paid' ? 'text-blue-500' : 
                                i.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`
                            }>
                                {i.status?.toUpperCase() || "N/A"}
                            </span>
                        </p>
                    </div>

                    {/* --- Financial Summary --- */}
                    <h4 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Financials</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-800 text-base mb-6">
                        <p className="font-semibold">Commissionable Sales:</p>
                        <span className="font-bold text-green-700">BDT {Number(commissionableSales).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        
                        <p className="font-semibold">Incentive Rate:</p>
                        <span className="font-bold">{Number(i.incentive_rate || 0).toFixed(2)}%</span>

                        <p className="font-semibold text-xl pt-2 border-t">Total Incentive Earned:</p>
                        <span className="font-bold text-xl text-[#1976D2] pt-2 border-t">BDT {Number(displayAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* --- Meta/Hierarchy Breakdown --- */}
                    {meta && (
                        <>
                            <h4 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Hierarchy Breakdown 🌳</h4>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-700 text-base mb-4">
                                <p className="font-medium">Total Subordinates Count:</p>
                                <span className="font-bold">{meta.subordinate_count || 0}</span>
                                
                                <p className="font-medium">Maximum Levels Considered:</p>
                                <span className="font-bold">{maxLevels}</span>
                            </div>

                            {/* Step Sales Table */}
                            <h5 className="font-semibold text-gray-700 mt-4 mb-2">Sales Contribution by Step:</h5>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Step (Level)</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee Count</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sales (BDT)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                                        {Array.from({ length: maxLevels }).map((_, index) => {
                                            const step = index + 1;
                                            const sales = Number(stepSales[index] || 0);
                                            const count = stepCounts[index] || 0;
                                            const isSignificant = sales > 0;

                                            return (
                                                <tr key={step} className={isSignificant ? 'bg-indigo-50 font-semibold' : ''}>
                                                    <td className="px-4 py-2 whitespace-nowrap">Step {step}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{count}</td>
                                                    <td className={`px-4 py-2 whitespace-nowrap text-right ${isSignificant ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}


                    <div className="mt-6 flex justify-end">
                        <button onClick={() => setShowView(false)} className="bg-[#1976D2] text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-md">Close</button>
                    </div>
                </div>
            </div>
        );
    };


    const renderPagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        if (totalPages <= 1) return null;

        return (
            <nav className="flex justify-between items-center pt-4" aria-label="Pagination">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{indexOfFirstIncentive + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastIncentive, filteredIncentives.length)}</span> of <span className="font-semibold text-gray-900">{filteredIncentives.length}</span> results
                </div>
                <ul className="inline-flex items-center -space-x-px">
                    <li>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                    </li>
                    {pageNumbers.map(number => (
                        <li key={number}>
                            <button
                                onClick={() => paginate(number)}
                                className={`px-3 py-2 leading-tight border border-gray-300 ${number === currentPage ? 'text-white bg-[#1976D2] hover:bg-blue-700' : 'text-gray-500 bg-white hover:bg-gray-100'}`}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };


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
                            <h2 className="text-2xl font-bold text-gray-800">Monthly Incentives 💰</h2>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">

                                {/* Status Filter */}
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1976D2] bg-white w-full sm:w-auto"
                                >
                                    <option value="">All</option>
                                    <option value="draft">Draft</option>
                                    <option value="processed">Processed</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="paid">Paid</option>
                                </select>

                                {/* Month Filter */}
                                <div className="relative w-full sm:w-auto">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                                    </div>
                                    <input
                                        ref={monthFilterRef}
                                        type="text"
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1976D2] focus:border-[#1976D2] block w-full pl-10 p-2.5 min-w-[200px]"
                                        placeholder="Select Date"
                                        autoComplete="off"
                                        readOnly
                                    />
                                </div>

                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder="Search by employee name/ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-[#1976D2]"
                                />
                                <div className="flex gap-2">
                                    {/* GENERATE Button */}
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || isProcessing || loading}
                                        className="flex items-center bg-gray-600 text-white px-3 py-2 rounded-lg shadow-md hover:bg-gray-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        <CogIcon /> {isGenerating ? "Generating..." : "Generate"}
                                    </button>

                                    {/* PROCESS Button */}
                                    {hasDraft && (
                                        <button
                                            onClick={handleProcess}
                                            disabled={isProcessing || isGenerating || loading}
                                            className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            <CogIcon /> {isProcessing ? "Processing..." : "Process"}
                                        </button>
                                    )}

                                 
                                </div>
                            </div>
                        </div>

                        {/* Incentive Table */}
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#1976D2] text-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Employee Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Employee ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Period</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Amount (BDT)</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {currentIncentives.length === 0 ? (
                                            <tr><td colSpan="7" className="text-center py-8 text-gray-500 text-lg">No incentives found for this period/status 🙁</td></tr>
                                        ) : (
                                            currentIncentives?.map((i) => (
                                                <tr key={i.id} className="hover:bg-gray-50 transition duration-150">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{i.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{i.employee_name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{i.employee_id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {i.period_start?.substring(0, 7)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                                        {/* FIX: Use 'amount' or 'total_incentive_amount' and safely call toLocaleString */}
                                                        BDT {(Number(i.amount || i.total_incentive_amount || 0)).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${i?.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                            i?.status === 'paid' ? 'bg-indigo-100 text-indigo-800' : // New status highlight
                                                            i?.status === 'processed' ? 'bg-green-100 text-green-800' :
                                                            i?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`
                                                        }>
                                                            {i?.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleView(i)}
                                                                className="text-gray-500 hover:text-indigo-900 p-1 rounded hover:bg-gray-200 transition"
                                                                title="View Details"
                                                            >
                                                                <EyeIcon />
                                                            </button>

                                                            {/* Edit/Delete only if status is draft */}
                                                            {i.status === 'draft' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => openEditModal(i)}
                                                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-gray-200 transition"
                                                                        title="Edit Record"
                                                                    >
                                                                        <EditIcon />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(i.id)}
                                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-gray-200 transition"
                                                                        title="Delete Record"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {/* Status is Finalized */}
                                                            {(i.status === 'processed' || i.status === 'approved' || i.status === 'rejected' || i.status === 'paid') && (
                                                                 <span className="text-gray-500 text-xs italic">Finalized</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {renderPagination()}
                    </div>
                </main>

                {renderModal()}
                {renderViewModal()}
            </div>
        </div>
    );
};

export default MonthlyIncentiveList;                      