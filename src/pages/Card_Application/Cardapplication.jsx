import React, { useEffect, useState } from 'react';
import Sidebar from '../../partials/Sidebar';
import { AiOutlineCheck, AiTwotoneDelete } from "react-icons/ai";
import { AiOutlinePlus } from "react-icons/ai";
import { BiSolidBriefcaseAlt2 } from "react-icons/bi";
import { BiMessageError } from "react-icons/bi";
import { BiUser } from "react-icons/bi";
import Header from '../../partials/Header';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import logo from '../../images/logo_p.jpg';
import axios from 'axios';
import { AiOutlineFile } from "react-icons/ai";
const Cardapplication = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const years = [];
    const currentYear = new Date().getFullYear(); // Get the current year
    
    for (let i = 1980; i <= currentYear; i++) {
      years.push(i);
    }

    const [allposition, setAllposition] = useState([])
    const [refetch, setRefetch] = useState(false)


    

    // console.log(allposition)

    React.useEffect(() => {
        // if (refetch) {
        const getAllPosition = async () => {
            const response = await fetch(
                `http://localhost:4001/api/position/allPosition`,
            )
            const data = await response.json()
            setAllposition(data?.result)
            // console.log(data?.result)
            setRefetch(false)
        }
        getAllPosition()
    }, [refetch])


    const [alldepartment, setAlldepartment] = useState([])
    // console.log(alldepartment)

    React.useEffect(() => {
        // if (refetch) {
        const getAlldepartment = async () => {
            const response = await fetch(
                `http://localhost:4001/api/department/alldepartment`,
            )
            const data = await response.json()
            setAlldepartment(data?.result)
            // console.log(data?.result)
            setRefetch(false)
        }
        getAlldepartment()
    }, [refetch])


const handleFileChange = (e) => {
  const { name, files } = e.target;
  if (files && files[0]) {
    const file = files[0];
    const previewURL = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      [name]: file,
      [`${name}Preview`]: previewURL,
    }));
  }
};

