// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const validator = require('validator')

// Replace with your own secret in production and store it securely
// const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {

  try {
    // get token from header
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
  
  // decode token
  try {
    // get token from header
    // const token = req.headers.authorization.split(' ')[1];
    // if (!token || validator.isEmpty(token)) {
    //   return res.status(401).json('No token provided');
    // }

    // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (req.body.role !== 'hr') {
      return res.status(403).json('Must be HR to access this!')
    }

    // assign data inside the token to the request body so that we can directly access these data in the request object in the route handler functions
    // req.body.userId = decoded.id;
    // req.body.username = decoded.username;
    // req.body.role = decoded.role
  } catch (err) {
    return res.status(401).json('Invalid token');
  }

  next();
}

module.exports = {
  authenticateJWT,
  isHR,
}