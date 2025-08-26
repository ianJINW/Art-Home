import React, { useEffect, useState } from 'react'
import { LoginUser, LogoutUser } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/auth.store'
import { Mail, Lock, Eye, EyeClosed, XCircle } from 'lucide-react'

const Login: React.FC = () => {
  const [data, setData] = useState({ email: '', password: '' })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(state => !!state.accessToken)
  const { mutate, isPending, isError, error, reset } = LoginUser()
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (isError) {
      let message = 'An unknown error occurred. Please try again.'
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as any).message
      }
      setErrorMsg(message)
    }
  }, [isError, error])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    reset()

    const formData = {
      username: data.email,
      email: data.email,
      password: data.password
    }

    mutate(formData, {
      onSuccess: data => {
        // Success handled by auth store
        console.log('Login successful:', data)
      },
      onError: (err: unknown) => {
        let message = 'Login failed. Please check your credentials.'
        if (err && typeof err === 'string') {
          message = err as string
        } else if (err instanceof Error) {
          message = err.message
        }
        setErrorMsg(message)
      }
    })
  }

  const handleDismissError = () => setErrorMsg(null)

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <fieldset className='w-full max-w-md border border-gray-300 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg'>
        <legend>
          <h1>Login</h1>
        </legend>
        {errorMsg && (
          <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <XCircle className="mr-2" size={20} />
            <span className="block flex-1">{errorMsg}</span>
            <button
              onClick={handleDismissError}
              className="ml-2 text-red-700 hover:text-red-900 focus:outline-none"
              aria-label="Dismiss error"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className='flex flex-col m-1 p-1 text-black radius-100 border-gray-600 gap-2'
        >
          <label className='flex items-center gap-2'>
            <Mail size={20} />
            Email
          </label>
          <input
            placeholder='Please input your email'
            type='email'
            className={`border ${errorMsg ? 'border-red-400' : 'border-gray-400'} rounded-md p-2 mt-1 w-full font-small dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            value={data.email}
            onChange={e => setData({ ...data, email: e.target.value })}
            autoComplete="username"
            required
          />

          <label className='flex items-center gap-2 mt-4'>
            <Lock size={20} />
            Password
          </label>
          <div className='relative'>
            <input
              placeholder='Please input your password'
              type={showPassword ? 'text' : 'password'}
              className={`border ${errorMsg ? 'border-red-400' : 'border-gray-400'} rounded-md p-2 mt-1 w-full font-small dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={data.password}
              onChange={e => setData({ ...data, password: e.target.value })}
              autoComplete="current-password"
              required
            />
            {showPassword === false ? (
              <span className='absolute right-2 top-3 text-gray-600 cursor-pointer'>
                <Eye size={20} onClick={togglePasswordVisibility} />
              </span>
            ) : (
              <span className='absolute right-2 top-3 text-gray-600 cursor-pointer'>
                <EyeClosed size={20} onClick={togglePasswordVisibility} />
              </span>
            )}
          </div>

          <button
            className='cursor-pointer bg-blue-500 text-white rounded-md p-2 mt-4 hover:bg-blue-600'
            type='submit'
            disabled={isPending}
          >
            {isPending ? `Logging in ...` : 'Login'}
          </button>
        </form>
      </fieldset>
    </div>
  )
}

export const Logout: React.FC = () => {
  const { mutate: logout, isPending } = LogoutUser()

  const handleLogout = () => {
    logout()
  }

  return (
    <fieldset className='w-full max-w-md border border-gray-300 rounded-lg p-6 text-center align-middle bg-white dark:bg-gray-800 shadow-lg '>
      <legend>
        <h1>Log Out</h1>
      </legend>
      <button
        onClick={handleLogout}
        className='cursor-pointer bg-red-500 text-white rounded-md p-2 mt-4 hover:bg-red-600'
        disabled={isPending}
      >
        {isPending ? 'Logging out...' : 'Yes, I want to log out'}
      </button>
    </fieldset>
  )
}

export default Login
