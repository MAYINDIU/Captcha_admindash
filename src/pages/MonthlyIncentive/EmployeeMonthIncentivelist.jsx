import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye, FaCalendarAlt, FaChartLine, FaUsers, FaCheckCircle, FaClock } from "react-icons/fa";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const EmployeeMonthIncentivelist = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const token = localStorage.getItem("authToken");
    const employeeId = 7; 
    const userData = JSON.parse(localStorage.getItem('user'));
  const UserId=userData?.employee?.id;
  console.log(UserId); 
// Always a good idea to check if it exists before using it
    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";

    const { data: incentives, isLoading } = useQuery({
        queryKey: ['employeeIncentives', employeeId],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}/employee/incentives?employee_id=${UserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response?.data?.data || [];
        }
    });
    console.log(incentives)

    const handleViewDetails = (item) => {
        const subordinates = item.subordinate_breakdown?.subordinates || [];
        const subHtml = subordinates.map(sub => `
            <div class="flex items-center justify-between p-3 border-b border-slate-100 last:border-0">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">${sub.name.charAt(0)}</div>
                    <span class="font-medium text-slate-700">${sub.name}</span>
                </div>
                <span class="px-2 py-1 rounded text-[10px] font-bold ${sub.step === 1 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}">STEP ${sub.step}</span>
            </div>
        `).join('');

        Swal.fire({
            title: 'Subordinate List',
            html: `<div class="text-left font-sans max-h-60 overflow-y-auto mt-4">${subHtml}</div>`,
            confirmButtonColor: '#4f46e5'
        });
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden font-sans">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="p-4 lg:p-8">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Incentive Analytics</h1>
                            <p className="text-slate-500 text-sm font-medium">Detailed breakdown of monthly performance and team earnings.</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md border border-slate-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800 text-slate-200 text-[10px] uppercase font-bold tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Incentive Period</th>
                                        <th className="px-6 py-4">Sales Performance (CCU)</th>
                                        <th className="px-6 py-4">Team Composition</th>
                                        <th className="px-6 py-4 text-right">Payout Amount</th>
                                        <th className="px-6 py-4 text-center">Status & Date</th>
                                        <th className="px-6 py-4 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan="6" className="text-center py-20"><div className="animate-pulse text-slate-400 font-bold uppercase tracking-widest">Fetching Data...</div></td></tr>
                                    ) : incentives?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-all group">
                                            {/* 1. Period */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FaCalendarAlt /></div>
                                                    <div>
                                                        <div className="font-bold text-slate-700">{new Date(item.period_start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                                                        <div className="text-[10px] text-slate-400 font-semibold uppercase">{item.type} Cycle</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Sales Performance */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                                                        <FaChartLine className="text-emerald-500" size={12}/>
                                                        {item.ccu_base_sales.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total Base Sales</div>
                                                </div>
                                            </td>

                                            {/* 3. Team Composition */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-600">Step 1: {item.subordinate_breakdown.step_counts["1"]}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">Sales: {item.subordinate_breakdown.step_sales["1"].toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-[1px] h-8 bg-slate-200"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-600">Step 2: {item.subordinate_breakdown.step_counts["2"]}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">Sales: {item.subordinate_breakdown.step_sales["2"].toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 4. Amount */}
                                            <td className="px-6 py-5 text-right">
                                                <div className="text-lg font-black text-indigo-600 leading-none">{item.amount.toLocaleString()}</div>
                                                <div className="text-[10px] text-slate-400 font-bold">BDT EARNED</div>
                                            </td>

                                            {/* 5. Status & Date */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                                                        item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {item.status === 'paid' ? <FaCheckCircle size={10}/> : <FaClock size={10}/>}
                                                        {item.status}
                                                    </span>
                                                    {item.paid_at && (
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(item.paid_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 6. Action */}
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleViewDetails(item)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all group-hover:shadow-md"
                                                >
                                                    <FaEye /> List
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeMonthIncentivelist;