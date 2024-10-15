// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

// Replace with your own secret in production and store it securely
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Middleware to authenticate JWT
exports.authenticateJWT = (req, res, next) => {
  // JWT can be sent in the Authorization header as Bearer token
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      req.user = user; // Attach user info to request
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization token required' });
  }
};
