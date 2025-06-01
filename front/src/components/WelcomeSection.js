import React from 'react';

export default function WelcomeSection({ onLogout }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            🎉 Welcome!
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem', margin: '0 0 20px 0' }}>
            You are successfully logged in
          </p>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          borderRadius: '15px', 
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
            ✅ Authentication System Ready
          </h3>
          <p style={{ color: '#666', margin: '0 0 20px 0' }}>
            Your JWT token is stored and the authentication system is working perfectly!
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            marginTop: '20px'
          }}>
            <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
              <strong>🔐 JWT Auth</strong><br />
              <small>Secure token-based authentication</small>
            </div>
            <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
              <strong>🛡️ Protected Routes</strong><br />
              <small>Middleware security enabled</small>
            </div>
            <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
              <strong>👥 User Management</strong><br />
              <small>Registration & login working</small>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          style={{ 
            padding: '15px 30px', 
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            color: 'white', 
            border: 'none', 
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
