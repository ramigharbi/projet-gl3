import React from 'react';
import { ApolloProvider } from '@apollo/client';
import './App.css';
import CommentedEditor from "./components/CommentedEditor/CommentedEditor";
import apolloClient from './apolloClient.ts';
import { useNotifications } from './hooks/useNotifications';

// Demo component that includes notifications
function AppWithNotifications() {
  const userId = 'demo-user'; // In a real app, this would come from authentication
  const { isConnected } = useNotifications(userId);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <h1>BlockNote with Comments</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '12px',
            backgroundColor: isConnected ? '#4caf50' : '#f44336',
            color: 'white'
          }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            User: {userId}
          </span>
        </div>
      </div>
      
      <CommentedEditor docId="demo-document" />
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Instructions:</p>
        <ul>
          <li>Select text in the editor and click "Add Comment" to create a comment</li>
          <li>Click on highlighted text to view comment details</li>
          <li>Use the comments panel to edit or delete comments</li>
          <li>Open multiple browser tabs to see real-time notifications</li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppWithNotifications />
    </ApolloProvider>
  );
}

export default App;
