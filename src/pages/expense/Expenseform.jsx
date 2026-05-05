import React, { useState } from 'react';

const Expenseform = () => {
    const [selectedOption, setSelectedOption] = useState('');
    console.log(selectedOption);

    const handleOptionChange = (event) => {
      setSelectedOption(event.target.value);
    };
    return (
        <div className='px-48'>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <div className='col-span-1 shadow-lg border p-5'>
                <h2 className='mb-2 text-sm text-[#009688]'>SELECT TYPE OF EXPENSE (*)</h2>
                <div className=''>
                <input
                type="radio"
                id="casual_leave"
                value="1"
                checked={selectedOption === '1'}
                onChange={handleOptionChange}
                />
                <label className='ml-4 text-[#333]' htmlFor="casual_leave">Food</label>
                </div>
                <div className='mt-2'>
                <input
                type="radio"
                id="earn_leave"
                value="2"
                checked={selectedOption === '2'}
                onChange={handleOptionChange}
                />
                <label className='ml-4 text-[#333]' htmlFor="option2">Transport</label>
                </div>
                <div className='mt-2'>
                <input
                type="radio"
                id="medical_leave"
                value="3"
                checked={selectedOption === '3'}
                onChange={handleOptionChange}
                />
                <label className='ml-4 text-[#333]' htmlFor="option2">Others</label>
                </div>
                </div>
                <div className='col-span-1 shadow-lg border p-5'>
                <div className="mb-1 mt-3 w-full">
                        <label htmlFor="amt" className="mb-0 text-sm text-[#009688] block mb-1 text-sm  text-gray-900 dark:text-white">AMOUNT (*)</label>
                        <textarea type="text" id="amt" className=" shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder='Write reason'  required />
                </div>
                <div className="mb-1 mt-3 w-full">
                        <label htmlFor="remarks" className="mb-0 text-sm text-[#009688] block mb-1 text-sm  text-gray-900 dark:text-white">REMARKS (*)</label>
                        <input  type="text" id="remarks" className=" shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                         required />
                </div>
                <div className="mb-1 mt-3 w-full">
                        <label htmlFor="destination" className="mb-0 text-sm text-[#009688] block mb-1 text-sm  text-gray-900 dark:text-white">DESTINATION (*)</label>
                        <input  type="text" id="destination" className=" shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                         required />
                </div>
         
               
                <div className="mb-1 mt-3 w-full">
                <button type="submit" className="w-full text-white bg-[#0097A7] hover:bg-[#00ACC1] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    ADD EXPENSE</button>

                </div>
                </div>


  </div>
        </div>
    );
};

export default Expenseform;