import React, { useState, useRef, useEffect } from 'react';

const OTPPage = ({ email, name, password, onComplete, onResend, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [resendTimer, setResendTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Start resend timer on mount
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    // Check if all digits entered
    if (newOtp.every(digit => digit !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  // Handle keyboard events
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current box
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous box and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      setError('Please paste numbers only');
      return;
    }
    
    const newOtp = pastedData.padEnd(6, ' ').split('').map(char => char === ' ' ? '' : char);
    setOtp(newOtp);
    
    // Focus last filled input or last input
    const lastFilledIndex = newOtp.findLastIndex(digit => digit !== '');
    const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
    inputRefs.current[focusIndex]?.focus();
    setActiveIndex(focusIndex);

    // Auto-submit if complete
    if (newOtp.every(digit => digit !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  // Handle form submission
  const handleSubmit = async (otpString = otp.join('')) => {
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call parent's onComplete function
      await onComplete(otpString);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setActiveIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      if (onResend) {
        await onResend();
      } else {
        // Default resend implementation
        const response = await fetch(`/api/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to resend OTP');
        }
      }

      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setActiveIndex(0);
      
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-500 text-sm">
          We've sent a code to <span className="font-medium">{email}</span>
        </p>
      </div>

      {/* OTP Input Boxes */}
      <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setActiveIndex(index)}
            disabled={isLoading}
            className={`
              w-11 h-12 text-center text-lg font-bold rounded-lg
              border-2 transition-all duration-200
              ${activeIndex === index 
                ? 'border-purple-500 ring-2 ring-purple-200' 
                : digit 
                  ? 'border-purple-300 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }
              ${error ? 'border-red-300' : ''}
              focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200
              disabled:opacity-50 disabled:cursor-not-allowed
              text-purple-700
            `}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Verify Button */}
      <button
        onClick={() => handleSubmit()}
        disabled={isLoading || otp.some(digit => digit === '')}
        className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold rounded transition-colors duration-200 disabled:cursor-not-allowed mb-3"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        ) : (
          'Verify & Register'
        )}
      </button>

      {/* Resend Section */}
      <div className="text-center text-sm mb-3">
        <span className="text-gray-500">
          Didn't receive the code?{' '}
        </span>
        {resendTimer > 0 ? (
          <span className="text-purple-600 font-medium">
            Resend in {resendTimer}s
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            Resend Code
          </button>
        )}
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to registration
        </button>
      )}
    </div>
  );
};

export default OTPPage;