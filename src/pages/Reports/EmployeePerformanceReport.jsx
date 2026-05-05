import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// --- Helper Component: Pagination (Remains the same) ---

/**
 * Renders the table's pagination controls.
 */
const Pagination = ({ meta, onPageChange, loading }) => {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page } = meta;

  const handlePageChange = (page) => {
    // Only proceed if the page is valid, different from current, and not loading
    if (page >= 1 && page <= last_page && page !== current_page && !loading) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 sm:px-6">
      {/* Mobile Pagination (Previous/Next) */}
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

      {/* Desktop Pagination (Details + Controls) */}
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
            {/* Previous Button */}
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

            {/* Simple page display for brevity */}
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-600 text-sm font-medium text-white">
              Page {current_page} of {last_page}
            </span>

            {/* Next Button */}
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

// --- Main Component: EmployeePerformanceReport ---

const EmployeePerformanceReport = () => {
  const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
  // ** UPDATED API ENDPOINT **
  const API_ENDPOINT = "/api/v1/reports/employee-performance";
  const API_TOKEN = localStorage.getItem("authToken");

  // ** UPDATED STATE NAMES **
  const [performanceData, setPerformanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // Helper function for currency formatting: Provides 4,000,000 format
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Helper function for percentage formatting
  const formatPercentage = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0%';
    return `${num.toFixed(2)}%`;
  };

  /**
   * Fetches ALL pages data from the API sequentially for full report generation.
   */
  const fetchAllPerformanceData = async () => {
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

      // Loop through all pages
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
        
        // Only get last_page from the first request's meta data
        if (page === 1) {
            lastPage = response.data.meta.last_page;
        }
        page++;
      } while (page <= lastPage);

      setPerformanceData(allData); // State update
      setSummary(fetchedSummary); // State update
      toast.success("Full performance report loaded for PDF");
      
      // Navigate to a dedicated PDF view page, passing the collected data
      // ** Using the destination route from your request: /performance-report-pdf **
      navigate("/employee-performance-report-pdf", {
        state: {
          pdfData: allData,
          summary: fetchedSummary,
        },
      });
    } catch (error) {
      toast.error("Failed to fetch full employee performance report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches a single page of performance data for on-screen display.
   */
  const fetchPerformanceData = async (page = 1) => {
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
      // ** UPDATE STATE BASED ON NEW DATA STRUCTURE **
      setPerformanceData(response.data.data);
      setSummary(response.data.summary);
      setMeta(response.data.meta);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to fetch employee performance data");
      console.error(error);
      setPerformanceData([]);
      setSummary(null);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and subsequent page fetches
  useEffect(() => {
    fetchPerformanceData(currentPage);
  }, [currentPage]);

  // Handler for pagination component
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (Assuming it's a separate component) */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header (Assuming it's a separate component) */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <h1 className="text-3xl font-extrabold text-dark dark:text-white mb-6">
              📊 Employee Performance Report
            </h1>

            {/* View PDF Button (Fetches all data, then navigates) */}
            <div className="mb-8 flex justify-end">
              <button
                onClick={fetchAllPerformanceData}
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
                {loading && performanceData.length === 0 ? "Loading Full Report..." : "Generate Full PDF Report"}
              </button>
            </div>

            {/* Loader */}
            {loading && performanceData.length === 0 ? (
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
                Loading employee performance data...
              </div>
            ) : (
              <>
                {/* Summary Cards: Displaying Total Sales, Collections, etc. (using API summary) */}
                {summary && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Sales */}
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        **Total Sales**
                      </p>
                      <p className="text-3xl font-extrabold text-indigo-600 mt-1">
                        **{formatCurrency(summary.total_sales || '0')}**
                      </p>
                    </div>

                    {/* Total Down Payment */}
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total **Down Payment**
                      </p>
                      <p className="text-3xl font-extrabold text-green-600 mt-1">
                        {formatCurrency(summary.total_down_payment || '0')}
                      </p>
                    </div>

                    {/* Total Collections */}
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total **Collections**
                      </p>
                      <p className="text-3xl font-extrabold text-red-600 mt-1">
                        {formatCurrency(summary.total_collections || '0')}
                      </p>
                    </div>

                    {/* Average Collection Rate */}
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-150">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Collection Rate
                      </p>
                      <p className="text-3xl font-extrabold text-yellow-600 mt-1">
                        {formatPercentage(summary.collection_rate || 0)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Performance Datatable */}
                <div className="bg-white shadow-2xl rounded-xl border border-gray-200">
                  <header className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-xl text-gray-800">
                      Individual Employee Performance (Page {currentPage})
                    </h2>
                  </header>
                  <div className="p-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Branch / Rank
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Total Sales (BDT)
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Down Payment (BDT)
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Collections (BDT)
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Collection Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {performanceData.length > 0 ? (
                          performanceData.map((employee) => (
                            <tr
                              key={employee.employee_id}
                              className="hover:bg-gray-50 transition duration-100"
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                **{employee.employee_name}** <span className="text-sm text-gray-500">({employee.employee_code})</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                {employee.branch_name}
                                {employee.rank && <span className="text-xs ml-2 px-2 inline-flex text-white bg-indigo-500 rounded-full">{employee.rank}</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-700">
                                {employee.orders_count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-indigo-600">
                                {formatCurrency(employee.total_sales)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">
                                {formatCurrency(employee.total_down_payment)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-red-600">
                                {formatCurrency(employee.total_collections)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-yellow-600">
                                {formatPercentage(employee.collection_rate)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-10 text-center text-lg text-gray-500">
                              No employee performance data found for the current filter/page.
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

export default EmployeePerformanceReport;