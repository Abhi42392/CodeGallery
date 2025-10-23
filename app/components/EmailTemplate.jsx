import React from 'react';

const EmailTemplate = ({ username = 'User', otp = '123456' }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h1 className="text-white text-2xl font-semibold">Verification Code</h1>
        </div>
        
        {/* Body */}
        <div className="px-6 py-8 space-y-6">
          {/* Greeting */}
          <h2 className="text-2xl font-semibold text-gray-800">
            Hello {username},
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 leading-relaxed">
            Thank you for registering. Please use the following verification
            code to complete your registration:
          </p>
          
          {/* OTP Code */}
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-4xl font-black bg-purple-500 text-white tracking-wider">
              {otp}
            </p>
          </div>
          
          {/* Footer Message */}
          <p className="text-sm text-gray-500">
            If you did not request this code, please ignore this email.
          </p>
          
          {/* Optional Verify Button */}
          {/* Uncomment to enable the button */}
          {/*
          <div className="pt-4">
            <a
              href={`http://localhost:3000/verify/${username}`}
              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Verify here
            </a>
          </div>
          */}
        </div>
        
        {/* Email Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;