import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import { FiPrinter, FiDownload } from 'react-icons/fi'; // Import icons
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// A simple utility to check if two numbers are equal, handling floating point inaccuracies
const areTotalsBalanced = (debit, credit) => {
    if (debit === undefined || credit === undefined) return false;
    return Math.abs(Number(debit) - Number(credit)) < 0.01;
};

const TrialBalanceReport = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reportData, setReportData] = useState({ data: [], summary: {} });
    const [loading, setLoading] = useState(false);

    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/accounting";
    const token = localStorage.getItem("authToken");

    const fetchTrialBalance = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/trial-balance`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await res.json();
            if (res.ok) {
                setReportData(data);
            } else {
                throw new Error(data.message || "Failed to fetch trial balance data.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrialBalance();
    }, [token]);

    const formatCurrency = (value) => {
        const num = Number(value);
        return num > 0 ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        if (reportData.data.length === 0) {
            toast.error("No data available to generate PDF.");
            return;
        }
    
        const doc = new jsPDF();
    
        // --- PDF Header ---
        doc.setFontSize(18);
        doc.text("Trial Balance Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`As of ${new Date().toLocaleDateString()}`, 14, 30);
    
        // --- PDF Table ---
        const tableColumn = ["Account Code", "Account Name", "Debit (BDT)", "Credit (BDT)"];
        const tableRows = [];
    
        reportData.data.forEach(account => {
            const accountData = [
                account.code,
                account.name,
                { content: formatCurrency(account.debit_total), styles: { halign: 'right' } },
                { content: formatCurrency(account.credit_total), styles: { halign: 'right' } },
            ];
            tableRows.push(accountData);
        });
    
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            foot: [
                [
                    { content: 'Totals', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: formatCurrency(reportData.summary?.total_debit), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: formatCurrency(reportData.summary?.total_credit), styles: { halign: 'right', fontStyle: 'bold' } },
                ],
            ],
            startY: 36,
            headStyles: { fillColor: [25, 118, 210] }, // Blue header
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
            didDrawPage: (data) => {
                // Footer
                doc.setFontSize(10);
                doc.text('Page ' + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });
    
        doc.save('Trial_Balance_Report.pdf');
    };

    const isBalanced = areTotalsBalanced(reportData.summary?.total_debit, reportData.summary?.total_credit);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow p-4 sm:p-6 lg:p-8 print:p-0">
                    <div id="report-content" className="w-full bg-white p-6 rounded-2xl shadow-2xl border border-gray-200 print:shadow-none print:border-none print:rounded-none">
                        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                        {/* Report Header */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 print:hidden">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800">Trial Balance Report</h2>
                                <p className="text-sm text-gray-500 mt-1">A summary of all account balances.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
                                >
                                    <FiDownload className="mr-2" /> PDF
                                </button>
                                <button onClick={handlePrint} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
                                    <FiPrinter className="mr-2" /> Print
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
                            {/* Total Debits Card */}
                            <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500 shadow-sm">
                                <h3 className="text-sm font-semibold text-blue-800 uppercase">Total Debits</h3>
                                <p className="text-3xl font-bold text-blue-900 mt-1">
                                    {formatCurrency(reportData.summary?.total_debit)}
                                </p>
                            </div>
                            {/* Total Credits Card */}
                            <div className="bg-green-50 p-5 rounded-xl border-l-4 border-green-500 shadow-sm">
                                <h3 className="text-sm font-semibold text-green-800 uppercase">Total Credits</h3>
                                <p className="text-3xl font-bold text-green-900 mt-1">
                                    {formatCurrency(reportData.summary?.total_credit)}
                                </p>
                            </div>
                            {/* Balance Status Card */}
                            <div className={`p-5 rounded-xl border-l-4 shadow-sm ${isBalanced ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                                <h3 className={`text-sm font-semibold uppercase ${isBalanced ? 'text-green-800' : 'text-red-800'}`}>Status</h3>
                                <p className={`text-3xl font-bold mt-1 ${isBalanced ? 'text-green-900' : 'text-red-900'}`}>
                                    {isBalanced ? 'Balanced' : 'Unbalanced'}
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-lg text-gray-600">Loading Report Data...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-md">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#1976D2] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Account Code</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Account Name</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Debit (BDT)</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Credit (BDT)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {reportData.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-12 text-gray-500 text-lg">No data available to display.</td>
                                            </tr>
                                        ) : (
                                            reportData.data.map((account) => (
                                                <tr key={account.id} className="hover:bg-blue-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.code}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-mono tabular-nums">{formatCurrency(account.debit_total)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-mono tabular-nums">{formatCurrency(account.credit_total)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-100 border-t-4 border-gray-300">
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-right text-base font-bold text-gray-800 uppercase">
                                                Totals
                                            </td>
                                            <td className="px-6 py-4 text-right text-base font-bold text-blue-700 font-mono tabular-nums">
                                                {formatCurrency(reportData.summary?.total_debit)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-base font-bold text-green-700 font-mono tabular-nums">
                                                {formatCurrency(reportData.summary?.total_credit)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TrialBalanceReport;