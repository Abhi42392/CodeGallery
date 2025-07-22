"use client"
import React, { useActionState, useEffect, useState } from 'react'
import { loginAction } from '../lib/actions/auth'
import { getProviders } from 'next-auth/react'
import SignInButton from './SignInButton'

const SignInOptions = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [providers, setProviders] = useState([])
  const [state, formAction] = useActionState(loginAction, { errors: {} })

  useEffect(() => {
    async function loadProviders() {
      const res = await getProviders()
      setProviders(res)
    }
    loadProviders()
  }, [])

  if (!providers) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? 'Register' : 'Login'}
        </h2>

        <form action={formAction} className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Email"
           className="w-full border border-gray-300 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"

            required
          />
          {state.errors?.email && (
            <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent border-gray-300 outline-0"
            required
          />
          {state.errors?.password && (
            <p className="text-red-500 text-sm mt-1">{state.errors.password[0]}</p>
          )}

          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
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
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 underline"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignInOptions
