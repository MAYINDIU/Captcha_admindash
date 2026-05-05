import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Import layout components
import Sidebar from "../../partials/Sidebar"; 
import Header from "../../partials/Header"; 
// Import Icons
import { 
    AiOutlineEye, 
    AiOutlineClose, 
    AiOutlineCalendar, 
    AiOutlineTeam, 
    AiOutlineDollarCircle, 
    AiOutlinePercentage
} from 'react-icons/ai';
import { 
    HiOutlineDocumentText, 
    HiOutlineChartSquareBar, 
    HiOutlineBadgeCheck 
} from 'react-icons/hi';
import DataTable from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { useNavigate } from 'react-router-dom';
import { BiRefresh } from 'react-icons/bi';
import { MdOutlineCalculate, MdDoneAll } from 'react-icons/md'; // Added MdDoneAll for processing


// --- Configuration Constants ---
const API_BASE_URL = 'https://alhamarahomesbd.com/alhamra-backend/public/api/v1/director-funds';
const CALCULATE_API_URL = `${API_BASE_URL}/calculate`;
const PROCESS_API_URL = `${API_BASE_URL}/process`; // NEW API endpoint for processing
const FUND_TYPES = ['ed', 'amd', 'dmd']; 
const INITIAL_FILTERS = {
    type: FUND_TYPES[0], 
    status: 'draft',
    per_page: 15,
};

// Utility function to get the current date in YYYY-MM format
const getCurrentMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

// Utility function for currency formatting (BDT)
const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', { 
        style: 'currency', 
        currency: 'BDT', 
        maximumFractionDigits: 0 
    });
};

// Utility function for formatting dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        return new Date(datePart).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch {
        return dateString.split('T')[0];
    }
};

