const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const generateToken = (id, username, role) => {
  const token = jwt.sign({ id, username, role }, ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });
  return token;
};

module.exports = {generateToken}