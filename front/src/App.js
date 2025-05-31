import './App.css';
import Editor from './components/Editor/Editor'; // Updated import path
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';

// Main App
export default function App() {
  if (!Editor || typeof Editor !== 'function') {
    console.error('[App.js] Editor is NOT a function! Value:', Editor);
    return (
      <div>
        <h1>Error: Editor Not Loaded Correctly</h1>
        <p>Received type: {typeof Editor}</p>
        <p>Received value: {JSON.stringify(Editor)}</p>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Editor docId="doc1" /> {/* Using Editor */}
      </div>
    </ApolloProvider>
  );
}
