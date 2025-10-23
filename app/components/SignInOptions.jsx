"use client"
import React, { useActionState, useEffect, useState } from 'react'
import { loginAction } from '../lib/actions/auth'
import { getProviders } from 'next-auth/react'
import SignInButton from './SignInButton'
import { verifyOTP } from '../lib/otp/otp'
import OTPPage from './OTPPage'
import { useRouter } from 'next/navigation'

const SignInOptions = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [providers, setProviders] = useState([])
  const [step, setStep] = useState("auth") // Fixed: Changed from "otp" to "auth"
  const [state, formAction] = useActionState(loginAction, { errors: {} })
  const [error, setError] = useState('')

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const router=useRouter();
  useEffect(() => {
    async function loadProviders() {
      const res = await getProviders()
      setProviders(res)
    }
    loadProviders()
  }, [])

  if (!providers) return null;

  const handleClick = async (e) => {
  e.preventDefault(); // Prevent form submission
  setError('');
  
  try {
    if (isRegister) {
      // ✅ Validate inputs
      if (!email || !password || !name) {
        setError("Please fill in all fields");
        return;
      }

      // ✅ Send register request
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          username: name
        })
      });

      const registerResponse = await response.json();

      // ✅ Handle register errors
      if (!response.ok || !registerResponse.success) {
        throw new Error(registerResponse.message || "Registration failed");
      }

      // ✅ Handle success
      console.log("Registration successful");
      router.push("/")
      setIsRegister(false); // Switch to login form after registration

    } else {
      // ✅ Handle login
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }

      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      const loginResponse = await response.json();

      // ✅ Handle login errors
      if (!response.ok || !loginResponse.success) {
        throw new Error(loginResponse.message || "Login failed");
      }

      // ✅ Handle successful login
      console.log("Login successful");
       // Redirect to homepage or dashboard
    }
  } catch (err) {
    console.error("Error:", err);
    setError(err.message);
  }
};


  const verifyEnteredOTP = async (otpString) => {
    try {
      console.log('Verifying OTP:', otpString);
      
      // Verify OTP using your utility
      const response = await verifyOTP(email, otpString);
      console.log('Verification response:', response);
      
      if (!response.valid) {
        throw new Error(response.message || 'Invalid OTP');
      }
      
      // If OTP is valid, complete registration
      const regResponse = await fetch(`/api/register`, {
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
      
      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const regData = await regResponse.json();
      
      if (!regData.success) {
        throw new Error(regData.message || 'Registration failed');
      }
      
      console.log('Registration successful!');
      // Redirect to dashboard or login
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Verification error:', err);
      // Throw error to be caught by OTPPage
      throw err;
    }
  };

  const handleResendOTP = async () => {
    try {
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
      
      // Show OTP in console for testing
      if (data.testOTP) {
        console.log('=================================');
        console.log('NEW TEST OTP:', data.testOTP);
        console.log('=================================');
      }

      console.log('OTP resent successfully');
    } catch (err) {
      console.error('Resend error:', err);
      throw err;
    }
  };

  const handleBack = () => {
    setStep("auth");
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        {(
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">
              {isRegister ? 'Register' : 'Login'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleClick} className="space-y-4">
              {isRegister && (
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              )}
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              {state.errors?.email && (
                <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
                minLength="6"
              />
              {state.errors?.password && (
                <p className="text-red-500 text-sm mt-1">{state.errors.password[0]}</p>
              )}

              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
              >
                {isRegister ? 'Register' : 'Login'}
              </button>
            </form>

            <div className="my-4 text-center text-sm text-gray-500">or continue with</div>

            <div className="flex gap-4 justify-center">
              {Object.values(providers).map((provider) => (
                <div key={provider.name}>
                  <SignInButton title={`${provider.name}`} />
                </div>
              ))}
            </div>

            <div className="text-center mt-4 text-sm">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsRegister(prev => !prev);
                  setError('');
                  // Clear form fields when switching
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-purple-600 underline hover:text-purple-700"
              >
                {isRegister ? 'Login' : 'Register'}
              </button>
            </div>
          </>
        )}
        
        {/* {step === "otp" && (
          <OTPPage 
            email={email}
            name={name}
            password={password}
            onComplete={verifyEnteredOTP}
            onResend={handleResendOTP}
            onBack={handleBack}
          />
        )} */}
      </div>
    </div>
  )
}

export default SignInOptions