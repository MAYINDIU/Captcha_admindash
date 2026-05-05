import React, { useState, useEffect } from 'react';

const PaymentFailed = () => {
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call or check that has determined a payment failure.
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowFailureModal(true);
    }, 1500); // Simulate a network delay of 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleTryAgain = () => {
    // Redirect the user back to the payment page to try again.
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans antialiased">
      {/* Main Content Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center transform transition-all duration-300">
        <h1 className="text-2xl font-bold text-gray-800">Payment Status</h1>
        <p className="mt-2 text-gray-500">
          {isLoading ? 'Verifying your payment, please wait...' : 'Verification complete.'}
        </p>
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center mt-6">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Custom Modal for Failure Message */}
      {showFailureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
          <div className="relative p-8 bg-white w-full max-w-xs sm:max-w-sm rounded-2xl shadow-2xl text-center scale-95 opacity-0 animate-modal-pop">
            {/* Failure Icon */}
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed!</h3>
            <p className="text-gray-500 mb-6">There was an issue processing your payment. Please try again.</p>
            <button
              onClick={handleTryAgain}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300
                         bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Keyframe for the modal pop-in animation */}
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

export default PaymentFailed;
