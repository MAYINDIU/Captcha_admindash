import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status');
  const message = searchParams.get('message');

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Status:", status, "Message:", message);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowModal(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Decide modal content
  const getModalContent = () => {
    // Priority: cancelled message
    if (message && message.toLowerCase().includes("cancel")) {
      return {
        title: 'Payment Cancelled',
        description: message,
        iconColor: 'text-yellow-500',
        iconPath: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 
               2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 
               0L3.332 16c-.77 1.333.192 3 1.732 3z"
          />
        ),
      };
    }

    // Fallback: check status
    switch (status) {
      case 'success':
        return {
          title: 'Payment Successful!',
          description: message || 'Your payment has been successfully processed. Thank you!',
          iconColor: 'text-green-500',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 
                 0 9 9 0 0118 0z"
            />
          ),
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          description: message || 'There was an issue processing your payment. Please try again.',
          iconColor: 'text-red-500',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 
                 2l2 2m7-2a9 9 0 11-18 
                 0 9 9 0 0118 0z"
            />
          ),
        };
      default:
        return {
          title: 'Payment Status',
          description: 'We are unable to determine your payment status. Please check your account.',
          iconColor: 'text-gray-500',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 
                 12a9 9 0 11-18 0 9 9 0 0118 
                 0z"
            />
          ),
        };
    }
  };

  const { title, description, iconColor, iconPath } = getModalContent();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans antialiased">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-gray-800">Payment Confirmation</h1>
          <p className="mt-2 text-gray-500">Verifying your payment, please wait...</p>
          <div className="flex justify-center mt-6">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 
                   0 12h4zm2 5.291A7.962 7.962 0 014 
                   12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showModal && !isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
          <div className="relative p-8 bg-white w-full max-w-xs sm:max-w-sm rounded-2xl shadow-2xl text-center animate-modal-pop">
            {/* Dynamic Icon */}
            <div className="flex justify-center mb-4">
              <svg
                className={`h-16 w-16 ${iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                {iconPath}
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6">{description}</p>
            <button
              onClick={handleGoToDashboard}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300
                         bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Modal Animation */}
      <style jsx>{`
        @keyframes modal-pop {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-modal-pop {
          animation: modal-pop 0.3s forwards ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentConfirmationPage;
