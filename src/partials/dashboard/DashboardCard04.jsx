import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    FaUserTie, FaUsers, FaUserCheck, FaUserTimes, FaUserClock, FaUserSlash,
    FaWallet, FaCheckCircle, FaHandHoldingUsd, FaFileInvoiceDollar, FaClock,
    FaThumbsUp, FaCoins, FaBan, FaExchangeAlt, FaUserPlus, FaCommentDots, FaPowerOff
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://fastwork24.com/captcha_backend/public/api";

// --- Role-Specific Color Mapping for Header and Highlights ---
const roleColors = {
    admin: { from: "from-red-600", to: "to-pink-500", border: "border-red-500" },
    branch_admin: { from: "from-green-600", to: "to-emerald-500", border: "border-green-500" },
    employee: { from: "from-indigo-600", to: "to-blue-500", border: "border-indigo-500" },
    agent: { from: "from-purple-600", to: "to-fuchsia-500", border: "border-purple-500" },
    customer: { from: "from-gray-600", to: "to-slate-500", border: "border-gray-500" },
    default: { from: "from-gray-600", to: "to-slate-500", border: "border-gray-500" },
};

// --- Fetcher Function for Dashboard Data ---
const fetchDashboardData = async ({ queryKey }) => {
    const [_, token] = queryKey;
    const response = await fetch(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
        throw new Error(json.message || "Failed to fetch data");
    }
    return json.data;
};

// --- Stat Card Component (Used for Admin/Personal Stats View) ---
const StatCard = ({ title, value, icon, color }) => (
    <div className="flex items-center p-4 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-transparent hover:border-indigo-500">
        <div className={`p-3 w-max rounded-full mr-4 bg-gradient-to-br ${color} shadow-md flex-shrink-0`}>
            {React.cloneElement(icon, { className: "text-white text-xl" })}
        </div>
        <div className="flex flex-col truncate">
            <span className="text-gray-500 text-xs font-medium uppercase truncate">{title}</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</span>
        </div>
    </div>
);

