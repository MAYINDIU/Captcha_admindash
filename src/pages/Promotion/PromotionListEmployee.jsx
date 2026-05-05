import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import DataTable, { createTheme } from "react-data-table-component"; // Import createTheme
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { format } from "date-fns";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";

// --- Material-UI Imports ---
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

// --- 1. Customizing the DataTable Theme (Dark Blue) ---
// We define a new theme called 'solarized-dark-blue'
createTheme('solarized-dark-blue', {
  text: {
    primary: '#f1f5f9',    // slate-100 (text color)
    secondary: '#94a3b8',  // slate-400 (header text)
  },
  background: {
    default: '#1e293b',   // slate-800 (The main background)
  },
  context: {
    background: '#cb4b16', // (not used here)
    text: '#FFFFFF',
  },
  divider: {
    default: '#334155',    // slate-700 (border color)
  },
  action: {
    button: 'rgba(255,255,255,.54)',
    hover: 'rgba(255,255,255,.08)',
    disabled: 'rgba(255,255,255,.26)',
  },
}, 'dark'); // Set 'dark' as base

const PromotionListEmployee = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const token = localStorage.getItem("authToken");

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["employeePromotionProgress"],
    queryFn: async () => {
      const res = await fetch("https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employee/promotions/progress", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
    enabled: !!token,
  });

  const progressData = apiResponse?.data || [];

  console.log(progressData)

  // --- 2. Customizing Table Styles (Margins, Typography) ---
  const customStyles = {
    headRow: {
      style: {
        fontSize: '11px',
        textTransform: 'uppercase',
        fontWeight: '900',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #334155', // slate-700
      }
    },
    rows: {
      style: {
        minHeight: '65px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#f1f5f9', // slate-100
        borderBottom: '1px solid #334155', // slate-700
      }
    },
    pagination: {
        style: {
            color: '#f1f5f9',
            fontSize: '13px',
            minHeight: '56px',
            backgroundColor: '#1e293b', // slate-800
            borderTop: '1px solid #334155', // slate-700
        },
        pageButtonsStyle: {
            borderRadius: '50%',
            height: '40px',
            width: '40px',
            padding: '8px',
            margin: '1px',
            cursor: 'pointer',
            transition: '0.4s',
            color: '#94a3b8',
            fill: '#94a3b8',
            backgroundColor: 'transparent',
            '&:hover:not(:disabled)': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
            '&:focus': {
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
        },
    },
  };

  const columns = [
    { name: "Session Name", selector: (row) => row.session_name, sortable: true, grow: 2 },
    { name: "Slot", selector: (row) => `Tier ${row.slot}`, width: "90px", center: true },
    { 
      name: "Eligibility", 
      selector: (row) => row.eligibility_type.replace("_", " ").toUpperCase(),
      width: "130px"
    },
    { 
      name: "Progress",
      minWidth: "180px",
      cell: (row) => {
        const percentage = Math.min((row.current_down_payment_count / row.target) * 100, 100);
        return (
          <div className="w-full pr-4">
            <div className="flex justify-between text-[11px] mb-1.5 font-bold">
              <span className="text-slate-100">{row.current_down_payment_count} / {row.target}</span>
              <span className="text-indigo-300">{Math.round(percentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-600 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-indigo-400 transition-all duration-500" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        );
      }
    },
    { name: "Remaining", selector: (row) => row.remaining, width: "100px", center: true },
    { 
      name: "Status", 
      cell: (row) => (
        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
          row.status === 'eligible' 
            ? 'bg-emerald-900 text-emerald-100 border border-emerald-700' 
            : 'bg-amber-950 text-amber-200 border border-amber-800'
        }`}>
          {row.status.replace("_", " ")}
        </span>
      )
    },
    {
      name: "Action",
      width: "80px",
      center: true,
      cell: (row) => (
        <button 
          onClick={() => { setSelectedSession(row); setIsDetailModalOpen(true); }}
          className="p-2 bg-slate-700 hover:bg-indigo-600 rounded-lg text-slate-300 hover:text-white transition"
        >
          <FaEye size={16} />
        </button>
      )
    }
  ];

  // --- 3. Material-UI Modal Styling (Box Sx prop) ---
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 }, // Responsive width
    bgcolor: 'background.paper', // Uses default theme background (white)
    boxShadow: 24, // Material design shadow level
    borderRadius: 4, // p-4 rounded-2xl
    p: 0, // Set padding to 0 and distribute inside
    overflow: 'hidden'
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 md:p-8">
          
          {/* Main Container - We apply the dark blue border/shadow here */}
          <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            
            {/* Darker Header section */}
            <div className="p-6 border-b border-slate-700 bg-[#111827]">
              <h2 className="text-2xl font-black text-slate-100">My Promotion Progress</h2>
              <p className="text-slate-400 text-sm mt-1">Track your performance across active tiers and sessions.</p>
            </div>
            
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton height={50} baseColor="#334155" highlightColor="#475569" />
                <Skeleton count={4} height={65} baseColor="#334155" highlightColor="#475569" />
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={progressData} 
                customStyles={customStyles}
                theme="solarized-dark-blue" // Use the defined theme
                pagination 
                highlightOnHover 
                responsive 
                noDataComponent={<div className="p-10 text-slate-400">No promotion data found.</div>}
              />
            )}
          </div>
        </main>

        {/* --- 4. Professional Material-UI Modal Implementation --- */}
        <Modal
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          aria-labelledby="promotion-detail-modal-title"
          aria-describedby="promotion-detail-modal-description"
          closeAfterTransition
          slotProps={{ backdrop: { timeout: 500 } }} // Smooth backdrop transition
        >
          <Box sx={modalStyle}>
            {/* Modal Header */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bg: '#f8fafc' }}>
              <Typography id="promotion-detail-modal-title" variant="h6" component="h2" sx={{ fontWeight: 800 }}>
                Promotion Details
              </Typography>
              <IconButton onClick={() => setIsDetailModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />

            {/* Modal Content */}
            {selectedSession && (
              <Box sx={{ p: 4, spaceY: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  {selectedSession.session_name}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'slate.50', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                        Eligibility
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {selectedSession.eligibility_type.replace("_", " ")}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'slate.50', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                        Type & Slot
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedSession.session_type} (Tier {selectedSession.slot})
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  {/* Performance Summary */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3730a3', mb: 1, textTransform: 'uppercase' }}>
                            Current Performance
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#312e81' }}>
                            {selectedSession.current_down_payment_count} / {selectedSession.target}
                        </Typography>
                        <Typography variant="body2" color="#4338ca">
                            Down payments completed. Need {selectedSession.remaining} more.
                        </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                      Valid Period
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {format(new Date(selectedSession.period.start_date), "dd MMM yyyy")} to {format(new Date(selectedSession.period.end_date), "dd MMM yyyy")}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Divider />
            {/* Modal Footer (Optional action button) */}
            <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', bg: '#f8fafc' }}>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold transition">
                    Close
                </button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default PromotionListEmployee;