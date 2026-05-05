import React, { useState, useMemo } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineReload } from "react-icons/ai";
import { FaEye, FaDollarSign, FaUser, FaInfoCircle, FaClipboardList } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useQuery, useQueryClient } from "@tanstack/react-query";

import 'react-loading-skeleton/dist/skeleton.css';
// --- API Configuration ---
const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public"; 

// --- Helper: Status Badge Styles ---
const statusBadge = (status) => {
  const base = "font-medium px-3 py-1 rounded-full text-xs shadow-sm ";
  switch (status?.toLowerCase()) {
    case "paid": 
    case "accrued":
    case "completed":
      return base + "bg-green-100 text-green-800";
    case "active":
      return base + "bg-blue-100 text-blue-800";
    case "pending":
      return base + "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return base + "bg-red-100 text-red-800";
    default:
      return base + "bg-gray-100 text-gray-800";
  }
};

// --- Helper: Format String ---
const formatString = (str) => {
  if (!str) return "N/A";
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// --- Skeleton Loader for Table ---
const TableSkeleton = () => (
  <div className="p-4 w-full bg-white rounded-xl">
    <div className="flex space-x-4 mb-6">
      <Skeleton width={100} height={40} />
      <Skeleton width={200} height={40} />
    </div>
    <Skeleton count={10} height={45} className="mb-2" />
  </div>
);

// --- Sub-Component: Order Modal ---
const OrderModal = ({ data, isOpen, onClose }) => {
  if (!isOpen || !data) return null;

  const { sales_order, meta, payment, amount, status, created_at } = data;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-[999] transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-4 flex justify-between items-center text-white sticky top-0 z-10">
          <h3 className="text-xl font-bold flex items-center">
            <FaEye className="mr-2" /> 
            Details for {sales_order?.order_no || 'N/A'}
          </h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Commission Info */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
              <FaDollarSign className="mr-2 text-green-600"/> Commission Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
               <div>
                 <p className="text-gray-500">Amount</p>
                 <p className="font-bold text-lg text-green-600">{parseFloat(amount).toLocaleString()} ৳</p>
               </div>
               <div>
                 <p className="text-gray-500">Status</p>
                 <span className={statusBadge(status)}>{formatString(status)}</span>
               </div>
               <div>
                 <p className="text-gray-500">Date</p>
                 <p className="font-medium">{new Date(created_at).toLocaleDateString()}</p>
               </div>
               <div>
                 <p className="text-gray-500">Category</p>
                 <p className="font-medium text-cyan-700">{formatString(meta?.category)}</p>
               </div>
               <div>
                 <p className="text-gray-500">Rank</p>
                 <p className="font-medium">{meta?.rank || 'N/A'}</p>
               </div>
               <div>
                 <p className="text-gray-500">Percentage</p>
                 <p className="font-medium">{meta?.percentage ? `${meta.percentage}%` : 'N/A'}</p>
               </div>
            </div>
          </div>

          {/* Payment Source Info */}
          {payment && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center border-b border-blue-200 pb-2">
                <FaClipboardList className="mr-2"/> Source Payment
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-500">Amount Paid</p>
                  <p className="font-bold">{parseFloat(payment.amount).toLocaleString()} ৳</p>
                </div>
                <div>
                  <p className="text-blue-500">Type</p>
                  <p className="font-medium">{formatString(payment.type)}</p>
                </div>
                <div>
                  <p className="text-blue-500">Method</p>
                  <p className="font-medium">{formatString(payment.method)}</p>
                </div>
                <div>
                  <p className="text-blue-500">Paid At</p>
                  <p className="font-medium">{new Date(payment.paid_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
               <h4 className="font-bold text-gray-700 mb-3 flex items-center border-b pb-2">
                 <FaInfoCircle className="mr-2"/> Order Info
               </h4>
               <div className="space-y-2 text-sm">
                 <p><span className="text-gray-500">Order No:</span> <span className="font-medium">{sales_order?.order_no}</span></p>
                 <p><span className="text-gray-500">Total Value:</span> <span className="font-medium">{parseFloat(sales_order?.total || 0).toLocaleString()} ৳</span></p>
                 <p><span className="text-gray-500">Branch:</span> <span className="font-medium">{sales_order?.branch?.name || 'N/A'}</span></p>
                 <p><span className="text-gray-500">Sales Type:</span> <span className="font-medium">{formatString(sales_order?.sales_type)}</span></p>
               </div>
            </div>

            {/* Customer */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
               <h4 className="font-bold text-yellow-800 mb-3 flex items-center border-b border-yellow-200 pb-2">
                 <FaUser className="mr-2"/> Customer Info
               </h4>
               <div className="space-y-2 text-sm">
                 <p><span className="text-yellow-600">Name:</span> <span className="font-medium">{sales_order?.customer?.name || 'N/A'}</span></p>
                 <p><span className="text-yellow-600">Contact:</span> <span className="font-medium">{sales_order?.customer?.contact_number || 'N/A'}</span></p>
                 <p><span className="text-yellow-600">Email:</span> <span className="font-medium">{sales_order?.customer?.email || 'N/A'}</span></p>
               </div>
            </div>
          </div>

        </div>
        <div className="px-6 py-4 bg-gray-50 text-right border-t">
          <button onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition shadow">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const EmployeeCommissionlist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  
  const token = localStorage.getItem("authToken");
  const queryClient = useQueryClient();

  // 1. Fetch Commissions using React Query
  const { 
    data: commissions = [], 
    isLoading, 
    isFetching, 
    refetch 
  } = useQuery({
    queryKey: ['commissions'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/employees/dashboard/commissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const result = await res.json();
      return result.data || [];
    },
    enabled: !!token,
    onError: () => toast.error("Failed to load commissions"),
  });

  // 2. Derived State: Total Calculation
  const totalCommission = useMemo(() => commissions.reduce((sum, item) => 
    sum + parseFloat(item.amount || 0), 0
  ).toFixed(2), [commissions]);

  // 3. Handle View Details Click
  const handleViewDetails = (row) => {
    setSelectedCommission(row);
    setOrderModalOpen(true);
  };

  const columns = [
    { name: "SL", selector: (row, index) => index + 1, width: "60px" },
    {
      name: "Category",
      selector: (row) => row.meta?.category,
      cell: (row) => <span className="font-medium text-gray-600 text-xs uppercase">{formatString(row.meta?.category)}</span>,
      sortable: true,
      width: "140px"
    },
    {
      name: "Order No",
      selector: (row) => row.sales_order?.order_no || `ID: ${row.sales_order_id}`,
      cell: (row) => <span className="font-bold text-gray-700">{row.sales_order?.order_no || row.sales_order_id}</span>,
      sortable: true,
      width: "120px"
    },
    {
      name: "Amount (৳)",
      selector: (row) => parseFloat(row.amount),
      cell: (row) => <span className="font-semibold">{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
      sortable: true,
      right: true,
    },
    {
      name: "Type",
      cell: (row) => {
        const type = row.meta?.payment_type || row.sales_order?.sales_type || 'N/A';
        let badgeClass = "bg-gray-100 text-gray-600";

        if (type.includes('service')) badgeClass = "bg-purple-100 text-purple-700";
        else if (type.includes('down_payment')) badgeClass = "bg-yellow-100 text-yellow-800";
        else if (type.includes('installment')) badgeClass = "bg-cyan-100 text-cyan-800";

        return <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${badgeClass}`}>{formatString(type)}</span>;
      },
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => <span className={statusBadge(row.status)}>{formatString(row.status)}</span>,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="p-2 text-cyan-600 hover:bg-cyan-600 hover:text-white rounded-full transition shadow-md"
          title="View Details"
        >
          <FaEye size={16} />
        </button>
      ),
      center: true,
    },
  ];

  const customStyles = {
    headCells: { style: { backgroundColor: "#0097A7", color: "#fff", fontWeight: "700", fontSize: "13px" } },
    rows: { style: { minHeight: "52px" } },
  };

  const conditionalRowStyles = [
    {
      when: row => {
        const type = row.meta?.payment_type || row.sales_order?.sales_type || '';
        return type.includes('service');
      },
      style: {
        backgroundColor: '#F3E8FF', // purple-100
        color: '#3B0764', // purple-950
        '&:hover': {
          cursor: 'pointer',
        },
      },
    },
    {
      when: row => {
        const type = row.meta?.payment_type || row.sales_order?.sales_type || '';
        return type.includes('down_payment');
      },
      style: {
        backgroundColor: '#FEF9C3', // yellow-100
        color: '#422006', // yellow-950
        '&:hover': {
          cursor: 'pointer',
        },
      },
    },
    {
      when: row => {
        const type = row.meta?.payment_type || row.sales_order?.sales_type || '';
        return type.includes('installment');
      },
      style: {
        backgroundColor: '#CFFAFE', // cyan-100
        color: '#083344', // cyan-950
        '&:hover': {
          cursor: 'pointer',
        },
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="grow p-6 sm:p-8">
          <ToastContainer position="top-right" autoClose={2000} />

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border-l-8 border-cyan-500 flex items-center">
              <div className="bg-cyan-100 text-cyan-600 p-4 rounded-xl mr-5">
                <FaClipboardList size={30} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">Commission Ledger</h2>
                <p className="text-gray-500">Track your earnings and order history</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-8 border-green-500 flex flex-col justify-center items-center">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Accrued</span>
              <div className="text-3xl font-black text-green-600 my-1">
                {isLoading ? <Skeleton width={120} /> : `${totalCommission} ৳`}
              </div>
              <button
                disabled={isFetching}
                onClick={() => refetch()}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cyan-600 transition"
              >
                <AiOutlineReload className={isFetching ? "animate-spin" : ""} /> 
                {isFetching ? "Syncing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="shadow-xl rounded-xl overflow-hidden bg-white border border-gray-100">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <DataTable 
                columns={columns} 
                data={commissions} 
                pagination 
                highlightOnHover 
                responsive 
                customStyles={customStyles}
                conditionalRowStyles={conditionalRowStyles}
                noDataComponent={<div className="p-10 text-gray-400">No records found.</div>}
              />
            )}
          </div>

          {/* Legend Section */}
          <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex gap-6 text-sm">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-gray-600">Service</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-gray-600">Down Payment</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <span className="text-gray-600">Installment</span>
             </div>
          </div>
        </main>
      </div>

      <OrderModal 
        data={selectedCommission} 
        isOpen={orderModalOpen} 
        onClose={() => setOrderModalOpen(false)} 
      />
    </div>
  );
};

export default EmployeeCommissionlist;
