import React, { useState } from 'react';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';

import Expenseform from './Expenseform';


const Expense = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);




    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const atDate=year+"-"+month+"-"+day;
    // console.log(year);


    return (
        <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  
        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
  
          {/*  Site header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  
          <main className="grow">
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
  
              {/* Dashboard actions */}
              <div className="flex items-center justify-center mb-8">
                <div className="text-center">
                 
        
                <h1 style={{ 
                        textShadow: '1px 2px 1px rgba(0, 0, 0, 0.5)' 
                    }} 
                    className="text-xl md:text-xl lg:text-2xl mt-1 text-gray-800 dark:text-gray-100 font-bold"
                    >
                    <span className="text-[#00ACC1]">EXPENSE</span> APPLICATION-{year}
                    </h1>

  
                </div>
              </div>
  
  
              {/* Cards */}
              <div className="">
               <Expenseform />
               
  
                
              </div>
  
            </div>
          </main>
  
     
  
        </div>
      </div>
    );
};

export default Expense;