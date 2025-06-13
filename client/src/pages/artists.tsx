import React, { useState } from 'react'
import { GetData } from '@/utils/api'
import api from '@/utils/axios'
import { Loader2, AlertCircle } from 'lucide-react'

const Artists: React.FC = () => {
  const {
    data: artists,
    isPending: isArtistsPending,
    isError: isArtistsError,
    error: artistsError
  } = GetData('/artist')

  const {
    data: users,
    isPending: isUsersPending,
    isError: isUsersError,
    error: usersError
  } = GetData('/user')

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    socials: [] as string[],
    user: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input changes for name, bio, and user
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle socials input as a comma-separated list
  const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const socialsArray = value.split(',').map(social => social.trim()) // Convert to array
    setFormData({ ...formData, socials: socialsArray })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.bio ||
      formData.socials.length === 0 ||
      !formData.user
    ) {
      setFormError('Please fill in all fields.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/artist', formData)
      setFormError(null)
      window.location.reload()
    } catch (error) {
      setFormError('Failed to create artist. Please try again.')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isArtistsPending || isUsersPending) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='animate-spin text-blue-500' size={40} />
        <p className='ml-4 text-gray-600 text-lg'>Loading...</p>
      </div>
    )
  }

  if (isArtistsError || isUsersError) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <AlertCircle className='text-red-500' size={40} />
        <p className='ml-4 text-red-500 text-lg'>
          Failed to load data. Please try again later.
          {artistsError && (
            <span className='block'>{artistsError.message}</span>
          )}
          {usersError && <span className='block'>{usersError.message}</span>}
        </p>
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6 text-center'>Artists</h1>

      {/* Display existing artists */}
      {Array.isArray(artists?.data) && artists.data.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {artists.data.map(
            (artist: { _id: string; name: string; bio: string }) => (
              <div
                key={artist._id}
                className='border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition-shadow'
              >
                <h2 className='text-lg font-semibold mb-2'>{artist.name}</h2>
                <p className='text-gray-600'>{artist.bio}</p>
              </div>
            )
          )}
        </div>
      ) : (
        <p className='text-center text-gray-600'>
          No artists found. Create one below!
        </p>
      )}

      {/* Form to create a new artist */}
      <div className='mt-8'>
        <h2 className='text-xl font-bold mb-4'>Create a New Artist</h2>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-lg font-medium text-gray-700 mb-2'>
              Name
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              placeholder='Enter artist name'
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-lg font-medium text-gray-700 mb-2'>
              Bio
            </label>
            <textarea
              name='bio'
              value={formData.bio}
              onChange={handleInputChange}
              placeholder='Enter artist bio'
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-lg font-medium text-gray-700 mb-2'>
              Socials
            </label>
            <input
              type='text'
              name='socials'
              value={formData.socials.join(', ')} // Convert array back to a string
              onChange={handleSocialsChange}
              placeholder='Enter artist socials (comma-separated)'
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-lg font-medium text-gray-700 mb-2'>
              Assign User
            </label>
            <select
              name='user'
              value={formData.user}
              onChange={handleInputChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Select a user</option>
              {Array.isArray(users?.users) && users.users.length > 0 ? (
                users.users.map((user: { _id: string; username: string }) => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))
              ) : (
                <option disabled>No users available</option>
              )}
            </select>
          </div>

          {formError && <p className='text-red-500 text-center'>{formError}</p>}

          <button
            type='submit'
            className='px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Artist'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Artists
