import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import { FiPrinter, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const BalanceSheetReport = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reportData, setReportData] = useState({ assets: { accounts: [], total: 0 }, liabilities: { accounts: [], total: 0 }, equity: { accounts: [], total: 0 } });
    const [loading, setLoading] = useState(false);

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/accounting";
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchBalanceSheet = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/balance-sheet`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });
                const data = await res.json();
                if (res.ok) {
                    setReportData(data);
                } else {
                    throw new Error(data.message || "Failed to fetch Balance Sheet data.");
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBalanceSheet();
    }, [token]);

    const formatCurrency = (value) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const AccountRow = ({ account }) => {
        const balance = account.type === 'asset' 
            ? Number(account.debit_total) - Number(account.credit_total) 
            : Number(account.credit_total) - Number(account.debit_total);
        
        return (
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">{account.name}</p>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{formatCurrency(balance)}</p>
            </div>
        );
    };

    const totalLiabilitiesAndEquity = (reportData.liabilities?.total || 0) + (reportData.equity?.total || 0);
    const isBalanced = Math.abs((reportData.assets?.total || 0) - totalLiabilitiesAndEquity) < 0.01;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow p-4 sm:p-6 lg:p-8 print:p-0">
                    <div id="report-content" className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Balance Sheet</h2>
                                <p className="text-sm text-gray-500 mt-1">As of {new Date().toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => window.print()} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 print:hidden">
                                <FiPrinter className="mr-2" /> Print
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {/* Assets Column */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b-2 pb-2">Assets</h3>
                                    {reportData.assets.accounts.map(acc => <AccountRow key={acc.id} account={acc} />)}
                                    <div className="flex justify-between pt-3 mt-2 border-t-4 border-double border-gray-400 dark:border-gray-500">
                                        <p className="text-md font-bold text-gray-800 dark:text-gray-100">Total Assets</p>
                                        <p className="text-md font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(reportData.assets?.total)}</p>
                                    </div>
                                </div>

                                {/* Liabilities & Equity Column */}
                                <div className="space-y-8">
                                    {/* Liabilities Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b-2 pb-2">Liabilities</h3>
                                        {reportData.liabilities.accounts.map(acc => <AccountRow key={acc.id} account={acc} />)}
                                        <div className="flex justify-between pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Total Liabilities</p>
                                            <p className="text-sm font-semibold font-mono text-gray-900 dark:text-white">{formatCurrency(reportData.liabilities?.total)}</p>
                                        </div>
                                    </div>
                                    {/* Equity Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b-2 pb-2">Equity</h3>
                                        {reportData.equity.accounts.map(acc => <AccountRow key={acc.id} account={acc} />)}
                                        <div className="flex justify-between pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Total Equity</p>
                                            <p className="text-sm font-semibold font-mono text-gray-900 dark:text-white">{formatCurrency(reportData.equity?.total)}</p>
                                        </div>
                                    </div>
                                    {/* Total Liabilities & Equity */}
                                    <div className={`flex justify-between pt-3 mt-2 border-t-4 border-double ${isBalanced ? 'border-gray-400 dark:border-gray-500' : 'border-red-400'}`}>
                                        <p className="text-md font-bold text-gray-800 dark:text-gray-100">Total Liabilities & Equity</p>
                                        <p className="text-md font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(totalLiabilitiesAndEquity)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BalanceSheetReport;