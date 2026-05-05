// src/pages/Reports/StockReportPDF.jsx
import React, { useState, useEffect } from "react";
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

// 1. Using the imported logo file
import logoImage from "../../images/al_hamra.jpg";

// Currency and Date helpers
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === null) return "N/A";
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

// --- STYLES (Adjusted for Stock Report Table) ---
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
    backgroundColor: "#D97706",
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
  // --- Loading Spinner/Fallback ---
  loadingContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    color: '#D97706',
    fontWeight: 'bold',
  },
  // --- Header ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#D97706",
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
  title: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 10,
    color: "#D97706",
    textTransform: "uppercase",
  },
  // --- Summary Section (Key Metrics) ---
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: "#D97706",
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
    color: "#B45309",
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
    backgroundColor: "#D97706",
    borderBottomWidth: 1,
    borderBottomColor: "#D97706",
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
  // Specific column widths (Adjusted for Stock Data)
  colSL: { width: "5%" },
  colProductName: { width: "25%", textAlign: "left" },
  colCategory: { width: "15%" },
  colPrice: { width: "12%", textAlign: "right" },
  colStockQty: { width: "10%" },
  colMinAlert: { width: "10%" },
  colIsManaged: { width: "11%" },
  colDate: { width: "12%" },

  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: "center",
    color: "#777",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
  },
});

const StockReportPDF = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // State for loading
  const [loading, setLoading] = useState(true);

  const reportData = state?.data || state?.pdfData || [];
  
  // Simulate data loading/processing delay for better UX demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms delay for demonstration

    return () => clearTimeout(timer);
  }, [reportData]);


  const totalProducts = reportData.length;
  // Count products with low/negative stock (assuming stock_qty < min_stock_alert is low)
  const lowStockCount = reportData.filter(
    (item) => parseFloat(item.stock_qty) < parseFloat(item.min_stock_alert)
  ).length;

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

      {/* PDF Viewer/Loading Full Screen */}
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {loading ? (
          // 2. Loading Spinner/Message
          <div style={styles.loadingContainer}>
            <p>
              **Generating PDF Report...**
            </p>
            {/* You would typically use a CSS spinner here */}
            <div style={{ marginTop: '20px', color: '#D97706', fontSize: '30px' }}>
                ⏳
            </div>
            <p style={{fontSize: '14px', color: '#777', marginTop: '10px'}}>
                This may take a moment for large reports.
            </p>
          </div>
        ) : (
          // 3. PDF Viewer with Document
          <PDFViewer width="100%" height="100%">
            <Document title="Al-Hamra Home Stock Report">
              <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerContainer} fixed>
                  {/* Use imported Image */}
                  <Image src={logoImage} style={styles.logo} /> 
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>Al-Hamra Home</Text>
                    <Text style={styles.reportDate}>
                      Current Inventory Stock Report
                    </Text>
                    <Text style={styles.reportDate}>
                      Generated: {new Date().toLocaleDateString("en-BD")}
                    </Text>
                  </View>
                </View>

                {/* Report Title */}
                <Text style={styles.title}>Inventory Stock Status</Text>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Product Lines</Text>
                    <Text style={styles.summaryValue}>{totalProducts}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Items in Low Stock</Text>
                    <Text style={styles.summaryValue}>{lowStockCount}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Stock Managed</Text>
                    <Text style={styles.summaryValue}>
                      {
                        reportData.filter((item) => item.is_stock_managed)
                          .length
                      }
                    </Text>
                  </View>
                </View>

                {/* Stock Details Table */}
                <View style={styles.tableContainer}>
                  {reportData.length > 0 ? (
                    <View style={styles.table}>
                      {/* Table Header (Fixed) */}
                      <View style={styles.tableHeader} fixed>
                        <Text
                          style={[styles.tableHeaderCell, styles.colSL]}
                        >
                          SL
                        </Text>
                        <Text
                          style={[styles.tableHeaderCell, styles.colProductName, {textAlign: 'left'}]}
                        >
                          Product Name
                        </Text>
                        <Text
                          style={[styles.tableHeaderCell, styles.colCategory]}
                        >
                          Category
                        </Text>
                        <Text
                          style={[styles.tableHeaderCell, styles.colPrice]}
                        >
                          Price
                        </Text>
                        <Text
                          style={[styles.tableHeaderCell, styles.colStockQty]}
                        >
                          Stock Qty
                        </Text>
                        <Text
                          style={[styles.tableHeaderCell, styles.colMinAlert]}
                        >
                          Alert Min
                        </Text>
                        <Text
                          style={[styles.tableHeaderCell, styles.colIsManaged]}
                        >
                          Stock Managed
                        </Text>
                        <Text
                          style={[styles.tableHeaderCell, styles.colDate]}
                        >
                          Created Date
                        </Text>
                      </View>
                      {/* Table Body */}
                      {reportData.map((item, index) => (
                        <View style={styles.tableRow} key={item.id}>
                          {/* SL */}
                          <Text style={[styles.tableDataCell, styles.colSL]}>
                            {index + 1}
                          </Text>
                          {/* Product Name */}
                          <Text style={[styles.tableDataCell, styles.colProductName]}>
                            {item.name}
                          </Text>
                          {/* Category */}
                          <Text style={[styles.tableDataCell, styles.colCategory]}>
                            {item.category?.name || "N/A"}
                          </Text>
                          {/* Price */}
                          <Text
                            style={[
                              styles.tableDataCell,
                              styles.colPrice,
                              { fontWeight: "bold", color: "#1D4ED8" },
                            ]}
                          >
                            {formatCurrency(item.price)}
                          </Text>
                          {/* Stock Qty */}
                          <Text
                            style={[
                              styles.tableDataCell,
                              styles.colStockQty,
                              {
                                color:
                                  parseFloat(item.stock_qty) <
                                  parseFloat(item.min_stock_alert)
                                    ? "#DC2626"
                                    : "#059669",
                                fontWeight: "bold",
                              },
                            ]}
                          >
                            {item.stock_qty}
                          </Text>
                          {/* Min Alert */}
                          <Text style={[styles.tableDataCell, styles.colMinAlert]}>
                            {item.min_stock_alert}
                          </Text>
                          {/* Stock Managed */}
                          <Text style={[styles.tableDataCell, styles.colIsManaged]}>
                            {item.is_stock_managed ? "Yes" : "No"}
                          </Text>
                          {/* Created Date */}
                          <Text style={[styles.tableDataCell, styles.colDate]}>
                            {formatDate(item.created_at)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
                      No stock details available to generate the report.
                    </Text>
                  )}
                </View>

                {/* Footer */}
                <Text
                  style={styles.footer}
                  render={({ pageNumber, totalPages }) =>
                    `Page ${pageNumber} of ${totalPages} | Al-Hamra Home Stock Report - Confidential`
                  }
                  fixed
                />
              </Page>
            </Document>
          </PDFViewer>
        )}
      </div>
    </div>
  );
};

export default StockReportPDF;