import './App.css';
import DocumentView from './views/DocumentView'; // Updated import path
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';

// Main App
export default function App() {
  if (!DocumentView || typeof DocumentView !== 'function') {
    console.error('[App.js] DocumentView is NOT a function! Value:', DocumentView);
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
        <DocumentView docId="doc1" />
      </div>
    </ApolloProvider>
  );
}
