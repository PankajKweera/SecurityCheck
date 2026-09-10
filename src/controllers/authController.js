const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findByEmail, updateActiveToken } = require('../models/User');
const { validateLogin } = require('../validators/authValidator');

/**
 * Sign a JWT bound to user id.
 * The ts (timestamp) field ensures every new token is unique —
 * so storing only the latest one is enough to kill prior sessions.
 */
const generateToken = (id) =>
  jwt.sign({ id, ts: Date.now() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

// ─────────────────────────────────────────────────────────────
// @desc    Login — issues a new token and invalidates all prior sessions
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const check = validateLogin(req.body);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const { email, password } = req.body;

    const user = findByEmail(email);
    if (!user) {

      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user.id);
    updateActiveToken(user.id, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};


const logout = async (req, res) => {
  try {
    updateActiveToken(req.user.id, null);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

module.exports = { login, logout };
