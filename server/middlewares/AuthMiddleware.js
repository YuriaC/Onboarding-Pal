// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const validator = require('validator')

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {

  try {
    // get token from cookie
    // const token = req.cookies['auth_token'];
    const token = req.headers.authorization.split(' ')[1];
    if (!token || validator.isEmpty(token)) {
      return res.status(401).json('No token provided');
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.body.userId = decoded.id;
    req.body.username = decoded.username;
    req.body.role = decoded.role
    next();
  }
  catch (error) {
    return res.status(401).json('Invalid token');
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