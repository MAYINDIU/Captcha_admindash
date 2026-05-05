import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LineChart from '../../charts/LineChart01';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import EditMenu from '../../components/DropdownEditMenu';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DashboardCard01() {

  const rawData = localStorage.getItem("empData");
  const data = rawData ? JSON.parse(rawData) : [];
  const [refetch, setRefetch] = useState(false);
  // console.log(data);
  const userName=data[0]?.NAME;
  const orgCode=data[0]?.ORG_CODE;
  const OFC_NAME=data[0]?.OFC_NAME;
  const OFC_CODE=data[0]?.OFC_CODE;
  const MOBILE=data[0]?.MOBILE;
  const DEVICE_ID=data[0]?.DEVICE_ID;


    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const atDate=year+"-"+month+"-"+day;
    // console.log(atDate)

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const time=hours+":"+minutes;
    const date=year+month+day;
    // console.log(date);


    const formatDate = (date) => {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
    
      const year = date.getFullYear();
      const month = months[date.getMonth()]; // Get the month name from the array
      const day = String(date.getDate()).padStart(2, '0'); // Pad the day with leading zero
    
      return `${day}, ${month} ${year}`;
    };

    const formattedDate = formatDate(now);

    //Function for Insert data for attendance
    const saveAttendanceData = () => {
      if (orgCode !== '') {
          const apiUrl = `https://app2.primeislamilifeinsurance.com/Attendance/attendance_insert.php`
          axios
              .post(apiUrl, { EMP_ID: orgCode,
                FING_ID: '123',
                AT_DATE: atDate, // Replace with actual date
                ENT: '',
                EXT: '',
                STATUS: 'Y',
                TYPE: 'DEV'})
              .then((response) => {
                  // console.log('POST request successful')
                  const t=response?.data?.message;
                  setRefetch(true);
                  // console.log(t)
                  toast.success(t);
              })
      }
     
  }

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded">
      <div className="px-5 pt-5">
        <div className="flex items-start">
          <div className="text-md lg:font-bold text-gray-800 dark:text-gray-100 mr-0">{userName}</div>
          <div className="text-sm font-medium text-green-700 px-4 py-1  rounded-lg">({orgCode})</div>
        </div>
        <div className="flex mt-0 items-start">
          <div className="text-md  text-gray-800 dark:text-gray-100 mr-0">{OFC_NAME}</div>
          <div className="text-sm font-medium text-green-700 py-1 px-4 rounded-lg">({OFC_CODE})</div>
        </div>
        <div className="text-md mt-0 text-gray-800 dark:text-gray-100 mr-2">PHONE NO:  {MOBILE}</div>

        <div className="flex items-start">
        <div className="lg:text-xl text-dark mt-1 font-medium w-1/2 px-4 py-2 bg-green-500/20 rounded">Time: <span className='lg:font-bold'>{time}</span> </div>
        <div className="lg:text-xl mt-1 font-medium text-dark w-1/2 ml-2 px-4 py-2 bg-green-500/20 rounded">Date: <span className='lg:font-bold'>{formattedDate}</span></div>
        </div>

        <div className="text-sm mt-2 font-medium text-black px-4 py-2 bg-green-500/20 rounded">DEVICE ID: {DEVICE_ID}</div>
           <div className='text-center mt-3'>
           <button onClick={saveAttendanceData} className='mt-1 text-sm rounded text-center bg-[#00BCD4] p-1 mb-2 px-3 text-white'>Click For Attendance</button>

           </div>
           <ToastContainer />

           
      </div>


      
  
    </div>
  );
}

export default DashboardCard01;
