import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import axios from "axios";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- 1. MINI COMPONENT: STAT CARD FOR DRAWER ---
const DetailStatCard = ({ label, value, icon, color }) => (
    <div className={`p-4 rounded-2xl border ${color.bg} ${color.border} shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${color.iconBg} ${color.iconText}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${color.labelText}`}>{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black ${color.valueText}`}>{value.toLocaleString()}</span>
            <span className={`text-[10px] font-bold ${color.labelText}`}>BDT</span>
        </div>
    </div>
);

// --- 2. COMPONENT: EMPLOYEE DETAILS DRAWER (SIDE SLIDE-OVER) ---
const EmployeeDetailsDrawer = ({ employeeId, month, onClose }) => {
    const token = localStorage.getItem("authToken");

    const { data, isLoading } = useQuery({
        queryKey: ["employeeDetail", employeeId, month],
        queryFn: async () => {
            const { data } = await axios.get(`https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employees/tree/node/${employeeId}`, {
                params: { month },
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: !!employeeId,
    });

    if (!employeeId) return null;

    return (
        <div className="fixed inset-0 z-[999] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
                
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors z-10 backdrop-blur-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Profile...</p>
                    </div>
                ) : data && (
                    <div className="relative px-8 pt-8 pb-12">
                        <div className="mb-10 relative">
                            <div className="flex items-end gap-5 mb-4 mt-12">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-indigo-600 text-4xl font-black shadow-xl border-4 border-white">
                                    {data.employee.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{data.employee.name}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-wider">{data.employee.rank}</span>
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{data.employee.branch} Branch</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-500">📞 {data.employee.mobile}</p>
                        </div>

                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <DetailStatCard label="Personal Sales" value={data.stats.own_sales} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>} color={{ bg: 'bg-white', border: 'border-slate-100', iconBg: 'bg-slate-100', iconText: 'text-slate-500', labelText: 'text-slate-400', valueText: 'text-slate-800' }} />
                            <DetailStatCard label="Team Sales" value={data.stats.team_sales} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} color={{ bg: 'bg-indigo-50/50', border: 'border-indigo-100', iconBg: 'bg-indigo-600', iconText: 'text-white', labelText: 'text-indigo-400', valueText: 'text-indigo-600' }} />
                            <DetailStatCard label="Comm. Paid" value={data.stats.own_commission_paid} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} color={{ bg: 'bg-emerald-50/50', border: 'border-emerald-100', iconBg: 'bg-emerald-500', iconText: 'text-white', labelText: 'text-emerald-500', valueText: 'text-emerald-600' }} />
                            <DetailStatCard label="Team Bonus" value={data.stats.team_commission_total} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} color={{ bg: 'bg-amber-50/50', border: 'border-amber-100', iconBg: 'bg-amber-500', iconText: 'text-white', labelText: 'text-amber-500', valueText: 'text-amber-600' }} />
                        </div>

                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Sales History</h4>
                        <div className="space-y-3 mb-10">
                            {data.recent_sales.map((sale, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{sale.order_no}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{sale.type.replace('_', ' ')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-800">{sale.amount.toLocaleString()} BDT</p>
                                        <p className="text-[10px] font-bold text-slate-400">{sale.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Commission Breakdown</h4>
                        <div className="space-y-2">
                            {data.recent_commissions.map((comm, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter group-hover:text-indigo-600">{comm.category.replace('_', ' ')}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{comm.date}</span>
                                    </div>
                                    <span className="text-sm font-black text-emerald-600">+{comm.amount.toLocaleString()} BDT</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 2.5 HELPER: SORT & FILTER NODES ---
const processNodes = (nodes, searchTerm) => {
    if (!nodes) return [];
    let processed = [...nodes];

    // 1. Filter by Name or Rank
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        processed = processed.filter(node => 
            node.name?.toLowerCase().includes(lowerTerm) || 
            node.rank?.toLowerCase().includes(lowerTerm) ||
            (node.mobile && String(node.mobile).toLowerCase().includes(lowerTerm))
        );
    }

    // 2. Sort: has_children = true first
    processed.sort((a, b) => (a.has_children === b.has_children ? 0 : a.has_children ? -1 : 1));

    return processed;
};

// --- 3. RECURSIVE NODE COMPONENT ---
const TeamNode = ({ node, month, onShowDetails, searchTerm }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const token = localStorage.getItem("authToken");

    const { data: children, isFetching } = useQuery({
        queryKey: ["teamTree", node.id, month],
        queryFn: async () => {
            const { data } = await axios.get(`https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employees/tree`, {
                params: { root_employee_id: node.id, month: month },
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.nodes;
        },
        enabled: isExpanded && node.has_children,
    });

    const processedChildren = processNodes(children, searchTerm);

    return (
        <div className="relative ml-6 md:ml-12 border-l-[2px] border-indigo-100/50 pl-6 md:pl-10 my-4">
            <div className="absolute top-1/2 -left-[2px] w-6 md:w-10 h-[2px] bg-indigo-100/50 rounded-r-full"></div>
            <div className="flex items-center gap-4 group">
                <div onClick={() => node.has_children && setIsExpanded(!isExpanded)}
                    className={`relative flex-1 flex items-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer
                    ${isExpanded 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:scale-[1.01]'}`}>
                    
                    <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors
                        ${isExpanded ? 'bg-white text-indigo-600' : 'bg-slate-800 text-white group-hover:bg-indigo-600'}`}>{node.rank}</div>
                    
                    <div className="mr-5">
                        {node.has_children ? (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 
                                ${isExpanded ? 'bg-white/20 rotate-180 text-white' : 'bg-indigo-50 text-indigo-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        ) : <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-slate-50 flex items-center justify-center"><div className="w-2 h-2 bg-slate-300 rounded-full group-hover:bg-indigo-400 transition-colors"></div></div>}
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-[140px]">
                            <h4 className={`text-sm font-black uppercase tracking-tight truncate ${isExpanded ? 'text-white' : 'text-slate-800'}`}>{node.name}</h4>
                            <p className={`text-[10px] font-bold ${isExpanded ? 'text-indigo-100' : 'text-slate-400'}`}>{node.has_children ? 'Team Leader' : 'Associate'}</p>
                            <p className={`text-[10px] font-bold mt-0.5 ${isExpanded ? 'text-indigo-200' : 'text-slate-400'}`}>{node.mobile || 'N/A'}</p>
                        </div>
                        <div className="flex gap-8">
                            <div className="flex flex-col text-center"><span className={`text-[9px] font-bold uppercase tracking-wider ${isExpanded ? 'text-indigo-200' : 'text-slate-400'}`}>Personal</span><span className={`text-xs font-black ${isExpanded ? 'text-white' : 'text-slate-700'}`}>{node.stats.own_sales.toLocaleString()}</span></div>
                            <div className="flex flex-col text-center"><span className={`text-[9px] font-bold uppercase tracking-wider ${isExpanded ? 'text-indigo-200' : 'text-slate-400'}`}>Team</span><span className={`text-xs font-black ${isExpanded ? 'text-white' : 'text-indigo-600'}`}>{node.stats.team_sales.toLocaleString()}</span></div>
                        </div>    <div className="flex flex-col text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Own Share Count</span><span className={`text-xs font-black ${isExpanded ? 'text-indigo-100' : 'text-indigo-600'}`}>{node.stats.own_share_count.toLocaleString()}</span></div>
                                             <div className="flex flex-col text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Team Share Count</span><span className={`text-xs font-black ${isExpanded ? 'text-indigo-100' : 'text-indigo-600'}`}>{node.stats.team_share_count.toLocaleString()}</span></div>

                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onShowDetails(node.id); }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300
                        ${isExpanded 
                            ? 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-indigo-600' 
                            : 'bg-white border-slate-100 text-slate-300 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md hover:scale-110'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </button>
            </div>
            {isExpanded && (
                <div className="mt-2 transition-all">
                    {isFetching ? <div className="ml-12 py-4 text-[10px] font-black text-indigo-400 animate-pulse tracking-widest uppercase">Syncing...</div> :
                        processedChildren?.map((child) => <TeamNode key={child.id} node={child} month={month} onShowDetails={onShowDetails} searchTerm={searchTerm} />)}
                </div>
            )}
        </div>
    );
};

// --- 4. MAIN PAGE COMPONENT ---
const MyTeamList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [detailId, setDetailId] = useState(null);
    const formattedMonth = format(selectedDate, "yyyy-MM");

    const { data: rootNodes, isLoading } = useQuery({
        queryKey: ["teamTree", "root", formattedMonth],
        queryFn: async () => {
            const token = localStorage.getItem("authToken");
            const { data } = await axios.get(`https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employees/tree`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.nodes;
        }
    });

    const processedRootNodes = processNodes(rootNodes, searchTerm);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-10 h-[2px] bg-indigo-600"></span>
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Organization Hierarchy</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">My Teams</h1>
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-end">
                            {/* Search Input */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Search Member</label>
                                <input 
                                    type="text" 
                                    placeholder="Name, Rank, or Mobile..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-64 px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all hover:border-indigo-200"
                                />
                            </div>

                            {/* Date Picker */}
                            <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filter Period</label>
                            <div className="relative group">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    dateFormat="MMMM yyyy"
                                    showMonthYearPicker
                                    className="w-full md:w-56 pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-0 cursor-pointer transition-all hover:border-indigo-200 hover:shadow-md"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 group-hover:text-indigo-600 transition-colors pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative pb-40">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-40">
                                <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="mt-6 text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Initializing Tree...</p>
                            </div>
                        ) : processedRootNodes?.map((node) => <TeamNode key={node.id} node={node} month={formattedMonth} onShowDetails={setDetailId} searchTerm={searchTerm} />)}
                    </div>
                </main>
            </div>
            <EmployeeDetailsDrawer employeeId={detailId} month={formattedMonth} onClose={() => setDetailId(null)} />
        </div>
    );
};

export default MyTeamList;