// --- Profile Header Card (Role-specific color applied here) ---
const ProfileHeaderCard = ({ title, name, icon: Icon, role }) => {
    const colors = roleColors[role] || roleColors.default;
    return (
        <div className={`col-span-full p-6 bg-gradient-to-r ${colors.from} ${colors.to} text-white rounded-xl shadow-2xl mb-6 flex items-center`}>
            <div className="flex items-center">
                <Icon className="text-4xl mr-4 opacity-80" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome Back, {name}!</h1>
                    <p className="text-sm font-medium opacity-90">{title}</p>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
function DashboardCard04() {
    const token = localStorage.getItem("authToken");
    const userJson = localStorage.getItem("user");

    // Safely parse the user data
    const userData = (userJson && userJson !== "undefined" && userJson !== "null")
        ? JSON.parse(userJson)
        : { role: null };

    const role = userData.role;

    const isAdmin = role === "admin";

    // Fetch dashboard data only for admin or employee/agent/branch
    const { data: dashboardData, isLoading: dashLoading, error: dashError } = useQuery({
        queryKey: ["dashboardData", token, role],
        queryFn: fetchDashboardData,
        enabled: !!token && role === "admin",
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (dashError) {
            console.error("Dashboard Fetch Error:", dashError);
            toast.error(`Failed to load dashboard data. ${dashError.message || 'Check console for details.'}`);
        }
    }, [dashError]);

    const formatCurrency = (value) => value !== undefined ? `BDT ${Number(value).toLocaleString('en-US')}` : 'BDT 0';
    const formatNumber = (value) => value ? Number(value).toLocaleString('en-US') : '0';

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen">
            <ProfileHeaderCard
                title="Captcha Earning System - Admin Panel"
                name={userData?.name || "Admin"}
                icon={FaUserTie}
                role={role}
            />

            {dashLoading ? (
                <p className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg">Loading dashboard data...</p>
            ) : isAdmin && dashboardData ? (
                <>
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">User Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <StatCard title="Total Users" value={formatNumber(dashboardData.total_users)} icon={<FaUsers />} color="from-blue-500 to-indigo-600" />
                            <StatCard title="Active Users" value={formatNumber(dashboardData.active_users)} icon={<FaUserCheck />} color="from-green-500 to-teal-600" />
                            <StatCard title="Inactive Users" value={formatNumber(dashboardData.inactive_users)} icon={<FaUserTimes />} color="from-yellow-500 to-orange-600" />
                            <StatCard title="Pending Users" value={formatNumber(dashboardData.pending_users)} icon={<FaUserClock />} color="from-purple-500 to-pink-600" />
                            <StatCard title="Blocked Users" value={formatNumber(dashboardData.blocked_users)} icon={<FaUserSlash />} color="from-red-600 to-rose-700" />
                            <StatCard title="Today's New Users" value={formatNumber(dashboardData.todays_new_users)} icon={<FaUserPlus />} color="from-sky-500 to-cyan-600" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Financials & Activity</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard title="Total Main Balance" value={formatCurrency(dashboardData.total_main_balance)} icon={<FaWallet />} color="from-emerald-600 to-green-500" />
                            <StatCard title="Today's Captchas" value={formatNumber(dashboardData.todays_captcha_completed)} icon={<FaCheckCircle />} color="from-cyan-500 to-blue-500" />
                            <StatCard title="Today's Paid Earning" value={formatCurrency(dashboardData.todays_earning_paid_to_users)} icon={<FaHandHoldingUsd />} color="from-amber-500 to-orange-500" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Withdrawal Statistics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Requests" value={formatNumber(dashboardData.total_withdraw_requests)} icon={<FaFileInvoiceDollar />} color="from-gray-600 to-slate-500" />
                            <StatCard title="Pending" value={formatNumber(dashboardData.pending_withdraw_requests)} icon={<FaClock />} color="from-indigo-500 to-violet-600" />
                            <StatCard title="Approved" value={formatNumber(dashboardData.approved_withdraw_requests)} icon={<FaThumbsUp />} color="from-teal-500 to-emerald-600" />
                            <StatCard title="Paid" value={formatNumber(dashboardData.paid_withdraw_requests)} icon={<FaCoins />} color="from-green-600 to-green-700" />
                            <StatCard title="Rejected" value={formatNumber(dashboardData.rejected_withdraw_requests)} icon={<FaBan />} color="from-red-500 to-red-700" />
                            <StatCard title="Total Paid Amount" value={formatCurrency(dashboardData.total_paid_amount)} icon={<FaWallet />} color="from-emerald-700 to-green-600" />
                            <StatCard title="Today's Withdraw" value={formatCurrency(dashboardData.todays_withdraw_amount)} icon={<FaHandHoldingUsd />} color="from-orange-600 to-amber-700" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">System Status</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard title="Total Transactions" value={formatNumber(dashboardData.total_transactions)} icon={<FaExchangeAlt />} color="from-indigo-600 to-blue-700" />
                            <StatCard title="Unread Messages" value={formatNumber(dashboardData.unread_chat_messages)} icon={<FaCommentDots />} color="from-pink-500 to-rose-600" />
                            <StatCard 
                                title="Withdraw System" 
                                value={dashboardData.withdraw_system_status ? "ONLINE" : "OFFLINE"} 
                                icon={<FaPowerOff />} 
                                color={dashboardData.withdraw_system_status ? "from-green-500 to-emerald-600" : "from-red-600 to-rose-700"} 
                            />
                        </div>
                    </div>

                    {dashboardData.quick_actions && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Quick Actions</h2>
                            <div className="flex flex-wrap gap-3">
                                {dashboardData.quick_actions.map((action, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                                        {action.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-center text-gray-400 p-12 bg-white rounded-xl shadow-lg">
                    No dashboard data available for your role.
                </p>
            )}
        </div>
    );
}

export default DashboardCard04;