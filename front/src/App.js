import React, { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import { Routes, Route } from "react-router-dom";
import AuthSection from "./components/AuthSection";
import DocsHomepage from "./pages/docs/page";
import DocumentPage from "./pages/document/[id]/page";
import { clearTokens } from "./utils/jwtUtils";
import "./CSS/App.css";

function App() {
  // Check both sessionStorage and localStorage for authentication
  const [authed, setAuthed] = useState(
    !!(sessionStorage.getItem("token") || localStorage.getItem("token"))
  );

  const handleLogout = () => {
    clearTokens();
    setAuthed(false);
  };

  if (!authed) {
    return <AuthSection onAuth={() => setAuthed(true)} />;
  }

  return (
    <ApolloProvider client={client}>
    <Routes>
      <Route path="/" element={<DocsHomepage onLogout={handleLogout} />} />
      <Route path="/document/:id" element={<DocumentPage />} />
    </Routes>
    </ApolloProvider>
      
  );
}

export default App;
