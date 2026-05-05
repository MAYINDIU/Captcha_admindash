import React, { useState, useEffect } from "react";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import { AiOutlineSearch } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomerDiscountlist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partners, setPartners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");

  // Fetch all partners
  const fetchPartners = async () => {
    try {
      const res = await fetch(
        "https://pleasurebd.com/pleasure-backend/public/api/v1/partners"
      );
      const data = await res.json();
      setPartners(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load partners");
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Filtering + Searching + Only Active
  const filteredPartners = partners.filter((partner) => {
    return (
      partner.is_active &&
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (divisionFilter ? partner.division === divisionFilter : true)
    );
  });

  // Extract unique divisions for filter dropdown
  const divisions = [...new Set(partners.map((p) => p.division).filter(Boolean))];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 p-4 rounded-xl">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
              ACTIVE DISCOUNT POINTS
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-auto flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <AiOutlineSearch className="text-gray-400 dark:text-gray-500 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search partners by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Division Filter */}
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="flex-grow px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-transparent rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0097A7] transition-all duration-300 cursor-pointer"
              >
                <option value="">All Divisions</option>
                {divisions.map((div, idx) => (
                  <option key={idx} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-800"
              >
                {/* Status Bar */}
                <div className="absolute inset-x-0 top-0 h-2 bg-green-500"></div>

                <div className="p-6 flex-grow">
                  {/* Partner Name */}
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate pr-4">
                      {partner?.name}
                    </h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </span>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Type:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner?.type?.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Phone:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.contact_phone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Email:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">
                        {partner.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Division:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.division}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">District:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.district}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <strong className="font-semibold w-24">Address:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {partner.address}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="font-semibold w-24">Agreement:</strong>
                      <span className="flex-1 text-gray-800 dark:text-gray-200">
                        {new Date(
                          partner.agreement_start_date
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          partner.agreement_end_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Facilities Section */}
                  {partner?.facilities && (
                    <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Facilities
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                        {partner.facilities}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredPartners.length === 0 && (
              <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                No active partners found.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDiscountlist;
