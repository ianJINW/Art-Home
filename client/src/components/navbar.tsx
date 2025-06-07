import React, { useState } from 'react'
import useAuthStore from '../stores/auth.store'
import { Link } from 'react-router-dom'
import {
  Image,
  MessageCircle,
  LogOut,
  LogIn,
  UserPlus,
  MoonIcon,
  SunIcon,
  MenuIcon // lucide-react hamburger
} from 'lucide-react'
import Sidebar from './Sidebar'

const Navbar: React.FC = () => {
  // Zustand store selectors
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => !!state.accessToken)
  const isDark = useAuthStore(state => state.isDark)

  // Local state: sidebar open?
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleDark = () => {
    const newDark = !useAuthStore.getState().isDark
    useAuthStore.setState({ isDark: newDark })
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.removeItem('darkMode')
    }
  }

  return (
    <header className='bg-white dark:bg-gray-900 shadow-md'>
      <div className='container mx-auto flex justify-between items-center py-4 px-6'>
        {/* Mobile hamburger (hidden on md+) */}
        <button
          className='md:hidden text-gray-700 dark:text-gray-200'
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon size={24} />
        </button>

        {/* Logo */}
        <Link
          to='/'
          className='text-2xl font-bold text-blue-500 dark:text-blue-400'
        >
          Art-Home
        </Link>

        {/* Desktop nav links (hidden on small) */}
        <nav className='hidden md:flex gap-6 items-center text-gray-700 dark:text-gray-200'>
          <Link
            to='/gallery'
            className='flex items-center gap-2 hover:text-white'
          >
            <Image size={20} /> Gallery
          </Link>
          <Link to='/chat' className='flex items-center gap-2 hover:text-white'>
            <MessageCircle size={20} /> Chat
          </Link>
          <Link
            to='/artists'
            className='flex items-center gap-2 hover:text-white'
          >
            <UserPlus size={20} /> Artists
          </Link>
          <Link
            to='/create-chat'
            className='flex items-center gap-2 hover:text-white'
          >
            <MessageCircle size={20} /> Create Chat
          </Link>
        </nav>

        {/* Right section */}
        <div className='flex items-center gap-4'>
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className='text-gray-700 dark:text-gray-200'
          >
            {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>

          {/* User avatar */}
          {user?.image && (
            <img
              src={
                typeof user.image === 'string'
                  ? user.image
                  : URL.createObjectURL(user.image)
              }
              alt={user.username}
              className='w-10 h-10 rounded-full border-2 border-blue-500 object-cover'
            />
          )}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <Link
              to='/logout'
              className='flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg'
            >
              <LogOut size={20} /> Logout
            </Link>
          ) : (
            <>
              <Link
                to='/login'
                className='flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg'
              >
                <LogIn size={20} /> Login
              </Link>
              <Link
                to='/register'
                className='flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg'
              >
                <UserPlus size={20} /> Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Sidebar overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  )
}

export default Navbar
