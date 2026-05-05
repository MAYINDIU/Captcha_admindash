import React, { useState } from "react";
import Swal from "sweetalert2";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const PasswordChange = () => {
  // State for the three required password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // State for toggling password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const API_TOKEN = localStorage.getItem("authToken");
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = "https://alhamarahomesbd.com/alhamra-backend/public";
  // Updated API endpoint
  const API_ENDPOINT = `${baseUrl}/api/v1/change-password`;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Swal.fire("ত্রুটি", "অনুগ্রহ করে সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Swal.fire("ত্রুটি", "নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না!", "error");
      return;
    }

    setIsLoading(true);

    // Construct the required request body
    const requestBody = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmNewPassword,
    };

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST", // Usually POST for change-password endpoints
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        Swal.fire("সফল", "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!", "success");
        // Clear all fields on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        const error = await response.json();
        // Display specific error message from the API
        const errorMessage = error.message || error.error || "কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করুন!";
        Swal.fire(
          "ত্রুটি",
          errorMessage,
          "error"
        );
      }
    } catch (err) {
      Swal.fire("ত্রুটি", "নেটওয়ার্ক সমস্যা! পরে আবার চেষ্টা করুন।", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Utility component for the Eye icon
  const PasswordToggleButton = ({ show, setShow, topOffset = "top-[38px]" }) => (
    <span
      className={`absolute ${topOffset} right-3 cursor-pointer text-gray-500`}
      onClick={() => setShow(!show)}
    >
      {show ? <AiFillEyeInvisible /> : <AiFillEye />}
    </span>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-grow p-6 bg-gray-100">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-600">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              🔐 পাসওয়ার্ড পরিবর্তন
            </h2>

            <form onSubmit={handleChangePassword}>
              
              {/* 1. Current Password */}
              <div className="mb-4 relative">
                <label className="block text-gray-700 font-medium mb-1">
                  বর্তমান পাসওয়ার্ড
                </label>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="আপনার বর্তমান পাসওয়ার্ড দিন"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <PasswordToggleButton 
                    show={showCurrentPassword} 
                    setShow={setShowCurrentPassword} 
                    topOffset="top-[42px]" 
                />
              </div>

              {/* 2. New Password */}
              <div className="mb-4 relative">
                <label className="block text-gray-700 font-medium mb-1">
                  নতুন পাসওয়ার্ড
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <PasswordToggleButton 
                    show={showNewPassword} 
                    setShow={setShowNewPassword} 
                    topOffset="top-[42px]" 
                />
              </div>

              {/* 3. Confirm New Password */}
              <div className="mb-6 relative">
                <label className="block text-gray-700 font-medium mb-1">
                  নতুন পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                <PasswordToggleButton 
                    show={showConfirmNewPassword} 
                    setShow={setShowConfirmNewPassword} 
                    topOffset="top-[42px]" 
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-300 transform hover:scale-[1.01] shadow-lg ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        আপডেট করা হচ্ছে...
                    </span>
                ) : (
                    "পাসওয়ার্ড আপডেট করুন"
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PasswordChange;