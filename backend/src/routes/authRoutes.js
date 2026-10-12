const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authIpLimiter, emailRateLimiter } = require('../middleware/rateLimiter');

// Rate limit email and IP on register & login
router.post('/register', authIpLimiter, emailRateLimiter(5, 15), register);
router.post('/login', authIpLimiter, emailRateLimiter(5, 15), login);
router.post('/google', authIpLimiter, googleAuth);

// Protected routes
router.get('/me', authMiddleware, getProfile);

module.exports = router;
