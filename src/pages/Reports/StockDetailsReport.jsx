// src/pages/reports/StockDetailsReport.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Helper component for the table's pagination controls (Reused)
const Pagination = ({ meta, onPageChange, loading }) => {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page } = meta;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= last_page && page !== current_page && !loading) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1 || loading}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === last_page || loading}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{meta.from}</span> to{" "}
            <span className="font-medium">{meta.to}</span> of{" "}
            <span className="font-medium">{meta.total}</span> results
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(current_page - 1)}
              disabled={current_page === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-600 text-sm font-medium text-white">
              Page {current_page} of {last_page}
            </span>
            <button
              onClick={() => handlePageChange(current_page + 1)}
              disabled={current_page === last_page || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Helper function for currency formatting
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-BD", {
    style: "currency",
    currency: "BDT",
  });
};


// --- UPDATED Modal Component with Enhanced Design ---
const ProductDetailsModal = ({ item, isOpen, onClose, formatCurrency }) => {
  if (!isOpen || !item) return null;

  const attributeEntries = item.attributes
    ? Object.entries(item.attributes)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto "
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-40 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* Modal content container */}
        <div
          className="inline-block w-full max-w-xl p-0 bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all align-middle"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-indigo-600 p-6 flex items-center justify-between">
            <h3
              className="text-2xl font-bold text-white"
              id="modal-title"
            >
              <span role="img" aria-label="package">📦</span> Product Details
            </h3>
            <button
              onClick={onClose}
              className="text-indigo-200 hover:text-white transition"
              title="Close"
            >
              {/* X Close Icon */}
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <h4 className="text-xl font-extrabold text-gray-800 border-b pb-2 mb-4">
              {item.name}
            </h4>
            
            {/* Main Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Row 1: Category & Price */}
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Category</p>
                    <p className="text-base font-semibold text-gray-900">{item.category?.name || "N/A"}</p>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Price (Per Unit)</p>
                    <p className="text-lg font-bold text-indigo-600">{formatCurrency(item.price)}</p>
                </div>

                {/* Row 2: Current Stock & Min Alert */}
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Current Stock</p>
                    <p className={`text-xl font-bold ${
                        parseFloat(item.stock_qty) <= parseFloat(item.min_stock_alert)
                          ? "text-red-600"
                          : "text-green-600"
                      }`}>
                        {item.stock_qty}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Minimum Alert Qty</p>
                    <p className="text-lg font-bold text-yellow-600">{item.min_stock_alert}</p>
                </div>
            </div>

            {/* Attributes Section */}
            {attributeEntries.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-base font-bold text-gray-700 mb-3">Specifications</p>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                  {attributeEntries.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-medium uppercase text-gray-500">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm font-medium text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footer Meta */}
            <p className="text-xs text-gray-400 pt-4 border-t border-dashed">
              Record Created: {new Date(item.created_at).toLocaleString()}
              <span className="ml-4">|</span>
              <span className="ml-4">Stock Managed: **{item.is_stock_managed ? "Yes" : "No"}**</span>
            </p>
          </div>

          {/* Footer/Action */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END UPDATED Modal Component ---


// --- Main Component ---

const StockDetailsReport = () => {
  const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
  const API_ENDPOINT = "/api/v1/reports/stock/detail"; 
  const API_TOKEN = localStorage.getItem("authToken");

  const [reportData, setReportData] = useState([]); 
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);


  const navigate = useNavigate();

  // Modal Handlers
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Fetch ALL pages data (for full PDF)
  const fetchAllReportData = async () => {
    if (!API_TOKEN) {
      toast.error("Authentication token missing");
      return;
    }

    try {
      setLoading(true);
      let allData = [];
      let page = 1;
      let lastPage = 1;
      let fetchedSummary = null;
      do {
        const response = await axios.get(
          `${BASE_URL}${API_ENDPOINT}?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              Accept: "application/json",
            },
          }
        );
        allData = [...allData, ...response.data.data];
        fetchedSummary = response.data.summary;
        lastPage = response.data.meta.last_page;
        page++;
      } while (page <= lastPage);

      setReportData(allData);
      setSummary(fetchedSummary);
      toast.success("All pages loaded for PDF");
      
      // Navigate to PDF view route
      navigate("/stock-report-pdf", { 
        state: {
          pdfData: allData,
          summary: fetchedSummary,
        },
      });
    } catch (error) {
      toast.error("Failed to fetch full report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch one page for on-screen display
  const fetchReportData = async (page = 1) => {
    if (!API_TOKEN) {
      toast.error("Authentication token missing");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}${API_ENDPOINT}?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            Accept: "application/json",
          },
        }
      );
      setReportData(response.data.data);
      setSummary(response.data.summary);
      setMeta(response.data.meta);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to fetch stock data");
      console.error(error);
      setReportData([]);
      setSummary(null);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and subsequent page fetches
  useEffect(() => {
    fetchReportData(currentPage);
  }, [currentPage]); 

  // Handler for pagination component
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <h1 className="text-3xl font-extrabold text-dark dark:text-white mb-6">
              📦 Stock Details Report
            </h1>

            {/* View PDF Button */}
            <div className="mb-8 flex justify-end">
              <button
                onClick={fetchAllReportData}
                className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4V3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V4a1 1 0 00-1-1h-2.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 009.414 1H5zM12 9a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {loading ? "Loading Full Report..." : "Generate Full PDF Report"}
              </button>
            </div>

            {loading && reportData.length === 0 ? (
              <div className="text-center py-10 text-lg text-gray-600 font-medium">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading stock data...
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                {summary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total Stock Value
                      </p>
                      <p className="text-3xl font-extrabold text-indigo-600 mt-1">
                        {formatCurrency(summary.total_value)}
                      </p>
                    </div>
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total Item Quantity
                      </p>
                      <p className="text-3xl font-extrabold text-green-600 mt-1">
                        {summary.total_qty} 
                      </p>
                    </div>
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total Unique Items
                      </p>
                      <p className="text-3xl font-extrabold text-yellow-600 mt-1">
                        {summary.total_items}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stock Details Datatable */}
                <div className="bg-white shadow-2xl rounded-xl border border-gray-200">
                  <header className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-xl text-gray-800">
                      Current Stock Details
                    </h2>
                  </header>
                  <div className="p-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Product Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Attributes
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Price
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Alert Min
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.length > 0 ? (
                          reportData.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50 transition duration-100"
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {item.category.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                {item.attributes
                                  ? Object.entries(item.attributes)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(", ")
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-indigo-600">
                                {formatCurrency(item.price)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                                  parseFloat(item.stock_qty) <= parseFloat(item.min_stock_alert)
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}>
                                {item.stock_qty}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-yellow-600">
                                {item.min_stock_alert}
                              </td>
                              {/* Action Cell - View Details Button */}
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <button
                                  onClick={() => handleViewDetails(item)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="View Details"
                                >
                                  {/* Eye Icon SVG */}
                                  <svg
                                    className="w-5 h-5 inline-block"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-10 text-center text-lg text-gray-500">
                              No stock details found for this page.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Control */}
                  <div className="border-t border-gray-200">
                    <Pagination
                      meta={meta}
                      onPageChange={handlePageChange}
                      loading={loading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* RENDER MODAL */}
      <ProductDetailsModal
        item={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default StockDetailsReport;