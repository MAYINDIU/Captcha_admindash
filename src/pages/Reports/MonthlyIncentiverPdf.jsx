// src/pages/reports/MonthlyIncentivePdf.jsx
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
} from "@react-pdf/renderer";
import logoImage from "../../images/al_hamra.jpg";

// Helpers
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === null) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Styles
const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10, fontFamily: "Helvetica", color: "#333" },
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
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1D4ED8",
    paddingBottom: 5,
  },
  logo: { width: 120, height: 40, objectFit: "contain" },
  companyInfo: { textAlign: "right" },
  companyName: { fontSize: 16, fontWeight: "bold" },
  reportDate: { fontSize: 9, color: "#555" },
  title: { fontSize: 18, textAlign: "center", fontWeight: "bold", marginVertical: 10, color: "#1D4ED8" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#1D4ED8",
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "bold",
  },
  summaryValue: { fontSize: 12, fontWeight: "bold", color: "#1F2937" },
  tableContainer: { marginTop: 10, marginBottom: 20 },
  table: { display: "table", width: "auto", borderWidth: 1, borderColor: "#E5E7EB" },
  tableHeader: { flexDirection: "row", backgroundColor: "#1D4ED8" },
  tableHeaderCell: { padding: 5, fontWeight: "bold", fontSize: 9, color: "#fff", textAlign: "center" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  tableDataCell: { padding: 5, fontSize: 9, borderLeftWidth: 0.5, borderLeftColor: "#E5E7EB", textAlign: "center" },
  tableTotalRow: { flexDirection: "row", backgroundColor: "#E5E7EB", fontWeight: "bold" },
  tableTotalCell: { padding: 5, fontSize: 10, fontWeight: "bold", textAlign: "center" },
  colSL: { width: "5%" },
  colEmployee: { width: "20%" },
  colPeriod: { width: "15%" },
  colSales: { width: "15%" },
  colRate: { width: "10%" },
  colAmount: { width: "15%" },
  colStatus: { width: "10%" },
  colReviewer: { width: "10%" },
  colProcessed: { width: "10%" },
  statusPaid: { color: "green", fontWeight: "bold" },
  statusDraft: { color: "orange", fontWeight: "bold" },
  footer: { position: "absolute", bottom: 10, left: 20, right: 20, textAlign: "center", fontSize: 8, color: "#999" },
});

const MonthlyIncentivePdf = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const pdfData = state?.pdfData || [];
  const summary = state?.summary || {};

  // ✅ Calculate totals for all rows
  const totalSales = pdfData.reduce((sum, item) => sum + (parseFloat(item.total_commissionable_sales) || 0), 0);
  const totalAmount = pdfData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <div style={{ flex: 1, border: "1px solid #ccc" }}>
        <PDFViewer width="100%" height="100%">
          <Document title="Monthly Incentive Report">
            <Page size="A4" style={styles.page}>
              {/* Header */}
              <View style={styles.headerContainer} fixed>
                <Image src={logoImage} style={styles.logo} />
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>Al-Hamra Home</Text>
                  <Text style={styles.reportDate}>Monthly Incentive Report</Text>
                  <Text style={styles.reportDate}>Generated: {new Date().toLocaleDateString()}</Text>
                </View>
              </View>

              <Text style={styles.title}>Detailed Monthly Incentive</Text>

              {/* Summary Section */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Records</Text>
                  <Text style={styles.summaryValue}>{summary.count || pdfData.length}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Sales</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Incentive</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
                </View>
              </View>

              {/* Table */}
              <View style={styles.tableContainer}>
                {pdfData.length > 0 ? (
                  <View style={styles.table}>
                    <View style={styles.tableHeader} fixed>
                      <Text style={[styles.tableHeaderCell, styles.colSL]}>SL</Text>
                      <Text style={[styles.tableHeaderCell, styles.colEmployee]}>Employee</Text>
                      <Text style={[styles.tableHeaderCell, styles.colPeriod]}>Period</Text>
                      <Text style={[styles.tableHeaderCell, styles.colSales]}>Sales</Text>
                      <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate (%)</Text>
                      <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
                      <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
                      <Text style={[styles.tableHeaderCell, styles.colReviewer]}>Reviewer</Text>
                      <Text style={[styles.tableHeaderCell, styles.colProcessed]}>Processed</Text>
                    </View>

                    {/* Table Rows */}
                    {pdfData.map((item, index) => (
                      <View key={item.id || index} style={[styles.tableRow, index % 2 === 1 ? { backgroundColor: "#fcfcfc" } : {}]} wrap={false}>
                        <Text style={[styles.tableDataCell, styles.colSL]}>{index + 1}</Text>
                        <Text style={[styles.tableDataCell, styles.colEmployee]}>{item.employee_name || "-"}</Text>
                        <Text style={[styles.tableDataCell, styles.colPeriod]}>
                          {item.period_start ? formatDate(item.period_start) : "-"} - {item.period_end ? formatDate(item.period_end) : "-"}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colSales]}>{formatCurrency(item.total_commissionable_sales)}</Text>
                        <Text style={[styles.tableDataCell, styles.colRate]}>{item.incentive_rate || 0}</Text>
                        <Text style={[styles.tableDataCell, styles.colAmount]}>{formatCurrency(item.amount)}</Text>
                        <Text
                          style={[
                            styles.tableDataCell,
                            styles.colStatus,
                            item.status === "paid" ? styles.statusPaid : styles.statusDraft,
                          ]}
                        >
                          {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "-"}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colReviewer]}>{item.reviewer_name || "-"}</Text>
                        <Text style={[styles.tableDataCell, styles.colProcessed]}>{item.processed_at ? formatDate(item.processed_at) : "-"}</Text>
                      </View>
                    ))}

                    {/* Totals Row */}
                    <View style={styles.tableTotalRow} wrap={false}>
                      <Text style={[styles.tableTotalCell, styles.colSL]}></Text>
                      <Text style={[styles.tableTotalCell, { width: "35%", textAlign: "right" }]}>GRAND TOTAL:</Text>
                      <Text style={[styles.tableTotalCell, styles.colSales]}>{formatCurrency(totalSales)}</Text>
                      <Text style={[styles.tableTotalCell, styles.colRate]}></Text>
                      <Text style={[styles.tableTotalCell, styles.colAmount]}>{formatCurrency(totalAmount)}</Text>
                      <Text style={[styles.tableTotalCell, styles.colStatus]}></Text>
                      <Text style={[styles.tableTotalCell, styles.colReviewer]}></Text>
                      <Text style={[styles.tableTotalCell, styles.colProcessed]}></Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ textAlign: "center", padding: 20 }}>
                    <Text>No data found for this report.</Text>
                  </View>
                )}
              </View>

              {/* Footer */}
              <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </Page>
          </Document>
        </PDFViewer>
      </div>
    </div>
  );
};

export default MonthlyIncentivePdf;