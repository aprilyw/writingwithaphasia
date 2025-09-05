import { getFontFamily } from './styles/fonts'

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: getFontFamily(),
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3a2c2a',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '2rem'
      }}></div>
      <p style={{ color: '#3a2c2a', fontSize: '18px' }}>
        Loading...
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
