import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { toast, ToastContainer } from "react-toastify";
import { 
    AiOutlineClose, AiOutlineEye, AiOutlineSearch, 
    AiOutlineCalendar, AiOutlineFilter, AiOutlineDownload 
} from "react-icons/ai";
import { 
    HiOutlineCurrencyDollar, HiOutlineOfficeBuilding, 
    HiOutlineReceiptTax, HiOutlineUserGroup, 
    HiOutlineTrendingUp, HiOutlineBadgeCheck 
} from "react-icons/hi";

// Partial Components (Assumed existing)
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// --- Design Utils ---

const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'BDT', 
        maximumFractionDigits: 0 
    }).format(amount || 0);

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString.split('T')[0]).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

// --- Professional UI Components ---

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
                {trend && <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <HiOutlineTrendingUp /> {trend}
                </p>}
            </div>
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 transition-colors group-hover:scale-110 duration-300`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className={`absolute bottom-0 left-0 h-1 w-full ${colorClass} opacity-20`}></div>
    </div>
);

const PaymentList = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewPayment, setViewPayment] = useState(null);
    const [totals, setTotals] = useState({ sales: 0, commission: 0 });
    const [pagination, setPagination] = useState({ current: 1, rowsPerPage: 10, total: 0 });
    
    // Default range: Start of month to Today
    const [dateRange, setDateRange] = useState({ 
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
        to: new Date().toISOString().split('T')[0] 
    });

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return navigate('/login');
        setLoading(true);

        try {
            const query = new URLSearchParams({
                page: pagination.current,
                per_page: pagination.rowsPerPage,
                search: searchTerm,
                from: dateRange.from,
                to: dateRange.to
            });

            const response = await fetch(`https://alhamarahomesbd.com/alhamra-backend/public/api/v1/payments?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = await response.json();
            setPayments(result.data || []);
            setPagination(p => ({ ...p, total: result.meta?.total || 0 }));
            
            // Calculate totals from current view
            const totalS = (result.data || []).reduce((a, b) => a + parseFloat(b.amount || 0), 0);
            const totalC = (result.data || []).reduce((a, b) => a + parseFloat(b.commission_base_amount || 0), 0);
            setTotals({ sales: totalS, commission: totalC });

        } catch (err) {
            toast.error("Failed to sync payment data");
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.rowsPerPage, dateRange, searchTerm, navigate]);

    useEffect(() => {
        const timer = setTimeout(fetchData, 400);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const columns = useMemo(() => [
        { 
            name: "DATE", 
            selector: row => row.paid_at,
            cell: row => <div className="text-gray-600 font-medium">{formatDate(row.paid_at)}</div>,
            sortable: true, width: '140px'
        },
        { 
            name: "CUSTOMER & PROJECT", 
            grow: 3,
            cell: row => (
                <div className="py-2">
                    <div className="font-bold text-gray-900 leading-tight">{row.customer?.name}</div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-tighter">{row.project?.name || 'No Project'}</div>
                </div>
            )
        },
        { 
            name: "CATEGORY", 
            width: '180px',
            cell: row => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {row.type?.replace(/_/g, ' ')}
                </span>
            )
        },
        { 
            name: "AMOUNT", 
            right: true,
            cell: row => <div className="text-sm font-extrabold text-gray-900">{formatCurrency(row.amount)}</div>,
            sortable: true 
        },
        { 
            name: "ACTIONS", 
            center: true,
            cell: row => (
                <button onClick={() => setViewPayment(row)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all">
                    <AiOutlineEye size={22} />
                </button>
            )
        }
    ], []);

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                    <ToastContainer />

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Ledger</h1>
                            <p className="text-slate-500 font-medium">Manage and track your inbound revenue streams</p>
                        </div>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                            <AiOutlineDownload size={18} /> Export CSV
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Revenue" value={formatCurrency(totals.sales)} icon={HiOutlineTrendingUp} colorClass="bg-emerald-500" trend="+12.5% vs last month" />
                        <StatCard title="Commissionable" value={formatCurrency(totals.commission)} icon={HiOutlineBadgeCheck} colorClass="bg-indigo-500" />
                        <StatCard title="Total Entries" value={pagination.total} icon={HiOutlineReceiptTax} colorClass="bg-amber-500" />
                    </div>

                    {/* Search & Filter Component */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-2">
                        <div className="relative flex-1 group">
                            <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by name, project, or ID..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 px-2 border-l border-gray-100">
                            <div className="flex items-center bg-gray-50 rounded-xl px-3 py-1.5 border border-transparent hover:border-gray-200">
                                <AiOutlineCalendar className="text-gray-400 mr-2" />
                                <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="bg-transparent text-xs font-bold outline-none cursor-pointer" />
                                <span className="mx-2 text-gray-300">—</span>
                                <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="bg-transparent text-xs font-bold outline-none cursor-pointer" />
                            </div>
                            <button onClick={fetchData} className="bg-indigo-50 text-indigo-700 p-3 rounded-xl hover:bg-indigo-100 transition-colors">
                                <AiOutlineFilter size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Data Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={payments}
                            progressPending={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination.total}
                            onChangePage={page => setPagination(p => ({...p, current: page}))}
                            highlightOnHover
                            responsive
                            customStyles={customTableStyles}
                        />
                    </div>
                </main>
            </div>

            {/* View Modal with Glassmorphism */}
            {viewPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40  transition-opacity">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Payment Insight</h2>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Transaction Details</p>
                            </div>
                            <button onClick={() => setViewPayment(null)} className="p-2 hover:bg-white rounded-full shadow-sm transition-all text-slate-400 hover:text-red-500">
                                <AiOutlineClose size={24} />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="p-4 bg-indigo-600 rounded-xl text-white">
                                    <HiOutlineCurrencyDollar size={32} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-indigo-400 uppercase">Settled Amount</p>
                                    <p className="text-3xl font-black text-indigo-900">{formatCurrency(viewPayment.amount)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <DetailBox label="Customer" value={viewPayment.customer?.name} icon={HiOutlineUserGroup} />
                                <DetailBox label="Date" value={formatDate(viewPayment.paid_at)} icon={AiOutlineCalendar} />
                                <div className="col-span-2">
                                    <DetailBox label="Project" value={viewPayment.project?.name} icon={HiOutlineOfficeBuilding} />
                                </div>
                                <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Internal Remarks</p>
                                    <p className="text-sm text-slate-600 italic">"{viewPayment.note || 'No specific notes recorded for this transaction.'}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailBox = ({ label, value, icon: Icon }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-2 text-slate-400">
            <Icon size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-800">{value || 'N/A'}</p>
    </div>
);

const customTableStyles = {
    table: { style: { backgroundColor: '#ffffff' } },
    headRow: { style: { border: 'none', backgroundColor: '#F8FAFC' } },
    headCells: { 
        style: { 
            color: '#64748b', 
            fontWeight: '800', 
            fontSize: '11px', 
            letterSpacing: '0.05em', 
            paddingTop: '16px', 
            paddingBottom: '16px' 
        } 
    },
    rows: { 
        style: { 
            borderBottom: '1px solid #f1f5f9', 
            minHeight: '72px',
            '&:hover': { backgroundColor: '#fdfdfd' } 
        } 
    },
    pagination: { 
        style: { 
            border: 'none', 
            color: '#64748b', 
            fontWeight: '600',
            marginTop: '10px'
        } 
    }
};

export default PaymentList;