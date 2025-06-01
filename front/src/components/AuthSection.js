import React from 'react';
import AuthForm from '../AuthForm';

export default function AuthSection({ onAuth }) {
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
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            📝 Google Docs Clone
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem',
            margin: '0'
          }}>
            Collaborative document editing platform
          </p>
        </div>
        
        <AuthForm onAuth={onAuth} />
        
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>🚀 Features</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            fontSize: '14px',
            color: '#666'
          }}>
            <div>🔐 Secure Authentication</div>
            <div>📄 Document Management</div>
            <div>🤝 Real-time Collaboration</div>
            <div>💬 Comments & Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
}
