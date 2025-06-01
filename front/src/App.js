import React, { useState } from 'react';
import AuthSection from './components/AuthSection';
import WelcomeSection from './components/WelcomeSection';
import './App.css';

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));

  if (!authed) {
    return <AuthSection onAuth={() => setAuthed(true)} />;
  }

  return <WelcomeSection onLogout={() => {
    localStorage.removeItem('token');
    setAuthed(false);
  }} />;
}

export default App;
