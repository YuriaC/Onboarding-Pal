// user registration validator
import validator from 'validator';
import {USERNAME_MIN_LEN, USERNAME_MAX_LEN, EMAIL_MIN_LEN, PWD_MIN_LEN} from "../model/User.js";


// global variables
const USERNAME_MIN_LEN = 3;
const USERNAME_MAX_LEN = 12;
const EMAIL_MIN_LEN = 5;
const PWD_MIN_LEN = 8;


// helper function for password validation msg display
function passWordValidationMsg(password, minLength = PWD_MIN_LEN) {
    const hasUpperCase = /[A-Z]/.test(password);   // Checks for uppercase letter
    const hasLowerCase = /[a-z]/.test(password);   // Checks for lowercase letter
    const hasDigit = /[0-9]/.test(password);       // Checks for digit
    const hasSpecialChar = /[!_@#$%^&*(),.?":{}|<>]/.test(password);  // Checks for special character
    
    if (password.length < minLength) {
        return 'Password must be at least 8 characters long.';
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!hasDigit) {
        return 'Password must contain at least one digit.';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character.';
    }
    
    return 'Invalid password.';
}

const employeeRegistrationValidation = (req, res, next) => {
    const {username, email, password, rePassword} = req.body;
    if ( // if any input fields are empty
        !username ||
        !email || 
        !password || 
        !rePassword ||
        validator.isEmpty(username) ||
        validator.isEmpty(email) ||
        validator.isEmpty(password) ||
        validator.isEmpty(rePassword)
    ) {
        return res.status(400).json({ message: 'Missing required fields!' });
    }

    // username must be of alphanumeric
    if (!validator.isAlphanumeric(username)) {
        return res.status(400).json({ message: 'Username must not contain special symbol' });
    }

    // if username too short
    if (username.length < USERNAME_MIN_LEN) {
        return res.status(400).json({ message: `Username must contain at least ${USERNAME_MIN_LEN} characters` });
    }
    
    // if username too long
    if (userName.length > USERNAME_MAX_LEN) {
        return res.status(400).json({ message: `Username contains ${userName.length} characters, exceeding max ${USERNAME_MAX_LEN} characters` });
    }

  // if email too short
    if (email.length < EMAIL_MIN_LEN) {
        return res.status(400).json({ message: `Email address is too short...` });
    }

    // email must be of correct format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    // two password entries must be the same
    if (password !== rePassword) {
        return res.status(400).json({ message: "Passwords don't match." });
    }

    // must use strong password
    if (!validator.isStrongPassword(password)) {
        const msg = passWordValidationMsg(password, PWD_MIN_LEN);
        return res.status(400).json({message: msg});
    }

    next();
}

// user Login Validation, can use both email or username to login
const employeeLoginValidation = (req, res, next) => {
    const { credential, password } = req.body;
    if (
        !credential ||
        !password || 
        validator.isEmpty(credential) ||
        validator.isEmpty(password)
    ) {
        return res.status(400).json({ message: 'Missing required fields!' });
    }

    if (validator.isAlphanumeric(credential) && validator.isEmail(credential)) {
        return res.status(400).json({ message: 'Invalid credential. Login with either email address or username.' });
    }

    next();
};

export { employeeRegistrationValidation, employeeLoginValidation };