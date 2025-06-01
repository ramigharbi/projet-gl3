import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthSection from './components/AuthSection';
import DocsHomepage from './pages/docs/page';
import DocumentPage from './pages/document/[id]/page';
import './App.css';

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));

  if (!authed) {
    return <AuthSection onAuth={() => setAuthed(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<DocsHomepage />} />
      <Route path="/document/:id" element={<DocumentPage />} />
    </Routes>
  );
}

export default App;
