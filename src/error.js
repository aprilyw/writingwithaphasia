'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Source Sans Pro, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#3a2c2a', marginBottom: '1rem' }}>
        Something went wrong!
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '500px' }}>
        We encountered an error while loading this page. Please try refreshing or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#3a2c2a',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        Try again
      </button>
    </div>
  )
}
