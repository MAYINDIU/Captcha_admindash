import React, { useEffect, useState } from 'react';
import { useGetAttendanceinfoQuery } from '../../pages/features/attendance';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
const AttendanceInfo = () => {

    const data = JSON.parse(localStorage.getItem("empData"));
    const orgCode=data[0]?.ORG_CODE;
    // console.log(data);


    const [attendanceData, setAttendanceData] = useState(['']);
    const [refetch, setRefetch] = useState(false);
    const [error, setError] = useState(null);

    // console.log(attendanceData);


    const datas = [
      { EMP_ID: '3166', AT_DATE: '2024-02-08', ENT: '16:57', EXT: '17:18' },
      { EMP_ID: '3166', AT_DATE: '2024-02-11', ENT: '09:59', EXT: '17:10' },
      // Add more data as needed
    ];


    const generatePDF = () => {
      const doc = new jsPDF();
      doc.text('Attendance Report', 20, 20);
      let y = 30;
      attendanceData?.forEach((item, index) => {
        doc.text(`EMP_ID: ${item.EMP_ID}, AT_DATE: ${item.AT_DATE}, ENT: ${item.ENT}, EXT: ${item.EXT}`, 20, y);
        y += 10;
      });
      doc.save(`attendance_report ${orgCode}.pdf`);
    };
  
    const generateExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(attendanceData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      XLSX.writeFile(workbook, `attendance_report ${orgCode}.xlsx`);
    };


    // const { data: attendance_data, error: permissionError, isSuccess, refetch } = useGetAttendanceinfoQuery({EMP_ID});
    // console.log()

    // useEffect(() => {
    //   refetch(); // Optional: Trigger refetch when EMP_ID changes
    // }, [EMP_ID, refetch]);
  
    // console.log(attendance_data); 

    const getStatus = (ent) => {
        const thresholdTime = '10:16';
        return ent > thresholdTime ? 'Late' : 'Present';
      };
    
    
      useEffect(() => {
        let isMounted = true; // Track if component is mounted
    
        const fetchAttendanceData = async () => {
          try {
            const response = await fetch(`https://app2.primeislamilifeinsurance.com/Attendance/attendanceInfo.php?EMP_CODE=${orgCode}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
    
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const text = await response.text();
            
            let data;
            try {
              data = JSON.parse(text);
            } catch (error) {
              console.error('Failed to parse JSON:', text); // Log the response text for debugging
              throw new Error('Failed to parse JSON response');
            }
    
            if (isMounted) {
              setAttendanceData(data?.attendance_info);
            }
            setRefetch(false);
          } catch (error) {
            if (isMounted) {
              setError(error.message || 'An error occurred');
            }
          }
        };
    
        if (orgCode) {
          fetchAttendanceData();
        }
    
        return () => {
          isMounted = false; // Cleanup on unmount
        };
      }, [orgCode,refetch]);
  
    if (error) {
      return <div>Error: {error?.message}</div>;
    }
  
    if (!attendanceData) {
      return <div>Loading...</div>;
    }

    return (
      
          <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded">
          <div className="px-5 pt-5">
    

        <div className="flex items-start">
        <div className="text-xs lg:text-sm mt-1 text-center text-white w-1/2 px-2 py-1 bg-[#26A69A] rounded">DATE</div>
        <div className="text-xs lg:text-sm  mt-1  text-center text-white w-1/2 ml-2 px-2 py-1 bg-[#26A69A] rounded">IN TIME</div>
        <div className="text-xs lg:text-sm mt-1  text-center text-white w-1/2 ml-2 px-2 py-1 bg-[#26A69A] rounded">EXIT TIME</div>
        <div className="text-xs lg:text-sm mt-1  text-center text-white w-1/2 ml-2 px-2 py-1 bg-[#26A69A] rounded">STATUS</div>
        </div>

        {attendanceData?.map((data, index) => (
        <div  key={index} className="flex items-start">
        <div className="text-xs lg:text-sm  mt-1 text-center font-medium text-green-700 w-1/2 px-2 py-1 bg-green-500/20 rounded">{data?.AT_DATE}</div>
        <div className="text-xs lg:text-sm  mt-1 text-center font-medium text-green-700 w-1/2 ml-2 px-2 py-1 bg-green-500/20 rounded">{data?.ENT}</div>
        <div className="text-xs lg:text-sm  mt-1 text-center font-medium text-green-700 w-1/2 ml-2 px-2 py-1 bg-green-500/20 rounded">{data?.EXT}</div>
        <div style={{ color: getStatus(data?.ENT) === 'Late' ? 'red' : 'green' }} className="text-xs lg:text-sm  mt-1 text-center font-medium text-green-700 w-1/2 ml-2 px-2 py-1 bg-green-500/20 rounded">{getStatus(data?.ENT)}</div>
        </div>
         ))}

        <div className="flex justify-center items-center mt-3">
              <button onClick={generatePDF} className="mt-1 text-sm rounded bg-[#00B0FF] p-1 mb-2 px-3 text-white flex items-center">
                <svg className="shrink-0 fill-current text-white mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm9 7h-1v4h-2v-4H9V9h6v2z"/>
                </svg>
                Generate PDF
              </button>

              <button onClick={generateExcel} className="mt-1 text-sm rounded bg-[#00B8D4] ml-5 p-1 mb-2 px-3 text-white flex items-center">
                <svg className="shrink-0 fill-current text-white mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M6 2v20h12V8l-6-6H6zm6 2l4 4h-3V4h-2v3H8l4-4zM8 14l4-4 4 4H8z"/>
                </svg>
                Generate Excel
              </button>
        </div>
     
           {/* <ToastContainer /> */}
      </div>
  
    </div>
        
    );
};

export default AttendanceInfo;