import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { FaCalculator, FaGift, FaSpinner, FaCheckCircle } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminCalculateprmotion = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [eligibilityData, setEligibilityData] = useState(null);
    const [awardsProcessData, setAwardsProcessData] = useState(null);

    const queryClient = useQueryClient();
    const token = localStorage.getItem("authToken");
    const API_BASE = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/promotions";

    // Fetch all promotion sessions
    const { data: sessionsResponse, isLoading: isLoadingSessions } = useQuery({
        queryKey: ["promotionSessions"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/sessions`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Failed to fetch sessions");
            return res.json();
        },
        enabled: !!token,
    });

    const sessions = sessionsResponse?.data || [];

    // Mutation for calculating eligibility
    const calculateEligibilityMutation = useMutation({
        mutationFn: async (sessionId) => {
            const res = await fetch(`${API_BASE}/sessions/${sessionId}/calculate-eligibility`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Eligibility calculation failed");
            return data;
        },
        onSuccess: (data) => {
            setEligibilityData(data);
            toast.success("Eligibility calculated successfully!");
        },
        onError: (err) => {
            toast.error(err.message || "Error calculating eligibility.");
            setEligibilityData(null);
        },
    });

    // Mutation for generating awards
    const generateAwardsMutation = useMutation({
        mutationFn: async (sessionId) => {
            const res = await fetch(`${API_BASE}/awards/generate`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id: sessionId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Award generation failed");
            return data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Awards generated successfully!");
            // Optionally, you might want to re-calculate eligibility or fetch awards list here
        },
        onError: (err) => {
            toast.error(err.message || "Error generating awards.");
        },
    });

    // Mutation for processing awards
    const processAwardsMutation = useMutation({
        mutationFn: async (sessionId) => {
            const res = await fetch(`${API_BASE}/awards/process`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id: sessionId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Award processing failed");
            return data;
        },
        onSuccess: (data) => {
            setAwardsProcessData(data);
            toast.success("Awards processed successfully!");
            // Optionally, invalidate queries to refresh any related data
            queryClient.invalidateQueries(["promotionSessions"]);
        },
        onError: (err) => {
            toast.error(err.message || "Error processing awards.");
            setAwardsProcessData(null);
        },
    });

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto bg-slate-50">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="p-4 md:p-8 grow">
                    <ToastContainer position="top-right" autoClose={2000} />

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Promotion Calculation Tools</h2>

                        <div className="mb-6">
                            <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 mb-2">Select Promotion Session:</label>
                            {isLoadingSessions ? (
                                <Skeleton height={40} />
                            ) : (
                                <select
                                    id="session-select"
                                    className="w-full md:w-96 border border-slate-300 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                >
                                    <option value="">-- Choose a session --</option>
                                    {sessions.map((session) => (
                                        <option key={session.id} value={session.id}>
                                            {session.name} (ID: {session.id})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <button
                                onClick={() => calculateEligibilityMutation.mutate(selectedSessionId)}
                                disabled={!selectedSessionId || calculateEligibilityMutation.isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                            >
                                {calculateEligibilityMutation.isLoading ? <FaSpinner className="animate-spin" /> : <FaCalculator />}
                                Calculate Eligibility
                            </button>
                            <button
                                onClick={() => generateAwardsMutation.mutate(selectedSessionId)}
                                disabled={!selectedSessionId || generateAwardsMutation.isLoading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                            >
                                {generateAwardsMutation.isLoading ? <FaSpinner className="animate-spin" /> : <FaGift />}
                                Generate Awards
                            </button>
                            <button
                                onClick={() => processAwardsMutation.mutate(selectedSessionId)}
                                disabled={!selectedSessionId || processAwardsMutation.isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
                            >
                                {processAwardsMutation.isLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                                Process Awards
                            </button>
                        </div>

                        {eligibilityData && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Eligibility Results:</h3>
                                <p className="text-blue-700">Total Records: <span className="font-bold">{eligibilityData.total_records}</span></p>
                                <p className="text-blue-700">Eligible Records: <span className="font-bold">{eligibilityData.eligible_records}</span></p>
                            </div>
                        )}

                        {awardsProcessData && (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-800 mb-2">Award Processing Results:</h3>
                                <p className="text-green-700">Processed: <span className="font-bold">{awardsProcessData.processed}</span></p>
                                <p className="text-green-700">Wallet Credited: <span className="font-bold">{awardsProcessData.wallet_credited}</span></p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminCalculateprmotion;
