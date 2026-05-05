import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AgentSalesSummary = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchSalesSummary = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Unauthenticated: No token found.");

        const response = await axios.get(
            `https://alhamarahomesbd.com/alhamra-backend/public/api/v1/agents/dashboard/sales`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );
        return response.data;
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['agentSalesSummary'],
        queryFn: fetchSalesSummary,
        retry: (failureCount, error) => {
            if (error.response?.status === 401) return false;
            return failureCount < 2;
        }
    });

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'BDT'
    }).format(val || 0);

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-red-200 p-6 rounded shadow-lg text-center">
                    <h2 className="text-lg font-bold text-red-600 mb-2">Request Failed</h2>
                    <p className="text-slate-600 mb-6">{error.response?.data?.message || error.message}</p>
                    <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-4 py-2 rounded">Retry</button>
                </div>
            </div>
        );
    }

    const summary = data?.summary;
    if (!summary) return <div className="p-8">No data found in response.</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <main className="grow p-4 sm:p-6 lg:p-8">
                    <div className="max-w-9xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-800">Sales Summary Report</h1>
                            <p className="text-sm text-slate-500">Agent ID: {data.agent_id}</p>
                        </div>
                        
                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard title="Total Sales" value={formatCurrency(summary.total_sales)} />
                            <StatCard title="Commission Paid" value={formatCurrency(summary.commission_paid)} isIndigo />
                            <StatCard title="Down Payments" value={formatCurrency(summary.down_payment)} isGreen />
                        </div>

                        {/* Secondary Breakdown */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                            <header className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-semibold text-slate-800">Revenue Breakdown</h2>
                            </header>
                            <div className="p-3">
                                <table className="table-auto w-full">
                                    <tbody className="text-sm divide-y divide-slate-100">
                                        <TableRow label="Installments" value={formatCurrency(summary.installment)} />
                                        <TableRow label="Service Sales" value={formatCurrency(summary.service_sales)} />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, isIndigo, isGreen }) => (
    <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
        <div className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wider">{title}</div>
        <div className={`text-2xl font-bold ${isIndigo ? 'text-indigo-600' : isGreen ? 'text-emerald-600' : 'text-slate-800'}`}>
            {value}
        </div>
    </div>
);

const TableRow = ({ label, value }) => (
    <tr>
        <td className="px-2 py-3 text-slate-600 font-medium">{label}</td>
        <td className="px-2 py-3 text-right text-slate-800 font-bold">{value}</td>
    </tr>
);

export default AgentSalesSummary;