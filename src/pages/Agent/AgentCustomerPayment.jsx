import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
    AiOutlineSearch, 
    AiOutlinePhone, 
    AiOutlineUser, 
    AiOutlineInfoCircle, 
    AiOutlineIdcard, 
    AiOutlineCreditCard,
    AiOutlineMail,
    AiOutlineEnvironment,
    AiOutlineTag,
    AiOutlineCalendar,
    AiOutlineDollar
} from "react-icons/ai";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const AgentCustomerPayment = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const BASE_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1";
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));
    const agentId = user?.agent_id;

    // Fetch Sales Orders for the logged-in agent
    const { data: salesOrders = [], isLoading } = useQuery({
        queryKey: ["agent-sales-orders-payment", agentId],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/sales-orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch sales orders");
            const data = await res.json();
            // Filter only sales belonging to current agent
            return (data.data || []).filter(order => Number(order.agent_id) === Number(agentId));
        },
        enabled: !!token && !!agentId,
    });

    const handlePaymentClick = (row) => {
        // Navigate to installment payment route with order data
        navigate(`/agent-payment-installment`, { 
            state: { salesOrderId: row } 
        });
    };

    // Filter results only when the search term is a "final match" (exactly 11 digits)
    // This avoids showing customer cards prematurely when just "0" is typed.
    const filteredOrders = (searchTerm.length === 11) 
        ? salesOrders.filter(o => 
            o.customer?.contact_number && String(o.customer.contact_number) === searchTerm
          )
        : [];

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50"> 
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow p-6">
                    <ToastContainer position="top-right" autoClose={3000} />
                    
                    <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Search</h2>
                        <div className="max-w-md relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <AiOutlinePhone className="text-blue-600" /> Search Customer by Mobile Number
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter mobile number (e.g. 017...)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                />
                                <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders.length > 0 ? (
                                <div className={`grid grid-cols-1 ${filteredOrders.length === 1 ? 'max-w-lg mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                                    {filteredOrders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <AiOutlineCreditCard className="text-2xl" />
                                                    <span className="font-mono font-bold tracking-tight">ID: #{order.id}</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                    order.status === 'active' ? 'bg-green-400 text-white' : 'bg-gray-400 text-white'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="p-6 grow space-y-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-blue-50 rounded-lg"><AiOutlineUser className="text-blue-600 text-xl" /></div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Customer Name</p>
                                                        <p className="text-gray-800 font-bold text-lg">{order.customer?.name || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-indigo-50 rounded-lg"><AiOutlineMail className="text-indigo-600 text-xl" /></div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email Address</p>
                                                        <p className="text-gray-700 font-semibold text-sm truncate">{order.customer?.email || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <AiOutlinePhone className="mt-1 text-gray-400" />
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Contact</p>
                                                            <p className="text-gray-700 text-sm font-semibold">{order.customer?.contact_number || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <AiOutlineIdcard className="mt-1 text-gray-400" />
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Profession</p>
                                                            <p className="text-gray-700 text-sm font-semibold truncate">{order.customer?.profession || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <AiOutlineEnvironment className="mt-1 text-gray-400" />
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Branch</p>
                                                            <p className="text-gray-700 text-sm font-semibold">{order.branch?.name || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <AiOutlineTag className="mt-1 text-gray-400" />
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Sales Type</p>
                                                            <p className="text-gray-700 text-sm font-semibold capitalize">{order.sales_type || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <div className="flex flex-col">
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Down Payment</p>
                                                        <p className="text-blue-600 font-bold text-sm">
                                                            {Number(order.down_payment).toLocaleString()} <span className="text-[10px]">BDT</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Tenure</p>
                                                        <p className="text-gray-700 font-bold text-sm">
                                                            {order.installment_tenure_months || 0} <span className="text-[10px]">Months</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Outstanding Total</p>
                                                            <p className="text-2xl font-black text-gray-900 font-mono flex items-center gap-1">
                                                                <span className="text-green-600 text-sm font-bold">৳</span>
                                                                {Number(order.total).toLocaleString()} 
                                                                <span className="text-xs text-gray-400 font-normal">BDT</span>
                                                            </p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handlePaymentClick(order)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-90 group"
                                                            title="Process Payment"
                                                        >
                                                            <AiOutlineCreditCard className="text-xl group-hover:rotate-12 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (searchTerm.length === 11) ? (
                                <div className="bg-white rounded-2xl p-16 shadow-sm border border-red-50 flex flex-col items-center text-center animate-pulse">
                                    <div className="bg-red-50 p-5 rounded-full mb-4">
                                        <AiOutlineInfoCircle className="text-5xl text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">No Information Found</h3>
                                    <p className="text-gray-500 max-w-sm mt-2">
                                        We couldn't find any active sales records for "<span className="text-red-600 font-bold">{searchTerm}</span>". 
                                        Please verify the number and try again.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-16 shadow-sm border border-dashed border-gray-300 flex flex-col items-center text-center">
                                    <div className="bg-blue-50 p-5 rounded-full mb-4">
                                        <AiOutlinePhone className="text-5xl text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {searchTerm.length > 0 ? "Searching..." : "Payment Gateway Ready"}
                                    </h3>
                                    <p className="text-gray-500 max-w-sm mt-2">
                                        {searchTerm.length > 0 
                                            ? `Please enter the full 11-digit mobile number. (Entered: ${searchTerm.length}/11)` 
                                            : "Enter the customer's mobile number above to retrieve their sales details and process outstanding payments."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AgentCustomerPayment;