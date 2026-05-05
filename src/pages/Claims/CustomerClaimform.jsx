import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose, AiOutlinePaperClip } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const ApplyClaimForm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    membership_id: "",
    service_name: "",
    service_date: "",
    invoice_reference: "",
    billed_amount: "",
    partner_id: "",
    invoice_number: "",
    notes: "",
  });
  console.log(formData)
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch partners and membership ID on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch partners
        const partnersRes = await fetch(
          "https://pleasurebd.com/pleasure-backend/public/api/v1/partners",
          { headers }
        );
        const partnersData = await partnersRes.json();
        setPartners(partnersData.data || []);

        // Fetch membership ID
        const membershipRes = await fetch(
          "https://pleasurebd.com/pleasure-backend/public/api/v1/customers/me/memberships",
          { headers }
        );
        const membershipData = await membershipRes.json();
        
        // Extract the membership ID from the first membership object
        const firstMembershipId =
          membershipData?.memberships?.[0]?.id || "";
        
        setFormData((prev) => ({
          ...prev,
          membership_id: firstMembershipId,
        }));
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        toast.error("Failed to load required data.");
      }
    };
    fetchInitialData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prevDocuments) => [...prevDocuments, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments((prevDocuments) =>
      prevDocuments.filter((_, i) => i !== index)
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let body;
    let options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (documents.length > 0) {
      // ✅ Case 1: With documents → use FormData
      body = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          body.append(key, formData[key]);
        }
      });

      documents.forEach((file) => {
        body.append("documents[]", file);
      });

      options.body = body; // fetch will set proper Content-Type
    } else {
      // ✅ Case 2: Without documents → send JSON
      body = {
        ...formData,
        documents: [],
      };

      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const res = await fetch(
      "https://pleasurebd.com/pleasure-backend/public/api/v1/claims/customer",
      options
    );

    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error("Invalid API response:", text);
      toast.error("Server returned invalid response.");
      setLoading(false);
      return;
    }

    if (res.ok && result.data) {
      toast.success("Claim submitted successfully! 🎉");
      setTimeout(() => {
        navigate("/customer-claim-form");
      }, 2000);
    } else {
      toast.error(result.message || "Failed to submit claim.");
    }
  } catch (err) {
    console.error("Request failed:", err);
    toast.error("An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow p-8">
          <ToastContainer position="top-right" autoClose={3000} />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Apply for a New Claim</h2>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <AiOutlineClose size={24} />
              Cancel
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Membership ID - This is now auto-populated */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Membership ID
                  </label>
                  <input
                    type="text"
                    name="membership_id"
                    value={formData.membership_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                </div>
                {/* Service Name */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    name="service_name"
                    value={formData.service_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    required
                  />
                </div>
                {/* Service Date */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Service Date
                  </label>
                  <input
                    type="date"
                    name="service_date"
                    value={formData.service_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    required
                  />
                </div>
                {/* Invoice Reference */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Invoice Reference
                  </label>
                  <input
                    type="text"
                    name="invoice_reference"
                    value={formData.invoice_reference}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    required
                  />
                </div>
                {/* Billed Amount */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Billed Amount
                  </label>
                  <input
                    type="number"
                    name="billed_amount"
                    value={formData.billed_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    required
                  />
                </div>
                {/* Partner Dropdown */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Partner
                  </label>
                  <select
                    name="partner_id"
                    value={formData.partner_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white"
                    required
                  >
                    <option value="">Select a Partner</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Invoice Number */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    required
                  />
                </div>
                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  ></textarea>
                </div>
                {/* Documents Upload */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Upload Documents
                  </label>
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer transition-colors">
                      <AiOutlinePaperClip className="mr-2" />
                      Select Files
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleDocumentChange}
                      />
                    </label>
                    <span className="text-gray-500 text-sm">
                      (Invoices, prescriptions, etc.)
                    </span>
                  </div>
                  {documents.length > 0 && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-md shadow-sm">
                      <p className="font-semibold text-gray-700 mb-2">
                        Selected Files:
                      </p>
                      <ul className="space-y-2">
                        {documents.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100"
                          >
                            <span className="text-gray-800 text-sm truncate">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="text-red-500 hover:text-red-700 ml-4 transition-colors"
                            >
                              <AiOutlineClose size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {/* Submit Button */}
              <div className="mt-8 text-right">
                <button
                  type="submit"
                  className="px-8 py-3 bg-teal-700 text-white rounded-md font-semibold hover:bg-teal-800 transition-colors shadow-md disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplyClaimForm;