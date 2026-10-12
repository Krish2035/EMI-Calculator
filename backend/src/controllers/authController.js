const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const queueManager = require('../queues/queueManager');
const { resetEmailRateLimit } = require('../middleware/rateLimiter');

// Helper to sign JWT token
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 1. Email & Password Registration
const register = async (req, res) => {
  try {
    const { email, password, name = 'Smart User' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const dbStatus = db.getStatus();

    // Check if user already exists
    if (dbStatus.connected) {
      const existing = await db.queryRead('SELECT id FROM users WHERE email = $1;', [normalizedEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      }

      // Hash password with bcrypt (salt rounds = 12)
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const insertSql = `
        INSERT INTO users (email, password_hash, name, auth_provider, created_at, updated_at)
        VALUES ($1, $2, $3, 'local', NOW(), NOW())
        RETURNING id, email, name, auth_provider, created_at;
      `;
      const result = await db.queryWrite(insertSql, [normalizedEmail, passwordHash, name]);
      const newUser = result.rows[0];

      // Reset rate limit
      resetEmailRateLimit(normalizedEmail);

      // Async BullMQ jobs
      await queueManager.addEmailJob('welcome-email', { email: normalizedEmail, name });
      await queueManager.addAuditJob('user-registration', { userId: newUser.id, email: normalizedEmail });

      const token = signToken(newUser);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: newUser,
      });
    } else {
      // In-memory fallback
      const existing = (db.usersStore || []).find((u) => u.email === normalizedEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = {
        id: db.userIdCounter(),
        email: normalizedEmail,
        passwordHash,
        name,
        auth_provider: 'local',
        created_at: new Date().toISOString(),
      };

      db.usersStore.unshift(newUser);
      db.saveUsersStore();

      resetEmailRateLimit(normalizedEmail);
      await queueManager.addEmailJob('welcome-email', { email: normalizedEmail, name });

      const token = signToken(newUser);
      const userResponse = { ...newUser };
      delete userResponse.passwordHash;

      return res.status(201).json({
        success: true,
        message: 'Account created successfully (local store)!',
        token,
        user: userResponse,
      });
    }
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + err.message,
    });
  }
};

// 2. Email & Password Signin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const dbStatus = db.getStatus();

    let userRecord = null;

    if (dbStatus.connected) {
      const result = await db.queryRead('SELECT * FROM users WHERE email = $1;', [normalizedEmail]);
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }
      userRecord = result.rows[0];
    } else {
      userRecord = (db.usersStore || []).find((u) => u.email === normalizedEmail);
      if (!userRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }
    }

    // Check if account was created via Google OAuth
    const storedHash = userRecord.password_hash || userRecord.passwordHash;
    if (!storedHash) {
      return res.status(400).json({
        success: false,
        message: 'This account was created using Google. Please click "Continue with Google".',
      });
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Success: Reset rate limit for email
    resetEmailRateLimit(normalizedEmail);

    // Queue audit job
    await queueManager.addAuditJob('user-login', { userId: userRecord.id, email: normalizedEmail });

    const safeUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatar_url || userRecord.avatarUrl,
      authProvider: userRecord.auth_provider || userRecord.authProvider,
    };

    const token = signToken(safeUser);

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + err.message,
    });
  }
};

// 3. Google OAuth Signin / Signup (Firebase)
const googleAuth = async (req, res) => {
  try {
    const { email, name, avatarUrl, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google email is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name || 'Google User';
    const dbStatus = db.getStatus();

    let userRecord = null;

    if (dbStatus.connected) {
      const existing = await db.queryRead('SELECT * FROM users WHERE email = $1;', [normalizedEmail]);

      if (existing.rows.length > 0) {
        userRecord = existing.rows[0];
        // Update avatar/googleId if missing
        if (!userRecord.google_id && googleId) {
          await db.queryWrite(
            'UPDATE users SET google_id = $1, avatar_url = coalesce(avatar_url, $2), updated_at = NOW() WHERE id = $3;',
            [googleId, avatarUrl, userRecord.id]
          );
        }
      } else {
        // Create new user with Google provider
        const insertSql = `
          INSERT INTO users (email, name, avatar_url, auth_provider, google_id, created_at, updated_at)
          VALUES ($1, $2, $3, 'google', $4, NOW(), NOW())
          RETURNING id, email, name, avatar_url, auth_provider, created_at;
        `;
        const result = await db.queryWrite(insertSql, [normalizedEmail, displayName, avatarUrl || null, googleId || null]);
        userRecord = result.rows[0];

        // Queue welcome email
        await queueManager.addEmailJob('welcome-email', { email: normalizedEmail, name: displayName, provider: 'google' });
      }
    } else {
      userRecord = (db.usersStore || []).find((u) => u.email === normalizedEmail);
      if (!userRecord) {
        userRecord = {
          id: db.userIdCounter(),
          email: normalizedEmail,
          name: displayName,
          avatarUrl: avatarUrl || null,
          authProvider: 'google',
          googleId: googleId || null,
          created_at: new Date().toISOString(),
        };
        db.usersStore.unshift(userRecord);
        db.saveUsersStore();
        await queueManager.addEmailJob('welcome-email', { email: normalizedEmail, name: displayName, provider: 'google' });
      }
    }

    resetEmailRateLimit(normalizedEmail);
    await queueManager.addAuditJob('google-login', { userId: userRecord.id, email: normalizedEmail });

    const safeUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatar_url || userRecord.avatarUrl,
      authProvider: 'google',
    };

    const token = signToken(safeUser);

    return res.json({
      success: true,
      message: 'Signed in via Google successfully!',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Google authentication failed: ' + err.message,
    });
  }
};

// 4. Current User Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const dbStatus = db.getStatus();

    if (dbStatus.connected) {
      const result = await db.queryRead('SELECT id, email, name, avatar_url, auth_provider, created_at FROM users WHERE id = $1;', [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user: result.rows[0] });
    } else {
      const user = (db.usersStore || []).find((u) => String(u.id) === String(userId));
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const safe = { ...user };
      delete safe.passwordHash;
      return res.json({ success: true, user: safe });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getProfile,
};
