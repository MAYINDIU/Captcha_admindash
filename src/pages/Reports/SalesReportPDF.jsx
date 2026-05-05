// src/pages/Reports/SalesReportPDF.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
} from "@react-pdf/renderer";

// --- PROFESSIONALISM UPGRADE: FONT REGISTRATION (Optional but highly recommended) ---
// For a truly professional look, register a font that supports different weights.
// You need to import a .ttf file or use one of the limited Google Fonts @react-pdf supports.
// For example, if you download a Montserrat Regular and Bold .ttf:
/*
import MontserratRegular from './fonts/Montserrat-Regular.ttf';
import MontserratBold from './fonts/Montserrat-Bold.ttf';

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: MontserratRegular, fontWeight: 'normal' },
    { src: MontserratBold, fontWeight: 'bold' },
  ]
});
*/
// For simplicity in this direct answer, we'll keep the default but apply the style change.

// Dummy logo URL - **REPLACE THIS WITH YOUR ACTUAL COMPANY LOGO URL**
const logoUrl = "https://via.placeholder.com/200x60?text=Al-Hamra+Homes+Logo"; // A slightly larger placeholder

// Currency and Date helpers (kept from original)
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === null) return "N/A";
  // Use a fixed number of decimals for financial data
  return num.toLocaleString("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-BD");
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    // fontFamily: "Montserrat", // Use the registered font here
    fontFamily: "Helvetica", // Fallback/Default
    color: "#333",
    fontSize: 10, // Base font size
  },
  // --- Back Button (For web view, outside PDF) ---
  backButton: {
    margin: 10,
    padding: "8px 16px",
    backgroundColor: "#1D4ED8", // A darker, more corporate blue
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    display: "block",
    width: "fit-content",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  // --- Header ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Align items to the top
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2, // Thicker border for header separation
    borderBottomColor: "#1D4ED8", // Header border matches corporate color
  },
  logo: {
    width: 140, // Slightly increased logo size
    height: 40,
    objectFit: "contain",
  },
  companyInfo: {
    textAlign: "right",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 9, // Smaller font for detail
    color: "#555",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 24, // Main title is very prominent
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 10,
    color: "#1D4ED8", // Title matches corporate color
    textTransform: "uppercase",
  },
  // --- Summary Section (Key Metrics) ---
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Use space-between for defined edges
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#F0F9FF", // Very light blue background
    borderRadius: 6,
    borderLeftWidth: 5, // A strong left border accent
    borderLeftColor: "#1D4ED8",
  },
  summaryItem: {
    flex: 1, // Use flex to evenly distribute space
    alignItems: "center",
    paddingHorizontal: 5,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0B73BB", // A strong primary color
  },
  // --- Table ---
  tableContainer: {
    marginBottom: 20,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E5E7EB", // Lighter border for the main table
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1D4ED8", // Darker header color
    borderBottomWidth: 1,
    borderBottomColor: "#1D4ED8",
    color: "#ffffff", // White text for contrast
  },
  tableHeaderCell: {
    padding: 8,
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  tableDataCell: {
    padding: 8,
    fontSize: 9,
    color: "#444",
    borderLeftWidth: 0.5,
    borderLeftColor: "#E5E7EB",
    textAlign: "center",
  },
  // --- Table Total Row (NEW) ---
  tableTotalRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB", // Light gray background for total row
    borderTopWidth: 1,
    borderTopColor: "#111",
    fontWeight: "bold",
  },
  tableTotalCell: {
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a202c",
    borderLeftWidth: 0.5,
    borderLeftColor: "#ccc",
  },
  // Specific column widths
  colSL: { width: "5%" },
  colOrderNo: { width: "15%" },
  colCustomer: { width: "25%" },
  colBranch: { width: "15%" },
  colTotal: { width: "15%", textAlign: "right" },
  colDownPayment: { width: "15%", textAlign: "right" },
  colDate: { width: "10%" },

  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 15, // Slightly lower
    left: 30,
    right: 30,
    fontSize: 8, // Smaller font for footer
    textAlign: "center",
    color: "#777",
    borderTopWidth: 1,
    borderTopColor: "#ddd", // Lighter border
    paddingTop: 8,
  },
});

