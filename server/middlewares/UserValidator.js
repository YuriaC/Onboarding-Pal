// user registration validator
const validator = require("validator");
const Yup = require('yup');
const DOMPurify = require('isomorphic-dompurify');
const { JSDOM } = require('jsdom');

// global variables
const USERNAME_MIN_LEN = 3;
const USERNAME_MAX_LEN = 12;
const EMAIL_MIN_LEN = 5;
const PWD_MIN_LEN = 8;

// helper function for sanitizing input
const sanitizeInput = (input) => {
    const dom = new JSDOM('');
    const purify = DOMPurify(dom.window);
    return purify.sanitize(input);
}

// helper function for password validation msg display can be reused in yup schema
function passWordValidationMsg(minLength = PWD_MIN_LEN) {
    return function (value){   
        const hasUpperCase = /[A-Z]/.test(value);   // Checks for uppercase letter
        const hasLowerCase = /[a-z]/.test(value);   // Checks for lowercase letter
        const hasDigit = /[0-9]/.test(value);       // Checks for digit
        const hasSpecialChar = /[!_@#$%^&*(),.?":{}|<>]/.test(value);  // Checks for special character
        
        if (value.length < minLength) {
            return this.createError({ message: `Password must be at least ${minLength} characters long.` })
        }
        if (!hasUpperCase) {
            return this.createError({ message: 'Password must contain at least 1 uppercase letter.'})
        }
        if (!hasLowerCase) {
            return this.createError({ message: 'Password must contain at least 1 lowercase letter.'})
        }
        if (!hasDigit) {
            return this.createError({ message: 'Password must contain at least 1 digit.' });
        }
        if (!hasSpecialChar) {
            return this.createError({ message: 'Password must contain at least 1 special character.' });
        }
        
        return true;
    }
}

// logic for login validation
const loginSchema = Yup.object().shape({
    credential: Yup.string()
        .test('username-or-email', 'Either username or email is required, but not both.', function (value) {
            // Check if the value matches a valid email format
            const isEmail = Yup.string().email().isValidSync(value);
            // Check if the value matches a valid username format
            const isUsername = /^[a-zA-Z0-9_]{3,16}$/.test(value);
            // Pass the test if it's either a valid email or username
            return isEmail || isUsername;
        })
        .required('Username or email address is required.'),

    password: Yup.string()
        .trim()
        .required('Password cannot be empty.')
        .test('password-strength', `Password must be at least ${PWD_MIN_LEN} long,
            contain at least one uppercase letter, 
            one lowercase letter, one digit, and one special character.`, 
            passWordValidationMsg(PWD_MIN_LEN)   
        )
});


// user Login Validation, can use both email or username to login
const employeeLoginValidation = async (req, res, next) => {
    try{
        // const loginData = req.body.form;  // data is encapsulated in form from the font-end
        const loginData = req.body
        // sanitize input data 
        // loginData.credential = sanitizeInput(loginData.credential);
        loginData.credential = sanitizeInput(loginData.userinput);
        loginData.password = sanitizeInput(loginData.password);
        // validate req data using Yup schema
        await loginSchema.validate(loginData, { abortEarly: false });  // abortEarly: false option ensures that Yup will collect all validation errors instead of stopping at the first one.
        
        next();

    } catch (err) {
        console.log('err:', err)
        return res.status(400).json({ message: err.errors });
    }
};


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

// // user Login Validation, can use both email or username to login
// const oldEmployeeLoginValidation = (req, res, next) => {
//     const { credential, password } = req.body;
//     if (
//         !credential ||
//         !password || 
//         validator.isEmpty(credential) ||
//         validator.isEmpty(password)
//     ) {
//         return res.status(400).json({ message: 'Missing required fields!' });
//     }

//     if (validator.isAlphanumeric(credential) && validator.isEmail(credential)) {
//         return res.status(400).json({ message: 'Invalid credential. Login with either email address or username.' });
//     }

//     next();
// };




module.exports = { 
    passWordValidationMsg, 
    employeeRegistrationValidation,
    employeeLoginValidation 
};