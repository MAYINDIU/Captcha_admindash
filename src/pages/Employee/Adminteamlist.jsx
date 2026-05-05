import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import axios from "axios";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- 1. MINI COMPONENT: STAT CARD ---
const DetailStatCard = ({ label, value, icon, color }) => (
    <div className={`p-4 rounded-2xl border ${color.bg} ${color.border} shadow-sm transition-all hover:shadow-md`}>
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${color.iconBg} ${color.iconText}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${color.labelText}`}>{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black ${color.valueText}`}>{value?.toLocaleString() || 0}</span>
            <span className={`text-[10px] font-bold ${color.labelText}`}>BDT</span>
        </div>
    </div>
);

// --- 2. COMPONENT: EMPLOYEE DETAILS DRAWER (MATCHING YOUR API STRUCTURE) ---
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
            <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto p-8 animate-in slide-in-from-right duration-500">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors group">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Member Data...</p>
                    </div>
                ) : data && (
                    <div className="pt-4">
                        {/* Profile Header */}
                        <div className="mb-8 border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                    {data.employee.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{data.employee.name}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-3 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase">{data.employee.rank}</span>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{data.employee.branch} Branch</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-500">📞 {data.employee.mobile}</p>
                        </div>

                        {/* Stats Grid */}
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Performance Summary</h3>
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <DetailStatCard label="Total Own Sales" value={data.stats.own_sales} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} color={{ bg: 'bg-white', border: 'border-slate-100', iconBg: 'bg-slate-100', iconText: 'text-slate-500', labelText: 'text-slate-400', valueText: 'text-slate-800' }} />
                            <DetailStatCard label="Down Payment" value={data.stats.own_down_payment} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>} color={{ bg: 'bg-indigo-50/50', border: 'border-indigo-100', iconBg: 'bg-indigo-600', iconText: 'text-white', labelText: 'text-indigo-400', valueText: 'text-indigo-600' }} />
                            <DetailStatCard label="Installment" value={data.stats.own_installment} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} color={{ bg: 'bg-blue-50/50', border: 'border-blue-100', iconBg: 'bg-blue-500', iconText: 'text-white', labelText: 'text-blue-400', valueText: 'text-blue-600' }} />
                            <DetailStatCard label="Team Sales" value={data.stats.team_sales} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} color={{ bg: 'bg-slate-900', border: 'border-slate-800', iconBg: 'bg-white/10', iconText: 'text-white', labelText: 'text-slate-400', valueText: 'text-white' }} />

                   <h1>Own Share Count: {data.stats.own_share_count} <br /> Team Share Count: {data.stats.team_share_count}</h1>
                     
                     
                        </div>

                        {/* Commission Section */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Commission Paid</span>
                                <span className="text-xl font-black text-emerald-700">{data.stats.own_commission_paid.toLocaleString()} BDT</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block mb-1">Commission Pending</span>
                                <span className="text-xl font-black text-amber-700">{data.stats.own_commission_pending.toLocaleString()} BDT</span>
                            </div>
                        </div>

                        {/* Recent Sales List */}
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Sales History</h4>
                        <div className="space-y-3 mb-10">
                            {data.recent_sales.map((sale, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase">{sale.order_no}</p>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase">{sale.type.replace('_', ' ')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-800">{sale.amount.toLocaleString()} BDT</p>
                                        <p className="text-[10px] font-bold text-slate-400">{sale.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Commissions List */}
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Commissions Breakdown</h4>
                        <div className="space-y-2">
                            {data.recent_commissions.map((comm, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter group-hover:text-indigo-600">{comm.category.replace('_', ' ')}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{comm.date} • <span className="text-emerald-500">{comm.status}</span></span>
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

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        processed = processed.filter(node => 
            node.name?.toLowerCase().includes(lowerTerm) || 
            node.rank?.toLowerCase().includes(lowerTerm) ||
            (node.mobile && String(node.mobile).toLowerCase().includes(lowerTerm))
        );
    }

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
        <div className="relative ml-6 md:ml-12 border-l-2 border-slate-100 pl-6 md:pl-10 my-6">
            <div className="absolute top-1/2 -left-[2px] w-6 md:w-10 h-[2px] bg-slate-100"></div>
            <div className="flex items-center gap-4 group">
                <div onClick={() => node.has_children && setIsExpanded(!isExpanded)}
                    className={`relative flex-1 flex items-center p-5 rounded-[22px] border transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer
                    ${isExpanded ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 hover:border-indigo-300'}`}>
                    <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm
                        ${isExpanded ? 'bg-white text-indigo-600' : 'bg-slate-900 text-white'}`}>{node.rank}</div>
                    
                    <div className="mr-5">
                        {node.has_children ? (
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 
                                ${isExpanded ? 'bg-white/20 rotate-180 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        ) : <div className="w-8 h-8 rounded-full border-2 border-slate-50 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div></div>}
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-[140px]">
                            <h4 className={`text-sm font-black uppercase tracking-tight truncate ${isExpanded ? 'text-white' : 'text-slate-800'}`}>{node.name}</h4>
                            <p className={`text-[10px] font-bold ${isExpanded ? 'text-indigo-200' : 'text-slate-400'}`}>{node.has_children ? 'Team Active' : 'Individual'}</p>
                            <p className={`text-[10px] font-bold mt-0.5 ${isExpanded ? 'text-indigo-200' : 'text-slate-400'}`}>{node.mobile || 'N/A'}</p>
                        </div>
                        <div className="flex gap-8">
                            <div className="flex flex-col text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Own Sales</span><span className={`text-xs font-black ${isExpanded ? 'text-white' : 'text-slate-700'}`}>{node.stats.own_sales.toLocaleString()}</span></div>
                            <div className="flex flex-col text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Team Sales</span><span className={`text-xs font-black ${isExpanded ? 'text-indigo-100' : 'text-indigo-600'}`}>{node.stats.team_sales.toLocaleString()}</span></div>
                                             <div className="flex flex-col text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Own Share Count</span><span className={`text-xs font-black ${isExpanded ? 'text-indigo-100' : 'text-indigo-600'}`}>{node.stats.own_share_count.toLocaleString()}</span></div>
                                             <div className="flex flex-col text-center"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Team Share Count</span><span className={`text-xs font-black ${isExpanded ? 'text-indigo-100' : 'text-indigo-600'}`}>{node.stats.team_share_count.toLocaleString()}</span></div>

                        </div>
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onShowDetails(node.id); }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300
                        ${isExpanded ? 'bg-white border-transparent text-indigo-600 shadow-lg' : 'bg-white border-slate-100 text-slate-300 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </button>
            </div>
            {isExpanded && (
                <div className="mt-2">
                    {isFetching ? <div className="ml-12 py-4 text-[10px] font-black text-indigo-400 animate-pulse uppercase tracking-widest">Building Tree...</div> :
                        processedChildren?.map((child) => <TeamNode key={child.id} node={child} month={month} onShowDetails={onShowDetails} searchTerm={searchTerm} />)}
                </div>
            )}
        </div>
    );
};

// --- 4. MAIN PAGE COMPONENT ---
const Adminteamlist = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [detailId, setDetailId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [rankFilter, setRankFilter] = useState("ME"); 
    const token = localStorage.getItem("authToken");
    const formattedMonth = format(selectedDate, "yyyy-MM");

    // FETCH RANKS FOR DROPDOWN
    const { data: ranksData, isLoading: ranksLoading } = useQuery({
        queryKey: ["ranks"],
        queryFn: async () => {
            const { data } = await axios.get(`https://alhamarahomesbd.com/alhamra-backend/public/api/v1/ranks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.data; 
        }
    });

    // FETCH ROOT NODES
    const { data: rootNodes, isLoading: treeLoading } = useQuery({
        queryKey: ["teamTree", "root", formattedMonth, rankFilter],
        queryFn: async () => {
            const { data } = await axios.get(`https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employees/tree`, {
                params: { rank: rankFilter, month: formattedMonth },
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
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Master Hierarchy</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Admin Team View</h1>
                        </div>

                        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                            {/* SEARCH INPUT */}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search Name/Mobile..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-4 pr-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 rounded-full border-none focus:ring-0 w-32 transition-all focus:w-48 placeholder:text-slate-400"
                                />
                            </div>

                            {/* RANK DROPDOWN */}
                            <div className="relative flex items-center">
                                <span className="pl-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank:</span>
                                <select 
                                    value={rankFilter}
                                    onChange={(e) => setRankFilter(e.target.value)}
                                    disabled={ranksLoading}
                                    className="bg-transparent pl-2 pr-8 py-2 text-xs font-black uppercase text-slate-800 border-none focus:ring-0 cursor-pointer min-w-[80px] appearance-none"
                                >
                                    {ranksLoading ? <option>...</option> : 
                                        ranksData?.map((rank) => <option key={rank.id} value={rank.code}>{rank.code}</option>)}
                                </select>
                            </div>

                            <div className="w-[1px] h-6 bg-slate-100 mx-2"></div>
                            
                            <div className="flex items-center gap-2 px-2">
                                <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="MMMM yyyy" showMonthYearPicker className="text-xs font-black text-indigo-600 uppercase border-none p-0 focus:ring-0 cursor-pointer w-28 bg-transparent" />
                            </div>
                        </div>
                    </div>

                    <div className="relative pb-40">
                        {treeLoading ? (
                            <div className="flex flex-col items-center justify-center py-40">
                                <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="mt-6 text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Initializing Tree...</p>
                            </div>
                        ) : (
                            processedRootNodes?.length > 0 ? (
                                processedRootNodes.map((node) => <TeamNode key={node.id} node={node} month={formattedMonth} onShowDetails={setDetailId} searchTerm={searchTerm} />)
                            ) : (
                                <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100">
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Employees Found</p>
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>
            <EmployeeDetailsDrawer employeeId={detailId} month={formattedMonth} onClose={() => setDetailId(null)} />
        </div>
    );
};

export default Adminteamlist;