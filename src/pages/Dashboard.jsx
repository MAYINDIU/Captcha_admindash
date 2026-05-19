import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import Datepicker from '../components/Datepicker';

import DashboardCard04 from '../partials/dashboard/DashboardCard04';
import DashboardCard07 from '../partials/dashboard/DashboardCard07';
import Banner from '../partials/Banner';
import AttendanceInfo from '../partials/dashboard/AttendanceInfo';
import logo from '../images/logo_p.jpg';
function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);



  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-emerald-50">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow bg-emerald-50">
      <div className="px-4 sm:px-6 lg:px-8 round-lg py-0 w-full max-w-full mx-auto">
          {/* Cards */}
          <div className="w-full">
            <DashboardCard04 />
          </div>
        </div>


      
        </main>

   

      </div>
    </div>
  );
}

export default Dashboard;
