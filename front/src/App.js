import React, { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import { Routes, Route } from "react-router-dom";
import AuthSection from "./components/AuthSection";
import DocsHomepage from "./pages/docs/page";
import DocumentPage from "./pages/document/[id]/page";
import "./App.css";

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    setAuthed(false);
  };

  if (!authed) {
    return <AuthSection onAuth={() => setAuthed(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<DocsHomepage onLogout={handleLogout} />} />
      <Route path="/document/:id" element={<DocumentPage />} />
    </Routes>
  );
}

export default App;
