import Link from 'next/link'

export default function NotFound() {
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
      <h1 style={{ color: '#3a2c2a', marginBottom: '1rem', fontSize: '3rem' }}>
        404
      </h1>
      <h2 style={{ color: '#3a2c2a', marginBottom: '1rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '500px' }}>
        The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Link href="/" style={{
        background: '#3a2c2a',
        color: 'white',
        textDecoration: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        Go back home
      </Link>
    </div>
  )
}
