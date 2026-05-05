import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlinePlus } from "react-icons/ai";
import axios from "axios";
import moment from "moment"; 

// ---------------------------------------------------------------- //
//                            SVG ICONS                           //
// ---------------------------------------------------------------- //
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const ProcessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
//                         PD SPECIAL BONUS LIST                   //
// ---------------------------------------------------------------- //

const PDlist = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pdBonusData, setPdBonusData] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, 'month').format('YYYY-MM')); 

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const token = localStorage.getItem("authToken");

    // --- Utility Functions ---

    // Generates month options for the native Select dropdown
    const getMonthOptions = () => {
        const options = [];
        let date = moment();
        for (let i = 0; i < 12; i++) {
            options.push(date.format('YYYY-MM'));
            date = date.subtract(1, 'month');
        }
        return options.map(month => (
            <option key={month} value={month}>
                {moment(month, 'YYYY-MM').format('MMMM YYYY')}
            </option>
        ));
    };
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('BDT', '৳');
    };
    
    // --- API Fetch Functions ---

    const fetchPdBonusData = async (month) => {
        if (!token) return;
        try {
            setLoading(true);
            const url = `${API_BASE}/pd-special-bonus?month=${month}`;
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            
            const data = res.data;
            if (data?.data) {
                setPdBonusData(data.data);
            } else {
                setPdBonusData([]);
                toast.error("Failed to load PD bonus data");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching PD bonus data");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchAllEmployees = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE}/employees`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const employeeData = res.data?.data; 
            if (Array.isArray(employeeData)) {
                 setAllEmployees(employeeData.map(emp => ({
                    id: emp.id,
                    full_name_en: emp.full_name_en,
                    employee_code: emp.employee_code,
                 })));
            }
        } catch (error) {
            toast.error("Error fetching employees list.");
        }
    };


    // --- PD Selection/Save Function ---

    const handleSavePDSelection = async (selections) => {
        Swal.showLoading();
        try {
            const url = `${API_BASE}/pd-special/select`;
            const res = await axios.post(url, { selections }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = res.data;
            Swal.hideLoading();

            if (res.status === 200 || res.status === 201) {
                toast.success(`PD selection saved successfully for ${moment(selections[0].month).format('MMMM YYYY')}!`);
                fetchPdBonusData(selectedMonth);
            } else {
                toast.error(data.message || "Failed to save PD selection.");
            }
        } catch (err) {
            Swal.hideLoading();
            toast.error(err.response?.data?.message || `An unexpected error occurred.`);
        }
    };

    const handleCalculateBonus = async () => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: `This will calculate the special bonus for ${moment(selectedMonth).format('MMMM YYYY')}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#34D399",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, process it!",
        });

        if (confirm.isConfirmed) {
            setIsProcessing(true);
            try {
                const url = `${API_BASE}/pd-special/calculate?month=${selectedMonth}`;
                const res = await axios.post(url, {}, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });

                toast.success(res.data.message || "Bonus calculated successfully!");
                fetchPdBonusData(selectedMonth); // Refresh data
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to calculate bonus.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleProcessAndPayBonus = async () => {
        const calculatedExist = pdBonusData.some(b => b.status === 'draft');
        if (!calculatedExist) {
            toast.info("No calculated bonuses to generate and pay for this month.");
            return;
        }

        const confirm = await Swal.fire({
            title: "Generate and Pay Bonus?",
            text: `This will finalize and pay the bonus for ${moment(selectedMonth).format('MMMM YYYY')}. This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3B82F6",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, Generate & Pay!",
        });

        if (confirm.isConfirmed) {
            setIsProcessing(true);
            try {
                const url = `${API_BASE}/pd-special/process?month=${selectedMonth}`;
                const res = await axios.post(url, {}, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });

                toast.success(res.data.message || "Bonus generated and paid successfully!");
                fetchPdBonusData(selectedMonth); // Refresh data
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to generate bonus.");
            } finally {
                setIsProcessing(false);
            }
        }
    };
    

    // --- Effects and Memo ---

    useEffect(() => {
        if (token) {
            fetchPdBonusData(selectedMonth);
            fetchAllEmployees(); 
        }
    }, [token, selectedMonth]); 

    const filteredPdBonusData = useMemo(() => {
        if (!searchTerm) return pdBonusData;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return pdBonusData.filter(item => {
            const name = item.employee_name?.toLowerCase() || "";
            const rank = item.rank_name?.toLowerCase() || "";
            const id = String(item.employee_id) || "";

            return (
                name.includes(lowerCaseSearch) ||
                rank.includes(lowerCaseSearch) ||
                id.includes(lowerCaseSearch)
            );
        });
    }, [pdBonusData, searchTerm]);

    // --- PD Selection Modal using Swal ---
    const openPDSelectionModal = async () => {
        // Prepare current selections for Swal default values
        const currentSelectionsMap = pdBonusData.reduce((acc, item) => {
            acc[item.employee_id] = item.percentage;
            return acc;
        }, {});
        
        // Dynamically create the HTML for the selection form
        const selectionRows = allEmployees.map(emp => {
            const isSelected = !!currentSelectionsMap[emp.id];
            const defaultPercentage = currentSelectionsMap[emp.id] || 4;

            return `
                <div class="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-200 last:border-b-0">
                    <label for="employee-check-${emp.id}" class="col-span-8 flex items-center text-sm font-medium text-gray-800 cursor-pointer">
                        <input type="checkbox" id="employee-check-${emp.id}" value="${emp.id}" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" ${isSelected ? 'checked' : ''}>
                        ${emp.full_name_en} (${emp.employee_code})
                    </label>
                    <div class="col-span-4 flex items-center justify-end">
                        <input type="number" id="employee-percent-${emp.id}" value="${defaultPercentage}" min="1" max="100" class="swal2-input !m-0 !w-24 !text-center !py-1.5" style="display: ${isSelected ? 'block' : 'none'};" required>
                        <span class="font-semibold text-gray-600 ml-2" style="display: ${isSelected ? 'block' : 'none'};">%</span>
                    </div>
                </div>
            `;
        }).join('');

        const { value: formValues } = await Swal.fire({
            customClass: {
                popup: 'shadow-2xl rounded-xl !max-w-2xl',
                title: '!text-gray-800 !font-extrabold',
                confirmButton: '!shadow-md !font-bold !py-2 !px-4',
            },
            title: `<span class="text-xl font-bold text-[#1976D2]">Select PDs for ${moment(selectedMonth, 'YYYY-MM').format('MMMM YYYY')}</span>`,
            html: `
                <div class="mb-4 text-left">
                    <label for="swal-month-select" class="block text-sm font-medium text-gray-700 mb-1">For Month:</label>
                    <select id="swal-month-select" class="swal2-input !w-full !py-2">
                        ${getMonthOptions().map(opt => opt.props.value === selectedMonth 
                            ? `<option value="${opt.props.value}" selected>${opt.props.children}</option>` 
                            : `<option value="${opt.props.value}">${opt.props.children}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="text-left max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                    ${selectionRows}
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save Selections',
            confirmButtonColor: "#1976D2",
            preConfirm: () => {
                const selections = [];
                let valid = true;
                const monthForSelection = document.getElementById('swal-month-select').value;

                allEmployees.forEach(emp => {
                    const checkbox = document.getElementById(`employee-check-${emp.id}`);
                    const percentInput = document.getElementById(`employee-percent-${emp.id}`);

                    if (checkbox && checkbox.checked) {
                        const percentage = parseInt(percentInput.value, 10);
                        
                        if (isNaN(percentage) || percentage < 1 || percentage > 100) {
                            Swal.showValidationMessage(`Percentage for ${emp.full_name_en} must be between 1 and 100.`);
                            valid = false;
                        }

                        selections.push({
                            employee_id: emp.id,
                            percentage: percentage,
                            month: selectedMonth,
                        });
                    }
                });

                if (!valid) return false;

                if (selections.length === 0) {
                     Swal.showValidationMessage(`Please select at least one employee.`);
                     return false;
                }
                
                return selections;
            },
            didOpen: () => {
                // Add event listeners for dynamic percentage input display
                allEmployees.forEach(emp => {
                    const checkbox = document.getElementById(`employee-check-${emp.id}`);
                    const percentInput = document.getElementById(`employee-percent-${emp.id}`);
                    const percentSign = percentInput.nextElementSibling;
                    
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            percentInput.style.display = 'block';
                            percentSign.style.display = 'block';
                        } else {
                            percentInput.style.display = 'none';
                            percentSign.style.display = 'none';
                        }
                    });
                });
            }
        });

        if (formValues) {
            handleSavePDSelection(formValues);
        }
    };

    // --- Component JSX ---

    const columns = [
        { name: "ID", selector: row => row.employee_id, sortable: true, width: '80px' },
        { name: "Employee Name", selector: row => row.employee_name, sortable: true, grow: 2 },
        { name: "Rank", selector: row => row.rank_name, sortable: true },
        { 
            name: "Down Payment (৳)", 
            selector: row => row.total_dp, 
            sortable: true, 
            cell: row => formatCurrency(row.total_dp) 
        },
        { 
            name: "Percentage", 
            selector: row => row.percentage, 
            sortable: true, 
            width: '120px',
            cell: row => (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {row.percentage}%
                </span>
            ),
        },
        { 
            name: "Bonus Amount (৳)", 
            selector: row => row.amount, 
            sortable: true, 
            cell: row => <span className="font-bold">{formatCurrency(row.amount)}</span>
        },
        { 
            name: "Status", 
            selector: row => row.status, 
            sortable: true,
            cell: row => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                    row.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                    row.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'}`}>
                    {row.status}
                </span>
            ),
        },
        { 
            name: "Processed At", 
            selector: row => row.processed_at ? moment(row.processed_at).format('YYYY-MM-DD') : 'Draft', 
            sortable: true 
        },
        {
            name: "Details",
            width: '80px',
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => {
                        const subtreeIds = new Set(row.meta?.subtree_employee_ids || []);
                        const subtreeEmployees = allEmployees.filter(emp => subtreeIds.has(emp.id));

                        const subtreeHtml = subtreeEmployees.length > 0 
                            ? `<div class="mt-4 pt-4 border-t border-gray-200">
                                 <h3 class="text-sm font-semibold text-gray-700 col-span-2 mb-2">Subtree Employees (${subtreeEmployees.length})</h3>
                                 <ul class="list-disc list-inside space-y-1 text-xs text-gray-600 max-h-40 overflow-y-auto bg-white p-3 rounded-md border">
                                   ${subtreeEmployees.map(emp => `<li>${emp.full_name_en} (${emp.employee_code})</li>`).join('')}
                                 </ul>
                               </div>`
                            : `<div class="mt-4 pt-4 border-t border-gray-200">
                                 <h3 class="text-sm font-semibold text-gray-700">Subtree IDs:</h3>
                                 <p class="text-xs text-gray-600 break-all mt-1">${row.meta?.subtree_employee_ids?.join(', ') || 'N/A'}</p>
                               </div>`;

                        const detailsHtml = `
                            <div class="text-left p-2">
                                <div class="grid grid-cols-3 gap-x-4 gap-y-3 text-sm bg-gray-50 p-4 rounded-lg border">
                                    <strong class="col-span-1 text-gray-500 font-medium">Employee Name:</strong>
                                    <span class="text-gray-800">${row.employee_name || 'N/A'}</span>

                                    <strong class="col-span-1 text-gray-500 font-medium">Employee ID:</strong>
                                    <span class="text-gray-800">${row.employee_id || 'N/A'}</span>

                                    <strong class="col-span-1 text-gray-500 font-medium">Rank:</strong>
                                    <span class="text-gray-800">${row.rank_name || 'N/A'}</span>

                                    <strong class="col-span-1 text-gray-500 font-medium">Period:</strong>
                                    <span class="text-gray-800">${row.period ? moment(row.period, 'YYYY-MM').format('MMMM YYYY') : 'N/A'}</span>

                                    <strong class="col-span-1 text-gray-500 font-medium">Down Payment:</strong>
                                    <span class="text-gray-800 font-mono">${formatCurrency(row.total_dp)}</span>

                                    <strong class="col-span-1 text-gray-500 font-medium">Percentage:</strong>
                                    <span class="text-gray-800">${row.percentage ? `${row.percentage}%` : 'N/A'}</span>

                                    <strong class="col-span-1 text-gray-500 font-medium border-t pt-3 mt-2">Bonus Amount:</strong>
                                    <span class="text-gray-900 font-bold border-t pt-3 mt-2 text-base">${formatCurrency(row.amount)}</span>
                                </div>
                                ${subtreeHtml}
                            </div>
                        `;
                        Swal.fire({
                            customClass: { popup: 'shadow-2xl rounded-xl !max-w-2xl' },
                            title: `<span class="text-xl font-bold text-gray-800">Bonus Details for ${row.employee_name}</span>`,
                            html: detailsHtml,
                            confirmButtonText: 'Close',
                            confirmButtonColor: '#6B7280'
                        });
                    }} className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-50 transition" title="View Details">
                        <EyeIcon />
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
                        {/* Page Header */}
                        <div className="border-b border-gray-200 pb-5 mb-6">
                            <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
                                <div className="mb-4 sm:mb-0">
                                    <h2 className="text-2xl font-bold leading-7 text-gray-900">PD Special Bonus List 🏆</h2>
                                    <p className="mt-1 text-sm text-gray-500">Manage, calculate, and process special bonuses for PDs.</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={openPDSelectionModal}
                                        className="flex items-center justify-center bg-[#1976D2] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <AiOutlinePlus size={18} className="mr-2" /> Select PDs
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-center">
                            {/* Left: Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Search by name, rank, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg w-full sm:flex-grow focus:ring-2 focus:ring-[#1976D2]"
                                />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg w-full sm:w-48 focus:ring-2 focus:ring-[#1976D2] bg-white"
                                >
                                    {getMonthOptions()}
                                </select>
                            </div>
                            {/* Right: Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-start md:justify-end">
                                <button onClick={handleCalculateBonus} className="flex items-center justify-center bg-teal-500 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isProcessing ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <ProcessIcon />}
                                    {isProcessing ? 'Calculating...' : 'Calculate Bonus'}
                                </button>
                                <button onClick={handleProcessAndPayBonus} className="flex items-center justify-center bg-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    <GenerateIcon /> <span className="ml-2">Generate & Pay</span>
                                </button>
                            </div>
                        </div>

                        {/* PD Bonus Table */}
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                               <DataTable
                                    columns={columns}
                                    data={filteredPdBonusData}
                                    pagination
                                    highlightOnHover
                                    responsive
                                    customStyles={customStyles}
                                    noDataComponent={
                                        <div className="p-8 text-gray-500 font-medium text-lg text-center">
                                            No PD special bonuses found for {moment(selectedMonth, 'YYYY-MM').format('MMMM YYYY')} 🙁
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

export default PDlist;