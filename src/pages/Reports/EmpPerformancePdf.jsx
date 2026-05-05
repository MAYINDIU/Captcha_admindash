// src/pages/Reports/EmpPerformancePdfReport.jsx

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
  Font,
} from "@react-pdf/renderer";

// --- LOGO IMPORT ---
import logoImage from "../../images/al_hamra.jpg"; // Using the imported logo file

// --- PROFESSIONALISM UPGRADE: FONT REGISTRATION (Recommended but omitted for brevity) ---
// Font.register({ family: 'Roboto', src: 'path/to/roboto.ttf' });
// For static assets, use the imported image directly in the Image component:
const logoUrl = logoImage; 


// --- Currency and Percentage Helpers ---
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === null) return "N/A";
  // Use 'en-BD' locale for BDT currency format
  return num.toLocaleString("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0,
  });
};

const formatPercentage = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "N/A";
  return `${num.toFixed(2)}%`;
};

// --- Styling (Optimized) ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    color: "#333",
    fontSize: 10,
  },
  // --- Back Button (For web view, outside PDF) ---
  backButton: {
    margin: 10,
    padding: "8px 16px",
    backgroundColor: "#DC2626", 
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
    borderBottomColor: "#DC2626", 
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
    color: "#DC2626", 
    textTransform: "uppercase",
  },
  // --- Summary Section (Key Metrics) ---
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#FEF2F2", // Light red background
    borderRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: "#DC2626",
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
    color: "#B91C1C", 
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
    backgroundColor: "#DC2626", 
    borderBottomWidth: 1,
    borderBottomColor: "#DC2626",
    color: "#ffffff",
  },
  tableHeaderCell: {
    padding: 8,
    fontWeight: "bold",
    fontSize: 8, 
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
  // --- Table Total Row ---
  tableTotalRow: {
    flexDirection: "row",
    backgroundColor: "#FEE2E2", 
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
  colEmployee: { width: "20%", textAlign: "left" },
  colBranch: { width: "15%", textAlign: "left" },
  colOrders: { width: "10%", textAlign: "right" },
  colTotalSales: { width: "15%", textAlign: "right" },
  colCollections: { width: "15%", textAlign: "right" },
  colAvgOrder: { width: "15%", textAlign: "right" },
  colRate: { width: "10%", textAlign: "right" },

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
  // --- Loading Spinner/Overlay Styles ---
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    flexDirection: 'column',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #DC2626', // Corporate Red spinner color
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  // Note: CSS animations aren't supported in standard React style objects. 
  // This spinner is conceptual; in a real app, you'd use a CSS module or a library.
  // For simplicity here, we'll use a placeholder/visual indicator.
});

// A simple component for the loading screen (using inline styles for the spinner effect)
const LoadingSpinner = () => (
    <div style={styles.loadingOverlay}>
        {/* Placeholder for a CSS-based spinner or an imported SVG/Image spinner */}
        <div style={{...styles.spinner, animation: 'none', borderTopColor: '#DC2626', border: '4px solid #f3f3f3',}} />
        <p style={styles.loadingText}>
            Generating Professional Report...
        </p>
    </div>
);