// Remove selected file
const removeFile = (name) => {
  setFormData((prev) => ({
    ...prev,
    [name]: null,
    [`${name}Preview`]: null,
  }));
};



    const boards = [
        "Dhaka Board",
        "Chittagong Board",
        "Rajshahi Board",
        "Khulna Board",
        "Barisal Board",
        "Sylhet Board",
        "Comilla Board",
        "Jessore Board",
        "Mymensingh Board",
        "Dinajpur Board",
        "Madrasah Board",
        "Technical Board",
      ];
  
    const [step, setStep] = useState(1);
    // console.log(step)
    const [formData, setFormData] = useState({
      empId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nid: '',
      doj: '',
      dept: '',
      desig: '',
      gender: '',
      country: '',
      city: '',
      zip: '',
      address: '',
      accountInfo: '',
      confirmation: '',
      design: '',   // ✅ New field
    });
    // console.log(formData)
          


    const officeCode=formData?.officeCode;
    const empID=formData?.empId;
    const applicantName=formData?.applicantName;
    const lastName=formData?.lastName;
    const email=formData?.email;
    const nameBangla=formData?.nameBangla;
    const phone=formData?.phone;
    const nid=formData?.nid;
    const dob=formData?.dob;
    const desig=formData?.desig;
    const department=formData?.dept;
    const gender=formData?.gender;
    const country=formData?.country;
    const city=formData?.city;
    const zip=formData?.zip;
    const address=formData?.address;
    



    const handleEmpBasicinfo = () => {
      if (empID !== "") {
        if (empID?.length < 4) {
          Swal.fire({
            icon: "error",
            title: "Emp_id too short",
            text: "Emp_id must be at least 4 characters long",
            showConfirmButton: true,
          });
          return;
        }
    
        // Create a JSON object with all the necessary fields
        const employeeData = {
          employee_id: empID,
          applicantName: applicantName,
          nameBangla: nameBangla,
          email: email,
          basic_salary: basic_salary,
          salary: gross_salary,
          phone: phone,
          nid: nid,
          date_of_birth: dob, // Ensure date of joining is added
          position_id: desig,
          gender: gender,
          country: country,
          city: city,
          zip: zip,
          address: address,
          department_id: department,
          officeCode:officeCode,
          nameBangla:nameBangla,
        };
    
        // Send data to the local server as a JSON object
        fetch("http://localhost:4001/api/employee/create-employee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
          body: JSON.stringify(employeeData), // Convert the data to a JSON string
        })
          .then(response => response.json())
          .then(data => {
            if (data?.message === "Employee created successfully") {
              Swal.fire({
                icon: "success",
                title: "Employee created successfully",
                showConfirmButton: true,
              });
              setRefetch(true);
              navigate(`/`);
            } else {
              toast.error('Employee creation failed or already exists');
            }
          })
          .catch(error => {
            console.error("Error during Employee creation:", error);
            toast.error('Employee Error');
          });
      }
    };
    
    

      
    const [empDetails,setEmpDatas]=useState(['']);
    const name=empDetails?.first_name;
      // console.log(empDetails[0]?.employee_id);

    if(formData?.empId===empDetails[0]?.employee_id){
      toast.error('EMP ID already submitted. Please type another EMP ID.');
    }

    useEffect(() => {
      if (formData?.empId) {
          fetch(`http://localhost:4001/api/employee/single-employee/${formData?.empId}`)
              .then(response => response.json())
              .then(data => setEmpDatas(data?.result))
              .catch(error => console.error('Error fetching data:', error));
              setRefetch(false)
      }
  }, [formData?.empId,refetch]); 



  const [salesRanks, setSalesRanks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    
    axios
      .get("https://pleasurebd.com/pleasure-backend/public/api/v1/sales-ranks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setSalesRanks(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


    const [formDatas, setFormDatas] = useState({
      institution: '',
      degree: '',
      cgpa: '',
      passing_year: '',
      board: '',
    });
  
    const [educationalData, setEducationalData] = useState([]);
  
    // const educationSize=educationalData?.length;
    // console.log(educationSize)
    // Handle form input change
    const handleChanges = (e) => {
      const { name, value } = e.target;
      setFormDatas({
        ...formDatas,
        [name]: value,
      });
    };
  
    // Add form data to the educationalData array
const handleAdd = () => {
  // Validate form data to ensure all fields are filled
  const { institution, degree, cgpa, passing_year, board } = formDatas;

  if (!institution || !degree || !cgpa || !passing_year || !board) {
    // Show an alert or handle the error (You can use Toast or Swal for better user feedback)
    alert('Please fill in all the fields before adding.');
    return;
  }

  // If all fields are filled, add the form data to the array
  setEducationalData([...educationalData, formDatas]);

  // Clear the form for the next entry
  setFormDatas({
    institution: '',
    degree: '',
    cgpa: '',
    passing_year: '',
    board: '',
  });
};

const [nomineeData, setnomineeData] = useState({
  name: '',
  mobile: '',
  relation: '',
  address: '',

});

const [nomineeList, setnomineeList] = useState([]);

// console.log(nomineeList)

const handleExperienceChange = (e) => {
  setnomineeData({
    ...nomineeData,
    [e.target.name]: e.target.value,
  });
};


const handleAddExperience = () => {
  if (nomineeData?.name && nomineeData.mobile && nomineeData.relation && nomineeData.address ) {
    setnomineeList([...nomineeList, nomineeData]);

    // Clear form data
    setnomineeData({
      name: '',
      mobile: '',
      relation: '',
      address: '',
 
    });
  }
};






const handleNext = () => {
  if (validateStep(step)) {
    setStep(step + 1);
    
  } else {
    Swal.fire('Validation Error', 'Please fill out the required fields.', 'error');
  }
};

const handleBack = () => {
  setStep(step - 1);
};

const handleSubmit = () => {
  if (validateStep(step)) {
    Swal.fire({
      icon: 'success',
      title: 'Form Submitted',
      text: 'Your data has been submitted successfully!',
    });
    // Handle form submission here
  } else {
    Swal.fire('Validation Error', 'Please fill out the required fields.', 'error');
  }
};

const handleRemove = (indexToRemove) => {
  setEducationalData(educationalData?.filter((_, index) => index !== indexToRemove));
};

const handleRemoveExperience = (index) => {
  const updatedList = nomineeList?.filter((_, i) => i !== index);
  setnomineeList(updatedList);
};



const validateStep = (currentStep) => {
  const educationSize = educationalData?.length; // Get the length of educationalData
  const experienceSize = nomineeList?.length;
  
  console.log(experienceSize)// Get the length of educationalData

  switch (currentStep) {
    case 1:
     case 1:
  return (
    (formData.applicantName?.trim() || '') !== '' &&
    (formData.nameBangla?.trim() || '') !== '' &&
    (formData.email?.trim() || '') !== '' &&
    (formData.phone?.trim() || '') !== '' &&
    (formData.nid?.trim() || '') !== '' &&
    (formData.dob?.trim() || '') !== ''
  );

      
      
    case 2:
      // Ensure there's at least one educational entry
      return educationSize >= 1;

    case 3:
      return formData.name !== '';

    case 4:
      return experienceSize >= 1;

    default:
      return false;
  }
};







    

    return (
        <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="grow">
            <div className="px-4 sm:px-6 lg:px-6 py-4 w-full max-w-full mx-auto">
          <div className="px-6 hidden sm:block">
            <div className="w-full bg-[#0097A7] rounded px-3 sm:px-6 lg:px-6 py-4 flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex-shrink-0">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="h-16 w-16 rounded object-contain"
                />
              </div>

              {/* Center: Company Info */}
              <div className="text-center text-white">
                <h1 className="text-xl font-bold">PLEASURE BANGLADESH LIMITED</h1>
                <p className="text-sm">Corporate Address: Zaman Tower, 11th floor, Flat:1115, Purana Palton, Dhaka</p>
                <p className="text-sm">Mobile: +880 1234 567890</p>
              </div>

              {/* Right: Optional space or button */}
              <div className="flex-shrink-0">
                {/* You can add a button or leave empty */}
              </div>
            </div>
          </div>

      

               
      <div className=" mx-auto lg:p-6">
      <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-6">
  {/* Step 1 */}
  <li className={`flex mr-10 items-center ${step === 1 ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'} ${step > 1 ? 'after:content-[""] after:w-full after:h-1 after:border-b after:border-blue-500 after:inline-block after:mx-6' : ''}`}>
    <span className="ml-5 flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
      {step > 1 ? (
        <div className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-[#80CBC4] text-white">
          <AiOutlineCheck className="w-4 h-4" />
        </div>
      ) : (
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === 1 ? 'bg-[#80CBC4] mr-2 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {step === 1 ? '1' : <BiUser className="w-4 h-4 text-gray-400" />}
        </div>
      )}
      BASIC <span className="hidden sm:inline-flex sm:ms-2">INFO</span>
    </span>
  </li>

  {/* Step 2 */}
  <li className={`flex mr-10 items-center ${step === 2 ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'} ${step > 2 ? 'after:content-[""] after:w-full after:h-1 after:border-b after:border-blue-500 after:inline-block after:mx-6' : ''}`}>
    <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
      {step > 2 ? (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#80CBC4] mr-3 text-white">
          <AiOutlineCheck className="w-4 h-4" />
        </div>
      ) : (
        <div className={`w-8 h-8 mr-2 flex items-center justify-center rounded-full ${step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {step === 2 ? '2' : <BiMessageError className="w-4 h-4 text-gray-400" />}
        </div>
      )}
      EDUCATIONAL <span className="hidden sm:inline-flex sm:ms-2">INFO</span>
    </span>
  </li>

  {/* Step 3 */}
  <li className={`flex mr-10 items-center ${step === 3 ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
    <span className="flex items-center">
      {step === 3 ? (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#80CBC4] mr-3 text-white">
          <AiOutlineCheck className="w-4 h-4" />
        </div>
      ) : (
        <div className={`w-8 h-8 flex items-center justify-center mr-2 rounded-full ${step === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {step === 3 ? '3' : <BiSolidBriefcaseAlt2 className="w-4 h-4 text-gray-400" />}
        </div>
      )}
      ADD NOMINEE 
    </span>
  </li>

  {/* Step 4 */}
<li className={`flex mr-10 items-center ${step === 4 ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
  <span className="flex items-center">
    {step === 4 ? (
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#80CBC4] mr-3 text-white">
        <AiOutlineCheck className="w-4 h-4" />
      </div>
    ) : (
      <div className={`w-8 h-8 flex items-center justify-center mr-2 rounded-full ${step === 4 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
        <AiOutlineFile className="w-4 h-4 text-gray-400" />
      </div>
    )}
    ADD DOCUMENTS
  </span>
</li>
</ol>


     {step === 1 && (
    <div className="shadow-lg px-12 py-12 bg-[#FAFAFA] space-y-6 mb-6">
      
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
          <label htmlFor="officeCode" className="block mb-1 text-sm font-medium text-gray-900">
            OFFICE CODE & NAME
          </label>
          <input
            type="text"
            name="officeCode"
            value={formData?.officeCode}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>
       <div>
        <label className="block mb-1 text-sm font-medium">Design</label>
        <select
          name="design"
          value={formData?.design}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 rounded w-full p-2 text-sm"
          required
        >
          <option value="">Select Design</option>
          {salesRanks.map((rank) => (
            <option key={rank.id} value={rank.code}>
              {rank?.name}
            </option>
          ))}
        </select>
      </div>

        <div>
          <label htmlFor="applicantName" className="block mb-1 text-sm font-medium text-gray-900">
            APPLICANT NAME
          </label>
          <input
            type="text"
            name="applicantName"
            value={formData?.applicantName}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>


          <div>
          <label htmlFor="nameBangla" className="block mb-1 text-sm font-medium text-gray-900">
            APPLICANT NAME (BANGLA)
          </label>
          <input
            type="text"
            name="nameBangla"
            value={formData?.nameBangla}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>

        
       
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
         
        <div>
          <label htmlFor="fatherName" className="block mb-0 text-sm font-medium text-gray-900">
            FATHER'S NAME
          </label>
          <input
            type="text"
            name="fatherName"
            value={formData?.fatherName}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="motherName" className="block mb-1 text-sm font-medium text-gray-900">
            MOTHER'S NAME
          </label>
          <input
            type="text"
            name="motherName"
            value={formData?.motherName}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-900">
            EMAIL
          </label>
          <input
            type="email"
            name="email"
            value={formData?.email}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-900">
            MOBILE
          </label>
          <input
            type="text"
            name="phone"
            value={formData?.phone}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor="nid" className="block mb-1 text-sm font-medium text-gray-900">
            NID NUMBER
          </label>
          <input
            type="text"
            name="nid"
            value={formData?.nid}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="dob" className="block mb-1 text-sm font-medium text-gray-900">
            DATE OF BIRTH
          </label>
          <input
            type="date"
            name="dob"
            value={formData?.dob}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>

    <div>
    <label
      htmlFor="marital_status"
      className="block mb-1 text-sm font-medium text-gray-900"
    >
      MARITAL STATUS
    </label>
    <select
      name="marital_status"
      value={formData.marital_status}
      onChange={handleChange}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
      required
    >
      <option value="">Select Marital Status</option>
      <option value="single">Single</option>
      <option value="married">Married</option>
      <option value="divorced">Divorced</option>
      <option value="widowed">Widowed</option>
    </select>
  </div>
    <div>
    <label
      htmlFor="religion"
      className="block mb-1 text-sm font-medium text-gray-900"
    >
      RELIGION
    </label>
    <select
      name="religion"
      value={formData.religion}
      onChange={handleChange}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
      required
    >
      <option value="">Select Religion</option>
      <option value="islam">Islam</option>
      <option value="hinduism">Hinduism</option>
      <option value="christianity">Christianity</option>
      <option value="buddhism">Buddhism</option>
      <option value="others">Others</option>
    </select>
  </div>

      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-900">
            GENDER
          </label>
          <select
            name="gender"
            value={formData?.gender}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label htmlFor="country" className="block mb-1 text-sm font-medium text-gray-900">
            COUNTRY
          </label>
          <input
            type="text"
            name="country"
            value={formData?.country}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>
          <div>
          <label htmlFor="city" className="block mb-1 text-sm font-medium text-gray-900">
            CITY
          </label>
          <input
            type="text"
            name="city"
            value={formData?.city}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="zip" className="block mb-1 text-sm font-medium text-gray-900">
            ZIP
          </label>
          <input
            type="text"
            name="zip"
            value={formData?.zip}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            required
          />
        </div>
      </div>

  

      {/* Address Full Width */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {/* Present Address */}
    <div>
      <label
        htmlFor="present_address"
        className="block mb-1 text-sm font-medium text-gray-900"
      >
        PRESENT ADDRESS
      </label>
      <textarea
        id="present_address"
        name="present_address"
        value={formData?.present_address}
        onChange={handleChange}
        className="h-20 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
        placeholder="Enter your present address"
        rows="4"
        required
      />
    </div>

    {/* Permanent Address */}
    <div>
      <label
        htmlFor="permanent_address"
        className="block mb-1 text-sm font-medium text-gray-900"
      >
        PERMANENT ADDRESS
      </label>
      <textarea
        id="permanent_address"
        name="permanent_address"
        value={formData?.permanent_address}
        onChange={handleChange}
        className="h-20 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
        placeholder="Enter your permanent address"
        rows="4"
        required
      />
    </div>
  </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {/* Bank Account */}
    <div>
      <label
        htmlFor="bank_ac"
        className="block mb-1 text-sm font-medium text-gray-900"
      >
        BANK ACCOUNT
      </label>
      <input
        type="text"
        name="bank_ac"
        value={formData.bank_ac}
        onChange={handleChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
        placeholder="Enter Bank Account Number"
        required
      />
    </div>

    {/* Bank Name */}
    <div>
      <label
        htmlFor="bank_name"
        className="block mb-1 text-sm font-medium text-gray-900"
      >
        BANK NAME
      </label>
      <input
        type="text"
        name="bank_name"
        value={formData.bank_name}
        onChange={handleChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
        placeholder="Enter Bank Name"
        required
      />
    </div>

    {/* Branch */}
    <div>
      <label
        htmlFor="branch"
        className="block mb-1 text-sm font-medium text-gray-900"
      >
        BRANCH
      </label>
      <input
        type="text"
        name="branch"
        value={formData.branch}
        onChange={handleChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
        placeholder="Enter Branch Name"
        required
      />
    </div>

    {/* Routing No */}
    <div>
      <label
        htmlFor="routing_no"
        className="block mb-1 text-sm font-medium text-gray-900"
      >
        ROUTING NO
      </label>
      <input
        type="text"
        name="routing_no"
        value={formData.routing_no}
        onChange={handleChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
        placeholder="Enter Routing Number"
        required
      />
    </div>
  </div>

    </div>
    )}


      {step === 2 && (
     <div className="shadow-lg px-12 py-12 bg-[#fff] space-y-4 mb-4">
     <p className="text-[#0097A7]">EDUCATIONAL DETAILS</p>
     <div className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-4">
       <div>
         <label
           htmlFor="institution"
           className="block mb-2 text-sm font-medium text-gray-900 dark:text-dark"
         >
           INSTITUTION NAME
         </label>
         <input
           type="text"
           name="institution"
           value={formDatas.institution}
           onChange={handleChanges}
           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
           placeholder="Institution Name"
           required
         />
       </div>

       <div>
         <label
           htmlFor="degree"
           className="block mb-2 text-sm font-medium text-gray-900 dark:text-dark"
         >
           EDUCATION LEVEL
         </label>
         <select
           name="degree"
           value={formDatas.degree}
           onChange={handleChanges}
           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
           required
         >
           <option value="" disabled selected>
             Select your education level
           </option>
           <option value="jsc">JSC</option>
           <option value="ssc">SSC</option>
           <option value="hsc">HSC</option>
           <option value="diploma">Diploma</option>
           <option value="bsc">BSc</option>
           <option value="msc">MSc</option>
         </select>
       </div>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-3 justify-center gap-4">
       <div>
         <label
           htmlFor="gpa"
           className="block mb-1 text-sm font-medium text-gray-900 dark:text-dark"
         >
           TYPE GPA/CGPA
         </label>
         <input
           type="text"
           name="cgpa"
           value={formDatas.cgpa}
           onChange={handleChanges}
           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
           placeholder="GPA/CGPA"
           required
         />
       </div>

       <div>
         <label
           htmlFor="passingYear"
           className="block mb-1 text-sm font-medium text-gray-900 dark:text-dark"
         >
           PASSING YEAR
         </label>
         <select
           name="passing_year"
           value={formDatas.passing_year}
           onChange={handleChanges}
           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
           required
         >
           <option value="">Select Year</option>
           {years?.map((year) => (
             <option key={year} value={year}>
               {year}
             </option>
           ))}
         </select>
       </div>

       <div>
         <label
           htmlFor="board"
           className="block mb-1 text-sm font-medium text-gray-900 dark:text-dark"
         >
           BOARD
         </label>
         <select
           name="board"
           value={formDatas.board}
           onChange={handleChanges}
           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
           required
         >
           <option value="">Select Board</option>
           {boards?.map((board, index) => (
             <option key={index} value={board}>
               {board}
             </option>
           ))}
         </select>
       </div>
     </div>

     <div className="text-right">
     <button 
     onClick={handleAdd}
       className='w-8 h-8  items-center justify-center rounded bg-[#0097A7] text-white'>
       <AiOutlinePlus className="w-6 pl-2 h-6 text-white" />
     </button>
     </div>


     {/* Display added educational data */}
     <div className="mt-6">
  {educationalData?.length > 0 && (
    <table className="min-w-full bg-white border border-gray-300">
      <thead>
        <tr>
          <th className="px-4 py-2 border">#</th>
          <th className="px-4 py-2 border">Institution Name</th>
          <th className="px-4 py-2 border">Education Level</th>
          <th className="px-4 py-2 border">GPA/CGPA</th>
          <th className="px-4 py-2 border">Passing Year</th>
          <th className="px-4 py-2 border">Board</th>
          <th className="px-4 py-2 border">Action</th> {/* New column for delete button */}
        </tr>
      </thead>
      <tbody>
        {educationalData?.map((edu, index) => (
          <tr key={index}>
            <td className="px-4 py-2 border text-center">{index + 1}</td>
            <td className="px-4 py-2 border">{edu?.institution}</td>
            <td className="px-4 py-2 border">{edu?.degree}</td>
            <td className="px-4 py-2 border">{edu?.cgpa}</td>
            <td className="px-4 py-2 border">{edu?.passing_year}</td>
            <td className="px-4 py-2 border">{edu?.board}</td>
            <td className="px-4 py-2 border text-center">
              <button
                onClick={() => handleRemove(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td> {/* Add delete button */}
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>


   </div>
        
        
      )}

      {step === 3 && (
   
        <div className="shadow-lg px-12 py-12 bg-[#fff] space-y-4 mb-4">
       <p className="text-[#0097A7]">NOMINEE DETAILS</p>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-4">
         <div>
           <label className="block mb-2 text-sm font-medium text-gray-900">NOMINEE NAME</label>
           <input type="text" 
             name="name" 
             value={nomineeData?.name} 
             onChange={handleExperienceChange} 
             className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-2" 
             required />
         </div>
     
         <div>
           <label className="block mb-1 text-sm font-medium text-gray-900">MOBILE</label>
           <input type="text" 
             name="mobile" 
             value={nomineeData?.mobile} 
             onChange={handleExperienceChange} 
             className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-2" 
             required />
         </div>
         
         <div>
           <label className="block mb-1 text-sm font-medium text-gray-900">RELATION</label>
           <input type="text" 
             name="relation" 
             value={nomineeData?.relation} 
             onChange={handleExperienceChange} 
             className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-2" 
             required />
         </div>
              <div>
           <label className="block mb-1 text-sm font-medium text-gray-900">ADDRESS</label>
           <input type="text" 
             name="address" 
             value={nomineeData?.address} 
             onChange={handleExperienceChange} 
             className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-2" 
             required />
         </div>
       </div>
     
     
     
       <div className="text-end">
         <button 
           onClick={handleAddExperience}
           className="w-8 h-8 items-center justify-center rounded bg-[#0097A7] text-white">
           <AiOutlinePlus className="w-6 pl-2 h-6 text-white" />
         </button>
       </div>


       <div className="mt-6">
  {nomineeList?.length > 0 && (
    <table className="min-w-full bg-white border border-gray-300">
      <thead>
        <tr>
          <th className="px-4 py-2 border">#</th>
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Mobile</th>
          <th className="px-4 py-2 border">Relation</th>
          <th className="px-4 py-2 border">Address</th>

          <th className="px-4 py-2 border">Action</th> {/* Added Action column */}
        </tr>
      </thead>
      <tbody>
        {nomineeList?.map((nomm, index) => (
          <tr key={index}>
            <td className="px-4 py-2 border text-center">{index + 1}</td>
            <td className="px-4 py-2 border">{nomm?.name}</td>
            <td className="px-4 py-2 border">{nomm?.mobile}</td>
            <td className="px-4 py-2 border">{nomm?.relation}</td>
            <td className="px-4 py-2 border">{nomm?.address}</td>
     
            <td className="px-4 py-2 border text-center">
              <button 
                onClick={() => handleRemoveExperience(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                DELETE
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>




     </div>
      )}
      
{step === 4 && (
  <div className="shadow-lg px-12 py-12 bg-white space-y-6 mb-6">
    <p className="text-[#0097A7] font-semibold text-lg">PHOTO & SIGNATURE UPLOAD</p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Photo Upload */}
      <div className="relative">
        <label className="block mb-2 text-sm font-medium text-gray-900">Upload Photo</label>
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 cursor-pointer p-2"
        />
        {formData.photoPreview && (
          <div className="mt-2 relative w-32 h-32">
            <img
              src={formData.photoPreview}
              alt="Photo Preview"
              className="w-full h-full object-cover border rounded"
            />
            <button
              type="button"
              onClick={() => removeFile("photo")}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Signature Upload */}
      <div className="relative">
        <label className="block mb-2 text-sm font-medium text-gray-900">Upload Signature</label>
        <input
          type="file"
          name="signature"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 cursor-pointer p-2"
        />
        {formData.signaturePreview && (
          <div className="mt-2 relative w-32 h-32">
            <img
              src={formData.signaturePreview}
              alt="Signature Preview"
              className="w-full h-full object-contain border rounded"
            />
            <button
              type="button"
              onClick={() => removeFile("signature")}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}


      <div className="flex justify-between">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="py-2 px-4 text-white bg-[#00ACC1] hover:bg-[#00ACC1] rounded"
          >
            Back
          </button>
        )}
        <button
          onClick={step === 4 ? handleSubmit : handleNext}
          disabled={!validateStep(step)}
          className={`py-2 px-4 text-white rounded-md ${!validateStep(step) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#00ACC1] hover:bg-[#00ACC1]'}`}
        >
          {step === 4 ? 'Submit' : 'Next'}
        </button>
          </div>
        </div>
            </div>
            <ToastContainer />
          </main>
  
   
  
        </div>
      </div>
    );
};

export default Cardapplication;