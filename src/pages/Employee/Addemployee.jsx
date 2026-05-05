import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AiOutlineCheck } from 'react-icons/ai';
import { AiTwotoneDelete } from 'react-icons/ai';
import { FaFileAlt } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

// Base URL for the API (Replaced with a placeholder, use your actual one)
const API_BASE_URL = 'https://alhamarahomesbd.com/alhamra-backend/public/api/v1';

// --- (Initial State definitions remain the same) ---
const Addemployee = () => {
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1979 }, (_, i) => 1980 + i);

    const [bankFormData, setBankFormData] = useState({
        bank_ac: '',
        bank_name: '',
        branch: '',
        routing_no: '',
    });

    const [bankAccounts, setBankAccounts] = useState([]);
    
    const [educationFormData, setEducationFormData] = useState({
        subject: '',
        degree: '',
        level: '', 
        cgpa: '',
        passing_year: '',
        board: '',
    });

    const [educationalData, setEducationalData] = useState([]);
    const [nomineeData, setNomineeData] = useState({
        name: '',
        mobile: '',
        relation: '',
        address: '',
    });
    const [nomineeList, setNomineeList] = useState([]);
    const [step, setStep] = useState(1);

    const [errors, setErrors] = useState({});

    const handleSuperiorChange = (e) => {
        const selectedId = e.target.value;

        setFormData(prev => ({
            ...prev,
            superior_id: selectedId || '' 
        }));
    };

    const generateEmployeeCode = () => Math.floor(10000000 + Math.random() * 90000000).toString();

    const [formData, setFormData] = useState({
        employee_code: generateEmployeeCode(),
        rank: '',
        branch_id: '', 
        superior_id: '',
        full_name_en: '',
        full_name_bn: '',
        father_name: '',
        mother_name: '',
        email: '',
        mobile: '',
        national_id: '',
        date_of_birth: '',
        marital_status: '',
        spouse_name: '',
        religion: '',
        gender: '',
        nationality: '',
        district: '',
        upazila: '',
        post_code: '',
        present_address: '',
        permanent_address: '',

        documents: {
            photo: null,
            signature: null,
            cv: null,
        },
        documentPreviews: {
            photo: null,
            signature: null,
            cv: null,
        },
    });

    const token = localStorage.getItem("authToken");

    // --- React Query: Fetch Employees (for Supervisor dropdown) ---
    const { data: employees = [] } = useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE_URL}/employees?per_page=1000`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data?.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Fetch Ranks ---
    const { data: salesRanks = [] } = useQuery({
        queryKey: ["ranks"],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE_URL}/ranks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res?.data?.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Fetch Branches ---
    const { data: branches = [] } = useQuery({
        queryKey: ["branches"],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE_URL}/branches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res?.data?.data || [];
        },
        enabled: !!token,
    });

    // --- React Query: Mutation for Creating Employee ---
    const createEmployeeMutation = useMutation({
        mutationFn: async (formDataObj) => {
            const response = await axios.post(`${API_BASE_URL}/employees`, formDataObj, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }
    });

    const boards = [
        'Dhaka Board',
        'Chittagong Board',
        'Rajshahi Board',
        'Khulna Board',
        'Barisal Board',
        'Sylhet Board',
        'Comilla Board',
        'Jessore Board',
        'Mymensingh Board',
        'Dinajpur Board',
        'Madrasah Board',
        'Technical Board',
    ];

    const educationLevels = [
        'PSC/5 Pass', 'JSC/JDC/8 Pass', 'SSC/O Level/Dakhil', 'HSC/A Level/Alim',
        'Diploma', 'Bachelor/Honours', 'Master’s/Equivalent', 'Ph.D.'
    ];


    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        let newErrors = { ...errors };

        if (['full_name_en', 'full_name_bn', 'national_id', 'date_of_birth', 'mobile', 'father_name', 'mother_name', 'present_address', 'permanent_address', 'marital_status', 'religion', 'gender', 'nationality', 'rank', 'branch_id'].includes(name)) {
            if (!value.trim()) {
                newErrors[name] = 'This field is required.';
            } else {
                delete newErrors[name];
            }
        }
        
        if (name === 'email') {
            if (!value.trim()) {
                newErrors[name] = 'Email is required.';
            } else if (!validateEmail(value)) {
                newErrors[name] = 'Please enter a valid email address.';
            } else {
                delete newErrors[name];
            }
        }
        
        setErrors(newErrors);
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            const previewURL = URL.createObjectURL(file);
            setFormData((prev) => ({
                ...prev,
                documents: { ...prev.documents, [name]: file },
                documentPreviews: { ...prev.documentPreviews, [name]: previewURL },
            }));
        }
    };

    const removeFile = (name) => {
        setFormData((prev) => ({
            ...prev,
            documents: { ...prev.documents, [name]: null },
            documentPreviews: { ...prev.documentPreviews, [name]: null },
        }));
    };

    const handleChangeBank = (e) => {
        const { name, value } = e.target;
        setBankFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddBank = () => {
        if (bankFormData.bank_ac && bankFormData.bank_name && bankFormData.branch && bankFormData.routing_no) {
            setBankAccounts([...bankAccounts, { ...bankFormData, id: Date.now() }]);
            setBankFormData({
                bank_ac: '',
                bank_name: '',
                branch: '',
                routing_no: '',
            });
        } else {
            Swal.fire('Error', 'Please fill all bank account fields.', 'error');
        }
    };

    const handleRemoveBank = (idToRemove) => {
        setBankAccounts(bankAccounts.filter((account) => account.id !== idToRemove));
    };

    const handleEducationChange = (e) => {
        setEducationFormData({
            ...educationFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddEducation = () => {
        const { subject, degree, level, cgpa, passing_year, board } = educationFormData;
        
        if (!subject || !degree || !level || !cgpa || !passing_year || !board) {
            Swal.fire('Error', 'Please fill all educational fields, including the Level.', 'error');
            return;
        }
        setEducationalData([...educationalData, educationFormData]);
        
        setEducationFormData({
            subject: '',
            degree: '',
            level: '', 
            cgpa: '',
            passing_year: '',
            board: '',
        });
    };

    const handleRemoveEducation = (indexToRemove) => {
        setEducationalData(educationalData.filter((_, index) => index !== indexToRemove));
    };

    const handleNomineeChange = (e) => {
        setNomineeData({
            ...nomineeData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddNominee = () => {
        if (nomineeData.name && nomineeData.mobile && nomineeData.relation && nomineeData.address) {
            setNomineeList([...nomineeList, nomineeData]);
            setNomineeData({
                name: '',
                mobile: '',
                relation: '',
                address: '',
            });
        } else {
            Swal.fire('Error', 'Please fill all nominee fields.', 'error');
        }
    };

    const handleRemoveNominee = (indexToRemove) => {
        setNomineeList(nomineeList.filter((_, index) => index !== indexToRemove));
    };

    const validateStep = (currentStep) => {
        let newErrors = {};
        const { full_name_en, full_name_bn, email, mobile, national_id, date_of_birth, rank, branch_id, father_name, mother_name, marital_status, religion, gender, nationality } = formData;

        if (currentStep === 1) {
            if (!full_name_en?.trim()) newErrors.full_name_en = 'Full Name (English) is required.';
            if (!full_name_bn?.trim()) newErrors.full_name_bn = 'Full Name (Bengali) is required.';
            if (!father_name?.trim()) newErrors.father_name = 'Father\'s Name is required.';
            if (!mother_name?.trim()) newErrors.mother_name = 'Mother\'s Name is required.';
            if (!email?.trim()) newErrors.email = 'Email is required.';
            else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address.';
            if (!mobile?.trim()) newErrors.mobile = 'Mobile number is required.';
            if (!national_id?.trim()) newErrors.national_id = 'National ID is required.';
            if (!date_of_birth?.trim()) newErrors.date_of_birth = 'Date of Birth is required.';
            if (!rank) newErrors.rank = 'Rank is required.';
            if (!branch_id) newErrors.branch_id = 'Branch is required.'; 
            if (!marital_status) newErrors.marital_status = 'Marital Status is required.';
            if (!religion) newErrors.religion = 'Religion is required.';
            if (!gender) newErrors.gender = 'Gender is required.';
            if (!nationality) newErrors.nationality = 'Nationality is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        } else {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please correct the highlighted errors before proceeding.',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const resetFormState = () => {
        setStep(1);
        setFormData({
            employee_code: generateEmployeeCode(),
            rank: '',
            branch_id: '',
            superior_id: '',
            full_name_en: '',
            full_name_bn: '',
            father_name: '',
            mother_name: '',
            email: '',
            mobile: '',
            national_id: '',
            date_of_birth: '',
            marital_status: '',
            spouse_name: '',
            religion: '',
            gender: '',
            nationality: '',
            district: '',
            upazila: '',
            post_code: '',
            present_address: '',
            permanent_address: '',

            documents: {
                photo: null,
                signature: null,
                cv: null,
            },
            documentPreviews: {
                photo: null,
                signature: null,
                cv: null,
            },
        });

        setEducationFormData({
            subject: '',
            degree: '',
            level: '', 
            cgpa: '',
            passing_year: '',
            board: '',
        });
        setEducationalData([]);

        setBankFormData({
            bank_ac: '',
            bank_name: '',
            branch: '',
            routing_no: '',
        });
        setBankAccounts([]);

        setNomineeData({
            name: '',
            mobile: '',
            relation: '',
            address: '',
        });
        setNomineeList([]);

        setErrors({});
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(1)) {
            setStep(1); 
            Swal.fire({
                title: 'Validation Error',
                text: 'Please correct the highlighted errors in the first step.',
                icon: 'error',
            });
            return;
        }

        // Show loading spinner
        Swal.fire({
            title: 'Processing...',
            text: 'Saving employee data, please wait.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const formDataObj = new FormData();

            // Append main employee fields 
            formDataObj.append("employee_code", formData.employee_code);
            formDataObj.append("rank", formData.rank);
            formDataObj.append("branch_id", formData.branch_id); 
            formDataObj.append("full_name_bn", formData.full_name_bn);
            formDataObj.append("full_name_en", formData.full_name_en);
            formDataObj.append("father_name", formData.father_name);
            formDataObj.append("mother_name", formData.mother_name);
            formDataObj.append("national_id", formData.national_id);
            formDataObj.append("date_of_birth", formData.date_of_birth);
            formDataObj.append("gender", formData.gender);
            formDataObj.append("religion", formData.religion);
            formDataObj.append("nationality", formData.nationality);
            formDataObj.append("mobile", formData.mobile);
            formDataObj.append("email", formData.email);
            formDataObj.append("marital_status", formData.marital_status);
            formDataObj.append("spouse_name", formData.spouse_name);
            if (formData.superior_id) {
                 formDataObj.append("superior_id", parseInt(formData.superior_id));
            }
            
            formDataObj.append("password", "secret123"); // Assuming a default password for new users
   formDataObj.append("present_address", formData.present_address);
     formDataObj.append("permanent_address", formData.permanent_address);
        
            // Append bank accounts
            bankAccounts.forEach((bank, i) => {
                formDataObj.append(`banks[${i}][account_no]`, bank.bank_ac);
                formDataObj.append(`banks[${i}][account_name]`, formData.full_name_en);
                formDataObj.append(`banks[${i}][bank_name]`, bank.bank_name);
                formDataObj.append(`banks[${i}][branch]`, bank.branch);
                if (bank.routing_no) {
                    formDataObj.append(`banks[${i}][routing_no]`, bank.routing_no);
                }
            });

            // Append education
            educationalData.forEach((edu, i) => {
                formDataObj.append(`educations[${i}][exam_name]`, edu.degree);
                formDataObj.append(`educations[${i}][subject]`, edu.subject);
                formDataObj.append(`educations[${i}][level]`, edu.level); 
                formDataObj.append(`educations[${i}][result]`, edu.cgpa);
                formDataObj.append(`educations[${i}][passing_year]`, edu.passing_year);
                formDataObj.append(`educations[${i}][board_university]`, edu.board);
            });

            // Append nominees
            nomineeList.forEach((nominee, i) => {
                formDataObj.append(`nominees[${i}][name]`, nominee.name);
                formDataObj.append(`nominees[${i}][relation]`, nominee.relation);
                formDataObj.append(`nominees[${i}][phone]`, nominee.mobile);
                formDataObj.append(`nominees[${i}][address]`, nominee.address);
            });

            // Append files
            if (formData.documents.photo) formDataObj.append("photo", formData.documents.photo);
            if (formData.documents.signature) formDataObj.append("signature", formData.documents.signature);
            if (formData.documents.cv) formDataObj.append("cv", formData.documents.cv);

            // Submit form to API
            await createEmployeeMutation.mutateAsync(formDataObj);

            // Show success message
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Employee created successfully.",
            });

            resetFormState();

        } catch (error) {
            console.error("Submission failed:", error);

            let errorMessage = "Something went wrong.";

            if (error.response && error.response.status === 422 && error.response.data) {
                const apiData = error.response.data;
                if (apiData.errors) {
                    const messages = [];
                    for (const field in apiData.errors) {
                        if (apiData.errors.hasOwnProperty(field)) {
                            apiData.errors[field].forEach(msg => {
                                const formattedField = field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                                messages.push(`<li><strong>${formattedField}:</strong> ${msg}</li>`);
                            });
                        }
                    }
                    errorMessage = `<strong>${apiData.message || 'Validation Errors Found:'}</strong><br><ul style="text-align:left; padding-left: 20px;">${messages.join("")}</ul>`;
                } else if (apiData.message) {
                    errorMessage = apiData.message;
                }
            }
            else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                title: "Submission Failed",
                html: errorMessage,
                icon: "error",
            });

        }
    };


    return (
        // **********************************
        // Design Updates:
        // - Main background is now a light slate-50/gray-50 color.
        // - Form sections use `bg-white` with `shadow-xl` for a cleaner, elevated look.
        // - Stepper uses a nice teal/cyan color gradient.
        // **********************************
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow bg-gray-50"> {/* Main content background color */}
                    <div className="px-4 sm:px-6 lg:px-6 py-8 w-full max-w-7xl mx-auto">
                        <div className="mx-auto">
                            
                            {/* Stepper */}
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                                <ol className="flex items-center justify-between w-full text-sm font-semibold text-gray-500">
                                    {/* Step 1 */}
                                    <li
                                        className={`flex items-center flex-col transition-colors duration-300 ${step >= 1 ? 'text-[#00ACC1]' : ''}`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full border-4 border-current flex items-center justify-center mb-2 ${step >= 1 ? 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-transparent shadow-md' : 'bg-gray-200 text-gray-500 border-gray-300'}`}
                                        >
                                            {step > 1 ? <AiOutlineCheck className="w-5 h-5" /> : 1}
                                        </div>
                                        <span className="text-sm">Basic Info</span>
                                    </li>

                                    <li className="flex-1 w-20 mx-4 h-1 bg-gray-200 rounded-full" />

                                    {/* Step 2 */}
                                    <li
                                        className={`flex items-center flex-col transition-colors duration-300 ${step >= 2 ? 'text-[#00ACC1]' : ''}`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full border-4 border-current flex items-center justify-center mb-2 ${step >= 2 ? 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-transparent shadow-md' : 'bg-gray-200 text-gray-500 border-gray-300'}`}
                                        >
                                            {step > 2 ? <AiOutlineCheck className="w-5 h-5" /> : 2}
                                        </div>
                                        <span className="text-sm text-center">
                                            Education & Bank
                                        </span>
                                    </li>

                                    <li className="flex-1 w-20 mx-4 h-1 bg-gray-200 rounded-full" />

                                    {/* Step 3 */}
                                    <li
                                        className={`flex items-center flex-col transition-colors duration-300 ${step >= 3 ? 'text-[#00ACC1]' : ''}`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full border-4 border-current flex items-center justify-center mb-2 ${step >= 3 ? 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-transparent shadow-md' : 'bg-gray-200 text-gray-500 border-gray-300'}`}
                                        >
                                            {step > 3 ? <AiOutlineCheck className="w-5 h-5" /> : 3}
                                        </div>
                                        <span className="text-sm">Add Nominee</span>
                                    </li>

                                    <li className="flex-1 w-20 mx-4 h-1 bg-gray-200 rounded-full" />

                                    {/* Step 4 */}
                                    <li
                                        className={`flex items-center flex-col transition-colors duration-300 ${step >= 4 ? 'text-[#00ACC1]' : ''}`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full border-4 border-current flex items-center justify-center mb-2 ${step >= 4 ? 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white border-transparent shadow-md' : 'bg-gray-200 text-gray-500 border-gray-300'}`}
                                        >
                                            {step > 4 ? <AiOutlineCheck className="w-5 h-5" /> : 4}
                                        </div>
                                        <span className="text-sm">Documents</span>
                                    </li>
                                </ol>
                            </div>

                            {/* Form Content based on step */}
                            <form onSubmit={handleSubmit}>
                                {/* Step 1: Basic Info */}
                                {step === 1 && (
                                    <div className="bg-white shadow-xl p-8 rounded-xl border border-gray-100">
                                        <h2 className="text-2xl font-extrabold text-[#024453] mb-6 border-b pb-3">
                                            Personal Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            
                                            {/* Employee Code */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Employee Code
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        name="employee_code"
                                                        value={formData.employee_code}
                                                        disabled
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, employee_code: generateEmployeeCode() }))}
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200"
                                                        title="Generate New Code"
                                                    >
                                                        ↻
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Rank */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Rank <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="rank"
                                                    value={formData.rank}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.rank ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                >
                                                    <option value="">Select a rank</option>
                                                    {salesRanks?.map((rank) => (
                                                        <option key={rank?.id} value={rank?.code}>
                                                            {rank?.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.rank && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.rank}</p>
                                                )}
                                            </div>

                                            {/* Branch */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Branch <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="branch_id"
                                                    value={formData.branch_id}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.branch_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                >
                                                    <option value="">Select a branch</option>
                                                    {branches.map((branch) => (
                                                        <option key={branch?.id} value={branch?.id}>
                                                            {branch?.name} - ({branch?.code})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.branch_id && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.branch_id}</p>
                                                )}
                                            </div>

                                            {/* Superior/Supervisor */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Supervisor/Superior
                                                </label>
                                                <select
                                                    name="superior_id"
                                                    value={formData.superior_id}
                                                    onChange={handleSuperiorChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800"
                                                >
                                                    <option value="">Select a Supervisor</option>
                                                    {employees?.map((employee) => (
                                                        <option key={employee?.id} value={employee?.id}>
                                                            {`${employee?.full_name_en} - ${employee?.rank} (${employee?.employee_code})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {/* Full Name (English) */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Full Name (English) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="full_name_en"
                                                    value={formData.full_name_en}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.full_name_en ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.full_name_en && <p className="text-red-500 text-sm mt-1">{errors.full_name_en}</p>}
                                            </div>

                                            {/* Full Name (Bengali) */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Full Name (Bengali) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="full_name_bn"
                                                    value={formData.full_name_bn}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.full_name_bn ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.full_name_bn && <p className="text-red-500 text-sm mt-1">{errors.full_name_bn}</p>}
                                            </div>

                                            {/* Father's Name */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Father's Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="father_name"
                                                    value={formData.father_name}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.father_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.father_name && <p className="text-red-500 text-sm mt-1">{errors.father_name}</p>}
                                            </div>

                                            {/* Mother's Name */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Mother's Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="mother_name"
                                                    value={formData.mother_name}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.mother_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.mother_name && <p className="text-red-500 text-sm mt-1">{errors.mother_name}</p>}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                            </div>

                                            {/* Mobile */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Mobile <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="mobile"
                                                    value={formData.mobile}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                                            </div>

                                            {/* National ID */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    National ID <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="national_id"
                                                    value={formData.national_id}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.national_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.national_id && <p className="text-red-500 text-sm mt-1">{errors.national_id}</p>}
                                            </div>

                                            {/* Date of Birth */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Date of Birth <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date_of_birth"
                                                    value={formData.date_of_birth}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.date_of_birth ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                                            </div>

                                            {/* Marital Status */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Marital Status <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="marital_status"
                                                    value={formData.marital_status}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.marital_status ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                >
                                                    <option value="">Select status</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Divorced">Divorced</option>
                                                    <option value="Widowed">Widowed</option>
                                                </select>
                                                {errors.marital_status && <p className="text-red-500 text-sm mt-1">{errors.marital_status}</p>}
                                            </div>

                                            {/* Spouse Name (Conditional) */}
                                            {formData.marital_status === 'Married' && (
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-1">
                                                        Spouse Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="spouse_name"
                                                        value={formData.spouse_name}
                                                        onChange={handleChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800"
                                                    />
                                                </div>
                                            )}

                                            {/* Religion */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Religion <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="religion"
                                                    value={formData.religion}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.religion ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                >
                                                    <option value="">Select religion</option>
                                                    <option value="Islam">Islam</option>
                                                    <option value="Hinduism">Hinduism</option>
                                                    <option value="Buddhism">Buddhism</option>
                                                    <option value="Christianity">Christianity</option>
                                                </select>
                                                {errors.religion && <p className="text-red-500 text-sm mt-1">{errors.religion}</p>}
                                            </div>

                                            {/* Gender */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Gender <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                                            </div>

                                            {/* Nationality */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Nationality <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="nationality"
                                                    value={formData.nationality}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.nationality ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                >
                                                    <option value="">Select nationality</option>
                                                    <option value="Bangladeshi">Bangladeshi</option>
                                                    <option value="Foreigner">Foreigner</option>
                                                </select>
                                                {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-[#024453] mt-10 mb-4 border-t pt-4">
                                            Address Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* District */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">District</label>
                                                <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            {/* Upazila */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Upazila</label>
                                                <input type="text" name="upazila" value={formData.upazila} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            {/* Post Code */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Post Code</label>
                                                <input type="text" name="post_code" value={formData.post_code} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                            {/* Present Address */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Present Address <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    name="present_address"
                                                    value={formData.present_address}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.present_address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.present_address && <p className="text-red-500 text-sm mt-1">{errors.present_address}</p>}
                                            </div>
                                            {/* Permanent Address */}
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">
                                                    Permanent Address <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    name="permanent_address"
                                                    value={formData.permanent_address}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${errors.permanent_address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00ACC1]'}`}
                                                    required
                                                />
                                                {errors.permanent_address && <p className="text-red-500 text-sm mt-1">{errors.permanent_address}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Education & Bank */}
                                {step === 2 && (
                                    <div className="bg-white shadow-xl p-8 rounded-xl border border-gray-100">
                                        {/* Education Section */}
                                        <h2 className="text-2xl font-extrabold text-[#024453] mb-6 border-b pb-3">
                                            Educational Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Level *</label>
                                                <select name="level" value={educationFormData.level} onChange={handleEducationChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800">
                                                    <option value="">Select Level</option>
                                                    {educationLevels.map((level, index) => (
                                                        <option key={index} value={level}>{level}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Exam Name/Degree *</label>
                                                <input type="text" name="degree" value={educationFormData.degree} onChange={handleEducationChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" placeholder="e.g. B.Sc." />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Subject/Group *</label>
                                                <input type="text" name="subject" value={educationFormData.subject} onChange={handleEducationChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" placeholder="e.g. Computer Science" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Result (CGPA/GPA) *</label>
                                                <input type="text" name="cgpa" value={educationFormData.cgpa} onChange={handleEducationChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" placeholder="e.g. 3.50/5.00" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Passing Year *</label>
                                                <select name="passing_year" value={educationFormData.passing_year} onChange={handleEducationChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800">
                                                    <option value="">Select Year</option>
                                                    {years.reverse().map((year) => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Board/University *</label>
                                                <select name="board" value={educationFormData.board} onChange={handleEducationChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800">
                                                    <option value="">Select Board</option>
                                                    {boards.map((board, index) => (
                                                        <option key={index} value={board}>{board}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="button" onClick={handleAddEducation} className="bg-[#00ACC1] hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md">
                                                Add Education
                                            </button>
                                        </div>

                                        {/* Education Table */}
                                        {educationalData.length > 0 && (
                                            <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="min-w-full bg-white border-collapse">
                                                    <thead className="bg-gray-50 border-b">
                                                        <tr>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Degree</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Result</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Board</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {educationalData.map((edu, index) => (
                                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                                <td className="py-3 px-4 text-sm text-gray-700">{edu.level}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{edu.degree}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{edu.subject}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{edu.cgpa}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{edu.passing_year}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{edu.board}</td>
                                                                <td className="py-3 px-4">
                                                                    <button type="button" onClick={() => handleRemoveEducation(index)} className="text-red-500 hover:text-red-700 transition duration-150">
                                                                        <AiTwotoneDelete className="w-5 h-5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Bank Account Section */}
                                        <h2 className="text-2xl font-extrabold text-[#024453] mt-10 mb-6 border-b pb-3">
                                            Bank Account Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Account No. *</label>
                                                <input type="text" name="bank_ac" value={bankFormData.bank_ac} onChange={handleChangeBank} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Bank Name *</label>
                                                <input type="text" name="bank_name" value={bankFormData.bank_name} onChange={handleChangeBank} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Branch *</label>
                                                <input type="text" name="branch" value={bankFormData.branch} onChange={handleChangeBank} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Routing No. *</label>
                                                <input type="text" name="routing_no" value={bankFormData.routing_no} onChange={handleChangeBank} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="button" onClick={handleAddBank} className="bg-[#00ACC1] hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md">
                                                Add Bank Account
                                            </button>
                                        </div>

                                        {/* Bank Account Table */}
                                        {bankAccounts.length > 0 && (
                                            <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="min-w-full bg-white border-collapse">
                                                    <thead className="bg-gray-50 border-b">
                                                        <tr>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">A/C No.</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bank Name</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Branch</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Routing No.</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bankAccounts.map((account) => (
                                                            <tr key={account.id} className="border-b hover:bg-gray-50">
                                                                <td className="py-3 px-4 text-sm text-gray-700">{account.bank_ac}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{account.bank_name}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{account.branch}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{account.routing_no}</td>
                                                                <td className="py-3 px-4">
                                                                    <button type="button" onClick={() => handleRemoveBank(account.id)} className="text-red-500 hover:text-red-700 transition duration-150">
                                                                        <AiTwotoneDelete className="w-5 h-5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 3: Nominee */}
                                {step === 3 && (
                                    <div className="bg-white shadow-xl p-8 rounded-xl border border-gray-100">
                                        <h2 className="text-2xl font-extrabold text-[#024453] mb-6 border-b pb-3">
                                            Nominee Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Nominee Name *</label>
                                                <input type="text" name="name" value={nomineeData.name} onChange={handleNomineeChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Mobile *</label>
                                                <input type="text" name="mobile" value={nomineeData.mobile} onChange={handleNomineeChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Relation *</label>
                                                <input type="text" name="relation" value={nomineeData.relation} onChange={handleNomineeChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-1">Address *</label>
                                                <textarea name="address" value={nomineeData.address} onChange={handleNomineeChange} rows="1" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white text-gray-800" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="button" onClick={handleAddNominee} className="bg-[#00ACC1] hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md">
                                                Add Nominee
                                            </button>
                                        </div>

                                        {/* Nominee Table */}
                                        {nomineeList.length > 0 && (
                                            <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="min-w-full bg-white border-collapse">
                                                    <thead className="bg-gray-50 border-b">
                                                        <tr>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Relation</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {nomineeList.map((nominee, index) => (
                                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                                <td className="py-3 px-4 text-sm text-gray-700">{nominee.name}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{nominee.mobile}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{nominee.relation}</td>
                                                                <td className="py-3 px-4 text-sm text-gray-700">{nominee.address}</td>
                                                                <td className="py-3 px-4">
                                                                    <button type="button" onClick={() => handleRemoveNominee(index)} className="text-red-500 hover:text-red-700 transition duration-150">
                                                                        <AiTwotoneDelete className="w-5 h-5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 4: Documents */}
                                {step === 4 && (
                                    <div className="bg-white shadow-xl p-8 rounded-xl border border-gray-100">
                                        <h2 className="text-2xl font-extrabold text-[#024453] mb-6 border-b pb-3">
                                            Upload Documents
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Photo Upload */}
                                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <label className="block text-gray-700 font-semibold mb-2">Photo</label>
                                                <input type="file" name="photo" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                                                {formData.documentPreviews.photo && (
                                                    <div className="mt-3 flex items-center space-x-2">
                                                        <img src={formData.documentPreviews.photo} alt="Photo Preview" className="h-16 w-16 object-cover rounded-md border" />
                                                        <button type="button" onClick={() => removeFile('photo')} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Signature Upload */}
                                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <label className="block text-gray-700 font-semibold mb-2">Signature</label>
                                                <input type="file" name="signature" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                                                {formData.documentPreviews.signature && (
                                                    <div className="mt-3 flex items-center space-x-2">
                                                        <img src={formData.documentPreviews.signature} alt="Signature Preview" className="h-16 w-16 object-contain rounded-md border" />
                                                        <button type="button" onClick={() => removeFile('signature')} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CV Upload */}
                                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <label className="block text-gray-700 font-semibold mb-2">CV / Resume (PDF)</label>
                                                <input type="file" name="cv" accept=".pdf" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                                                {formData.documentPreviews.cv && (
                                                    <div className="mt-3 flex items-center space-x-2">
                                                        <FaFileAlt className="h-8 w-8 text-red-500" />
                                                        <span className="text-sm font-medium text-gray-700">CV Uploaded</span>
                                                        <button type="button" onClick={() => removeFile('cv')} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="mt-8 flex justify-between">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-md"
                                        >
                                            &larr; Back
                                        </button>
                                    )}

                                    {step < 4 && (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="bg-[#00ACC1] hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 ml-auto shadow-md"
                                        >
                                            Next &rarr;
                                        </button>
                                    )}

                                    {step === 4 && (
                                        <button
                                            type="submit"
                                            className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 ml-auto shadow-md ${createEmployeeMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={createEmployeeMutation.isLoading}
                                        >
                                            {createEmployeeMutation.isLoading ? (
                                                <span className="flex items-center">
                                                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                                                    Submitting...
                                                </span>
                                            ) : (
                                                'Submit Employee'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Addemployee;