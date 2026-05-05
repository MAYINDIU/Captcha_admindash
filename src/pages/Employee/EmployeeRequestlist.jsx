import React, { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import { AiOutlineEye, AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';
import { ClipLoader } from 'react-spinners';
import { Link } from 'react-router-dom';

import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';

const API_URL = 'https://alhamarahomesbd.com/alhamra-backend/public/api/v1/employee-recruit-requests';

const EmployeeRequestlist = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem("authToken");

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ["recruitRequests"],
        queryFn: async () => {
            const res = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data?.data || [];
        },
        enabled: !!token,
    });

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const name = req.data?.full_name_en?.toLowerCase() || "";
            const mobile = req.data?.mobile || "";
            return name.includes(searchQuery.toLowerCase()) || mobile.includes(searchQuery);
        });
    }, [requests, searchQuery]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                
                <main className="p-4 sm:p-6 lg:p-8">
                    {/* Top Action Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-extrabold text-[#024453]">Recruitment Requests</h2>
                        
                        <div className="flex gap-4">
                            <div className="relative w-64">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <AiOutlineSearch size={20} />
                                </span>
                                <input 
                                    type="text"
                                    placeholder="Search by name or mobile..."
                                    className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-[#024453] outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Link 
                                to="/employee-add-request" 
                                className="bg-[#024453] text-white px-6 py-2 rounded-lg font-bold hover:bg-cyan-900 transition flex items-center gap-2"
                            >
                                <AiOutlinePlus /> Add Request
                            </Link>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center mt-20"><ClipLoader color="#024453" size={50} /></div>
                    ) : (
                        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                            <table className="w-full text-left">
                                <thead className="bg-[#024453] text-white">
                                    <tr>
                                          <th className="px-6 py-4 text-xs font-bold uppercase">SL NO</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase">Mobile</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase">Rank</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredRequests.map((req,index) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition">
                                                   <td className="px-6 py-4 text-gray-600">{index+1}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">{req.data?.full_name_en}</td>
                                            <td className="px-6 py-4 text-gray-600">{req.data?.mobile}</td>
                                            <td className="px-6 py-4 text-gray-600">{req.data?.email || "N/A"}</td>
                                            <td className="px-6 py-4 text-sm">{req.data?.rank}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-[#00ACC1] capitalize">{req.status}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => setSelectedReq(req)} className="text-[#024453] hover:text-cyan-600">
                                                    <AiOutlineEye size={22} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Detail Modal */}
            {selectedReq && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-extrabold text-[#024453]">Request Details</h2>
                            <button onClick={() => setSelectedReq(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DetailSection title="Candidate Info" data={selectedReq.data} />
                            <DetailSection title="Requester" data={selectedReq.requester} />
                        </div>
                        <button onClick={() => setSelectedReq(null)} className="mt-8 w-full bg-[#024453] text-white py-3 rounded-xl font-bold hover:bg-cyan-900">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailSection = ({ title, data }) => (
    <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#00ACC1] uppercase tracking-wider">{title}</h3>
        <div className="space-y-2">
            {data ? Object.entries(data).map(([key, val]) => (
                val !== null && typeof val !== 'object' && (
                    <div key={key} className="flex justify-between border-b border-gray-50 pb-1 text-sm">
                        <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-gray-800 font-medium text-right">{String(val)}</span>
                    </div>
                )
            )) : <p className="text-gray-400 italic text-sm">No data available</p>}
        </div>
    </div>
);

export default EmployeeRequestlist;