// Custom styles for DataTable
const customStyles = {
    headCells: {
        style: {
            backgroundColor: '#1E293B',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14px',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    cells: {
        style: {
            fontSize: '13px',
            color: '#334155',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    rows: {
       highlightOnHoverStyle: {
            backgroundColor: '#F3F4F6',
            transitionDuration: '0.15s',
            transitionProperty: 'background-color',
            borderBottomColor: '#FFFFFF',
        },
    },
};

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

// --- Calculate Fund Modal Component ---
const CalculateFundModal = ({ 
    fundTypeToCalculate, 
    setFundTypeToCalculate, 
    calculationMonth, 
    setCalculationMonth, 
    isProcessing, 
    onConfirm, 
    onCancel 
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <div className="absolute inset-0 bg-gray-900 opacity-70 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-50 transform transition-all duration-300 scale-100 border-t-4 border-red-500">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-900" onClick={onCancel}>
                    <AiOutlineClose size={20} />
                </button>
                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <MdOutlineCalculate /> Confirm Fund Calculation
                </h3>
                
                <p className="text-sm text-gray-700 mb-6">
                    Select the **Fund Type** and the **Target Month** to initiate the **DRAFT** calculation process.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Fund Type Selection */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-500 mb-2">Fund Type</label>
                        <select
                            value={fundTypeToCalculate}
                            onChange={(e) => setFundTypeToCalculate(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm text-sm text-gray-800 capitalize"
                            disabled={isProcessing}
                        >
                            {FUND_TYPES.map(type => (
                                <option key={type} value={type}>
                                    {type.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Target Month Selection */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-500 mb-2">Target Month/Year</label>
                        <input
                            type="month"
                            value={calculationMonth}
                            onChange={(e) => setCalculationMonth(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm text-sm text-gray-800"
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition duration-150 flex items-center gap-2
                            ${isProcessing ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`
                        }
                        disabled={isProcessing || !calculationMonth || !fundTypeToCalculate}
                    >
                        <MdOutlineCalculate size={18} className={isProcessing ? 'animate-spin' : ''}/>
                        {isProcessing ? 'Calculating...' : 'Calculate Fund'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Process Fund Modal Component (NEW) ---
const ProcessFundModal = ({ 
    fundTypeToProcess, 
    setFundTypeToProcess, 
    processMonth, 
    setProcessMonth,
    processFrequency,
    setProcessFrequency,
    isFinalizing, 
    onConfirm, 
    onCancel 
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <div className="absolute inset-0 bg-gray-900 opacity-70 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-50 transform transition-all duration-300 scale-100 border-t-4 border-green-500">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-900" onClick={onCancel}>
                    <AiOutlineClose size={20} />
                </button>
                <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                    <MdDoneAll /> Confirm Fund Processing
                </h3>
                
                <p className="text-sm text-gray-700 mb-6 font-semibold">
                    <span className="text-red-700">WARNING:</span> This action will finalize all DRAFT funds for the selected type and month.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Fund Type Selection */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-500 mb-2">Fund Type</label>
                        <select
                            value={fundTypeToProcess}
                            onChange={(e) => setFundTypeToProcess(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm text-sm text-gray-800 capitalize"
                            disabled={isFinalizing}
                        >
                            {FUND_TYPES.map(type => (
                                <option key={type} value={type}>
                                    {type.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Target Month Selection */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-500 mb-2">Target Month/Year</label>
                        <input
                            type="month"
                            value={processMonth}
                            onChange={(e) => setProcessMonth(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm text-sm text-gray-800"
                            disabled={isFinalizing}
                        />
                    </div>
                </div>

                {/* Frequency Selection */}
                <div className="flex flex-col mb-6">
                    <label className="text-sm font-medium text-gray-500 mb-2">Frequency</label>
                    <select
                        value={processFrequency}
                        onChange={(e) => setProcessFrequency(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm text-sm text-gray-800 capitalize"
                        disabled={isFinalizing}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                        disabled={isFinalizing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition duration-150 flex items-center gap-2
                            ${isFinalizing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`
                        }
                        disabled={isFinalizing || !processMonth || !fundTypeToProcess || !processFrequency}
                    >
                        <MdDoneAll size={18} className={isFinalizing ? 'animate-spin' : ''}/>
                        {isFinalizing ? 'Finalizing...' : 'Process Funds'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- DirectorFundList Component ---
const DirectorFundList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false); 
    
    // Filter States
    const [tempFilterType, setTempFilterType] = useState(INITIAL_FILTERS.type);
    const [tempFilterStatus, setTempFilterStatus] = useState(INITIAL_FILTERS.status); 
    const [activeFilterType, setActiveFilterType] = useState(INITIAL_FILTERS.type);
    const [activeFilterStatus, setActiveFilterStatus] = useState(INITIAL_FILTERS.status);
    
    // Calculation/Processing States (Combined to use the same month/type inputs)
    const [calculationMonth, setCalculationMonth] = useState(getCurrentMonth());
    const [fundTypeToCalculate, setFundTypeToCalculate] = useState(INITIAL_FILTERS.type);
    const [processFrequency, setProcessFrequency] = useState('monthly');
    
    const [isProcessing, setIsProcessing] = useState(false); // Used for CALCULATE action
    const [isFinalizing, setIsFinalizing] = useState(false); // NEW: Used for PROCESS action
    
    const [showCalculateModal, setShowCalculateModal] = useState(false);
    const [showProcessModal, setShowProcessModal] = useState(false); // NEW: Modal state for processing
    
    // Data States
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0); 
    const [meta, setMeta] = useState(null);
    const [viewFund, setViewFund] = useState(null);
    const [totals, setTotals] = useState({ 
        total_fund: 0, 
        total_sales: 0, 
        recipient_count: 0,
        period_start: null,
        period_end: null
    });
    
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken") || 'YOUR_AUTH_TOKEN_HERE'; 
    

    // --- Data Fetching Logic (Uses ACTIVE filters) ---
    const fetchDirectorFunds = useCallback(async (page, perPage, type, status) => {
        setLoading(true);

        const url = `${API_BASE_URL}?type=${type}&status=${status}&per_page=${perPage}&page=${page}`;

        try {
            const res = await fetch(url, { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            });
            
            if (res.status === 401) { navigate('/'); throw new Error("Unauthorized access"); }

            if (!res.ok) {
                if (res.status === 429) {
                    toast.error("Rate limit hit. Please wait a moment.");
                }
                throw new Error(`Failed to fetch data: ${res.status}`);
            }
            
            const data = await res.json();
            
            setFunds(data.data || []); 
            setTotalRows(data.meta?.total || 0); 
            setMeta(data.meta);
            setCurrentPage(page);
            
            if (data.data && data.data.length > 0) {
                const firstRecord = data.data[0];
                const summary = firstRecord.meta || firstRecord;
                setTotals({
                    total_fund: firstRecord.total_fund || 0, 
                    total_sales: summary.total_sales || 0,
                    recipient_count: summary.recipient_count || 0,
                    period_start: firstRecord.period_start,
                    period_end: firstRecord.period_end
                });
            } else {
                 setTotals({ total_fund: 0, total_sales: 0, recipient_count: 0, period_start: null, period_end: null });
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to load director funds: " + (err.message || "Network Error"));
            setFunds([]);
            setTotalRows(0);
        }
        setLoading(false);
    }, [token, navigate]); 


    // --- Fund Calculation API Execution ---
    const handleExecuteCalculation = useCallback(async () => {
        if (!calculationMonth || !fundTypeToCalculate) return; 

        setIsProcessing(true);
        const url = `${CALCULATE_API_URL}?type=${fundTypeToCalculate}&month=${calculationMonth}`;

        try {
            const res = await fetch(url, {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 401) { navigate('/login'); throw new Error("Unauthorized access"); }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to calculate funds: ${res.status}`);
            }

            const data = await res.json();
            
            toast.success(data.message || `Fund calculation successful for ${fundTypeToCalculate.toUpperCase()} / ${calculationMonth} (Generated: ${data.generated || 0})!`);
            
            // Refresh list to see new draft entries
            fetchDirectorFunds(1, INITIAL_FILTERS.per_page, activeFilterType, activeFilterStatus);

        } catch (err) {
            console.error(err);
            toast.error("Calculation failed: " + (err.message || "Network Error"));
        } finally {
            setIsProcessing(false);
            setShowCalculateModal(false); 
        }
    }, [token, navigate, calculationMonth, fundTypeToCalculate, activeFilterType, activeFilterStatus, fetchDirectorFunds]);


    // --- Fund Processing API Execution (NEW) ---
    const handleExecuteProcess = useCallback(async () => {
        if (!calculationMonth || !fundTypeToCalculate || !processFrequency) return; 

        setIsFinalizing(true);
        
        const payload = {
            type: fundTypeToCalculate,
            month: calculationMonth,
            frequency: processFrequency
        };

        try {
            const res = await fetch(PROCESS_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) { navigate('/login'); throw new Error("Unauthorized access"); }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to process funds: ${res.status}`);
            }

            const data = await res.json();
            toast.success(data.message || `Fund processing successful for ${fundTypeToCalculate.toUpperCase()} / ${calculationMonth} (${processFrequency})! (${data.processed || 0} records updated)`);
            
            // Refresh list to see updated (processed) entries
            fetchDirectorFunds(1, INITIAL_FILTERS.per_page, activeFilterType, activeFilterStatus);

        } catch (err) {
            console.error(err);
            toast.error("Processing failed: " + (err.message || "Network Error"));
        } finally {
            setIsFinalizing(false);
            setShowProcessModal(false); 
        }
    }, [token, navigate, calculationMonth, fundTypeToCalculate, processFrequency, activeFilterType, activeFilterStatus, fetchDirectorFunds]);


    // --- Filter Application Handler ---
    const handleApplyFilters = useCallback(() => {
        setActiveFilterType(tempFilterType);
        setActiveFilterStatus(tempFilterStatus);
    }, [tempFilterType, tempFilterStatus]);

    // --- Effect for Initial Load / Active Filter Change ---
    useEffect(() => { 
        fetchDirectorFunds(1, INITIAL_FILTERS.per_page, activeFilterType, activeFilterStatus); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilterType, activeFilterStatus]); 

    // --- DataTable Handlers ---
    const handlePageChange = (page) => {
        fetchDirectorFunds(page, INITIAL_FILTERS.per_page, activeFilterType, activeFilterStatus);
    };
    
    // --- DataTable Columns ---
    const columns = useMemo(() => [
        {
            name: "SL",
            width: '60px',
            cell: (row, index) => (currentPage - 1) * INITIAL_FILTERS.per_page + index + 1,
        },
        { 
            name: "ID", 
            selector: row => row.id, 
            sortable: true, 
            width: '80px', 
        },
        { 
            name: "Employee", 
            selector: row => row.employee.name, 
            sortable: true, 
            minWidth: '150px',
            cell: row => (
                <div className="font-medium text-indigo-600">
                    {row.employee.name} <span className="text-xs text-gray-500">({row.employee.employee_code})</span>
                </div>
            )
        },
        { 
            name: "Type", 
            selector: row => row.type.toUpperCase(), 
            sortable: true, 
            width: '100px',
            center: true
        },
        { 
            name: "Fund Amount", 
            selector: row => row.total_fund, 
            sortable: true, 
            minWidth: '150px',
            cell: row => <span className="font-bold text-green-600">{formatCurrency(row.total_fund)}</span>
        },
        { 
            name: "Per Person", 
            selector: row => row.per_person_amount, 
            sortable: true, 
            minWidth: '130px',
            cell: row => formatCurrency(row.per_person_amount)
        },
        { 
            name: "Status", 
            selector: row => row.status, 
            sortable: true, 
            width: '100px',
            center: true,
            cell: row => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {row.status.toUpperCase()}
                </span>
            )
        },
        { 
            name: "Actions",
            cell: row => (
                <button 
                    title="View Details" 
                    className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition duration-150" 
                    onClick={() => setViewFund(row)}
                >
                    <AiOutlineEye size={18} />
                </button>
            ),
            allowOverflow: true,
            button: true,
            width: '80px'
        }
    ], [setViewFund, currentPage]); 

    // --- Detail Row Component for View Modal ---
    const DetailRow = ({ icon: Icon, label, value }) => (
        <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-1 space-x-2">
                <Icon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-gray-900 text-base font-bold break-words">{value || 'N/A'}</span>
        </div>
    );

    // --- Main Component Render ---
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">

                {/* Header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow p-4 sm:p-6">
                    <ToastContainer position="top-right" autoClose={5000} newestOnTop />
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <HiOutlineChartSquareBar className="text-indigo-600" size={32} /> Director Fund Management
                    </h1>
                    
                    {/* --- Filter Bar and Action Buttons --- */}
                    <div className="flex flex-wrap justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-md border-t-4 border-indigo-500">
                        
                        {/* LEFT: Filters */}
                        <div className="flex flex-wrap gap-4 items-center">
                            
                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-gray-500 mb-1">Fund Type Filter</label>
                                <select
                                    value={tempFilterType}
                                    onChange={(e) => setTempFilterType(e.target.value)}
                                    className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 text-sm text-gray-800 capitalize w-36"
                                    disabled={loading || isProcessing || isFinalizing}
                                >
                                    {FUND_TYPES.map(type => (
                                        <option key={type} value={type}>
                                            {type.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-gray-500 mb-1">Status Filter</label>
                                <select
                                    value={tempFilterStatus}
                                    onChange={(e) => setTempFilterStatus(e.target.value)}
                                    className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 text-sm text-gray-800 capitalize w-36"
                                    disabled={loading || isProcessing || isFinalizing}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            <button
                                onClick={handleApplyFilters}
                                className={`flex items-center gap-2 mt-auto h-[42px] px-4 py-2 rounded-lg shadow-lg transition duration-150 font-semibold text-sm 
                                    ${(loading || isProcessing || isFinalizing) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`
                                }
                                disabled={loading || isProcessing || isFinalizing}
                            >
                                <BiRefresh size={18} className={loading ? 'animate-spin' : ''}/>
                                {loading ? 'Loading List...' : 'Apply Filters'}
                            </button>
                        </div>

                        {/* RIGHT: Action Buttons */}
                        <div className="flex flex-wrap gap-3 items-center mt-4 md:mt-0">
                            
                            {/* 1. Calculate Fund Button */}
                            <button
                                onClick={() => { 
                                    setFundTypeToCalculate(activeFilterType); 
                                    setShowCalculateModal(true); 
                                }}
                                className={`flex items-center gap-2 h-[42px] px-4 py-2 rounded-lg shadow-lg transition duration-150 font-semibold text-sm 
                                    ${isProcessing ? 'bg-red-400 text-gray-100 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`
                                }
                                disabled={isProcessing || isFinalizing}
                            >
                                <MdOutlineCalculate size={18} />
                                Calculate Fund
                            </button>

                            {/* 2. Process Fund Button (NEW) */}
                            <button
                                onClick={() => {
                                    setFundTypeToCalculate(activeFilterType); // Use same state variables for month/type input
                                    setShowProcessModal(true); 
                                }}
                                className={`flex items-center gap-2 h-[42px] px-4 py-2 rounded-lg shadow-lg transition duration-150 font-semibold text-sm 
                                    ${isFinalizing ? 'bg-green-400 text-gray-100 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`
                                }
                                disabled={isProcessing || isFinalizing}
                            >
                                <MdDoneAll size={18} />
                                Process Funds
                            </button>

                        </div>
                    </div>
                    {/* ------------------------------------------------------------------- */}


                    {/* --- Summary Cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Fund */}
                        <div className="p-5 bg-white rounded-xl shadow-lg ring-1 ring-indigo-100/50">
                            <p className="text-sm font-medium text-indigo-600 uppercase">Total Fund ({activeFilterType.toUpperCase()})</p>
                            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                                {loading || isProcessing || isFinalizing ? '...' : formatCurrency(totals.total_fund)}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Period: {totals.period_start && totals.period_end ? `${formatDate(totals.period_start)} - ${formatDate(totals.period_end)}` : 'N/A'}
                            </p>
                        </div>

                        {/* Total Sales */}
                        <div className="p-5 bg-white rounded-xl shadow-lg ring-1 ring-green-100/50">
                            <p className="text-sm font-medium text-green-600 uppercase">Commission Base Sales</p>
                            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                                {loading || isProcessing || isFinalizing ? '...' : formatCurrency(totals.total_sales)}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Fund % Used: <span className="font-bold text-green-600">
                                    {funds[0]?.percentage_used || 0}%
                                </span>
                            </p>
                        </div>

                        {/* Recipient Count */}
                        <div className="p-5 bg-white rounded-xl shadow-lg ring-1 ring-red-100/50">
                            <p className="text-sm font-medium text-red-600 uppercase">Total Directors/Recipients</p>
                            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                                {loading || isProcessing || isFinalizing ? '...' : totals.recipient_count}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Current Status: <span className="font-bold text-red-600">{activeFilterStatus.toUpperCase()}</span>
                            </p>
                        </div>
                    </div>
                    {/* ------------------------------------------------------------------- */}
                    
                    {/* Table (Details) */}
                    <div className="bg-white p-4 rounded-xl shadow-2xl overflow-hidden">
                        <DataTable
                            title={`Director Funds (${activeFilterType.toUpperCase()} - ${activeFilterStatus.toUpperCase()}) - ${totalRows} Records`}
                            columns={columns}
                            data={funds} 
                            pagination={false}
                            progressPending={loading || isProcessing || isFinalizing}
                            highlightOnHover
                            striped
                            customStyles={customStyles}
                            className="rounded-xl border border-gray-100" 
                            dense
                            noDataComponent={<div className="p-6 text-gray-500 text-center">No director funds found.</div>}
                        />
                        <Pagination 
                            meta={meta} 
                            onPageChange={handlePageChange} 
                            loading={loading} 
                        />
                    </div>

                    {/* --- View Fund Modal (Details) --- */}
                    {viewFund && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm" onClick={() => setViewFund(null)}></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg z-10 overflow-y-auto max-h-[90vh] transform transition-all duration-300 scale-100">
                                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100" onClick={() => setViewFund(null)}>
                                    <AiOutlineClose size={24} />
                                </button>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3 border-indigo-100 flex items-center gap-2">
                                    <HiOutlineDocumentText className="text-indigo-600" /> Fund Details: <span className="text-indigo-600">{viewFund.employee.name}</span>
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <DetailRow icon={HiOutlineBadgeCheck} label="Employee Code" value={viewFund.employee.employee_code} />
                                    <DetailRow icon={AiOutlineTeam} label="Director Rank" value={viewFund.employee.rank} />
                                    
                                    <DetailRow icon={AiOutlineDollarCircle} label="Total Fund" value={formatCurrency(viewFund.total_fund)} />
                                    <DetailRow icon={AiOutlineDollarCircle} label="Per Person Amount" value={formatCurrency(viewFund.per_person_amount)} />
                                    
                                    <DetailRow icon={AiOutlinePercentage} label="Percentage Used" value={`${viewFund.percentage_used}%`} />
                                    <DetailRow icon={HiOutlineChartSquareBar} label="Total Sales" value={formatCurrency(viewFund.total_sales)} />
                                    
                                    <DetailRow icon={AiOutlineCalendar} label="Period Start" value={formatDate(viewFund.period_start)} />
                                    <DetailRow icon={AiOutlineCalendar} label="Period End" value={formatDate(viewFund.period_end)} />
                                    
                                    <DetailRow icon={HiOutlineDocumentText} label="Status" value={viewFund.status.toUpperCase()} />
                                    <DetailRow icon={HiOutlineDocumentText} label="Frequency" value={viewFund.frequency.toUpperCase()} />

                                    {viewFund.processed_at && (
                                        <div className="col-span-2">
                                            <DetailRow icon={HiOutlineBadgeCheck} label="Processed At" value={formatDate(viewFund.processed_at)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* --- Fund Calculation Modal RENDER --- */}
                    {showCalculateModal && (
                        <CalculateFundModal
                            fundTypeToCalculate={fundTypeToCalculate}
                            setFundTypeToCalculate={setFundTypeToCalculate}
                            calculationMonth={calculationMonth}
                            setCalculationMonth={setCalculationMonth}
                            isProcessing={isProcessing}
                            onConfirm={handleExecuteCalculation}
                            onCancel={() => setShowCalculateModal(false)}
                        />
                    )}

                    {/* --- Fund Processing Modal RENDER (NEW) --- */}
                    {showProcessModal && (
                        <ProcessFundModal
                            fundTypeToProcess={fundTypeToCalculate} // Reusing the same state variable
                            setFundTypeToProcess={setFundTypeToCalculate} // Reusing the same state variable
                            processMonth={calculationMonth} // Reusing the same state variable
                            setProcessMonth={setCalculationMonth} // Reusing the same state variable
                            processFrequency={processFrequency}
                            setProcessFrequency={setProcessFrequency}
                            isFinalizing={isFinalizing}
                            onConfirm={handleExecuteProcess}
                            onCancel={() => setShowProcessModal(false)}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default DirectorFundList;