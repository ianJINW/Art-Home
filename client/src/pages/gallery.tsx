import React, { useEffect } from 'react'
import AuthStore from '@/stores/auth.store'
import { GetData } from '@/utils/api'

const Gallery: React.FC = () => {
  const user = AuthStore(state => state.user)

  const { data, isPending, isError, error } = GetData('art')

  useEffect(() => {
    if (isError) {
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '16px',
        }}
      >
        <p style={{ color: 'red', fontSize: '1.25rem', textAlign: 'center' }}>
          Failed to load gallery. Please try again later.
        </p>
      </div>
    }
  }, [isError, error])

  if (isPending) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            border: '4px solid blue',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 0.65s linear infinite',
          }}
        ></div>
        <p style={{ marginLeft: '16px', fontSize: '1rem', color: 'gray' }}>
          Loading gallery...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '16px',
        }}
      >
        <p style={{ color: 'red', fontSize: '1.25rem', textAlign: 'center' }}>
          Failed to load gallery. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1>Art-Home</h1>
        <p style={{ fontSize: '1rem', color: 'gray', marginLeft: '16px' }}>
          Welcome {user?.username}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {Array.isArray(data) &&
          data.map((piece) => (
            <div key={piece.id} style={{ border: '1px solid #ccc', padding: '16px' }}>
              <img
                src={piece.image}
                alt={piece.title}
                style={{ width: '100%', height: 'auto' }}
              />
              <div style={{ marginTop: '8px' }}>
                <h2>{piece.artist}</h2>
                <button style={{ marginTop: '8px', padding: '8px 16px' }}>
                  I'm here
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Gallery