const EmpPerformancePdf = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // Simulate a brief loading time for the PDF to prepare/render
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, []);

  // Data passed from the data-fetching component
  const performanceData = state?.pdfData || [];
  const summary = state?.summary || {};

  // Default value for calculated total
  const defaultTotalSales = performanceData.reduce(
    (acc, item) => acc + (parseFloat(item.total_sales) || 0),
    0
  );
  const defaultTotalCollections = performanceData.reduce(
    (acc, item) => acc + (parseFloat(item.total_collections) || 0),
    0
  );
  const defaultCollectionRate =
    defaultTotalSales > 0
      ? (defaultTotalCollections / defaultTotalSales) * 100
      : 0;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f7fa",
        position: 'relative', // Necessary for the absolute loading overlay
      }}
    >
      {/* Show Loading Spinner until data is ready and component has mounted */}
      {loading && <LoadingSpinner />}

      {/* Back Button (Always visible) */}
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        &larr; Back to Report
      </button>

      {/* PDF Viewer Full Screen */}
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          // Hide viewer until loading is complete
          opacity: loading ? 0 : 1, 
          transition: 'opacity 0.5s ease',
        }}
      >
        <PDFViewer width="100%" height="100%">
          <Document title="Al-Hamra Home Employee Performance Report">
            <Page size="A4" orientation="landscape" style={styles.page}>
              {/* Header (Fixed) */}
              <View style={styles.headerContainer} fixed>
                <Image src={logoUrl} style={styles.logo} />
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>Al-Hamra Home</Text>
                  <Text style={styles.reportDate}>
                    Employee Performance Analysis
                  </Text>
                  <Text style={styles.reportDate}>
                    Generated: {new Date().toLocaleDateString("en-BD")}
                  </Text>
                </View>
              </View>

              {/* Report Title */}
              <Text style={styles.title}>Detailed Employee Performance</Text>

              {/* Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Sales Value</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(summary.total_sales || defaultTotalSales)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Collections</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      summary.total_collections || defaultTotalCollections
                    )}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Employees</Text>
                  <Text style={styles.summaryValue}>
                    {summary.employee_count || performanceData.length}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Avg. Collection Rate</Text>
                  <Text style={styles.summaryValue}>
                    {formatPercentage(
                      summary.collection_rate || defaultCollectionRate
                    )}
                  </Text>
                </View>
              </View>

              {/* Performance Table */}
              <View style={styles.tableContainer}>
                {performanceData.length > 0 ? (
                  <View style={styles.table}>
                    {/* Table Header (Fixed) */}
                    <View style={styles.tableHeader} fixed>
                      <Text style={[styles.tableHeaderCell, styles.colEmployee]}>
                        Employee
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.colBranch]}>
                        Branch
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.colOrders]}>
                        Orders
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.colTotalSales]}>
                        Total Sales
                      </Text>
                      <Text
                        style={[styles.tableHeaderCell, styles.colCollections]}
                      >
                        Collections
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.colAvgOrder]}>
                        Avg Order Value
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.colRate]}>
                        Collection Rate
                      </Text>
                    </View>

                    {/* Table Rows */}
                    {performanceData.map((employee, index) => (
                      <View
                        key={employee.employee_id || index}
                        style={[
                          styles.tableRow,
                          index % 2 === 1 ? { backgroundColor: "#fcfcfc" } : {},
                        ]}
                        wrap={false} // Prevent rows from splitting across pages
                      >
                        <Text style={[styles.tableDataCell, styles.colEmployee]}>
                          {employee.employee_name || "N/A"}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colBranch]}>
                          {employee.branch_name || "N/A"}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colOrders]}>
                          {employee.orders_count || 0}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colTotalSales]}
                        >
                          {formatCurrency(employee.total_sales)}
                        </Text>
                        <Text
                          style={[styles.tableDataCell, styles.colCollections]}
                        >
                          {formatCurrency(employee.total_collections)}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colAvgOrder]}>
                          {formatCurrency(employee.avg_order_value)}
                        </Text>
                        <Text style={[styles.tableDataCell, styles.colRate]}>
                          {formatPercentage(employee.collection_rate)}
                        </Text>
                      </View>
                    ))}

                    {/* --- Table Grand Total Row --- */}
                    <View style={styles.tableTotalRow} wrap={false}>
                      <Text
                        style={[
                          styles.tableTotalCell,
                          styles.colEmployee,
                          {
                            width: "35%", // Span Employee, Branch, Orders
                            textAlign: "right",
                            paddingRight: 15,
                          },
                        ]}
                      >
                        **GRAND TOTAL:**
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colTotalSales]}
                      >
                        {formatCurrency(
                          summary.total_sales || defaultTotalSales
                        )}
                      </Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colCollections]}
                      >
                        {formatCurrency(
                          summary.total_collections || defaultTotalCollections
                        )}
                      </Text>
                      <Text
                        style={[
                          styles.tableTotalCell,
                          styles.colAvgOrder,
                          { borderLeftWidth: 0 },
                        ]}
                      ></Text>
                      <Text
                        style={[styles.tableTotalCell, styles.colRate, { borderLeftWidth: 0 }]}
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
                    No employee performance data available to generate the report.
                  </Text>
                )}
              </View>

              {/* Footer (Fixed) */}
              <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} of ${totalPages} | Confidential Performance Report | Al-Hamra Home ${new Date().getFullYear()}`
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

export default EmpPerformancePdf;