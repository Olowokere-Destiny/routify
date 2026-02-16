interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remainingTime?: number;
}

export function rateLimit(
  identifier: string,
  maxAttempts: number = 3,
  windowMs: number = 30000 // 30 seconds
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  // No entry or expired entry
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true };
  }

  // Entry exists and is still valid
  if (entry.count < maxAttempts) {
    entry.count++;
    return { allowed: true };
  }

  // Rate limit exceeded
  const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
  return {
    allowed: false,
    remainingTime,
  };
}

export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}