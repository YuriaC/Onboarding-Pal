// import jwt from 'jsonwebtoken';
const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (id, username, role) => {
  const token = jwt.sign({ id, username, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });
  console.log(token)
  return token;
};

generateToken(123, 'abc', 'hr')

// export default generateToken;
module.exports = generateToken
