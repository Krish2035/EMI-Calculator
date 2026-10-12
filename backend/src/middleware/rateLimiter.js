const rateLimit = require('express-rate-limit');

// In-Memory store for Email rate limiting
const emailAttempts = new Map();

// General API Rate Limiter (IP-based)
const apiIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

// Strict Auth Endpoint Rate Limiter (IP-based)
const authIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP address. Please try again later.',
  },
});

/**
 * Email-Based Rate Limiting Middleware
 * Prevents brute force and credential stuffing attacks targeted against a specific email address,
 * regardless of whether the attacker is rotating their IP address!
 */
const emailRateLimiter = (maxAttempts = 5, windowMinutes = 15) => {
  const windowMs = windowMinutes * 60 * 1000;

  return (req, res, next) => {
    const rawEmail = req.body?.email || req.query?.email;
    if (!rawEmail) {
      return next(); // If no email in request, IP limiter handles it
    }

    const email = String(rawEmail).trim().toLowerCase();
    const now = Date.now();

    const record = emailAttempts.get(email) || { count: 0, resetAt: now + windowMs };

    // Reset if window has expired
    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count += 1;
    emailAttempts.set(email, record);

    const remainingAttempts = Math.max(0, maxAttempts - record.count);
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader('X-Email-RateLimit-Limit', maxAttempts);
    res.setHeader('X-Email-RateLimit-Remaining', remainingAttempts);

    if (record.count > maxAttempts) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: `Too many login/registration attempts for email "${email}". Please wait ${Math.ceil(retryAfterSeconds / 60)} minutes before trying again.`,
        retryAfterSeconds,
      });
    }

    next();
  };
};

// Reset email rate limit counter upon successful authentication
const resetEmailRateLimit = (email) => {
  if (email) {
    emailAttempts.delete(String(email).trim().toLowerCase());
  }
};

module.exports = {
  apiIpLimiter,
  authIpLimiter,
  emailRateLimiter,
  resetEmailRateLimit,
};
