import "./CSS/App.css";
import DocumentView from "./views/DocumentView"; // Updated import path
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import TextEditor from "./components/quill/TextEditor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

// Main App
export default function App() {
  if (!DocumentView || typeof DocumentView !== "function") {
    console.error(
      "[App.js] DocumentView is NOT a function! Value:",
      DocumentView
    );
    return (
      <div>
        <h1>Error: DocumentView Not Loaded Correctly</h1>
        <p>Received type: {typeof DocumentView}</p>
        <p>Received value: {JSON.stringify(DocumentView)}</p>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Router>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={`/documents/${uuidV4()}`} replace />}
            />
            <Route
              path="/documents/:id"
              element={<DocumentView docId="doc1" />}
            />
          </Routes>
        </Router>
      </div>
    </ApolloProvider>
  );
}
