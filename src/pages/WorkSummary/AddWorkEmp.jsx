import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from "react-toastify";
import Swal from 'sweetalert2';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AddWorkEmp = () => {
    const API_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/work-summaries";
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("authToken");

    // Filter States
    const [filters, setFilters] = useState({
        type: 'daily',
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const fetchSummaries = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}?type=${filters.type}&from=${filters.from}&to=${filters.to}&per_page=15`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setSummaries(data.data || []);
        } catch (error) {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    }, [token, filters]);

    useEffect(() => { fetchSummaries(); }, [fetchSummaries]);

    // --- Detail View Logic ---
    const showDetails = (item) => {
        const renderTable = (title, data, columns) => {
            if (!data || data.length === 0) return '';
            return `
                <div class="mb-4">
                    <h4 class="text-indigo-600 font-bold border-b pb-1 mb-2 text-left text-sm uppercase">${title}</h4>
                    <div class="overflow-x-auto">
                        <table class="w-full text-[11px] text-left border border-slate-200">
                            <thead>
                                <tr class="bg-slate-100">
                                    ${columns.map(col => `<th class="p-2 border border-slate-200 text-slate-600">${col}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(d => `
                                    <tr>
                                        ${columns.map(col => {
                                            const key = col.toLowerCase().replace(' ', '_');
                                            return `<td class="p-2 border border-slate-200">${d[key] || d[col.toLowerCase()] || '-'}</td>`;
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
            title: `<div class="text-left font-bold border-b pb-2">
                        <span class="text-indigo-600 uppercase text-[10px] block">${item.type} Report</span>
                        ${item.type === 'weekly' ? `${item.week_start} to ${item.week_end}` : item.report_date}
                    </div>`,
            width: '850px',
            html: `
                <div class="text-sm mt-4">
                    <div class="grid grid-cols-2 gap-4 mb-6 text-left">
                        <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Total Sales</p>
                            <p class="text-xl font-black text-slate-800">${Number(item.today_sales_amount).toLocaleString()} BDT</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-right">
                            <p class="text-[10px] text-slate-400 font-bold uppercase">Log ID: #${item.id}</p>
                            <p class="text-xs font-semibold text-slate-500 mt-1">Submitted: ${item.submitted_at}</p>
                        </div>
                    </div>
                    ${renderTable('Products Discussion', item.sections?.products_discussion, ['Name', 'Mobile', 'Products', 'Project', 'Place'])}
                    ${renderTable('Office Visit', item.sections?.office_visit, ['Name', 'Mobile', 'Products', 'Project', 'Place'])}
                    ${renderTable('Project Visit', item.sections?.project_visit, ['Name', 'Mobile', 'Products', 'Project', 'Place'])}
                    ${renderTable('Business Meetings', item.sections?.business_meeting, ['Place', 'Meeting Type', 'Attendance'])}
                    <div class="text-left mt-4 p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-500">
                        <strong class="text-xs text-slate-500 uppercase">Manager Remarks:</strong>
                        <p class="text-slate-700 mt-1 italic text-sm">"${item.remarks || 'No remarks provided.'}"</p>
                    </div>
                </div>
            `,
            confirmButtonText: 'Close Window',
            confirmButtonColor: '#334155'
        });
    };

    // --- Modal Logic with Type Switch ---
    const openAddModal = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Create Work Summary',
            width: '1000px',
            html: `
                <div class="text-left space-y-4 font-sans p-2">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Report Type</label>
                            <select id="swal_type" class="w-full p-2.5 text-sm border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500">
                                <option value="daily">Daily Summary</option>
                                <option value="weekly">Weekly Summary</option>
                            </select>
                        </div>
                        <div id="date_input_container" class="md:col-span-2 grid grid-cols-2 gap-2">
                            <div class="col-span-2">
                                <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Report Date</label>
                                <input id="report_date" type="date" class="w-full p-2.5 text-sm border-slate-300 rounded-lg shadow-sm" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Sales Amount (BDT)</label>
                            <input id="sales_amount" type="number" class="w-full p-2.5 text-sm border-slate-300 rounded-lg shadow-sm" placeholder="0.00">
                        </div>
                    </div>

                    ${['products_discussion', 'office_visit', 'project_visit', 'business_meeting'].map(sec => `
                        <div class="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
                            <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                                <h3 class="font-bold text-slate-800 capitalize flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-200"></span>
                                    ${sec.replace('_', ' ')}
                                </h3>
                                <button type="button" onclick="addRow('${sec}')" class="text-[10px] bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-black transition-all">+ ADD ENTRY</button>
                            </div>
                            <div id="container_${sec}" class="space-y-3"></div>
                        </div>
                    `).join('')}

                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Additional Remarks</label>
                        <textarea id="remarks" class="w-full p-4 text-sm border-slate-300 rounded-xl shadow-sm" rows="2" placeholder="Write any specific notes or highlights..."></textarea>
                    </div>
                </div>
            `,
            didOpen: () => {
                const typeEl = document.getElementById('swal_type');
                const dateCont = document.getElementById('date_input_container');

                typeEl.addEventListener('change', (e) => {
                    if (e.target.value === 'weekly') {
                        dateCont.innerHTML = `
                            <div>
                                <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Week Start</label>
                                <input id="week_start" type="date" class="w-full p-2.5 text-sm border-slate-300 rounded-lg shadow-sm">
                            </div>
                            <div>
                                <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Week End</label>
                                <input id="week_end" type="date" class="w-full p-2.5 text-sm border-slate-300 rounded-lg shadow-sm">
                            </div>`;
                    } else {
                        dateCont.innerHTML = `
                            <div class="col-span-2">
                                <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Report Date</label>
                                <input id="report_date" type="date" class="w-full p-2.5 text-sm border-slate-300 rounded-lg shadow-sm" value="${new Date().toISOString().split('T')[0]}">
                            </div>`;
                    }
                });

                window.addRow = (id) => {
                    const cont = document.getElementById(`container_${id}`);
                    const div = document.createElement('div');
                    div.className = "grid grid-cols-12 gap-2 items-center animate-in fade-in slide-in-from-top-2 duration-300";
                    
                    if (id === 'business_meeting') {
                        div.innerHTML = `
                            <div class="col-span-3"><input placeholder="Place" class="w-full p-2 text-xs border rounded-lg r-place"></div>
                            <div class="col-span-4"><input placeholder="Meeting Type" class="w-full p-2 text-xs border rounded-lg r-mtype"></div>
                            <div class="col-span-4"><input placeholder="Attendance" class="w-full p-2 text-xs border rounded-lg r-att"></div>
                            <div class="col-span-1 text-right"><button onclick="this.closest('.grid').remove()" class="text-red-400 hover:text-red-600 font-bold text-xl">×</button></div>`;
                    } else {
                        div.innerHTML = `
                            <div class="col-span-2"><input placeholder="Name" class="w-full p-2 text-xs border rounded-lg r-name"></div>
                            <div class="col-span-2"><input placeholder="Mobile" class="w-full p-2 text-xs border rounded-lg r-mobile"></div>
                            <div class="col-span-3"><input placeholder="Product" class="w-full p-2 text-xs border rounded-lg r-prod"></div>
                            <div class="col-span-2"><input placeholder="Project" class="w-full p-2 text-xs border rounded-lg r-proj"></div>
                            <div class="col-span-2"><input placeholder="Place" class="w-full p-2 text-xs border rounded-lg r-place"></div>
                            <div class="col-span-1 text-right"><button onclick="this.closest('.grid').remove()" class="text-red-400 hover:text-red-600 font-bold text-xl">×</button></div>`;
                    }
                    cont.appendChild(div);
                };
            },
            preConfirm: () => {
                const type = document.getElementById('swal_type').value;
                const collectStandard = (id) => Array.from(document.querySelectorAll(`#container_${id} .grid`)).map(r => ({
                    name: r.querySelector('.r-name').value,
                    mobile: r.querySelector('.r-mobile').value,
                    products: r.querySelector('.r-prod').value,
                    project: r.querySelector('.r-proj').value,
                    place: r.querySelector('.r-place').value,
                })).filter(x => x.name);

                const collectMeetings = () => Array.from(document.querySelectorAll(`#container_business_meeting .grid`)).map(r => ({
                    place: r.querySelector('.r-place').value,
                    meeting_type: r.querySelector('.r-mtype').value,
                    attendance: r.querySelector('.r-att').value,
                })).filter(x => x.place);

                const data = {
                    type,
                    today_sales_amount: document.getElementById('sales_amount').value || 0,
                    remarks: document.getElementById('remarks').value,
                    sections: {
                        products_discussion: collectStandard('products_discussion'),
                        office_visit: collectStandard('office_visit'),
                        project_visit: collectStandard('project_visit'),
                        business_meeting: collectMeetings()
                    }
                };

                if (type === 'weekly') {
                    data.week_start = document.getElementById('week_start').value;
                    data.week_end = document.getElementById('week_end').value;
                    if (!data.week_start || !data.week_end) return Swal.showValidationMessage("Select start and end dates");
                } else {
                    data.report_date = document.getElementById('report_date').value;
                    if (!data.report_date) return Swal.showValidationMessage("Select report date");
                }
                return data;
            }
        });
        if (formValues) submitReport(formValues);
    };

    const submitReport = async (data) => {
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                toast.success("Report saved successfully!");
                fetchSummaries();
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to submit");
            }
        } catch (e) {
            toast.error("Network error");
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    
                    {/* Top Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Work Summaries</h1>
                            <p className="text-slate-500 font-medium">Manage and review your business activity logs.</p>
                        </div>
                        <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                            Add New Report
                        </button>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-slate-200 flex flex-wrap gap-6 items-end">
                        <div className="w-full md:w-48">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Category</label>
                            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="w-full border-slate-200 rounded-xl text-sm font-bold focus:ring-indigo-500">
                                <option value="daily">Daily Logs</option>
                                <option value="weekly">Weekly Logs</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">From Date</label>
                            <input type="date" value={filters.from} onChange={(e) => setFilters({...filters, from: e.target.value})} className="w-full border-slate-200 rounded-xl text-sm" />
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">To Date</label>
                            <input type="date" value={filters.to} onChange={(e) => setFilters({...filters, to: e.target.value})} className="w-full border-slate-200 rounded-xl text-sm" />
                        </div>
                        <button onClick={fetchSummaries} className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-2.5 rounded-xl font-bold transition shadow-lg">Filter</button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-5">Date / Duration</th>
                                    <th className="px-6 py-5">Type</th>
                                    <th className="px-6 py-5">Total Sales</th>
                                    <th className="px-6 py-5">Activities</th>
                                    <th className="px-6 py-5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-slate-400 animate-pulse font-medium">Fetching records...</td></tr>
                                ) : summaries.length === 0 ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-medium">No records found for selected filters.</td></tr>
                                ) : summaries.map((item, idx) => (
                                    <tr key={item.id} className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/40`}>
                                        <td className="px-6 py-5 font-bold text-slate-700">
                                            {item.type === 'weekly' ? `${item.week_start} ~ ${item.week_end}` : item.report_date}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${item.type === 'weekly' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-black text-slate-800">{Number(item.today_sales_amount).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">BDT</span></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="text-center">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Leads</p>
                                                    <p className="text-xs font-bold text-indigo-600">{item.sections?.products_discussion?.length || 0}</p>
                                                </div>
                                                <div className="w-px h-6 bg-slate-200"></div>
                                                <div className="text-center">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Visits</p>
                                                    <p className="text-xs font-bold text-slate-700">{(item.sections?.office_visit?.length || 0) + (item.sections?.project_visit?.length || 0)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => showDetails(item)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-sm transition-all active:scale-90">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddWorkEmp;