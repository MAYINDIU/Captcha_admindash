import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from "react-toastify";
import Swal from 'sweetalert2';
import { Calendar, Filter, Eye, User, Briefcase, ChevronLeft, ChevronRight, Layers, TrendingUp } from 'lucide-react';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const WorkListAdmin = () => {
    const API_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/admin/work-summaries";
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [summaries, setSummaries] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("authToken");

    const [filters, setFilters] = useState({
        type: 'daily', // Added type filter
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        page: 1
    });

    const fetchSummaries = useCallback(async (pageNumber = 1) => {
        setLoading(true);
        try {
            // Updated query string to include 'type'
            const res = await fetch(`${API_URL}?per_page=15&page=${pageNumber}&from=${filters.from}&to=${filters.to}&type=${filters.type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setSummaries(data.data || []);
            setMeta(data.meta || {});
        } catch (error) {
            toast.error("Failed to load admin records");
        } finally {
            setLoading(false);
        }
    }, [token, filters.from, filters.to, filters.type]);

    useEffect(() => {
        fetchSummaries(filters.page);
    }, [fetchSummaries, filters.page]);

    const showDetails = (item) => {
        const renderTable = (title, rows, columns) => {
            if (!rows || rows.length === 0) return '';
            return `
                <div class="mb-6">
                    <h4 class="text-slate-800 font-bold border-l-4 border-indigo-500 pl-2 mb-3 text-left uppercase text-xs tracking-wider">${title}</h4>
                    <div class="overflow-hidden rounded-lg border border-slate-200">
                        <table class="w-full text-[11px] text-left">
                            <thead class="bg-slate-50 text-slate-600 uppercase font-semibold">
                                <tr>${columns.map(col => `<th class="p-2 border-b">${col}</th>`).join('')}</tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${rows.map(r => `
                                    <tr class="hover:bg-slate-50 transition-colors">
                                        ${columns.map(col => {
                                            const key = col.toLowerCase().replace(' ', '_');
                                            return `<td class="p-2 text-slate-700">${r[key] || r[col.toLowerCase()] || '-'}</td>`;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        };

        Swal.fire({
            title: `<div class="text-left font-sans">
                        <p class="text-[10px] uppercase text-indigo-500 font-black mb-1 tracking-[0.2em]">${item.type} Summary</p>
                        <p class="text-xl text-slate-800 font-black">${item.employee_name}</p>
                    </div>`,
            width: '850px',
            padding: '1.5rem',
            html: `
                <div class="text-sm font-sans">
                    <div class="grid grid-cols-3 gap-4 mb-6 text-left">
                        <div class="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
                            <p class="text-[9px] text-indigo-400 uppercase font-black mb-1">Duration</p>
                            <p class="font-bold text-indigo-900">${item.type === 'weekly' ? `${item.week_start} to ${item.week_end}` : item.report_date}</p>
                        </div>
                        <div class="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                            <p class="text-[9px] text-emerald-400 uppercase font-black mb-1">Total Sales</p>
                            <p class="font-bold text-emerald-900">${Number(item.today_sales_amount).toLocaleString()} BDT</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <p class="text-[9px] text-slate-400 uppercase font-black mb-1">Submitted At</p>
                            <p class="font-bold text-slate-700">${item.submitted_at}</p>
                        </div>
                    </div>
                    ${renderTable('Products Discussion', item.sections?.products_discussion, ['Name', 'Mobile', 'Products', 'Project', 'Place'])}
                    ${renderTable('Office Visit', item.sections?.office_visit, ['Name', 'Mobile', 'Products', 'Place'])}
                    ${renderTable('Project Visit', item.sections?.project_visit, ['Name', 'Mobile', 'Project', 'Place'])}
                    ${renderTable('Business Meetings', item.sections?.business_meeting, ['Place', 'Meeting Type', 'Attendance'])}
                    
                    <div class="text-left mt-4 p-5 bg-slate-50 rounded-2xl border-l-4 border-slate-300">
                        <p class="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest">Remarks</p>
                        <p class="text-slate-600 italic text-sm">"${item.remarks || 'No remarks provided.'}"</p>
                    </div>
                </div>
            `,
            confirmButtonText: 'Dismiss',
            confirmButtonColor: '#1e293b',
            customClass: { popup: 'rounded-[2rem]' }
        });
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-inter">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <main className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h1>
                            <p className="text-slate-500 font-medium mt-1">Monitoring organizational work summaries and sales performance.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[200px]">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Logs</p>
                                    <p className="text-xl font-black text-slate-900">{meta.total || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 mb-8 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-100 rounded-xl">
                                <Layers className="w-5 h-5 text-slate-600" />
                            </div>
                            <select 
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value, page: 1})}
                                className="border-none bg-slate-50 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer py-2.5 px-4"
                            >
                                <option value="daily">Daily Reports</option>
                                <option value="weekly">Weekly Reports</option>
                            </select>
                        </div>

                        <div className="h-10 w-px bg-slate-200 hidden lg:block"></div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    value={filters.from} 
                                    onChange={(e) => setFilters({...filters, from: e.target.value, page: 1})} 
                                    className="text-sm font-bold border-slate-200 rounded-xl bg-slate-50 focus:ring-indigo-500" 
                                />
                            </div>
                            <span className="text-slate-300 font-black text-xs uppercase">To</span>
                            <input 
                                type="date" 
                                value={filters.to} 
                                onChange={(e) => setFilters({...filters, to: e.target.value, page: 1})} 
                                className="text-sm font-bold border-slate-200 rounded-xl bg-slate-50 focus:ring-indigo-500" 
                            />
                        </div>
                        
                        <button 
                            onClick={() => fetchSummaries(1)} 
                            className="ml-auto bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Filter className="w-4 h-4" /> Apply Filters
                        </button>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white">
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">Report Period</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">Employee Details</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 text-right">Sales Volume</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">Activity Summary</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="py-32 text-center">
                                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-[4px] border-indigo-500 border-t-transparent"></div>
                                                <p className="mt-4 text-slate-400 font-black text-xs uppercase tracking-widest">Loading Records...</p>
                                            </td>
                                        </tr>
                                    ) : summaries.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-32 text-center text-slate-400 font-bold italic">No summaries found matching your criteria.</td>
                                        </tr>
                                    ) : summaries.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-all group">
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-800 tracking-tight">
                                                        {item.type === 'weekly' ? `${item.week_start} ~ ${item.week_end}` : item.report_date}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase mt-1 w-fit px-2 py-0.5 rounded-md ${item.type === 'weekly' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {item.type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-white group-hover:border-indigo-200 transition-all">
                                                        <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 tracking-tight">{item.employee_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {item.employee_id || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <span className="text-sm font-black text-slate-900">{Number(item.today_sales_amount).toLocaleString()}</span>
                                                <span className="text-[10px] text-slate-400 font-bold ml-1">BDT</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex gap-2">
                                                    <div className="px-3 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50 text-center min-w-[70px]">
                                                        <p className="text-[8px] font-black text-indigo-400 uppercase">Leads</p>
                                                        <p className="text-xs font-black text-indigo-700">{item.sections?.products_discussion?.length || 0}</p>
                                                    </div>
                                                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/50 text-center min-w-[70px]">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase">Visits</p>
                                                        <p className="text-xs font-black text-slate-700">{(item.sections?.office_visit?.length || 0) + (item.sections?.project_visit?.length || 0)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <button 
                                                    onClick={() => showDetails(item)}
                                                    className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-90"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Bar */}
                    <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-500 font-bold">
                            Showing <span className="text-indigo-600">{meta.from || 0}</span> to <span className="text-indigo-600">{meta.to || 0}</span> of <span className="text-slate-900">{meta.total || 0}</span> entries
                        </p>
                        <div className="flex items-center gap-1.5">
                            {meta.links?.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() => {
                                        const url = new URL(link.url);
                                        const page = url.searchParams.get("page");
                                        setFilters({...filters, page: parseInt(page)});
                                    }}
                                    className={`
                                        h-10 min-w-[40px] px-3 rounded-xl text-xs font-black transition-all
                                        ${link.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-200'} 
                                        ${!link.url ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                    dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', '←').replace('Next', '→') }}
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer position="bottom-right" theme="colored" />
        </div>
    );
};

export default WorkListAdmin;