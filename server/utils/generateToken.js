
// import jwt from 'jsonwebtoken';
const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (id, username, role) => {
  const token = jwt.sign({ id, username, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '3h',
  });
  console.log(token);
  return token;
};

// Can we delete this chunk of code?
if (process.argv[2] === 'hr') {
  generateToken(123, 'abc', 'hr')
}
else {
  generateToken(123, 'abc', 'employee')
}

// export default generateToken;
module.exports = generateToken
