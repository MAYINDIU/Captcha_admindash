import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import DataTable, { createTheme } from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { format } from "date-fns";
import { FaEye, FaWallet, FaSearch, FaFilter, FaCalendarAlt, FaExchangeAlt, FaInfoCircle } from "react-icons/fa";
import { Modal, Box, Typography, Divider, IconButton, Chip, Grid, Paper, MenuItem, Select, FormControl, InputLabel, TextField, InputAdornment } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Enhanced Dark Theme
createTheme("solarized-dark-blue", {
  text: { primary: "#f1f5f9", secondary: "#94a3b8" },
  background: { default: "transparent" },
  divider: { default: "#334155" },
}, "dark");

const PromotionRewardTransactionEmp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filter States
  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("All");

  const token = localStorage.getItem("authToken");

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["employeeWalletTransactions"],
    queryFn: async () => {
      const res = await fetch("https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employee/wallet/transactions", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token,
  });

  const transactionData = apiResponse?.data || [];

  // Get unique types for the dropdown
  const transactionTypes = useMemo(() => {
    const types = transactionData.map(t => t.type);
    return ["All", ...new Set(types)];
  }, [transactionData]);

  // Filter Logic
  const filteredItems = transactionData.filter(item => {
    const matchesText = item.narration?.toLowerCase().includes(filterText.toLowerCase());
    const matchesType = filterType === "All" || item.type === filterType;
    return matchesText && matchesType;
  });

  const columns = [
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="uppercase text-[10px] font-bold tracking-wider text-slate-500">Transaction</span>
          <span className="font-semibold text-slate-200">{row.type}</span>
        </div>
      ),
    },
    {
      name: "Amount",
      sortable: true,
      cell: (row) => (
        <div className={`px-3 py-1 rounded-full font-bold ${row.amount >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {row.amount > 0 ? "+" : ""}{row.amount} {row.currency}
        </div>
      ),
    },
    {
      name: "Narration",
      selector: (row) => row.narration,
      grow: 2,
      cell: (row) => <span className="text-slate-400 italic text-sm line-clamp-1">{row.narration}</span>
    },
    {
      name: "Date",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => (
        <div className="text-slate-300">
          <div className="font-medium">{format(new Date(row.created_at), "dd MMM yyyy")}</div>
          <div className="text-[10px] text-slate-500">{format(new Date(row.created_at), "hh:mm a")}</div>
        </div>
      ),
    },
    {
      name: "Action",
      center: true,
      cell: (row) => (
        <button
          onClick={() => { setSelectedTransaction(row); setModalOpen(true); }}
          className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition shadow-lg"
        >
          <FaEye size={14} />
        </button>
      ),
    },
  ];

  const DetailRow = ({ label, value, icon: Icon }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {Icon && <Icon size={14} className="text-slate-400" />}
        <Typography variant="body2" className="text-slate-500 font-medium">{label}</Typography>
      </Box>
      <Typography variant="body2" className="text-slate-800 font-bold">{value || "N/A"}</Typography>
    </Box>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-8">
          <div className="max-w-full mx-auto">
            
            {/* Page Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-800">Wallet History</h1>
                <p className="text-slate-500 text-sm">Review all your reward and bonus distributions.</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                 <FaWallet className="text-indigo-500" />
                 <span className="text-sm font-bold text-slate-600">{filteredItems.length} Transactions</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-1/2">
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search narration..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaSearch className="text-slate-400" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                  }}
                />
              </div>
              
              <div className="w-full md:w-1/4">
                <FormControl fullWidth size="small">
                  <InputLabel id="type-filter-label">Filter Type</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    value={filterType}
                    label="Filter Type"
                    onChange={(e) => setFilterType(e.target.value)}
                    sx={{ borderRadius: '12px', bgcolor: '#f8fafc' }}
                  >
                    {transactionTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#1e293b] rounded-[1.5rem] shadow-xl border border-slate-700 overflow-hidden">
              {isLoading ? (
                <div className="p-8 space-y-3">
                  <Skeleton count={5} height={60} baseColor="#334155" highlightColor="#475569" borderRadius={12} />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredItems}
                  theme="solarized-dark-blue"
                  pagination
                  highlightOnHover
                  responsive
                  customStyles={{
                    rows: { style: { minHeight: '64px', borderBottom: '1px solid #334155' } },
                    headCells: { style: { color: '#94a3b8', fontWeight: 'bold' } }
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Details Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: 500 }, bgcolor: "#fff", borderRadius: 6, overflow: "hidden", boxShadow: 24, outline: 'none'
        }}>
          <Box sx={{ bgcolor: '#6366f1', p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800}>Transaction Details</Typography>
            <IconButton onClick={() => setModalOpen(false)} size="small" sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 4 }}>
            <div className="flex justify-center mb-6">
                <div className="text-center">
                    <Typography variant="h4" fontWeight={900} color="primary">
                        {selectedTransaction?.amount} <small>{selectedTransaction?.currency}</small>
                    </Typography>
                    <Chip label={selectedTransaction?.type} size="small" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }} />
                </div>
            </div>

            <DetailRow label="ID" value={selectedTransaction?.id} icon={FaInfoCircle} />
            <DetailRow label="Date" value={selectedTransaction && format(new Date(selectedTransaction.created_at), "PPPP")} icon={FaCalendarAlt} />
            <DetailRow label="Reference" value={selectedTransaction?.reference_type} icon={FaExchangeAlt} />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="caption" className="text-slate-400 uppercase font-bold">Additional Info</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Grid container spacing={1}>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Slot: {selectedTransaction?.meta?.slot_no || 'N/A'}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="textSecondary">Session: {selectedTransaction?.meta?.session_id || 'N/A'}</Typography></Grid>
                </Grid>
            </Paper>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-sm italic text-slate-600">
                "{selectedTransaction?.narration}"
            </div>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default PromotionRewardTransactionEmp;