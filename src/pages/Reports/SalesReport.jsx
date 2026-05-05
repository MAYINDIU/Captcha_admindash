// src/pages/reports/SalesReport.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Helper component for the table's pagination controls
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
              {/* Heroicon name: solid/chevron-left */}
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

            {/* Simple page display for brevity */}
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-600 text-sm font-medium text-white">
              Page {current_page} of {last_page}
            </span>

            <button
              onClick={() => handlePageChange(current_page + 1)}
              disabled={current_page === last_page || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              {/* Heroicon name: solid/chevron-right */}
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

// --- Main Component ---

const SalesReport = () => {
  const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
  const API_ENDPOINT = "/api/v1/reports/sales/detail";
  const API_TOKEN = localStorage.getItem("authToken");

  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State for current page display

  const navigate = useNavigate();

  // Helper function for currency formatting
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString("en-BD", {
      style: "currency",
      currency: "BDT",
    });
  };

  // Fetch ALL pages data (for full PDF) - This logic remains the same
  const fetchAllSalesData = async () => {
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

      setSalesData(allData); // Optionally keep this for consistency, though it's primarily for PDF
      setSummary(fetchedSummary);
      toast.success("All pages loaded for PDF");
      // Navigate to PDF generation route with all data
      navigate("/sales-report-pdf", {
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

  // Fetch one page for on-screen display - Updated to take a page number
  const fetchSalesData = async (page = 1) => {
    if (!API_TOKEN) {
      toast.error("Authentication token missing");
      setLoading(false);
      return;
    }
    setLoading(true); // Set loading to true for every fetch
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
      setSalesData(response.data.data);
      setSummary(response.data.summary);
      setMeta(response.data.meta);
      setCurrentPage(page); // Update the current page state
    } catch (error) {
      toast.error("Failed to fetch sales data");
      console.error(error);
      setSalesData([]); // Clear data on error
      setSummary(null);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and subsequent page fetches
  useEffect(() => {
    fetchSalesData(currentPage);
  }, [currentPage]); // Re-run effect when currentPage changes

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
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
              💰 Sales Report
            </h1>

            {/* View PDF Button */}
            <div className="mb-8 flex justify-end">
              <button
                onClick={fetchAllSalesData}
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

            {loading && salesData.length === 0 ? (
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
                Loading sales data...
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                {summary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total Sales Value
                      </p>
                      <p className="text-3xl font-extrabold text-indigo-600 mt-1">
                        {formatCurrency(summary.total_value)}
                      </p>
                    </div>
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total Down Payment
                      </p>
                      <p className="text-3xl font-extrabold text-green-600 mt-1">
                        {formatCurrency(summary.total_down_payment)}
                      </p>
                    </div>
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total Orders
                      </p>
                      <p className="text-3xl font-extrabold text-yellow-600 mt-1">
                        {summary.count}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sales Transaction Datatable */}
                <div className="bg-white shadow-2xl rounded-xl border border-gray-200">
                  <header className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-xl text-gray-800">
                      Sales Transactions
                    </h2>
                  </header>
                  <div className="p-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Order No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Branch
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Total Value
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Down Payment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.length > 0 ? (
                          salesData.map((sale) => (
                            <tr
                              key={sale.id}
                              className="hover:bg-gray-50 transition duration-100"
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {sale.order_no}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                {sale.customer.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                {sale.branch.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-indigo-600">
                                {formatCurrency(sale.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                                {formatCurrency(sale.down_payment)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                {new Date(
                                  sale.created_at
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-10 text-center text-lg text-gray-500">
                              No sales transactions found for this page.
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
    </div>
  );
};

export default SalesReport;