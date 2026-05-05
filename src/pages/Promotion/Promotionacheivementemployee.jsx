import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import DataTable, { createTheme } from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { format } from "date-fns";

// --- Custom Dark Theme ---
createTheme(
  "solarized-dark-blue",
  {
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    background: {
      default: "#1e293b",
    },
    divider: {
      default: "#334155",
    },
  },
  "dark"
);

const Promotionacheivementemployee = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("authToken");

  // ✅ NEW API CALL (Achievements)
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["employeePromotionAchievements"],
    queryFn: async () => {
      const res = await fetch(
        "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employee/promotions/achievements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch achievements");
      return res.json();
    },
    enabled: !!token,
  });

  const achievementData = apiResponse?.data || [];

  // --- Custom Table Styles ---
  const customStyles = {
    headRow: {
      style: {
        fontSize: "11px",
        textTransform: "uppercase",
        fontWeight: "900",
        letterSpacing: "0.05em",
        borderBottom: "2px solid #334155",
      },
    },
    rows: {
      style: {
        minHeight: "65px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#f1f5f9",
        borderBottom: "1px solid #334155",
      },
    },
    pagination: {
      style: {
        color: "#f1f5f9",
        fontSize: "13px",
        minHeight: "56px",
        backgroundColor: "#1e293b",
        borderTop: "1px solid #334155",
      },
    },
  };

  // --- Table Columns ---
  const columns = [
    {
      name: "Session Name",
      selector: (row) => row.session_name,
      sortable: true,
      grow: 2,
    },
    {
      name: "Slot",
      selector: (row) => `Tier ${row.slot}`,
      width: "100px",
      center: true,
    },
    {
      name: "Incentive Type",
      cell: (row) => (
        <span className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-900 text-emerald-100 border border-emerald-700">
          {row.incentive_type}
        </span>
      ),
      width: "150px",
      center: true,
    },
    {
      name: "Award Date",
      selector: (row) =>
        format(new Date(row.award_date), "dd MMM yyyy"),
      sortable: true,
      width: "150px",
      center: true,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-8">
          <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 border-b border-slate-700 bg-[#111827]">
              <h2 className="text-2xl font-black text-slate-100">
                My Promotion Achievements
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                View your earned incentives and rewards.
              </p>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton height={50} baseColor="#334155" highlightColor="#475569" />
                <Skeleton count={4} height={65} baseColor="#334155" highlightColor="#475569" />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={achievementData}
                customStyles={customStyles}
                theme="solarized-dark-blue"
                pagination
                highlightOnHover
                responsive
                noDataComponent={
                  <div className="p-10 text-slate-400 text-center">
                    No achievements found.
                  </div>
                }
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Promotionacheivementemployee;