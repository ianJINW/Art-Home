import React from 'react'
import { Link } from 'react-router-dom'
import { Image, MessageCircle, UserPlus } from 'lucide-react'

// Props: whether sidebar is open, and a function to close it
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    // Fixed full-screen overlay, visible only when isOpen
    <div
      className={`fixed inset-0 z-40 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}
      aria-hidden={!isOpen}
    >
      {/* Semi-transparent backdrop */}
      <div className='absolute inset-0 bg-black opacity-50' onClick={onClose} />
      {/* Actual sidebar panel */}
      <nav className='relative bg-gray-800 w-64 h-full p-6'>
        <button className='absolute top-4 right-4 text-white' onClick={onClose}>
          ✕
        </button>
        <ul className='mt-8 flex flex-col gap-6'>
          <li>
            <Link
              to='/gallery'
              onClick={onClose}
              className='flex items-center gap-2 text-gray-200 hover:text-white'
            >
              <Image size={20} /> Gallery
            </Link>
          </li>
          <li>
            <Link
              to='/chat'
              onClick={onClose}
              className='flex items-center gap-2 text-gray-200 hover:text-white'
            >
              <MessageCircle size={20} /> Chat
            </Link>
          </li>
          <li>
            <Link
              to='/artists'
              onClick={onClose}
              className='flex items-center gap-2 text-gray-200 hover:text-white'
            >
              <UserPlus size={20} /> Artists
            </Link>
          </li>
          <li>
            <Link
              to='/create-chat'
              onClick={onClose}
              className='flex items-center gap-2 text-gray-200 hover:text-white'
            >
              <MessageCircle size={20} /> Create Chat
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