const SalesReportPDF = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const pdfData = state?.pdfData || [];
  const summary = state?.summary || {};

  // Calculate total values from the data if summary is missing or for verification
  const totalSaleValue = pdfData.reduce(
    (acc, item) => acc + (parseFloat(item.total) || 0),
    0
  );
  const totalDownPaymentValue = pdfData.reduce(
    (acc, item) => acc + (parseFloat(item.down_payment) || 0),
    0
  );

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* Back Button */}
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        &larr; Back to Report
      </button>

      {/* PDF Viewer Full Screen */}
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // Stronger shadow
        }}
      >
        <PDFViewer width="100%" height="100%">
          <Document title="Al-Hamra Home Sales Report">
            <Page size="A4" style={styles.page}>
              {/* Header */}
              <View style={styles.headerContainer} fixed>
                <Image src={logoUrl} style={styles.logo} />
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>Al-Hamra Home</Text>
                  <Text style={styles.reportDate}>
                    Sales Performance Report
                  </Text>
                  <Text style={styles.reportDate}>
                    Generated: {new Date().toLocaleDateString("en-BD")}
                  </Text>
                </View>
              </View>

              {/* Report Title */}
              <Text style={styles.title}>Detailed Sales Report</Text>

              {/* Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Sales Value</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(summary.total_value || totalSaleValue)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Down Payment</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      summary.total_down_payment || totalDownPaymentValue
                    )}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Orders</Text>
                  <Text style={styles.summaryValue}>
                    {summary.count || pdfData.length}
                  </Text>
                </View>
              </View>

              {/* Sales Transactions Table */}
              <View style={styles.tableContainer}>
                {pdfData.length > 0 ? (
                  <View style={styles.table}>
                    {/* Table Header (Fixed) */}
                    <View style={styles.tableHeader} fixed>
                      <Text
                        style={[styles.tableHeaderCell, styles.colSL]}
                      >
                        SL
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colOrderNo]}
                      >
                        Order No
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colCustomer]}
                      >
                        Customer Name
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colBranch]}
                      >
                        Branch
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colTotal]}
                      >
                        Total Value
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderCell,
                          styles.colDownPayment,
                        ]}
                      >
                        Down Payment
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colDate]}
                      >
                        Date
                      </Text>
                    </View>

                    {/* Table Rows */}
                    {pdfData.map((item, index) => (
                      <View
                        key={item.id || index}
                        style={[
                          styles.tableRow,
                          index % 2 === 1 ? { backgroundColor: "#fcfcfc" } : {},
                        ]}
                        wrap={false} // Prevent rows from splitting across pages
                      >
                        <Text style={[styles.tableDataCell, styles.colSL]}>
                          {index + 1}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colOrderNo]}
                        >
                          {item.order_no || "N/A"}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colCustomer]}
                        >
                          {item.customer?.name || "N/A"}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colBranch]}
                        >
                          {item.branch?.name || "N/A"}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colTotal]}
                        >
                          {formatCurrency(item.total)}
                        </Text>
                        <Text
                          style={[
                            styles.tableDataCell,
                            styles.colDownPayment,
                          ]}
                        >
                          {formatCurrency(item.down_payment)}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colDate]}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                    ))}
                    
                    {/* --- PROFESSIONALISM UPGRADE: Table Total Row --- */}
                    <View style={styles.tableTotalRow} wrap={false}>
                      <Text
                        style={[
                          styles.tableTotalCell,
                          styles.colSL,
                          { borderLeftWidth: 0 },
                        ]}
                      ></Text>
                      <Text
                        style={[
                          styles.tableTotalCell,
                          { width: "55%", textAlign: "right", paddingRight: 15 }, // Combine/span cells
                        ]}
                      >
                        GRAND TOTAL:
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colTotal]}
                      >
                        {formatCurrency(summary.total_value || totalSaleValue)}
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colDownPayment]}
                      >
                        {formatCurrency(
                          summary.total_down_payment || totalDownPaymentValue
                        )}
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colDate]}
                      ></Text>
                    </View>
                    
                  </View>
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      marginVertical: 20,
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    No sales data available to generate the report.
                  </Text>
                )}
              </View>

              {/* Footer */}
              <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} of ${totalPages} | Confidential Sales Report | Al-Hamra Home ${new Date().getFullYear()}`
                }
                fixed
              />
            </Page>
          </Document>
        </PDFViewer>
      </div>
    </div>
  );
};

export default SalesReportPDF;