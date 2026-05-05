import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Datepicker from 'flowbite-datepicker/Datepicker';

// Assuming these are your components for layout
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// =========================
// Icon Components (SVG)
// =========================
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c2.25-4.5 6.75-7.5 9.75-7.5s7.5 3 9.75 7.5c-2.25 4.5-6.75 7.5-9.75 7.5S4.5 16.5 2.25 12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// =========================================================================
// SKELETON LOADERS
// =========================================================================
const SkeletonPulse = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;

const TableSkeleton = () => (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-12 bg-indigo-600 flex items-center px-6 space-x-4">
             {[...Array(8)].map((_, i) => <SkeletonPulse key={i} className="h-4 w-1/12 bg-indigo-400/50" />)}
        </div>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 space-x-4">
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-20" />
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-16" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2 ml-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// ======================================================
// MAIN COMPONENT: CommissionCalculationList
// ======================================================
const CommissionCalculationList = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 
    
    // API Setup
    const API_BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
    const API_TOKEN = localStorage.getItem("authToken");
    
    // Using a dedicated object to cache recipient names by type/id key (e.g., 'Employee-16', 'Agent-6')
    const [recipientCache, setRecipientCache] = useState({});


    // ===================================
    // 0. Helper Functions (Money & Date)
    // ===================================
    const formatCurrency = (value) => 
        new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'BDT', 
            minimumFractionDigits: 2 
        }).format(value || 0);
    
    const getDetail = (value) => value || "N/A";

    const formatDate = (dateString) => 
        dateString ? new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric'
        }) : "N/A";

    // ===================================
    // 1. Data Fetching
    // ===================================
    const { data: commissionData, isLoading: loading } = useQuery({
        queryKey: ["commissions", currentPage, itemsPerPage],
        queryFn: async () => {
            if (!API_TOKEN) throw new Error("Authentication token not found.");
            const response = await fetch(`${API_BASE_URL}/api/v1/commission-calculations`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            });
            if (!response.ok) throw new Error(`Failed to load commission list: ${response.statusText}`);
            return response.json();
        },
        keepPreviousData: true,
        onError: (error) => {
            toast.error(`Error loading data: ${error.message}`);
        }
    });

    const calculations = Array.isArray(commissionData?.data) ? commissionData.data : [];
    const summary = commissionData?.summary || {};
    
    // ===================================
    // 2. Recipient Name Lookup (Cached Functions)
    // ===================================

    // Function to fetch Employee name
    const fetchEmployeeName = async (id) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/employees/${id}`,
                { headers: { Authorization: `Bearer ${API_TOKEN}` } }
            );
            if (!response.ok) return `${id} `;
            const result = await response.json();
            return result?.name || `Employee ID ${id} (Name Unknown)`;
        } catch (error) {
            console.error(`Error fetching employee ${id}:`, error);
            return `Employee ID ${id} (Error)`;
        }
    };

    // Function to fetch Agent name
    const fetchAgentName = async (id) => {
        try {
            // Assuming there's an API endpoint for Agents by ID that returns user details
            const response = await fetch(
                `${API_BASE_URL}/api/v1/agents/${id}`,
                { headers: { Authorization: `Bearer ${API_TOKEN}` } }
            );
            if (!response.ok) return ` ${id} `;
            const result = await response.json();
            // Assuming the agent object contains a 'user' object with a 'name' field.
            return result?.user?.name || `Agent ID ${id} (${result?.agent_code || 'Code Unknown'})`; 
        } catch (error) {
            console.error(`Error fetching agent ${id}:`, error);
            return `Agent ID ${id} (Error)`;
        }
    };

    // Unified function to get recipient name with caching
    const getRecipientName = useCallback(async (type, id) => {
        if (!id) return "N/A";
        const key = `${type}-${id}`;
        
        // Check cache first
        if (recipientCache[key]) {
            return recipientCache[key];
        }

        let name = "N/A";
        
        if (type.includes("Employee")) {
            name = await fetchEmployeeName(id);
        } else if (type.includes("Agent")) {
            name = await fetchAgentName(id);
        }
        
        // Update cache state
        setRecipientCache(prev => ({
            ...prev,
            [key]: name
        }));
        
        return name;
    }, [API_BASE_URL, API_TOKEN, recipientCache]);


    // ===================================
    // 2b. Eager Caching of Recipient Names
    // Triggers name lookups for all unique IDs/Types after main data loads.
    // ===================================
    useEffect(() => {
        if (calculations.length > 0) {
            const uniqueRecipients = new Set();
            calculations.forEach(unit => {
                unit.items.forEach(item => {
                    const key = `${item.recipient_type}-${item.recipient_id}`;
                    // Check if we need to fetch this ID/Type
                    if (item.recipient_id && !recipientCache[key]) {
                        uniqueRecipients.add(JSON.stringify({ type: item.recipient_type, id: item.recipient_id }));
                    }
                });
            });

            // Start fetching for new unique IDs asynchronously
            uniqueRecipients.forEach(jsonItem => {
                const { type, id } = JSON.parse(jsonItem);
                getRecipientName(type, id);
            });
        }
    }, [calculations, getRecipientName, recipientCache]);


    // ===================================
    // 3. Handle View Details (Modal) - IMPROVED DESIGN
    // ===================================
    const handleView = async (unit) => {
        const payment = unit.payment || {};
        const customer = payment.customer || {};
        const branch = payment.branch || {};

        // Prepare the recipients table with name lookup
  
        const recipientRows = await Promise.all(unit.items.map(async (item) => {
            const recipientType = item.recipient_type.includes("Employee") ? "Employee" : "Agent";
            const recipientId = item.recipient_id;
               const recipientNames = item.meta?.recipient_name;
               console.log(recipientNames)
            // Use the cached name or fetch it
            const recipientName = await getRecipientName(item.recipient_type, recipientNames);

            // Determine display details based on type
            let commissionSource = getDetail(item.meta?.category || 'N/A');
            let rankOrCode = '';
            let percentageDisplay = '';

            if (recipientType === "Employee") {
                rankOrCode = getDetail(item.meta?.rank).toUpperCase();
                percentageDisplay = `${getDetail(item.percentage)}%`;
            } else if (recipientType === "Agent") {
                // Agent commissions typically don't have a 'rank' meta field,
                // but we can show the Agent Code if available from the payment data, or the Category
                rankOrCode = commissionSource === 'agent_commission' ? 'Agent' : 'N/A';
                percentageDisplay = getDetail(item.meta?.percentage) ? `${getDetail(item.meta?.percentage)}%` : 'Fixed/Other';
            }

            return `
                <tr class="border-b hover:bg-indigo-50/50 transition duration-150"> 
                    <td class="py-3 px-4 text-sm font-medium text-gray-600">${recipientType.substring(0, 2)}-${getDetail(recipientId)}</td>
                    <td class="py-3 px-4 text-sm text-gray-900 font-semibold">${recipientName}</td>
                    <td class="py-3 px-4 text-sm text-gray-600">${rankOrCode}</td>
                    <td class="py-3 px-4 text-sm text-blue-600 font-medium capitalize">${commissionSource.replace('_', ' ')}</td>
                    <td class="py-3 px-4 text-sm text-pink-600 font-medium">${percentageDisplay}</td>
                    <td class="py-3 px-4 text-sm text-green-700 font-extrabold">${formatCurrency(item.amount)}</td> 
                </tr>
            `;
        }));

        Swal.fire({
            title: `<span class="text-2xl font-bold text-indigo-700">Commission Breakdown (Unit: ${getDetail(unit.id)})</span>`,
            html: `
                <div class="p-4 text-left space-y-6">
                    
                    <div class="bg-indigo-50 p-5 rounded-xl border-2 border-indigo-200"> 
                        <h4 class="text-lg font-extrabold text-indigo-800 mb-3 border-b border-indigo-200 pb-2 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Transaction Details
                        </h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p class="font-semibold text-gray-600">Payment ID:</p><p class="text-gray-800 font-bold">${getDetail(payment.id)}</p></div>
                            <div class="col-span-2"><p class="font-semibold text-gray-600">Customer:</p><p class="text-gray-800">${getDetail(customer.name)} (${getDetail(customer.contact_number)})</p></div>
                            <div><p class="font-semibold text-gray-600">Branch:</p><p class="text-gray-800">${getDetail(branch.name)}</p></div>
                            <div class="col-span-2 md:col-span-1"><p class="font-semibold text-gray-600">Comm'able Amount:</p><p class="text-red-700 font-extrabold text-xl">${formatCurrency(unit.commissionable_amount)}</p></div> 
                            <div class="col-span-2 md:col-span-1"><p class="font-semibold text-gray-600">Payment Type:</p><p class="text-gray-800 capitalize">${getDetail(unit.meta?.payment_type)}</p></div>
                            <div class="col-span-full"><p class="font-semibold text-gray-600">Calculated At:</p><p class="text-gray-800">${getDetail(unit.calculated_at)}</p></div>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-xl shadow-xl border border-gray-100"> 
                        <h4 class="text-xl font-extrabold text-green-700 mb-3 border-b-2 border-green-200 pb-2 flex items-center">
                            <svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            Commission Recipients Summary (${unit.total_items} item/s)
                        </h4>
                        <div class="overflow-x-auto max-h-80"> 
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-indigo-100 sticky top-0 shadow-sm"> 
                                    <tr>
                                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">ID (Type)</th>
                                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Recipient Name</th>
                                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Role/Code</th> 
                                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Source</th>
                                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Rate</th> 
                                        <th class="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recipientRows.join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false, 
            showCloseButton: true,
            width: '65%', // Slightly wider
            maxWidth: '900px', // Increased max width
            customClass: {
                popup: 'shadow-2xl rounded-xl border-t-8 border-indigo-600', // Bolder top border
                title: 'pt-4', 
                closeButton: 'text-gray-500 hover:text-indigo-600'
            }
        });
    };

    // ===================================
    // 4. Handle Commission Processing (Approval)
    // ===================================
    const processMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await fetch(`${API_BASE_URL}/api/v1/commission-calculations/process`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`,
                },
                body: JSON.stringify(payload)
            });
            
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Commission processing failed.");
                }
                return data;
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error(`Server Error: ${response.status} ${response.statusText}`);
            }
        },
        onSuccess: (data, variables) => {
            toast.success(data.message || "Commissions processed successfully!");
            queryClient.invalidateQueries(["commissions"]);
        },
        onError: (error) => {
            console.error("Commission Processing Error:", error);
            toast.error(`Processing failed: ${error.message}`);
        }
    });

    const handleProcessCommissions = async () => {
        if (processMutation.isLoading) return;
        
        const confirm = await Swal.fire({
            title: "Process Commissions",
            html: `
                <div class="text-left">
                    <p class="mb-4 text-gray-600">Select processing criteria:</p>
                    
                    <div class="flex flex-wrap gap-4 mb-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="period_type" value="date" class="accent-indigo-600 w-4 h-4" checked>
                            <span class="font-medium text-gray-800">By Cutoff Date</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="period_type" value="month" class="accent-indigo-600 w-4 h-4">
                            <span class="font-medium text-gray-800">By Month</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="period_type" value="week" class="accent-indigo-600 w-4 h-4">
                            <span class="font-medium text-gray-800">By Week</span>
                        </label>
                    </div>

                    <div id="date-container">
                        <label class="block text-sm font-bold text-gray-700 mb-1">Select Cutoff Date</label>
                        <input type="date" id="cutoff_date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" value="${new Date().toISOString().split('T')[0]}">
                        <p class="text-xs text-gray-500 mt-1">Processes all pending commissions up to this date.</p>
                    </div>

                    <div id="month-container" class="hidden">
                        <label class="block text-sm font-bold text-gray-700 mb-1">Select Month</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                </svg>
                            </div>
                            <input type="text" id="month_input" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5" placeholder="Select month (YYYY-MM)">
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Processes commissions for this specific month.</p>
                    </div>

                    <div id="week-container" class="hidden">
                        <label class="block text-sm font-bold text-gray-700 mb-1">Select Start of Week</label>
                        <input type="date" id="week_input" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" value="${new Date().toISOString().split('T')[0]}">
                        <p class="text-xs text-gray-500 mt-1">Processes commissions for the week starting on this date.</p>
                    </div>

                    <div class="mt-4 border-t pt-4">
                        <label class="block text-sm font-bold text-red-600 mb-1">Admin Password Required</label>
                        <input type="password" id="admin_password" class="w-full border border-red-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 shadow-sm" placeholder="Enter password to confirm">
                    </div>
                </div>
            `,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#4F46E5",
            cancelButtonColor: "#EF4444",
            confirmButtonText: "Process",
            cancelButtonText: "Cancel",
            didOpen: () => {
                const radios = document.querySelectorAll('input[name="period_type"]');
                const dateContainer = document.getElementById('date-container');
                const monthContainer = document.getElementById('month-container');
                const weekContainer = document.getElementById('week-container');
                const monthInput = document.getElementById('month_input');

                if (monthInput) {
                    new Datepicker(monthInput, {
                        pickLevel: 1,
                        format: 'yyyy-mm',
                        autohide: true,
                        orientation: 'bottom',
                        container: '.swal2-container'
                    });
                }

                radios.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        dateContainer.classList.add('hidden');
                        monthContainer.classList.add('hidden');
                        weekContainer.classList.add('hidden');

                        if (e.target.value === 'date') {
                            dateContainer.classList.remove('hidden');
                        } else if (e.target.value === 'month') {
                            monthContainer.classList.remove('hidden');
                        } else if (e.target.value === 'week') {
                            weekContainer.classList.remove('hidden');
                        }
                    });
                });
                document.querySelector('input[name="period_type"]:checked').dispatchEvent(new Event('change'));
            },
            preConfirm: () => {
                const password = document.getElementById('admin_password').value;
                if (!password) {
                    Swal.showValidationMessage('Please enter the admin password');
                    return false;
                }
                if (password !== 'secret123') {
                    Swal.showValidationMessage('Incorrect password!');
                    return false;
                }

                const periodType = document.querySelector('input[name="period_type"]:checked').value;
                if (periodType === 'date') {
                    const date = document.getElementById('cutoff_date').value;
                    if (!date) Swal.showValidationMessage('Please select a cutoff date');
                    return { period_type: 'date', cutoff_date: date };
                } else if (periodType === 'month') {
                    const month = document.getElementById('month_input').value;
                    if (!month) Swal.showValidationMessage('Please select a month');
                    return { period_type: 'month', month: month };
                } else if (periodType === 'week') {
                    const week = document.getElementById('week_input').value;
                    if (!week) Swal.showValidationMessage('Please select a week start date');
                    return { period_type: 'week', week: week };
                }
            }
        });

        if (confirm.isConfirmed) {
            processMutation.mutate(confirm.value);
        }
    };
    
    // ===================================
    // 5. Search, Filter, and Pagination
    // ===================================
    const filteredData = useMemo(() => {
        if (!search.trim()) {
            return calculations;
        }
        const lowerSearch = search.toLowerCase();
        return calculations.filter(
            (item) =>
                String(item.id).includes(lowerSearch) || // Search by Unit ID
                item.payment?.sales_order?.order_no?.toLowerCase().includes(lowerSearch) ||
                item.payment?.customer?.name?.toLowerCase().includes(lowerSearch) ||
                item.status?.toLowerCase().includes(lowerSearch)
        );
    }, [search, calculations]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search, itemsPerPage]);

    // ===================================
    // 6. Render Section
    // ===================================
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 md:p-6 w-full max-w-full mx-auto">
                    
                    {/* ## Commission List Header 💰 */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 sm:mb-0">
                            Commission Calculation List
                        </h1>
                        <button
                            onClick={handleProcessCommissions}
                            disabled={processMutation.isLoading}
                            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold shadow-md transition duration-150 ${
                                processMutation.isLoading
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {processMutation.isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckIcon />
                                    <span>Process Commissions</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    <hr/>
                    
                    {/* ## Summary and Search 🔍 */}
                    <div className="flex flex-col md:flex-row justify-between items-center my-6 space-y-4 md:space-y-0 md:space-x-4">
                        {/* Summary Block */}
                        {summary && (
                            <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-lg border border-indigo-200 w-full md:w-auto">
                                <div className="p-2 border-r">
                                    <p className="text-xs text-gray-500 font-medium">Total Units (Payments)</p>
                                    <p className="text-lg font-bold text-indigo-700">{summary.units || 0}</p>
                                </div>
                                <div className="p-2 border-r">
                                    <p className="text-xs text-gray-500 font-medium">Total Items (Recipients)</p>
                                    <p className="text-lg font-bold text-indigo-700">{summary.items || 0}</p>
                                </div>
                                <div className="p-2">
                                    <p className="text-xs text-gray-500 font-medium">Grand Total Commission</p>
                                    <p className="text-xl font-extrabold text-green-700">{formatCurrency(summary.total_amount)}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Search Input */}
                        <div className="w-full md:w-1/3">
                            <input
                                type="text"
                                placeholder="🔍 Search by Order No, Customer Name..."
                                className="w-full border-2 border-gray-300 focus:border-indigo-500 p-3 rounded-lg transition duration-150 ease-in-out placeholder-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ## Commission Calculation List Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                        {loading ? (
                            <TableSkeleton />
                        ) : filteredData.length === 0 ? (
                            <p className="text-center p-8 text-lg text-red-500 font-medium">
                                No commission calculations found matching your search.
                            </p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-indigo-600 text-white">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Paid At</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Order No</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Customer Name</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Payment Amount</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Total Commission</th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Recipients</th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedData.map((unit, index) => (
                                                <tr key={unit.id || index} className="hover:bg-gray-50 transition duration-100">
                                                    <td className="py-3 px-4 text-sm text-gray-700">{formatDate(unit.payment?.paid_at)}</td>
                                                    <td className="py-3 px-4 text-sm text-indigo-600 font-semibold">{getDetail(unit.payment?.sales_order?.order_no)}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{getDetail(unit.payment?.customer?.name)}</td>
                                                    <td className="py-3 px-4 text-sm text-red-600 font-medium">{formatCurrency(unit.payment?.amount)}</td>
                                                    <td className="py-3 px-4 text-sm text-green-700 font-bold">{formatCurrency(unit.total_amount)}</td>
                                                    <td className="py-3 px-4 text-center text-sm font-medium">{getDetail(unit.total_items)}</td>
                                                    <td className="py-3 px-4 text-center text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                            unit.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                                            unit.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {getDetail(unit.status)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <button
                                                            onClick={() => handleView(unit)} 
                                                            className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out p-1 rounded-full hover:bg-indigo-100"
                                                            title="View Commission Details"
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
                                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-lg text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}>&laquo; Previous</button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button key={page} onClick={() => goToPage(page)} className={`px-3 py-1 text-sm font-medium rounded-lg ${currentPage === page ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}>{page}</button>
                                        ))}
                                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || filteredData.length === 0} className={`p-2 rounded-lg text-sm font-medium ${currentPage === totalPages || filteredData.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}>Next &raquo;</button>
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

export default CommissionCalculationList;