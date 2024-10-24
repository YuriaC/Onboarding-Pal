// import jwt from 'jsonwebtoken';
const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (id, username, role, onboardingStatus) => {
  const token = jwt.sign({ id, username, role, onboardingStatus }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '3h',
  });
  return token;
};

// // Can we delete this chunk of code?
// if (process.argv[2] === 'hr') {
//   generateToken(123, 'HRTest', 'hr')
// }
// else {
//   generateToken(123, 'EmployeeTest', 'employee')
// }

// export default generateToken;
module.exports = generateToken;
