import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { AiOutlineSearch, AiOutlineEye, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

const EmployeeAddreqListadmin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem("authToken");

    const authHeader = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    }), [token]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get(
                    "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employee-recruit-requests",
                    authHeader
                );
                setRequests(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch recruitment requests.");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchRequests();
    }, [token, authHeader]);

    const openDetails = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const handleApprove = async (id) => {
        const result = await Swal.fire({
            title: 'Approve Request?',
            text: "This will approve the recruitment request.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve'
        });

        if (result.isConfirmed) {
            try {
                await axios.post(
                    `https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employee-recruit-requests/${id}/approve`,
                    {},
                    authHeader
                );
                toast.success("Request approved successfully!");
                setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'approved' } : req));
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to approve request.");
            }
        }
    };

    const handleReject = async (id) => {
        const result = await Swal.fire({
            title: 'Reject Request?',
            text: "This will reject the recruitment request.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Reject'
        });

        if (result.isConfirmed) {
            try {
                await axios.post(
                    `https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employee-recruit-requests/${id}/reject`,
                    {},
                    authHeader
                );
                toast.success("Request rejected successfully!");
                setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req));
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to reject request.");
            }
        }
    };

    // --- Filter Logic ---
    const filteredRequests = useMemo(() => {
        if (!searchTerm) return requests;
        const lowerTerm = searchTerm.toLowerCase();
        return requests.filter(req => 
            req.data.full_name_en?.toLowerCase().includes(lowerTerm) ||
            req.data.mobile?.includes(lowerTerm) ||
            req.data.national_id?.includes(lowerTerm)
        );
    }, [requests, searchTerm]);

    // --- DataTable Columns ---
    const columns = [
        {
            name: 'Candidate',
            selector: row => row.data.full_name_en,
            cell: row => (
                <div className="py-2">
                    <div className="font-bold text-indigo-600">{row.data.full_name_en}</div>
                    <div className="text-xs text-slate-500">F: {row.data.father_name}</div>
                </div>
            ),
            sortable: true,
            grow: 2
        },
        {
            name: 'Contact & ID',
            selector: row => row.data.mobile,
            cell: row => (
                <div className="py-2">
                    <div className="text-slate-800 font-medium">{row.data.mobile}</div>
                    <div className="text-xs text-gray-500">{row.data.email}</div>
                    <div className="text-[10px] bg-slate-100 px-1 inline-block rounded text-slate-600 mt-1">NID: {row.data.national_id}</div>
                </div>
            ),
            sortable: true
        },
        {
            name: 'Requester',
            selector: row => row.requester?.full_name_en,
            cell: row => (
                <div className="py-2">
                    <div className="text-slate-700 font-semibold">{row.requester?.full_name_en}</div>
                    <div className="text-xs text-indigo-500 font-bold">{row.requester?.rank}</div>
                </div>
            ),
            sortable: true
        },
        {
            name: 'Status',
            selector: row => row.status,
            cell: row => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    row.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                    row.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                    'bg-green-100 text-green-600'
                }`}>
                    {row.status.toUpperCase()}
                </span>
            ),
            sortable: true,
            center: true
        },
        {
            name: 'Action',
            cell: row => (
                <div className="flex justify-center items-center gap-2">
                    {row.status === 'pending' && (
                        <>
                            <button onClick={() => handleApprove(row.id)} className="text-white hover:bg-green-700 transition p-2 bg-green-500 rounded-full shadow-sm" title="Approve">
                                <AiOutlineCheck />
                            </button>
                            <button onClick={() => handleReject(row.id)} className="text-white hover:bg-red-700 transition p-2 bg-red-500 rounded-full shadow-sm" title="Reject">
                                <AiOutlineClose />
                            </button>
                        </>
                    )}
                    <button onClick={() => openDetails(row)} className="text-slate-500 hover:text-indigo-600 transition p-2 bg-slate-100 rounded-full shadow-sm" title="View Details">
                        <AiOutlineEye />
                    </button>
                </div>
            ),
            button: true,
            width: '140px'
        }
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#1565C0',
                color: '#ffffff',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
            },
        },
        headCells: {
            style: {
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#ffffff',
            },
        },
        rows: {
            style: {
                minHeight: '72px', 
            },
        },
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="sm:flex sm:justify-between sm:items-center mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Recruitment Requests</h1>
                            <p className="text-sm text-gray-500">Full candidate database and requisition review.</p>
                        </div>
                        
                        {/* Search Input */}
                        <div className="mt-4 sm:mt-0 relative">
                            <input 
                                type="text" 
                                placeholder="Search by Name or Mobile..." 
                                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl border border-slate-200">
                        <DataTable
                            columns={columns}
                            data={filteredRequests}
                            pagination
                            progressPending={loading}
                            customStyles={customStyles}
                            highlightOnHover
                            responsive
                            noDataComponent={<div className="p-8 text-center text-slate-500">No requests found.</div>}
                        />
                    </div>
                </main>

                {/* --- DETAILED MODAL --- */}
                {isModalOpen && selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4  transition-opacity">
                        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                            
                            {/* Modal Header */}
                            <div className="p-5 border-b flex justify-between items-center bg-slate-800 text-white">
                                <div>
                                    <h2 className="text-xl font-bold">Recruitment Dossier: {selectedRequest.data.full_name_en}</h2>
                                    <p className="text-xs text-slate-300 uppercase tracking-widest font-semibold">Rank Requested: {selectedRequest.data.rank}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-red-400 transition text-3xl">&times;</button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                    
                                    {/* Section 1: Basic Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-indigo-600 uppercase border-b border-indigo-100 pb-2">1. Personal Identity</h3>
                                        <div className="space-y-3 text-sm">
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">Full Name (Bangla)</span> <p className="font-semibold">{selectedRequest.data.full_name_bn}</p></div>
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">Date of Birth</span> <p className="font-medium">{selectedRequest.data.date_of_birth}</p></div>
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">Marital Status</span> <p className="font-medium">{selectedRequest.data.marital_status || 'Not Specified'}</p></div>
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">Religion / Gender</span> <p className="font-medium">{selectedRequest.data.religion || 'N/A'} / {selectedRequest.data.gender || 'N/A'}</p></div>
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">Nationality</span> <p className="font-medium">{selectedRequest.data.nationality || 'Bangladeshi'}</p></div>
                                        </div>
                                    </div>

                                    {/* Section 2: Contact & Location */}
                                    <div className="space-y-4 px-0 md:px-4 border-x border-gray-100">
                                        <h3 className="text-xs font-black text-indigo-600 uppercase border-b border-indigo-100 pb-2">2. Communication & Address</h3>
                                        <div className="space-y-3 text-sm">
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">Mobile</span> <p className="font-bold text-indigo-600">{selectedRequest.data.mobile}</p></div>
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">District / Upazila</span> <p className="font-medium">{selectedRequest.data.district} / {selectedRequest.data.upazila}</p></div>
                                            <div><span className="text-gray-400 block text-[10px] uppercase font-bold">Post Code</span> <p className="font-medium">{selectedRequest.data.post_code || 'N/A'}</p></div>
                                            <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                                <span className="text-blue-500 block text-[10px] uppercase font-black">Present Address</span> 
                                                <p className="text-xs text-slate-700 leading-relaxed">{selectedRequest.data.present_address}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                                <span className="text-gray-500 block text-[10px] uppercase font-black">Permanent Address</span> 
                                                <p className="text-xs text-slate-700 leading-relaxed">{selectedRequest.data.permanent_address || 'Same as present'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Requester Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-emerald-600 uppercase border-b border-emerald-100 pb-2">3. Internal Requester</h3>
                                        {selectedRequest.requester ? (
                                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3 text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-12 w-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                                                        {selectedRequest.requester.full_name_en.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800">{selectedRequest.requester.full_name_en}</p>
                                                        <p className="text-xs text-emerald-700 font-bold bg-white px-2 rounded-full inline-block border border-emerald-200 mt-1">{selectedRequest.requester.rank}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-emerald-200/50 space-y-2">
                                                    <p className="text-[11px]"><span className="text-emerald-600 font-bold uppercase mr-1">Code:</span> {selectedRequest.requester.employee_code}</p>
                                                    <p className="text-[11px]"><span className="text-emerald-600 font-bold uppercase mr-1">Mobile:</span> {selectedRequest.requester.mobile}</p>
                                                    <p className="text-[11px]"><span className="text-emerald-600 font-bold uppercase mr-1">Branch ID:</span> #{selectedRequest.requester.branch_id}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic">No requester information available.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Extra Sections: Education & Nominees */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                                    {/* Education */}
                                    <div>
                                        <h3 className="text-xs font-black text-slate-600 uppercase mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Education History
                                        </h3>
                                        {selectedRequest.data.educations && selectedRequest.data.educations.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedRequest.data.educations.map((edu, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                                                        <div className="flex justify-between font-bold text-slate-700">
                                                            <span>{edu.exam_name || edu.level}</span>
                                                            <span>{edu.passing_year}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {edu.subject} • {edu.board_university} • Result: {edu.result}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-gray-400 italic">No education records provided.</p>}
                                    </div>

                                    {/* Nominees */}
                                    <div>
                                        <h3 className="text-xs font-black text-slate-600 uppercase mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Nominee Information
                                        </h3>
                                        {selectedRequest.data.nominees && selectedRequest.data.nominees.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedRequest.data.nominees.map((nom, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                                                        <div className="font-bold text-slate-700">{nom.name} <span className="text-xs font-normal text-slate-500">({nom.relation})</span></div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            Phone: {nom.phone}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-1 truncate">
                                                            {nom.address}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-gray-400 italic">No nominee records provided.</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t bg-slate-50 flex justify-end space-x-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-200 transition text-sm font-bold">Close Preview</button>
                            </div>
                        </div>
                    </div>
                )}
                <ToastContainer />
            </div>
        </div>
    );
};

export default EmployeeAddreqListadmin;