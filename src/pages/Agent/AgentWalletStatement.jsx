// src/pages/AgentWalletStatement.jsx
import React, { useState } from "react";
import axios from "axios";
import { PDFViewer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// React Query v5
import { useQuery } from "@tanstack/react-query";

// Layout components
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

// Skeleton loader
import ContentLoader from "react-content-loader";

const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";

// Helpers
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === null) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
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

const AgentWalletStatement = () => {
  const [showPdf, setShowPdf] = useState(false);

  // Fetch wallet function
  const fetchWallet = async () => {
    const token = localStorage.getItem("authToken");
    const res = await axios.get(`${BASE_URL}/api/v1/agents/dashboard/wallet/statement`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  };

  // React Query v5
  const { data: wallet, isLoading, isError } = useQuery({
    queryKey: ["agentWallet"],
    queryFn: fetchWallet,
    onError: () => toast.error("Failed to fetch wallet data"),
    staleTime: 1000 * 60, // 1 min
  });

  // Totals
  const totalDebit = wallet?.transactions.reduce((sum, t) => sum + t.debit, 0) || 0;
  const totalCredit = wallet?.transactions.reduce((sum, t) => sum + t.credit, 0) || 0;
  const totalBalance = wallet?.transactions.reduce((sum, t) => sum + t.balance, 0) || 0;

  // Skeleton Loader
  if (isLoading)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="p-6 flex-1">
            <ContentLoader
              speed={2}
              width="100%"
              height={400}
              viewBox="0 0 800 400"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <rect x="0" y="0" rx="5" ry="5" width="200" height="30" />
              <rect x="0" y="50" rx="5" ry="5" width="800" height="30" />
              <rect x="0" y="100" rx="5" ry="5" width="800" height="30" />
              <rect x="0" y="150" rx="5" ry="5" width="800" height="30" />
              <rect x="0" y="200" rx="5" ry="5" width="800" height="30" />
            </ContentLoader>
          </main>
        </div>
      </div>
    );

  if (isError) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-1">
          <ToastContainer />
          <h1 className="text-3xl font-bold mb-6 text-indigo-700">Wallet Statement</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded shadow text-center">
              <p className="text-gray-500 uppercase text-sm">Opening Balance</p>
              <p className="font-bold text-lg">{formatCurrency(wallet.opening_balance)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow text-center">
              <p className="text-gray-500 uppercase text-sm">Total Debit</p>
              <p className="font-bold text-lg">{formatCurrency(wallet.total_debit)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow text-center">
              <p className="text-gray-500 uppercase text-sm">Total Credit</p>
              <p className="font-bold text-lg">{formatCurrency(wallet.total_credit)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow text-center">
              <p className="text-gray-500 uppercase text-sm">Closing Balance</p>
              <p className="font-bold text-lg">{formatCurrency(wallet.closing_balance)}</p>
            </div>
          </div>

          {/* Datatable */}
          <div className="overflow-x-auto rounded shadow-lg bg-white">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-indigo-600 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-white font-semibold uppercase text-sm">#</th>
                  <th className="px-4 py-3 text-left text-white font-semibold uppercase text-sm">Date</th>
                  <th className="px-4 py-3 text-left text-white font-semibold uppercase text-sm">Source</th>
                  <th className="px-4 py-3 text-left text-white font-semibold uppercase text-sm">Reference</th>
                  <th className="px-4 py-3 text-left text-white font-semibold uppercase text-sm">Note</th>
                  <th className="px-4 py-3 text-right text-white font-semibold uppercase text-sm">Debit</th>
                  <th className="px-4 py-3 text-right text-white font-semibold uppercase text-sm">Credit</th>
                  <th className="px-4 py-3 text-right text-white font-semibold uppercase text-sm">Balance</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{formatDate(item.date)}</td>
                    <td className="px-4 py-2 capitalize">{item.source}</td>
                    <td className="px-4 py-2">{item.reference}</td>
                    <td className="px-4 py-2">{item.note}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.debit)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.credit)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.balance)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-200 font-bold">
                  <td className="px-4 py-2 text-left" colSpan={5}>
                    TOTAL
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalDebit)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalCredit)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PDF Button */}
          <button
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => setShowPdf(!showPdf)}
          >
            {showPdf ? "Hide PDF" : "Download PDF"}
          </button>

          {/* PDF Viewer */}
          {showPdf && (
            <div className="mt-4 h-[600px] border">
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
        </main>
      </div>
    </div>
  );
};

export default AgentWalletStatement;