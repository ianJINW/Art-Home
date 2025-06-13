import React, { useState, ChangeEvent } from 'react'
import { RegisterUser } from '../utils/api'
import { Eye, EyeClosed, Mail, UserPlus, Lock } from 'lucide-react'

interface RegisterFormData {
  username: string
  email: string
  password: string
  image: File | null
}

const Register: React.FC = () => {
  // Local state for form fields
  const [data, setData] = useState<RegisterFormData>({
    email: '',
    password: '',
    username: '',
    image: null
  })
  const [showPassword, setShowPassword] = useState(false)
  const { mutate, isPending, isError, error } = RegisterUser()

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  // Handler for form submission: create a FormData object
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Create a FormData instance and append fields for file upload
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('username', data.username)
    if (data.image) {
      formData.append('profile', data.image)
    }

    // Trigger the mutation with the FormData
    mutate(formData)
  }

  // Handler for file input change event
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData({ ...data, image: e.target.files[0] })
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 align-middle text-center'>
      <fieldset className='w-full max-w-md border border-gray-300 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg'>
        <legend className='text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200'>
          Register
        </legend>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-4'
          encType='multipart/form-data'
        >
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              <UserPlus size={20} className='inline-block mr-2' />
              Username
            </label>
            <input
              placeholder='Please input Username'
              className='mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 '
              id='username'
              type='text'
              value={data.username}
              onChange={e => setData({ ...data, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              <Mail size={20} className='inline-block mr-2' />
              Email
            </label>
            <input
              placeholder='Please input Email'
              className='mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500'
              id='email'
              type='email'
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              required
            />
          </div>

          <label className='flex items-center gap-2 mt-4'>
            <Lock size={20} />
            Password
          </label>
          <div className='relative'>
            <input
              placeholder='Please input your password'
              type={showPassword ? 'text' : 'password'}
              className='border border-gray-400 rounded-md p-2 mt-1 w-full font-small'
              onChange={e => setData({ ...data, password: e.target.value })}
            />
            {showPassword === false ? (
              <span className='absolute right-2 top-3 text-gray-600'>
                <Eye size={20} onClick={togglePasswordVisibility} />
              </span>
            ) : (
              <span className='absolute right-2 top-3 text-gray-600'>
                <EyeClosed size={20} onClick={togglePasswordVisibility} />
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor='image'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Profile Image
            </label>
            <input
              id='image'
              name='profile'
              type='file'
              accept='image/*'
              className='mt-1 block w-full text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500'
              onChange={handleFileChange}
            />
          </div>

          <button
            className='w-full bg-blue-500 text-white rounded-md p-2 mt-4 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:opacity-50'
            type='submit'
            disabled={isPending}
          >
            {isPending ? 'Registering ...' : 'Register'}
          </button>
          {isError && (
            <p className='text-red-500 text-sm mt-2'>
              Error: {error?.message || 'An error occurred'}
            </p>
          )}
        </form>
      </fieldset>
    </div>
  )
}

export default Register
