/**
 * Anonymous session UUID helper (T008)
 *
 * Generates or retrieves a persistent anonymous session UUID stored in
 * localStorage. This ID is attached to every chat API request to associate
 * conversation history with a browser session without requiring user login.
 *
 * - Key: `qr_session_id`
 * - Format: RFC 4122 UUID v4 (via crypto.randomUUID)
 * - Fallback: Math.random-based UUID for environments without crypto API
 */

const SESSION_KEY = 'qr_session_id'

/** Generate an RFC-4122 compliant UUID v4 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Returns the anonymous session ID for the current browser session.
 *
 * On first call, a new UUID is created and stored in localStorage.
 * On subsequent calls, the stored UUID is returned.
 *
 * Safe to call on the server (returns `null` — only used client-side).
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') {
    // Server-side rendering: no session
    return null
  }

  try {
    let sessionId = localStorage.getItem(SESSION_KEY)

    if (!sessionId) {
      sessionId = generateUUID()
      localStorage.setItem(SESSION_KEY, sessionId)
    }

    return sessionId
  } catch {
    // localStorage may be blocked (e.g., private browser mode edge cases)
    return generateUUID()
  }
}

/**
 * Force-reset the session ID. Useful for testing or when a user
 * explicitly clears their chat history.
 */
export function resetSessionId(): string {
  const newId = generateUUID()

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_KEY, newId)
    } catch {
      // silently ignore
    }
  }

  return newId
}
