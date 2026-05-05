// src/pages/reports/CommissionReportPDF.jsx
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
  // Font,
} from "@react-pdf/renderer";

// ** NEW: Import the local logo image **
// Assuming 'images/al_hamra.jpg' is relative to the project root or configured correctly 
// via your bundler (like Webpack/Vite) to resolve to the correct path.
import logoImage from "../../images/al_hamra.jpg"; 

// Currency and Date helpers (adjusted for clarity)
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === null) return "N/A";
  
  // 1. Format using a standard locale (like 'en-US') to get comma thousands separator and two decimals.
  // Example: 20000.00 -> "20,000.00"
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // 2. Replace the thousands separator (comma) with a dot.
  // Example: "20,000.00" -> "20.000.00"
  return formatted.replace(/,/g, ".");
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  // Assuming created_at is a full date string
  return new Date(dateString).toLocaleDateString("en-BD");
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica", // Fallback/Default
    color: "#333",
    fontSize: 10,
  },
  // --- Back Button (For web view, outside PDF) ---
  backButton: {
    margin: 10,
    padding: "8px 16px",
    backgroundColor: "#1D4ED8",
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
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#1D4ED8",
  },
  logo: {
    width: 140,
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
    fontSize: 9,
    color: "#555",
    lineHeight: 1.5,
  },
  // ** UPDATED TITLE STYLE/CONTENT **
  title: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 10,
    color: "#1D4ED8",
    textTransform: "uppercase",
  },
  // --- Summary Section (Key Metrics) ---
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#FFFBEB", // Light yellow for commissions
    borderRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: "#D97706", // Orange accent
  },
  summaryItem: {
    flex: 1,
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
    color: "#D97706", // Strong commission/orange color
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
    borderColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1D4ED8",
    borderBottomWidth: 1,
    borderBottomColor: "#1D4ED8",
    color: "#ffffff",
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
    backgroundColor: "#E5E7EB",
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
  // ** UPDATED COLUMN WIDTHS/TITLES FOR COMMISSION DATA **
  colSL: { width: "5%" },
  colOrderNo: { width: "15%" },
  colRecipient: { width: "25%" }, // New field
  colRule: { width: "25%" }, // New field
  colAmount: { width: "15%", textAlign: "right" }, // New field (Amount)
  colStatus: { width: "10%" }, // New field
  colDate: { width: "10%" },
  // Status style
  statusPaid: {
    color: 'green',
    fontWeight: 'bold',
  },
  statusUnpaid: {
    color: 'red',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
  }
});

const CommissionReportPDF = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // state.pdfData is now the array of commission objects
  const dateRange = state?.dateRange || {};
  const pdfData = state?.pdfData || []; 
  // state.summary is the summary object
  const summary = state?.summary || {}; 

  // Calculate total values from the data if summary is missing or for verification
  const totalCommissionValue = pdfData.reduce(
    (acc, item) => acc + (parseFloat(item.amount) || 0),
    0
  );
  const totalUnpaidValue = pdfData.reduce(
    (acc, item) => acc + (item.status !== 'paid' ? (parseFloat(item.amount) || 0) : 0),
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
        &larr; Back to Commission Report
      </button>

      {/* PDF Viewer Full Screen */}
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <PDFViewer width="100%" height="100%">
          <Document title="Al-Hamra Home Commission Report">
            <Page size="A4" style={styles.page}>
              {/* Header */}
              <View style={styles.headerContainer} fixed>
                {/* ** UPDATED to use imported logoImage ** */}
                <Image src={logoImage} style={styles.logo} />
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>Al-Hamra Home</Text>
                  <Text style={styles.reportDate}>
                    Commission Transaction Report
                  </Text>
                  {dateRange.from && dateRange.to && (
                    <Text style={styles.reportDate}>
                      Period: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </Text>
                  )}
                  <Text style={styles.reportDate}>
                    Generated: {new Date().toLocaleDateString("en-BD")}
                  </Text>
                </View>
              </View>

              {/* Report Title */}
              <Text style={styles.title}>Detailed Commission Report</Text>

              {/* Summary (Using new summary fields) */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Commission Value</Text>
                  <Text style={styles.summaryValue}>
                    {/* Use summary or calculated total */}
                    {formatCurrency(summary.total_commission || totalCommissionValue)} 
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Unpaid Commissions</Text>
                  <Text style={styles.summaryValue}>
                    {/* Use summary or calculated total */}
                    {formatCurrency(summary.unpaid_value || totalUnpaidValue)} 
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Entries</Text>
                  <Text style={styles.summaryValue}>
                    {summary.count || pdfData.length}
                  </Text>
                </View>
              </View>

              {/* Commission Transactions Table */}
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
                        style={[styles.tableHeaderCell, styles.colRecipient]}
                      >
                        Recipient
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colRule]}
                      >
                        Commission Rule
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colAmount]}
                      >
                        Amount
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colStatus]}
                      >
                        Status
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colDate]}
                      >
                        Generated Date
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
                          {/* Accessing sales_order object */}
                          {item.sales_order?.order_no || "N/A"} 
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colRecipient]}
                        >
                          {item.recipient_name || "N/A"}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colRule]}
                        >
                          {item.rule?.name || 'N/A (System)'}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colAmount]}
                        >
                          {formatCurrency(item.amount)}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colStatus, item.status === 'paid' ? styles.statusPaid : styles.statusUnpaid]}
                        >
                          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'N/A'}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colDate]}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Table Total Row (Updated) */}
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
                          { width: "65%", textAlign: "right", paddingRight: 15 }, // Combine/span cells
                        ]}
                      >
                        **TOTAL COMMISSION VALUE:**
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colAmount]}
                      >
                        {formatCurrency(summary.total_commission || totalCommissionValue)}
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colStatus]} // Empty cell for Status
                      >
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colDate]} // Empty cell for Date
                      ></Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ textAlign: "center", padding: 20 }}>
                    <Text style={{ fontSize: 12, color: "#999" }}>
                      No commission transactions available for this report.
                    </Text>
                  </View>
                )}
              </View>
              {/* Footer */}
              <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} of ${totalPages}`
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

export default CommissionReportPDF;