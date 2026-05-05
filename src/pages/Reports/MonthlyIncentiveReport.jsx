import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public";
const API_ENDPOINT = "/api/v1/reports/monthly-incentives/detail";

// --- Pagination Component ---
const Pagination = ({ meta, onPageChange, loading }) => {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page } = meta;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= last_page && page !== current_page && !loading) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 sm:px-6 border-t border-gray-200 bg-white">
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
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(current_page - 1)}
              disabled={current_page === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
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
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const MonthlyIncentiveReport = () => {
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  
  // State for Date Range (Defaults to current month start and today)
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset();
    const dateLocal = new Date(date.getTime() - (offset * 60 * 1000));
    return dateLocal.toISOString().split("T")[0];
  };

  const fetchReport = async ({ queryKey }) => {
    const [_key, page, from, to] = queryKey;
    const res = await axios.get(
      `${BASE_URL}${API_ENDPOINT}?from=${from}&to=${to}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return res.data;
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["monthlyIncentiveReport", page, formatDate(startDate), formatDate(endDate)],
    queryFn: fetchReport,
    keepPreviousData: true,
    enabled: !!token,
  });

  const formatCurrency = (value) =>
    parseFloat(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // --- NEW: Generate PDF Button Handler ---
  const handleGeneratePdf = async () => {
    if (!token) {
      toast.error("Authentication token missing");
      return;
    }

    try {
      setLoadingPdf(true);
      let allData = [];
      let currentPage = 1;
      let lastPage = 1;
      let fetchedSummary = null;

      const from = formatDate(startDate);
      const to = formatDate(endDate);

      // Fetch all pages
      do {
        const res = await axios.get(
          `${BASE_URL}${API_ENDPOINT}?from=${from}&to=${to}&page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        allData = [...allData, ...res.data.data];
        fetchedSummary = res.data.summary;

        if (currentPage === 1) {
          lastPage = res.data.meta.last_page;
        }
        currentPage++;
      } while (currentPage <= lastPage);

      toast.success("All data loaded, redirecting to PDF...");
      navigate("/monthly-incentive-pdf", {
        state: { pdfData: allData, summary: fetchedSummary },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch all data for PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-extrabold">
              📊 Monthly Incentive Report
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              {/* Date Pickers */}
              <div className="flex items-center gap-2 bg-white p-1 rounded border border-gray-300">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => { setStartDate(date); setPage(1); }}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-28 text-sm border-none focus:ring-0 cursor-pointer"
                  dateFormat="yyyy-MM-dd"
                />
                <span className="text-gray-400">-</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => { setEndDate(date); setPage(1); }}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="w-28 text-sm border-none focus:ring-0 cursor-pointer"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              {/* Generate PDF Button */}
              <button
                onClick={handleGeneratePdf}
                disabled={loadingPdf}
                className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingPdf ? "Generating PDF..." : "Generate PDF"}
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-10 text-gray-500">
              Loading report...
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-10 text-red-500">
              {error.message}
            </div>
          )}

          {/* Data */}
          {!isLoading && data && (
            <>
              {/* Summary */}
              {data.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card
                    title="Total Incentives"
                    value={formatCurrency(data.summary.total_amount)}
                    color="indigo"
                  />
                  <Card
                    title="Paid"
                    value={formatCurrency(data.summary.paid_amount)}
                    color="green"
                  />
                  <Card
                    title="Draft"
                    value={formatCurrency(data.summary.draft_amount)}
                    color="yellow"
                  />
                  <Card
                    title="Records"
                    value={data.summary.count}
                    color="purple"
                  />
                </div>
              )}

              {/* Table */}
              <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Rate (%)</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Processed</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {data.data.length > 0 ? (
                      data.data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold">
                            {item.employee_name}
                          </td>

                          <td className="px-6 py-4">
                            {new Date(item.period_start).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(item.period_end).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {formatCurrency(item.total_commissionable_sales)}
                          </td>

                          <td className="px-6 py-4 text-center">
                            {item.incentive_rate}%
                          </td>

                          <td className="px-6 py-4 text-right font-bold text-indigo-600">
                            {formatCurrency(item.amount)}
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="px-6 py-4">{item.reviewer_name || "-"}</td>

                          <td className="px-6 py-4">
                            {item.processed_at
                              ? new Date(item.processed_at).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-8 text-gray-500"
                        >
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {/* Table Footer with Grand Totals */}
                  {data?.summary && (
                    <tfoot className="bg-gray-100">
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-700 uppercase">
                          Grand Total
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-indigo-600">
                          {formatCurrency(data.summary.total_amount)}
                        </td>
                        <td colSpan="3" className="px-6 py-4"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
                
                {/* Pagination Controls */}
                <Pagination 
                  meta={data.meta} 
                  onPageChange={setPage} 
                  loading={isFetching} 
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

/* ---------- Reusable Components ---------- */
const Card = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <p className="text-sm text-gray-500 uppercase">{title}</p>
    <p className={`text-3xl font-extrabold text-${color}-600 mt-2`}>{value}</p>
  </div>
);

const TableHead = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-bold uppercase">{children}</th>
);

const StatusBadge = ({ status }) => {
  const styles =
    status === "paid"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default MonthlyIncentiveReport;