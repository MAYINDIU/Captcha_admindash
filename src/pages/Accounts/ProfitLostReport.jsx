import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import { FiPrinter } from 'react-icons/fi';

const ProfitLostReport = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reportData, setReportData] = useState({ revenues: [], expenses: [], totals: {}, net_profit: 0 });
    const [loading, setLoading] = useState(false);

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/accounting";
    const token = localStorage.getItem("authToken");

    const fetchProfitLoss = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/profit-loss`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await res.json();
            if (res.ok) {
                setReportData(data);
            } else {
                throw new Error(data.message || "Failed to fetch Profit & Loss data.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfitLoss();
    }, [token]);

    const formatCurrency = (value) => {
        const num = Number(value);
        // No need to check for > 0, as we want to show negative values for profit/loss
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const AccountRow = ({ account }) => {
        // For P&L, expenses are debits, revenues are credits. We show the net effect.
        const amount = account.type === 'expense' ? account.debit_total : account.credit_total;
        return (
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">{account.name}</p>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{formatCurrency(amount)}</p>
            </div>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow p-4 sm:p-6 lg:p-8 print:p-0">
                    <div id="report-content" className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none print:rounded-none">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                        {/* Report Header */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Profit & Loss Statement</h2>
                                <p className="text-sm text-gray-500 mt-1">For the current period</p>
                            </div>
                            <button onClick={() => window.print()} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 print:hidden">
                                <FiPrinter className="mr-2" /> Print
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <div className="space-y-8">
                                {/* Revenues Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Revenues</h3>
                                    <div className="pl-4 border-l-2 border-green-400">
                                        {reportData.revenues.length > 0 ? reportData.revenues.map(acc => <AccountRow key={acc.id} account={acc} />) : <p className="text-sm text-gray-500 py-3">No revenue recorded.</p>}
                                        <div className="flex justify-between pt-3 mt-2 border-t-2 border-gray-300 dark:border-gray-600">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Total Revenues</p>
                                            <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(reportData.totals?.revenues)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expenses Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Expenses</h3>
                                    <div className="pl-4 border-l-2 border-red-400">
                                        {reportData.expenses.length > 0 ? reportData.expenses.map(acc => <AccountRow key={acc.id} account={acc} />) : <p className="text-sm text-gray-500 py-3">No expenses recorded.</p>}
                                        <div className="flex justify-between pt-3 mt-2 border-t-2 border-gray-300 dark:border-gray-600">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Total Expenses</p>
                                            <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(reportData.totals?.expenses)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Profit/Loss Section */}
                                <div className={`flex justify-between items-center p-5 rounded-xl mt-8 ${reportData.net_profit >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                    <h3 className={`text-xl font-extrabold ${reportData.net_profit >= 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                        {reportData.net_profit >= 0 ? 'Net Profit' : 'Net Loss'}
                                    </h3>
                                    <p className={`text-2xl font-bold font-mono ${reportData.net_profit >= 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                        {formatCurrency(reportData.net_profit)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfitLostReport;