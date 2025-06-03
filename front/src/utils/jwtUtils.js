/**
 * JWT utility functions for token decoding and user information extraction
 * Toggle storage using the 'useSessionStorage' flag: true for sessionStorage, false for localStorage.
 */
const useSessionStorage = true; // set to false to use localStorage instead

/**
 * Get the configured storage (sessionStorage or localStorage)
 */
function getStorage() {
  return useSessionStorage ? sessionStorage : localStorage;
}

/**
 * Decode JWT token to get payload without verification
 * @param {string} token - The JWT token
 * @returns {object|null} - The decoded payload or null if invalid
 */
export function decodeJWT(token) {
  try {
    if (!token) return null;

    // JWT tokens have 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Decode base64 and parse JSON
    const decodedPayload = JSON.parse(atob(paddedPayload));

    return decodedPayload;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Get current user information from stored JWT token
 * @returns {object|null} - User info with userId and username, or null if not available
 */
export function getCurrentUser() {
  try {
    // Try sessionStorage first (tab-specific), then localStorage (global)
    const token = getStorage().getItem("token");
    if (!token) return null;

    const payload = decodeJWT(token);
    if (!payload) return null;

    // Get the base identifier (username from JWT)
    const baseIdentifier = payload.username || payload.email || payload.sub;

    return {
      userId: baseIdentifier, // Use the raw identifier as userId
      username: baseIdentifier, // Keep username the same for compatibility
      email: baseIdentifier, // Add explicit email field for color consistency
      // Extract display name from username (everything before @ if email-like, or first part if contains dots/underscores)
      displayName: extractDisplayName(baseIdentifier),
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Extract a display name from a username
 * If username looks like an email, extract the part before @
 * If username contains dots or underscores, extract the first part
 * Otherwise, return the username as is
 * @param {string} username - The username to extract display name from
 * @returns {string} - The extracted display name
 */
export function extractDisplayName(username) {
  if (!username) return "Anonymous";

  // If it contains @, treat as email and extract the part before @
  if (username.includes("@")) {
    return username.split("@")[0];
  }

  // If it contains dots or underscores, extract the first part
  if (username.includes(".") || username.includes("_")) {
    return username.split(/[._]/)[0];
  }

  // Return username as is if no special characters
  return username;
}

/**
 * Check if the current JWT token is expired
 * @returns {boolean} - True if token is expired or invalid
 */
export function isTokenExpired() {
  try {
    const token = getStorage().getItem("token");
    if (!token) return true;

    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}

/**
 * Store token for the current tab (sessionStorage) and optionally globally
 * @param {string} token - The JWT token to store
 * @param {boolean} rememberGlobally - Whether to also store in localStorage for persistence
 */
export function storeToken(token, rememberGlobally = false) {
  if (!token) return;

  // Store token in the configured storage
  getStorage().setItem("token", token);
  // Optionally store globally in localStorage regardless of primary storage
  if (rememberGlobally && useSessionStorage) {
    localStorage.setItem("token", token);
  }
}

/**
 * Clear authentication tokens
 */
export function clearTokens() {
  // Remove from both storages to ensure cleanup
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
}
/**
 * Get token from configured storage
 */
export function getToken() {
  return getStorage().getItem("token");
}
