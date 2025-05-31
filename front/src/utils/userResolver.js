/**
 * User resolver function for BlockNote comments
 * Fetches user information based on user IDs
 */

// Mock user data - in a real application, you'd fetch this from your backend
const MOCK_USERS = [
  {
    id: 'Anonymous',
    username: 'Anonymous',
    avatarUrl: 'https://via.placeholder.com/32/cccccc/ffffff?text=A'
  },
  {
    id: 'user1',
    username: 'Alice Johnson',
    avatarUrl: 'https://via.placeholder.com/32/2196F3/ffffff?text=AJ'
  },
  {
    id: 'user2', 
    username: 'Bob Smith',
    avatarUrl: 'https://via.placeholder.com/32/4CAF50/ffffff?text=BS'
  },
  {
    id: 'user3',
    username: 'Carol Davis',
    avatarUrl: 'https://via.placeholder.com/32/FF9800/ffffff?text=CD'
  },
  {
    id: 'admin',
    username: 'Administrator',
    avatarUrl: 'https://via.placeholder.com/32/F44336/ffffff?text=AD'
  }
];

/**
 * Resolves user information for the given user IDs
 * @param {string[]} userIds - Array of user IDs to resolve
 * @returns {Promise<Array>} Promise resolving to array of user objects
 */
export async function resolveUsers(userIds) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Filter users that match the requested IDs
  const resolvedUsers = userIds.map(userId => {
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (user) {
      return user;
    }
    
    // Return a default user for unknown IDs
    return {
      id: userId,
      username: userId,
      avatarUrl: `https://via.placeholder.com/32/757575/ffffff?text=${userId.charAt(0).toUpperCase()}`
    };
  });
  
  return resolvedUsers;
}

/**
 * Get a random user for testing purposes
 */
export function getRandomUser() {
  const users = MOCK_USERS.slice(1); // Exclude Anonymous
  return users[Math.floor(Math.random() * users.length)];
}

/**
 * Get a random color for collaboration
 */
export function getRandomColor() {
  const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
  return colors[Math.floor(Math.random() * colors.length)];
}
