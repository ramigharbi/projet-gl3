import { useState, useEffect, useRef } from 'react';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Create EventSource connection
    const eventSource = new EventSource(`http://localhost:3000/notifications/sse?userId=${userId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        
        if (event.type === 'commentNotification') {
          showToast(data);
          setNotifications(prev => [...prev, { ...data, id: Date.now(), timestamp: new Date() }]);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.addEventListener('commentNotification', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Comment notification received:', data);
        showToast(data);
        setNotifications(prev => [...prev, { ...data, id: Date.now(), timestamp: new Date() }]);
      } catch (error) {
        console.error('Error parsing comment notification:', error);
      }
    });

    eventSource.addEventListener('heartbeat', (event) => {
      console.log('Heartbeat received:', event.data);
    });

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
    };

    eventSource.onclose = () => {
      console.log('SSE connection closed');
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [userId]);

  const showToast = (notification) => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;

    const icon = notification.type === 'ADD' ? '💬' : notification.type === 'DELETE' ? '🗑️' : '✏️';
    const action = notification.type === 'ADD' ? 'added' : notification.type === 'DELETE' ? 'deleted' : 'updated';
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">${icon}</span>
        <div>
          <div style="font-weight: bold;">Comment ${action}</div>
          <div style="font-size: 12px; opacity: 0.8;">by ${notification.author}</div>
          ${notification.text ? `<div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">"${notification.text.substring(0, 50)}${notification.text.length > 50 ? '...' : ''}"</div>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);

    // Click to dismiss
    toast.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    isConnected,
    clearNotifications,
    dismissNotification,
  };
};
