/**
 * Client-Side Rate Limiter
 *
 * Provides protection against rapid API calls that could:
 * - Exhaust database resources
 * - Degrade performance for other users
 * - Increase infrastructure costs
 * - Cause accidental DoS from runaway scripts/bugs
 *
 * This is a defensive measure that complements server-side protections.
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Simple sliding window rate limiter
 * Tracks timestamps of actions and enforces limits per action type
 */
class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  /**
   * Check if an action can be performed based on rate limits
   *
   * @param action - Unique identifier for the action (e.g., 'create_tag')
   * @param maxRequests - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns true if action is allowed, false if rate limited
   */
  canPerform(action: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const key = action;

    // Get timestamps for this action
    const actionTimestamps = this.timestamps.get(key) || [];

    // Remove timestamps outside the sliding window
    const validTimestamps = actionTimestamps.filter((ts) => now - ts < windowMs);

    // Check if we've hit the limit
    if (validTimestamps.length >= maxRequests) {
      return false;
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.timestamps.set(key, validTimestamps);

    return true;
  }

  /**
   * Check if action can be performed, throwing an error if rate limited
   *
   * @param action - Unique identifier for the action
   * @param config - Rate limit configuration
   * @throws Error if rate limit is exceeded
   */
  enforce(action: string, config: RateLimitConfig): void {
    if (!this.canPerform(action, config.maxRequests, config.windowMs)) {
      const windowSeconds = Math.ceil(config.windowMs / 1000);
      throw new Error(
        `Rate limit exceeded. Maximum ${config.maxRequests} ${action.replace(/_/g, ' ')}s allowed per ${windowSeconds} seconds. Please wait before trying again.`
      );
    }
  }

  /**
   * Get time remaining until next request is allowed (in milliseconds)
   *
   * @param action - Action identifier
   * @param config - Rate limit configuration
   * @returns milliseconds until next request allowed, or 0 if allowed now
   */
  getTimeUntilNextRequest(action: string, config: RateLimitConfig): number {
    const now = Date.now();
    const actionTimestamps = this.timestamps.get(action) || [];
    const validTimestamps = actionTimestamps.filter((ts) => now - ts < config.windowMs);

    if (validTimestamps.length < config.maxRequests) {
      return 0; // No wait needed
    }

    // Calculate when the oldest timestamp will expire
    const oldestTimestamp = Math.min(...validTimestamps);
    const timeUntilExpiry = config.windowMs - (now - oldestTimestamp);

    return Math.max(0, timeUntilExpiry);
  }

  /**
   * Reset rate limit for a specific action (useful for testing)
   *
   * @param action - Action identifier to reset
   */
  reset(action?: string): void {
    if (action) {
      this.timestamps.delete(action);
    } else {
      this.timestamps.clear();
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Pre-configured rate limit configs for common operations
 */
export const RATE_LIMITS = {
  TAG_CREATE: {
    maxRequests: 10,
    windowMs: 60000, // 10 tags per minute
  },
  TAG_UPDATE: {
    maxRequests: 30,
    windowMs: 60000, // 30 updates per minute
  },
  TAG_DELETE: {
    maxRequests: 20,
    windowMs: 60000, // 20 deletions per minute
  },
  OBJECT_CREATE: {
    maxRequests: 5,
    windowMs: 60000, // 5 objects per minute
  },
  OBJECT_UPDATE: {
    maxRequests: 20,
    windowMs: 60000, // 20 updates per minute
  },
} as const;

/**
 * Convenience function for tag creation rate limiting
 */
export function checkTagCreationLimit(): void {
  rateLimiter.enforce('create_tag', RATE_LIMITS.TAG_CREATE);
}

/**
 * Convenience function for tag update rate limiting
 */
export function checkTagUpdateLimit(): void {
  rateLimiter.enforce('update_tag', RATE_LIMITS.TAG_UPDATE);
}

/**
 * Convenience function for tag deletion rate limiting
 */
export function checkTagDeletionLimit(): void {
  rateLimiter.enforce('delete_tag', RATE_LIMITS.TAG_DELETE);
}

/**
 * Convenience function for object creation rate limiting
 */
export function checkObjectCreationLimit(): void {
  rateLimiter.enforce('create_object', RATE_LIMITS.OBJECT_CREATE);
}

/**
 * Convenience function for object update rate limiting
 */
export function checkObjectUpdateLimit(): void {
  rateLimiter.enforce('update_object', RATE_LIMITS.OBJECT_UPDATE);
}
