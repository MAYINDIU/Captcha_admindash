import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import { FiFilter, FiPrinter, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const LedgerReport = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [ledgerData, setLedgerData] = useState({ entries: [], opening_balance: 0 });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        account_id: '',
        start_date: '',
        end_date: '',
    });
    const [selectedAccount, setSelectedAccount] = useState(null);

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/accounting";
    const token = localStorage.getItem("authToken");

    // Fetch all accounts for the filter dropdown
    useEffect(() => {
        const fetchAccounts = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE}/accounts`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });
                const data = await res.json();
                setAccounts(Array.isArray(data) ? data : (data.data || []));
            } catch (error) {
                toast.warn("Could not fetch accounts for filter.");
            }
        };
        fetchAccounts();
    }, [token]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFetchLedger = async () => {
        if (!filters.account_id) {
            toast.error("Please select an account to generate the ledger.");
            return;
        }
        if (!token) return;

        setLoading(true);
        setSelectedAccount(accounts.find(a => a.id === parseInt(filters.account_id, 10)));

        // Construct query parameters
        const params = new URLSearchParams({
            account_id: filters.account_id,
            ...(filters.start_date && { start_date: filters.start_date }),
            ...(filters.end_date && { end_date: filters.end_date }),
        });

        try {
            const res = await fetch(`${API_BASE}/ledger?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await res.json();
            if (res.ok) {
                // Assuming API returns { data: [], opening_balance: X }
                // If not, we adapt. For now, we use the provided structure.
                setLedgerData({ entries: data.data || [], opening_balance: data.opening_balance || 0 });
            } else {
                throw new Error(data.message || "Failed to fetch ledger data.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleDownloadPDF = () => {
        if (!selectedAccount || reportSummary.processedEntries.length === 0) {
            toast.error("No data available to generate PDF.");
            return;
        }
    
        const doc = new jsPDF();
    
        const reportTitle = "Account Ledger Report";
        const accountName = `${selectedAccount.name} (${selectedAccount.code})`;
        const dateRange = filters.start_date && filters.end_date 
            ? `From ${filters.start_date} to ${filters.end_date}`
            : 'For all dates';
    
        // Add header
        doc.setFontSize(18);
        doc.text(reportTitle, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(accountName, 14, 30);
        doc.text(dateRange, 14, 36);
    
        // Add summary data
        doc.setFontSize(10);
        doc.autoTable({
            startY: 42,
            body: [
                [`Opening Balance: ${formatCurrency(reportSummary.openingBalance)}`, `Total Debits: ${formatCurrency(reportSummary.totalDebit)}`],
                [`Closing Balance: ${formatCurrency(reportSummary.closingBalance)}`, `Total Credits: ${formatCurrency(reportSummary.totalCredit)}`],
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1 },
        });
    
        // Define table columns
        const tableColumn = ["Date", "Description", "Txn ID", "Debit", "Credit", "Balance"];
        
        // Define table rows
        const tableRows = [];
        tableRows.push(["", "Opening Balance", "", "", "", formatCurrency(reportSummary.openingBalance)]);
    
        reportSummary.processedEntries.forEach(entry => {
            const entryData = [
                new Date(entry.occurred_at).toLocaleDateString(),
                entry.journal?.description || '---',
                entry.tx_id,
                Number(entry.debit) > 0 ? formatCurrency(entry.debit) : '',
                Number(entry.credit) > 0 ? formatCurrency(entry.credit) : '',
                formatCurrency(entry.runningBalance)
            ];
            tableRows.push(entryData);
        });
    
        doc.autoTable(tableColumn, tableRows, { startY: doc.lastAutoTable.finalY + 10 });
        doc.save(`Ledger_Report_${selectedAccount.code}.pdf`);
    };

    // Calculate running balance and totals
    const reportSummary = useMemo(() => {
        let runningBalance = ledgerData.opening_balance || 0;
        const isAssetOrExpense = selectedAccount?.type === 'asset' || selectedAccount?.type === 'expense';
        let totalDebit = 0;
        let totalCredit = 0;

        const entries = ledgerData.entries.map(entry => {
            const debit = Number(entry.debit);
            const credit = Number(entry.credit);
            totalDebit += debit;
            totalCredit += credit;
            runningBalance += isAssetOrExpense ? (debit - credit) : (credit - debit);
            return { ...entry, runningBalance };
        });

        return {
            processedEntries: entries,
            openingBalance: ledgerData.opening_balance || 0,
            totalDebit,
            totalCredit,
            closingBalance: runningBalance
        };
    }, [ledgerData, selectedAccount]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} className="print:hidden" />

                <main className="grow p-6 print:p-0">
                    <div id="report-content" className="w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg print:shadow-none print:rounded-none">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 print:hidden">Account Ledger Report</h2>

                        {/* Filters Section */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg print:hidden">
                            <select name="account_id" value={filters.account_id} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600">
                                <option value="">-- Select Account --</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                            </select>
                            <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600" />
                            <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600" />
                            <button onClick={handleFetchLedger} disabled={loading} className="flex justify-center items-center bg-[#1976D2] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition disabled:opacity-50">
                                <FiFilter className="mr-2" /> {loading ? 'Filtering...' : 'Filter'}
                            </button>
                        </div>

                        {/* Report Header and Summary - Visible only when data is loaded */}
                        {selectedAccount && reportSummary.processedEntries.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAccount.name} ({selectedAccount.code})</h3>
                                        <p className="text-sm text-gray-500">
                                            {filters.start_date && filters.end_date 
                                                ? `From ${filters.start_date} to ${filters.end_date}`
                                                : 'For all dates'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 print:hidden">
                                        <button onClick={handleDownloadPDF} className="flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition">
                                            <FiDownload className="mr-2" /> PDF
                                        </button>
                                        <button onClick={() => window.print()} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
                                            <FiPrinter className="mr-2" /> Print
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center print:hidden">
                                    <div className="bg-gray-100 p-4 rounded-lg"><p className="text-sm text-gray-600">Opening Balance</p><p className="text-xl font-bold">{formatCurrency(reportSummary.openingBalance)}</p></div>
                                    <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-blue-700">Total Debits</p><p className="text-xl font-bold text-blue-800">{formatCurrency(reportSummary.totalDebit)}</p></div>
                                    <div className="bg-green-50 p-4 rounded-lg"><p className="text-sm text-green-700">Total Credits</p><p className="text-xl font-bold text-green-800">{formatCurrency(reportSummary.totalCredit)}</p></div>
                                    <div className="bg-gray-200 p-4 rounded-lg"><p className="text-sm text-gray-800">Closing Balance</p><p className="text-xl font-bold">{formatCurrency(reportSummary.closingBalance)}</p></div>
                                </div>
                            </div>
                        )}

                        {/* Report Table */}
                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Txn ID</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Debit</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Credit</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></td></tr>
                                    ) : reportSummary.processedEntries.length > 0 ? (
                                        <>
                                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                                <td colSpan="5" className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-200">Opening Balance</td>
                                                <td className="px-6 py-3 text-right font-semibold font-mono text-gray-900 dark:text-white">{formatCurrency(reportSummary.openingBalance)}</td>
                                            </tr>
                                            {reportSummary.processedEntries.map(entry => (
                                                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(entry.occurred_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{entry.journal?.description || '---'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{entry.tx_id}</td>
                                                    <td className="px-6 py-4 text-right text-sm font-mono">{Number(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}</td>
                                                    <td className="px-6 py-4 text-right text-sm font-mono">{Number(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}</td>
                                                    <td className="px-6 py-4 text-right text-sm font-mono font-semibold text-gray-900 dark:text-white">{formatCurrency(entry.runningBalance)}</td>
                                                </tr>
                                            ))}
                                        </>
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-10 text-gray-500">Select an account and filter to see the ledger.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LedgerReport;