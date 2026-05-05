// src/pages/EmployeeWalletStatement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { PDFViewer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";

// =========================
// Icons (SVG)
// =========================
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.252l12.49-10.49a2.25 2.25 0 013.042.48l1.758 2.05c.29.338.44.773.414 1.216l-.76 11.544a2.25 2.25 0 01-2.246 2.098H5.25a2.25 2.25 0 01-2.25-2.25V12.252z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
  </svg>
);

const BalanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// =========================
// Helpers
// =========================
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === null) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 20, fontSize: 10, fontFamily: "Helvetica" },
  header: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  table: { display: "table", width: "auto", borderWidth: 1, borderColor: "#bdbdbd", marginTop: 10 },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    borderRightWidth: 1,
    borderColor: "#bdbdbd",
    padding: 4,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#1D4ED8",
    color: "#fff",
  },
  tableCol: { borderRightWidth: 1, borderColor: "#bdbdbd", padding: 4, textAlign: "center" },
});

const EmployeeWalletStatement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  // Fetch wallet data
  const fetchWallet = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${BASE_URL}/api/v1/employees/dashboard/wallet/statement`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallet(res?.data?.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Loading State
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
       <div className="text-xl font-semibold text-indigo-600 animate-pulse">Loading Wallet Data...</div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="p-4 md:p-6 w-full max-w-7xl mx-auto">
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Page Title & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                <span className="text-indigo-600">💳</span> Wallet Statement
              </h1>
              <p className="text-sm text-gray-500 mt-1">Track your earnings, withdrawals, and balance.</p>
            </div>
            
            {wallet && (
               <button
                className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 ${showPdf ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                onClick={() => setShowPdf(!showPdf)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {showPdf ? "Close PDF Viewer" : "Download PDF"}
              </button>
            )}
          </div>

          {wallet && (
            <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            
            {/* Opening Balance */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Opening Balance</p>
                <p className="font-bold text-xl md:text-2xl text-gray-800 mt-1">{formatCurrency(wallet.opening_balance)}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <WalletIcon />
              </div>
            </div>

             {/* Total Debit */}
             <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Debit</p>
                <p className="font-bold text-xl md:text-2xl text-red-600 mt-1">{formatCurrency(wallet.total_debit)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <TrendingDownIcon />
              </div>
            </div>

             {/* Total Credit */}
             <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Credit</p>
                <p className="font-bold text-xl md:text-2xl text-green-600 mt-1">{formatCurrency(wallet.total_credit)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                 <TrendingUpIcon />
              </div>
            </div>

            {/* Closing Balance */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-between transition hover:shadow-md ring-1 ring-indigo-50">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Closing Balance</p>
                <p className="font-bold text-xl md:text-2xl text-indigo-700 mt-1">{formatCurrency(wallet.closing_balance)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <BalanceIcon />
              </div>
            </div>
          </div>

          {/* Datatable */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Note</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Debit</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Credit</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wallet.transactions.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-indigo-50/50 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(item.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {item.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{item.reference || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 min-w-[200px]">{item.note || '-'}</td>
                    <td className="px-6 py-4 text-sm text-red-500 font-medium text-right whitespace-nowrap">
                      {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium text-right whitespace-nowrap">
                      {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-indigo-900 font-bold text-right whitespace-nowrap">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td className="px-6 py-4 text-left text-gray-700 uppercase tracking-wider" colSpan={5}>
                    Total Summary
                  </td>
                  <td className="px-6 py-4 text-right text-red-600">
                    {formatCurrency(wallet.transactions.reduce((sum, t) => sum + t.debit, 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-green-600">
                    {formatCurrency(wallet.transactions.reduce((sum, t) => sum + t.credit, 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-indigo-700">
                     {/* Balance isn't typically summed in a statement, usually it's the last closing balance, but keeping logic as per original */}
                     -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          {/* PDF Viewer */}
          {showPdf && (
            <div className="mt-8 h-[600px] border-2 border-indigo-100 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-indigo-600 text-white p-2 text-center text-sm font-semibold">PDF PREVIEW</div>
              <PDFViewer width="100%" height="100%">
                <Document title="Wallet Statement">
                  <Page size="A4" style={pdfStyles.page}>
                    <Text style={pdfStyles.header}>Wallet Statement</Text>

                    <View style={pdfStyles.table}>
                      <View style={pdfStyles.tableRow}>
                        <Text style={[pdfStyles.tableColHeader, { width: "5%" }]}>#</Text>
                        <Text style={[pdfStyles.tableColHeader, { width: "15%" }]}>Date</Text>
                        <Text style={[pdfStyles.tableColHeader, { width: "10%" }]}>Source</Text>
                        <Text style={[pdfStyles.tableColHeader, { width: "15%" }]}>Reference</Text>
                        <Text style={[pdfStyles.tableColHeader, { width: "20%" }]}>Note</Text>
                        <Text style={[pdfStyles.tableColHeader, { width: "10%" }]}>Debit</Text>
                        <Text style={[pdfStyles.tableColHeader, { width: "10%" }]}>Credit</Text>
                        <Text style={[pdfStyles.tableColHeader, { width: "15%" }]}>Balance</Text>
                      </View>

                      {wallet.transactions.map((item, index) => (
                        <View style={pdfStyles.tableRow} key={index}>
                          <Text style={[pdfStyles.tableCol, { width: "5%" }]}>{index + 1}</Text>
                          <Text style={[pdfStyles.tableCol, { width: "15%" }]}>{formatDate(item.date)}</Text>
                          <Text style={[pdfStyles.tableCol, { width: "10%" }]}>{item.source}</Text>
                          <Text style={[pdfStyles.tableCol, { width: "15%" }]}>{item.reference}</Text>
                          <Text style={[pdfStyles.tableCol, { width: "20%" }]}>{item.note}</Text>
                          <Text style={[pdfStyles.tableCol, { width: "10%" }]}>{formatCurrency(item.debit)}</Text>
                          <Text style={[pdfStyles.tableCol, { width: "10%" }]}>{formatCurrency(item.credit)}</Text>
                          <Text style={[pdfStyles.tableCol, { width: "15%" }]}>{formatCurrency(item.balance)}</Text>
                        </View>
                      ))}
                    </View>
                  </Page>
                </Document>
              </PDFViewer>
            </div>
          )}
          </>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeWalletStatement;