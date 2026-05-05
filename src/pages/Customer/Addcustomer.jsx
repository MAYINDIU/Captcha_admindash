import React, { useState, useEffect } from 'react';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import logo from '../../images/logo_p.jpg';
import Swal from 'sweetalert2';

const AddCustomer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;



const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
  

    useEffect(() => {
        // Fetch employees when the component mounts
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error("No authentication token found.");
                    setLoading(false);
                    return;
                }

                const response = await fetch('https://pleasurebd.com/pleasure-backend/public/api/v1/employees', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                if (result.status && result.data.data) {
                    setEmployees(result.data?.data);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    const handleSelectChange = (e) => {
        // Find the selected employee's ID from the dropdown value
        updateFormData('order', 'sales_officer_id', e.target.value);
    };



  const [plans, setPlans] = useState([]);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [formData, setFormData] = useState({
    plan_id: '',
    issue_date: '',
    physical_card_no: '',
    price: '',
    start_date: '',
    end_date: '',
    customer: {
      first_name: '',
      last_name: '',
      full_name_bn: '',
      full_name_en: '',
      phone: '',
      email: '',
      national_id: '',
      dob: '',
      gender: '',
      present_address: '',
      permanent_address: '',
      city: '',
      district: '',
      postal_code: '',
      fathers_name: '',
      mothers_name: '',
      occupation: '',
      marital_status: '',
    },
    members: [{ name: '', relationship: '', dob: '' }],
    nominee: {
      name: '',
      relationship: '',
      phone: '',
      address: '',
    },
    order: {
      order_type: '',
      membership_id: '',
      sales_officer_id: '',
    },
    payment: {
      gateway_id: '',
      transaction_id: '',
      amount: '',
    },
  });

  console.log(formData?.order?.sales_officer_id)
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch plans from API on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('https://pleasurebd.com/pleasure-backend/public/api/v1/plans');
        if (response.ok) {
          const result = await response.json();
          setPlans(result.data);
        } else {
          console.error('Failed to fetch plans:', response.statusText);
        }
      } catch (error) {
        console.error('Network error fetching plans:', error);
      }
    };
    fetchPlans();
  }, []);

  // Fetch payment gateways from API on component mount
  useEffect(() => {
    const fetchPaymentGateways = async () => {
      try {
        const response = await fetch('https://pleasurebd.com/pleasure-backend/public/api/v1/payment-gateways');
        if (response.ok) {
          const result = await response.json();
          const cashOption = { id: 1, display_name: 'Cash' };
          setPaymentGateways([cashOption, ...result]);
        } else {
          console.error('Failed to fetch payment gateways:', response.statusText);
        }
      } catch (error) {
        console.error('Network error fetching payment gateways:', error);
      }
    };
    fetchPaymentGateways();
  }, []);

  // Helper functions to update nested state
  const updateFormData = (section, key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [key]: value,
      },
    }));
  };

  const updateTopLevelData = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const updateDynamicList = (section, index, key, value) => {
    setFormData((prevData) => {
      const newList = [...prevData[section]];
      newList[index] = { ...newList[index], [key]: value };
      return { ...prevData, [section]: newList };
    });
  };

  const addDynamicItem = (section) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: [...prevData[section], { name: '', relationship: '', dob: '' }],
    }));
  };

  const removeDynamicItem = (section, index) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: prevData[section].filter((_, i) => i !== index),
    }));
  };

  // Logic to handle plan selection and auto-filling
  const handlePlanSelect = (e) => {
    const selectedPlanId = e.target.value;
    const selectedPlan = plans.find(plan => plan.id.toString() === selectedPlanId);

    if (selectedPlan) {
      updateTopLevelData('plan_id', selectedPlan.id);
      updateTopLevelData('price', selectedPlan.price);
      //  <-- CRITICAL CHANGE: Set the payment amount to the plan price
      setFormData(prevData => ({
        ...prevData,
        price: selectedPlan.price,
        payment: {
          ...prevData.payment,
          amount: selectedPlan.price,
        },
      }));
      const randomCardNumber = Math.floor(1000 + Math.random() * 9000);
      updateTopLevelData('physical_card_no', `PBL0001${randomCardNumber}`);
      const today = new Date().toISOString().slice(0, 10);
      updateTopLevelData('issue_date', today);
    } else {
      updateTopLevelData('plan_id', '');
      updateTopLevelData('price', '');
      updateTopLevelData('physical_card_no', '');
      updateTopLevelData('issue_date', '');
      setFormData(prevData => ({
        ...prevData,
        price: '',
        payment: {
          ...prevData.payment,
          amount: '',
        },
      }));
    }
  };

  const handlePaymentGatewaySelect = (e) => {
    const gatewayId = e.target.value;
    updateFormData('payment', 'gateway_id', gatewayId);
    if (gatewayId === '1') {
      updateFormData('payment', 'transaction_id', '');
    }
  };

  const validateStep = (currentStep) => {
    const errors = {};
    let hasErrors = false;

    switch (currentStep) {
      case 1:
        if (!formData.customer.first_name) errors.first_name = 'First Name is required.';
        if (!formData.customer.full_name_bn) errors.full_name_bn = 'Full Name (Bangla) is required.';
        if (!formData.customer.phone) errors.phone = 'Mobile is required.';
        if (!formData.customer.national_id) errors.national_id = 'NID is required.';
        if (!formData.customer.present_address) errors.present_address = 'Present Address is required.';
        if (!formData.customer.city) errors.city = 'City is required.';
        if (!formData.customer.district) errors.district = 'District is required.';
        if (!formData.customer.postal_code) errors.postal_code = 'Postal Code is required.';
        break;
      case 2:
        if (!formData.plan_id) errors.plan_id = 'Plan is required.';
        if (!formData.issue_date) errors.issue_date = 'Issue Date is required.';
        break;
      case 3:
        if (formData.members.length === 0 || formData.members.some(member => !member.name || !member.relationship)) {
          errors.members = 'Name and Relationship are required for all members. At least one member is required.';
        }
        if (!formData.nominee.name || !formData.nominee.relationship || !formData.nominee.phone || !formData.nominee.address) {
          errors.nominee = 'All nominee fields are required.';
        }
        break;
      case 4:
        if (!formData.order.order_type) errors.order_type = 'Order Type is required.';
        break;
      case 5:
        if (!formData.payment.gateway_id) errors.gateway_id = 'Payment Method is required.';
        //  <-- CRITICAL CHANGE: Validation now checks formData.price instead of formData.payment.amount
        if (!formData.price) errors.amount = 'Amount is required.';
        break;
      default:
        break;
    }

    setValidationErrors(errors);
    hasErrors = Object.keys(errors).length > 0;
    return !hasErrors;
  };

  useEffect(() => {
    validateStep(step);
  }, [formData, step]);

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
        setMessage(null);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setMessage(null);
    }
  };

  const resetForm = () => {
    setFormData({
      plan_id: '',
      issue_date: '',
      physical_card_no: '',
      price: '',
      start_date: '',
      end_date: '',
      customer: {
        first_name: '',
        last_name: '',
        full_name_bn: '',
        full_name_en: '',
        phone: '',
        email: '',
        national_id: '',
        dob: '',
        gender: '',
        present_address: '',
        permanent_address: '',
        city: '',
        district: '',
        postal_code: '',
        fathers_name: '',
        mothers_name: '',
        occupation: '',
        marital_status: '',
      },
      members: [{ name: '', relationship: '', dob: '' }],
      nominee: {
        name: '',
        relationship: '',
        phone: '',
        address: '',
      },
      order: {
        order_type: '',
        membership_id: '',
        sales_officer_id: '',
      },
      payment: {
        gateway_id: '',
        transaction_id: '',
        amount: '',
      },
    });
    setStep(1);
    setValidationErrors({});
  };


    const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateStep(step)) {
    return;
  }

  // 🔹 Check if gateway_id === '5' → Show Alert
  if (formData.payment.gateway_id === '5') {
    Swal.fire({
      title: 'Redirecting to Payment Gateway',
      text: 'You will be redirected to the secure payment gateway to complete your transaction.',
      icon: 'info',
      confirmButtonText: 'Proceed',
    });
  }

  setIsLoading(true);
  setMessage(null);

  const token = localStorage.getItem('token');
  let apiUrl;

  if (formData.payment.gateway_id === '5') {
    apiUrl = 'https://pleasurebd.com/pleasure-backend/public/api/v1/sales/checkout';
  } else {
    apiUrl = 'https://pleasurebd.com/pleasure-backend/public/api/v1/sales/applications';
  }

  const apiPayload = {
    plan_id: formData.plan_id,
    issue_date: formData.issue_date,
    physical_card_no: formData.physical_card_no,
    price: parseFloat(formData.price),
    customer: { ...formData.customer },
    members: formData.members.map((m) => ({ ...m })),
    nominee: { ...formData.nominee },
    order: { ...formData.order },
    payment: { ...formData.payment },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiPayload),
    });

    const result = await response.json();

    if (response.ok) {
      if (apiUrl.includes('sales/checkout') && result.payment_redirect_url) {
        window.location.href = result.payment_redirect_url;
      } else {
        setMessage({
          type: 'success',
          text: 'Customer application submitted successfully!',
        });
        console.log('Success:', result);
        resetForm();
      }
    } else {
      const errorText = result.message || JSON.stringify(result.errors);
      setMessage({ type: 'error', text: `Error: ${errorText}` });
      console.error('Error:', result);
    }
  } catch (error) {
    console.error('Submission failed:', error);
    setMessage({
      type: 'error',
      text: 'Submission failed due to a network error. Please check your connection and try again.',
    });
  } finally {
    setIsLoading(false);
  }
};







  const renderMemberRow = (member, index) => (
    <div key={index} className="grid md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
      <input className="form-input" placeholder="Name" value={member.name || ''} onChange={(e) => updateDynamicList('members', index, 'name', e.target.value)} />
      <input className="form-input" placeholder="Relationship" value={member.relationship || ''} onChange={(e) => updateDynamicList('members', index, 'relationship', e.target.value)} />
      <input className="form-input" type="date" placeholder="Date of Birth" value={member.dob || ''} onChange={(e) => updateDynamicList('members', index, 'dob', e.target.value)} />
      <div className="flex gap-2 items-center">
        <button type="button" className="btn-icon" onClick={() => removeDynamicItem('members', index)}>
          <svg className="h-4 w-4 fill-current text-rose-500" viewBox="0 0 16 16"><path d="M5 7h6a.5.5 0 010 1H5a.5.5 0 010-1z" /></svg>
        </button>
      </div>
    </div>
  );

  const renderNomineeFields = () => (
    <div className="grid md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Name <span className="text-rose-500">*</span></label>
        <input className="form-input w-full" placeholder="Name" value={formData.nominee.name} onChange={(e) => updateFormData('nominee', 'name', e.target.value)} />
        {validationErrors.nominee && <span className="text-xs text-rose-500">{validationErrors.nominee}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Relationship <span className="text-rose-500">*</span></label>
        <input className="form-input w-full" placeholder="Relationship" value={formData.nominee.relationship} onChange={(e) => updateFormData('nominee', 'relationship', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Phone <span className="text-rose-500">*</span></label>
        <input className="form-input w-full" placeholder="Phone" value={formData.nominee.phone} onChange={(e) => updateFormData('nominee', 'phone', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Address <span className="text-rose-500">*</span></label>
        <input className="form-input w-full" placeholder="Address" value={formData.nominee.address} onChange={(e) => updateFormData('nominee', 'address', e.target.value)} />
      </div>
    </div>
  );

  const hasCurrentStepErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-16 py-0 w-full max-w-full mx-auto">
            <div className="px-6 hidden sm:block">
              <div className="w-full bg-[#0097A7] rounded px-3 sm:px-6 lg:px-6 py-4 flex items-center justify-between">
                <div className="flex-shrink-0">
                  <img src={logo} alt="Company Logo" className="h-16 w-16 rounded object-contain" />
                </div>
                <div className="text-center text-white">
                  <h1 className="text-xl font-bold">PLEASURE BANGLADESH LIMITED</h1>
                  <p className="text-sm">Corporate Address: Zaman Tower, 11th floor, Flat:1115, Purana Palton, Dhaka</p>
                  <p className="text-sm">Mobile: +880 1234 567890</p>
                </div>
                <div className="flex-shrink-0"></div>
              </div>
            </div>

            <div className="max-w-full mx-auto p-8 md:p-8">
              <div id="stepper" className="mb-6 shadow-xl lg:px-16">
                <div className="flex items-center justify-between text-sm font-medium">
                  {[
                    'Customer',
                    'Membership',
                    'Member/Nominee',
                    'Order',
                    'Payment',
                  ].map((label, index) => (
                    <React.Fragment key={index}>
                      <div className="shrink-0 text-center w-1/5">
                        <div className={`mx-auto h-8 w-8 rounded-full grid place-items-center font-bold ${step >= index + 1 ? 'bg-[#0097A7] text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {index + 1}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{label}</div>
                      </div>
                      {index < 4 && (
                        <div className={`h-1 grow mx-2 ${step > index + 1 ? 'bg-[#0097A7]' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-3 h-1 w-full bg-slate-200 rounded overflow-hidden">
                  <div className="h-full bg-[#0097A7] transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
                </div>
              </div>

              {message && (
                <div className={`mb-4 px-4 py-2 rounded-md ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <section data-step="1" className="step">
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-4">
                      <h2 className="text-xl font-bold text-slate-700">Step 1/5 – Customer Information</h2>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">First Name <span className="text-rose-500">*</span></label>
                          <input name="first_name" className="form-input w-full" onChange={(e) => updateFormData('customer', 'first_name', e.target.value)} value={formData.customer.first_name} />
                          {validationErrors.first_name && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.first_name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
                          <input name="last_name" className="form-input w-full" onChange={(e) => updateFormData('customer', 'last_name', e.target.value)} value={formData.customer.last_name} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Full Name (Bangla) <span className="text-rose-500">*</span></label>
                          <input name="full_name_bn" className="form-input w-full" onChange={(e) => updateFormData('customer', 'full_name_bn', e.target.value)} value={formData.customer.full_name_bn} />
                          {validationErrors.full_name_bn && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.full_name_bn}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Full Name (English)</label>
                          <input name="full_name_en" className="form-input w-full" onChange={(e) => updateFormData('customer', 'full_name_en', e.target.value)} value={formData.customer.full_name_en} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Mobile <span className="text-rose-500">*</span></label>
                          <input name="phone" className="form-input w-full" onChange={(e) => updateFormData('customer', 'phone', e.target.value)} value={formData.customer.phone} />
                          {validationErrors.phone && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.phone}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                          <input type="email" name="email" className="form-input w-full" onChange={(e) => updateFormData('customer', 'email', e.target.value)} value={formData.customer.email} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">National ID (NID) <span className="text-rose-500">*</span></label>
                          <input name="national_id" className="form-input w-full" onChange={(e) => updateFormData('customer', 'national_id', e.target.value)} value={formData.customer.national_id} />
                          {validationErrors.national_id && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.national_id}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                          <input type="date" name="dob" className="form-input w-full" onChange={(e) => updateFormData('customer', 'dob', e.target.value)} value={formData.customer.dob} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Father's Name</label>
                          <input name="fathers_name" className="form-input w-full" onChange={(e) => updateFormData('customer', 'fathers_name', e.target.value)} value={formData.customer.fathers_name} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Mother's Name</label>
                          <input name="mothers_name" className="form-input w-full" onChange={(e) => updateFormData('customer', 'mothers_name', e.target.value)} value={formData.customer.mothers_name} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Occupation</label>
                          <input name="occupation" className="form-input w-full" onChange={(e) => updateFormData('customer', 'occupation', e.target.value)} value={formData.customer.occupation} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Marital Status</label>
                          <select name="marital_status" className="form-select w-full" onChange={(e) => updateFormData('customer', 'marital_status', e.target.value)} value={formData.customer.marital_status}>
                            <option value="">Select</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                          <select name="gender" className="form-select w-full" onChange={(e) => updateFormData('customer', 'gender', e.target.value)} value={formData.customer.gender}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Present Address <span className="text-rose-500">*</span></label>
                          <input name="present_address" className="form-input w-full" onChange={(e) => updateFormData('customer', 'present_address', e.target.value)} value={formData.customer.present_address} />
                          {validationErrors.present_address && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.present_address}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Permanent Address</label>
                          <input name="permanent_address" className="form-input w-full" onChange={(e) => updateFormData('customer', 'permanent_address', e.target.value)} value={formData.customer.permanent_address} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">City <span className="text-rose-500">*</span></label>
                          <input name="city" className="form-input w-full" onChange={(e) => updateFormData('customer', 'city', e.target.value)} value={formData.customer.city} />
                          {validationErrors.city && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">District <span className="text-rose-500">*</span></label>
                          <input name="district" className="form-input w-full" onChange={(e) => updateFormData('customer', 'district', e.target.value)} value={formData.customer.district} />
                          {validationErrors.district && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.district}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Postal Code <span className="text-rose-500">*</span></label>
                          <input name="postal_code" className="form-input w-full" onChange={(e) => updateFormData('customer', 'postal_code', e.target.value)} value={formData.customer.postal_code} />
                          {validationErrors.postal_code && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.postal_code}</p>}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {step === 2 && (
                  <section data-step="2" className="step">
                    <div className="bg-white rounded-xl shadow p-6 md:p-8 space-y-4">
                      <h2 className="text-xl font-bold text-slate-700">Step 2/5 – Membership Application</h2>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Plan <span className="text-rose-500">*</span></label>
                          <select name="plan_id" className="form-select w-full" onChange={handlePlanSelect} value={formData.plan_id}>
                            <option value="">Select a plan</option>
                            {plans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name} - {plan.price} {plan.currency}
                              </option>
                            ))}
                          </select>
                          {validationErrors.plan_id && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.plan_id}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Physical Card Number</label>
                          <input name="physical_card_no" className="form-input w-full" placeholder="Auto-generated" onChange={(e) => updateTopLevelData('physical_card_no', e.target.value)} value={formData.physical_card_no} readOnly disabled/>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Issue Date <span className="text-rose-500">*</span></label>
                          <input type="date" name="issue_date" className="form-input w-full" onChange={(e) => updateTopLevelData('issue_date', e.target.value)} value={formData.issue_date} readOnly disabled/>
                          {validationErrors.issue_date && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.issue_date}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Price</label>
                          <input name="price" type="number" step="0.01" className="form-input w-full" onChange={(e) => updateTopLevelData('price', e.target.value)} value={formData.price} readOnly disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                          <input type="date" name="start_date" className="form-input w-full" onChange={(e) => updateTopLevelData('start_date', e.target.value)} value={formData.start_date} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                          <input type="date" name="end_date" className="form-input w-full" onChange={(e) => updateTopLevelData('end_date', e.target.value)} value={formData.end_date} />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {step === 3 && (
                  <section data-step="3" className="step">
                    <div className="bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
                      <h2 className="text-xl font-bold text-slate-700">Step 3/5 – Beneficiary Members & Nominees</h2>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-800">Member List</h3>
                          <button type="button" onClick={() => addDynamicItem('members')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0097A7] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">+ Add Member</button>
                        </div>
                        <div id="members" className="space-y-3">
                          {formData.members.map(renderMemberRow)}
                        </div>
                        {validationErrors.members && <p className="text-xs text-rose-500 mt-2 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.members}</p>}
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-800">Nominee Information</h3>
                        </div>
                        <div id="nominee-fields" className="space-y-3">
                          {renderNomineeFields()}
                        </div>
                        {validationErrors.nominee && <p className="text-xs text-rose-500 mt-2 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.nominee}</p>}
                      </div>
                    </div>
                  </section>
                )}

               
            {step === 4 && (
                <section data-step="4" className="step">
                    <div className="bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
                        <h2 className="text-xl font-bold text-slate-700">Step 4/5 – Order</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    Order Type <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    name="order_type" 
                                    className="form-select w-full" 
                                    onChange={(e) => updateFormData('order', 'order_type', e.target.value)} 
                                    value={formData.order.order_type}
                                >
                                    <option value="">Select</option>
                                    <option value="new">New</option>
                                    <option value="renewal">Renewal</option>
                                    <option value="upgrade">Upgrade</option>
                                </select>
                                {validationErrors.order_type && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center">
                                        <span className="mr-1">⚠️</span>{validationErrors.order_type}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    Membership ID (optional)
                                </label>
                                <input 
                                    name="membership_id" 
                                    className="form-input w-full" 
                                    onChange={(e) => updateFormData('order', 'membership_id', e.target.value)} 
                                    value={formData.order.membership_id} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    Sales Officer <span className="text-rose-500">*</span>
                                </label>
                                {loading ? (
                                    <div className="form-input w-full text-center py-2">Loading...</div>
                                ) : (
                                   <select 
                                      name="sales_officer_id" 
                                      className="form-select text-xs w-full" 
                                      onChange={handleSelectChange}
                                      value={formData.order.sales_officer_id || ''}
                                  >
                                      <option value="">Select Sales Officer</option>
                                      {employees?.map((employee) => (
                                          <option key={employee.id} value={employee?.employee_code}>
                                              {employee.full_name_en || employee.full_name_bn || 'N/A'} ({employee.rank?.name || 'No Rank'})({employee?.employee_code || 'No Rank'})
                                          </option>
                                      ))}
                                  </select>
                                )}
                                {validationErrors.sales_officer_id && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center">
                                        <span className="mr-1">⚠️</span>{validationErrors.sales_officer_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
       

                {step === 5 && (
                  <section data-step="5" className="step">
                    <div className="bg-white rounded-xl shadow p-6 md:p-8 space-y-4">
                      <h2 className="text-xl font-bold text-slate-700">Step 5/5 – Payment Information</h2>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Payment Method <span className="text-rose-500">*</span></label>
                          <select name="gateway_id" className="form-select w-full" onChange={handlePaymentGatewaySelect} value={formData.payment.gateway_id}>
                            <option value="">Select</option>
                            {paymentGateways.map((gateway) => (
                              <option key={gateway.id} value={gateway.id}>
                                {gateway.display_name}
                              </option>
                            ))}
                          </select>
                          {validationErrors.gateway_id && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.gateway_id}</p>}
                        </div>
                        {formData.payment.gateway_id !== '1' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Transaction ID</label>
                            <input name="transaction_id" className="form-input w-full" onChange={(e) => updateFormData('payment', 'transaction_id', e.target.value)} value={formData.payment.transaction_id} />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Amount <span className="text-rose-500">*</span></label>
                          {/* <-- CRITICAL CHANGE: The input is now readOnly and gets its value from formData.price */}
                          <input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            className="form-input w-full" 
                            value={formData.price} 
                            readOnly 
                          />
                          {validationErrors.amount && <p className="text-xs text-rose-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{validationErrors.amount}</p>}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                  {step > 1 && (
                    <button type="button" onClick={prevStep} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-slate-800 bg-slate-200 hover:bg-slate-300 transition-colors">
                      &larr; Previous
                    </button>
                  )}
                  {step < totalSteps && (
                    <button type="button" onClick={nextStep} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0097A7] hover:bg-[#007F8F] transition-colors ml-auto" disabled={hasCurrentStepErrors}>
                      Next &rarr;
                    </button>
                  )}
                  {step === totalSteps && (
                    <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-500 hover:bg-emerald-600 transition-colors ml-auto" disabled={isLoading || hasCurrentStepErrors}>
                      {isLoading ? 'Submitting...' : 'Submit'}
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

export default AddCustomer;