import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast } from "react-toastify";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const Pagination = ({ meta, onPageChange, loading }) => {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const { current_page, last_page, from, to, total } = meta;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= last_page && page !== current_page && !loading) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-sm text-slate-500">
                Showing <span className="font-bold">{from}</span> to <span className="font-bold">{to}</span> of <span className="font-bold">{total}</span> results
            </p>
            <nav className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(current_page - 1)}
                    disabled={current_page === 1 || loading}
                    className="px-3 py-1 text-sm font-medium rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    &laquo; Previous
                </button>
                <span className="text-sm text-slate-500">Page {current_page} of {last_page}</span>
                <button
                    onClick={() => handlePageChange(current_page + 1)}
                    disabled={current_page === last_page || loading}
                    className="px-3 py-1 text-sm font-medium rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next &raquo;
                </button>
            </nav>
        </div>
    );
};

const CommissionProcessHistorys = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null); // For detail modal

    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch paginated data for UI
    const { data: paginatedData, isLoading, isFetching } = useQuery({
        queryKey: ["commHistory", { from: format(startDate, 'yyyy-MM-dd'), to: format(endDate, 'yyyy-MM-dd'), page: currentPage }],
        queryFn: async ({ queryKey }) => {
            const [_key, { from, to, page }] = queryKey;
            const token = localStorage.getItem("authToken");
            const { data } = await axios.get(
                `https://alhamarahomesbd.com/alhamra-backend/public/api/v1/commission-calculations/process-history`,
                {
                    params: { from, to, page },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return data;
        },
        keepPreviousData: true,
    });
    
    const historyData = paginatedData?.data ?? [];
    const meta = paginatedData?.meta;

    const handleDownload = async () => {
        toast.info("Preparing PDF, please wait...");
        try {
            const token = localStorage.getItem("authToken");
            const from = format(startDate, 'yyyy-MM-dd');
            const to = format(endDate, 'yyyy-MM-dd');

            let allData = [];
            let page = 1;
            let lastPage = 1;

            do {
                const { data: responseData } = await axios.get(
                    `https://alhamarahomesbd.com/alhamra-backend/public/api/v1/commission-calculations/process-history`,
                    {
                        params: { from, to, page },
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (responseData.data && responseData.data.length > 0) {
                    allData = allData.concat(responseData.data);
                }
                lastPage = responseData.meta ? responseData.meta.last_page : 1;
                page++;
            } while (page <= lastPage);

            if (allData.length === 0) {
                toast.warning("No data available to download for the selected period.");
                return;
            }

            const totalAmount = allData.reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0);
            const totalCount = allData.length;

            const doc = new jsPDF();
            doc.setFillColor(30, 41, 59);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("ALHAMRA HOMES", 14, 20);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Commission Process History Report", 14, 30);
            doc.text(`Period: ${format(startDate, 'PP')} - ${format(endDate, 'PP')}`, 150, 30);
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12);
            doc.text(`Total Amount: ${totalAmount.toLocaleString()} BDT`, 14, 50);
            doc.text(`Total Records: ${totalCount}`, 14, 56);

            const tableColumn = ["ID", "Reference", "Type", "Units", "Processor", "Amount"];
            const tableRows = allData.map(item => [
                item.id,
                item.month || format(new Date(item.cutoff_date), 'yyyy-MM-dd'),
                item.period_type.toUpperCase(),
                item.processed_units,
                item.processor?.name || 'N/A',
                `${Number(item.total_amount).toLocaleString()} BDT`
            ]);

            doc.autoTable({
                startY: 65,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
                styles: { fontSize: 9 },
                columnStyles: { 5: { halign: 'right', fontStyle: 'bold' } }
            });

            doc.save(`Commission_History_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
            toast.success("Report downloaded successfully!");
        } catch (error) {
            console.error("PDF Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F1F5F9]">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 sm:p-8 w-full max-w-9xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Commission Logs</h1>
                            <p className="text-slate-500 font-medium italic">Data updates automatically on date change</p>
                        </div>
                        <button 
                            onClick={handleDownload}
                            disabled={isFetching || historyData.length === 0}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Export PDF Report
                        </button>
                    </div>
                    
                    {/* Filters */}
                    <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        <p className="font-bold text-slate-600">Filter by Date:</p>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => { setStartDate(date); setCurrentPage(1); }}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            className="w-32 border-slate-200 rounded-lg text-sm"
                        />
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => { setEndDate(date); setCurrentPage(1); }}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            className="w-32 border-slate-200 rounded-lg text-sm"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Reference</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Processor</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Units</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase text-right">Amount</th>
                                        <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase">Details</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-slate-50 transition-all duration-300 ${isFetching ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <p className="text-slate-400 font-medium">Loading history...</p>
                                            </td>
                                        </tr>
                                    ) :
                                    
                                    historyData.length > 0 ? (
                                        historyData.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="font-black text-slate-700">{item.month || format(new Date(item.cutoff_date), 'dd MMM yyyy')}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">ID: #{item.id} • {item.period_type}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-sm font-bold text-slate-700">{item.processor?.name}</div>
                                                    <div className="text-xs text-slate-400">{item.processor?.role}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{item.processed_units} Units</span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="text-lg font-black text-slate-900 leading-none">{Number(item.total_amount).toLocaleString()}</div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">BDT Total</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button
                                                        onClick={() => setSelectedDetail(item)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <p className="text-slate-400 font-medium">No records found for the selected period.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            meta={meta}
                            onPageChange={setCurrentPage}
                            loading={isFetching}
                        />
                    </div>

                    {/* Detail Modal */}
                    {selectedDetail && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-xl w-11/12 md:w-2/3 lg:w-1/2">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Commission Detail (ID: {selectedDetail.id})</h2>
                                    <button onClick={() => setSelectedDetail(null)} className="text-red-600 font-bold text-xl">&times;</button>
                                </div>
                                <div className="space-y-2">
                                    <p><strong>Processor:</strong> {selectedDetail.processor?.name} ({selectedDetail.processor?.role})</p>
                                    <p><strong>Period Type:</strong> {selectedDetail.period_type}</p>
                                    <p><strong>Date/Month:</strong> {selectedDetail.month || format(new Date(selectedDetail.cutoff_date), 'dd MMM yyyy')}</p>
                                    <p><strong>Processed Units:</strong> {selectedDetail.processed_units}</p>
                                    <p><strong>Processed Items:</strong> {selectedDetail.processed_items}</p>
                                    <p><strong>Total Amount:</strong> {Number(selectedDetail.total_amount).toLocaleString()} BDT</p>
                                    <p><strong>Processed At:</strong> {format(new Date(selectedDetail.processed_at), 'PPpp')}</p>
                                    {selectedDetail.meta && <p><strong>Meta:</strong> {JSON.stringify(selectedDetail.meta)}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default CommissionProcessHistorys;