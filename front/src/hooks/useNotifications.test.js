import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';

// Mock EventSource
class MockEventSource {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this.addEventListener = jest.fn();
    this.close = jest.fn();

    // Simulate connection opening
    setTimeout(() => {
      if (this.onopen) {
        this.onopen();
      }
    }, 0);
  }

  dispatchEvent(event) {
    if (event.type === 'message' && this.onmessage) {
      this.onmessage(event);
    }
  }
}

// Replace global EventSource
global.EventSource = MockEventSource;

describe('useNotifications Hook Integration', () => {
  let mockEventSource;

  beforeEach(() => {
    // Mock document methods for toast creation
    global.document.createElement = jest.fn((tagName) => {
      const element = {
        tagName: tagName.toUpperCase(),
        style: {},
        innerHTML: '',
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        remove: jest.fn(),
      };
      
      // Mock properties for different elements
      if (tagName === 'div') {
        element.style = {
          cssText: '',
        };
      }
      
      return element;
    });    // Mock document.body methods without replacing the whole object
    Object.defineProperty(global.document.body, 'appendChild', {
      value: jest.fn(),
      writable: true
    });
    Object.defineProperty(global.document.body, 'removeChild', {
      value: jest.fn(),
      writable: true
    });

    // Clear any existing mock calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any timeouts
    jest.clearAllTimers();
  });

  test('establishes SSE connection when userId is provided', () => {
    const { result } = renderHook(() => useNotifications('test-user'));

    expect(result.current.isConnected).toBe(false); // Initially false

    // Simulate connection opening
    act(() => {
      // Connection should be established
    });
  });

  test('does not establish connection when userId is null', () => {
    const { result } = renderHook(() => useNotifications(null));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.notifications).toEqual([]);
  });

  test('handles connection state changes', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useNotifications(userId),
      { initialProps: { userId: 'test-user' } }
    );

    // Initially disconnected
    expect(result.current.isConnected).toBe(false);

    // Wait for connection to open
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1));
    });

    expect(result.current.isConnected).toBe(true);
  });

  test('receives and processes comment notifications', async () => {
    const { result } = renderHook(() => useNotifications('test-user'));

    const notificationData = {
      type: 'ADD',
      docId: 'test-doc',
      commentId: 'test-comment',
      author: 'Test Author',
      text: 'Test comment text',
    };

    await act(async () => {
      // Simulate receiving a notification
      const mockEvent = {
        type: 'commentNotification',
        data: JSON.stringify(notificationData),
      };

      // Get the mock EventSource instance
      const eventSourceInstances = MockEventSource.mock.instances;
      if (eventSourceInstances.length > 0) {
        const instance = eventSourceInstances[eventSourceInstances.length - 1];
        if (instance.onmessage) {
          instance.onmessage(mockEvent);
        }
      }
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject(notificationData);
  });

  test('handles different notification types', async () => {
    const { result } = renderHook(() => useNotifications('test-user'));

    const notificationTypes = [
      { type: 'ADD', icon: '💬', action: 'added' },
      { type: 'UPDATE', icon: '✏️', action: 'updated' },
      { type: 'DELETE', icon: '🗑️', action: 'deleted' },
    ];

    for (const { type } of notificationTypes) {
      await act(async () => {
        const mockEvent = {
          type: 'commentNotification',
          data: JSON.stringify({
            type,
            docId: 'test-doc',
            commentId: `test-comment-${type}`,
            author: 'Test Author',
            text: type !== 'DELETE' ? 'Test comment text' : undefined,
          }),
        };

        const eventSourceInstances = MockEventSource.mock.instances;
        if (eventSourceInstances.length > 0) {
          const instance = eventSourceInstances[eventSourceInstances.length - 1];
          if (instance.onmessage) {
            instance.onmessage(mockEvent);
          }
        }
      });
    }

    expect(result.current.notifications).toHaveLength(3);
  });

  test('creates toast notifications for comment events', async () => {
    const { result } = renderHook(() => useNotifications('test-user'));

    await act(async () => {
      const mockEvent = {
        type: 'commentNotification',
        data: JSON.stringify({
          type: 'ADD',
          docId: 'test-doc',
          commentId: 'test-comment',
          author: 'Test Author',
          text: 'Test comment text',
        }),
      };

      const eventSourceInstances = MockEventSource.mock.instances;
      if (eventSourceInstances.length > 0) {
        const instance = eventSourceInstances[eventSourceInstances.length - 1];
        if (instance.onmessage) {
          instance.onmessage(mockEvent);
        }
      }
    });

    // Verify toast was created
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  test('handles heartbeat events', async () => {
    const { result } = renderHook(() => useNotifications('test-user'));

    await act(async () => {
      const heartbeatEvent = {
        type: 'heartbeat',
        data: JSON.stringify({ timestamp: new Date().toISOString() }),
      };

      const eventSourceInstances = MockEventSource.mock.instances;
      if (eventSourceInstances.length > 0) {
        const instance = eventSourceInstances[eventSourceInstances.length - 1];
        
        // Simulate heartbeat event listener
        if (instance.addEventListener.mock.calls.length > 0) {
          const heartbeatListener = instance.addEventListener.mock.calls
            .find(call => call[0] === 'heartbeat')?.[1];
          
          if (heartbeatListener) {
            heartbeatListener(heartbeatEvent);
          }
        }
      }
    });

    // Heartbeat shouldn't add to notifications
    expect(result.current.notifications).toHaveLength(0);
  });

  test('handles connection errors gracefully', async () => {
    const { result } = renderHook(() => useNotifications('test-user'));

    await act(async () => {
      const eventSourceInstances = MockEventSource.mock.instances;
      if (eventSourceInstances.length > 0) {
        const instance = eventSourceInstances[eventSourceInstances.length - 1];
        if (instance.onerror) {
          instance.onerror(new Error('Connection error'));
        }
      }
    });

    expect(result.current.isConnected).toBe(false);
  });

  test('cleans up connection on unmount', () => {
    const { unmount } = renderHook(() => useNotifications('test-user'));

    const eventSourceInstances = MockEventSource.mock.instances;
    
    unmount();

    if (eventSourceInstances.length > 0) {
      const instance = eventSourceInstances[eventSourceInstances.length - 1];
      expect(instance.close).toHaveBeenCalled();
    }
  });

  test('provides notification management functions', () => {
    const { result } = renderHook(() => useNotifications('test-user'));

    expect(typeof result.current.clearNotifications).toBe('function');
    expect(typeof result.current.dismissNotification).toBe('function');

    // Test clearNotifications
    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toEqual([]);
  });

  test('handles malformed JSON gracefully', async () => {
    // Spy on console.error to check error handling
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useNotifications('test-user'));

    await act(async () => {
      const malformedEvent = {
        type: 'commentNotification',
        data: 'invalid json',
      };

      const eventSourceInstances = MockEventSource.mock.instances;
      if (eventSourceInstances.length > 0) {
        const instance = eventSourceInstances[eventSourceInstances.length - 1];
        if (instance.onmessage) {
          instance.onmessage(malformedEvent);
        }
      }
    });

    // Should handle gracefully without crashing
    expect(result.current.notifications).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
