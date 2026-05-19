import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

function DropdownProfile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    const logoutUrl = "https://fastwork24.com/captcha_backend/public/api/admin/logout";

    try {
      if (token) {
        const response = await fetch(logoutUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Logout failed on the server side.");
        }
      }
    } catch (error) {
      console.error("An error occurred during the logout request:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("roles");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      localStorage.removeItem("customer");
      navigate("/admin-login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Logout"
      aria-label="Logout"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900 active:scale-95 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900"
    >
      <FiLogOut className="h-5 w-5" />
    </button>
  );
}

export default DropdownProfile;
