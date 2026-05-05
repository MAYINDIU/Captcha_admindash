import React, { useState } from "react";
import Swal from "sweetalert2";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const CustomerChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = "https://alhamarahomesbd.com/alhamra-backend/public";

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire("ত্রুটি", "অনুগ্রহ করে সব ফিল্ড পূরণ করুন", "error");
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire("ত্রুটি", "পাসওয়ার্ড মিলছে না!", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/v1/customer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        Swal.fire("সফল", "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!", "success");
        setPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        Swal.fire(
          "ত্রুটি",
          error.message || "কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করুন!",
          "error"
        );
      }
    } catch (err) {
      Swal.fire("ত্রুটি", "নেটওয়ার্ক সমস্যা! পরে আবার চেষ্টা করুন।", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-grow p-6 bg-gray-100">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
              পাসওয়ার্ড পরিবর্তন
            </h2>

            <form onSubmit={handleChangePassword}>
              {/* New Password */}
              <div className="mb-4 relative">
                <label className="block text-gray-700 font-medium mb-1">
                  নতুন পাসওয়ার্ড
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-500"
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="absolute top-[38px] right-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="mb-6 relative">
                <label className="block text-gray-700 font-medium mb-1">
                  নতুন পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-500"
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="absolute top-[38px] right-3 cursor-pointer text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "আপডেট করা হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerChangePassword;
