// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const validator = require('validator')

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  try {
    // get token from cookie
    const token = req.cookies['auth_token'];
    // const token = req.headers.authorization.split(' ')[1];
    if (!token || validator.isEmpty(token)) {
      return res.status(401).json('No token provided');

    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { userId: decoded.id, username: decoded.username, role: decoded.role }
    next();
  }
  catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json('Invalid token');
    }
    return res.status(400).json('Bad request');
  }
};

const isHR = (req, res, next) => {
  
  if (req.body.role !== 'hr') {
    return res.status(403).json('Must be HR to access this!')
  }

  next();
}

module.exports = {
  authenticateJWT,
  isHR,
}