const jwt = require('jsonwebtoken');
const { findById } = require('../models/User');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }

    const user = findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.activeToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. You have logged in from another device. Please log in again.',
      });
    }

    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect };
