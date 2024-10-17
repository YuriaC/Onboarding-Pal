
const User = require('../models/User');
const House = require('../models/House');
const Contact = require('../models/Contact');
const Yup = require('yup');
const { JSDOM } = require('jsdom');
const argon2 = require("argon2");
const DOMPurify = require('isomorphic-dompurify');
const { generateToken } = require("../utils/generateToken");
const { sendMail } = require("../utils/sendMails");
const jwt = require('jsonwebtoken');


const registerSchema = Yup.object().shape({
    username: Yup.string()
        .matches(/^[a-zA-Z0-9_]{3,16}$/, 'Username must be 3-16 characters long and alphanumeric.')
        .required('Username is required.'),
    email: Yup.string()
        .email('Invalid email address.')
        .required('Email is required.'),
    password: Yup.string()
        .trim()
        .required('Message cannot be empty.'),
  });
const loginSchema_username = Yup.object().shape({
    username: Yup.string()
        .matches(/^[a-zA-Z0-9_]{3,16}$/, 'Username must be 3-16 characters long and alphanumeric.')
        .required('Username is required.'),
    password: Yup.string()
        .trim()
        .required('Message cannot be empty.'),
});
const sanitizeInput = (input) => {
    const dom = new JSDOM('');
    const purify = DOMPurify(dom.window);
    return purify.sanitize(input);
}

const register = async (req,res) =>{
    //Todo: add house reference
    await registerSchema.validate(req.body);
    const username = sanitizeInput(req.body.username);
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);
    try{
        const duplicate = await User.findOne({ username }).lean().exec();
        if (duplicate) {
          return res.status(409).json({ message: 'Username already exists' });
        }
        const existingUser = await User.findOne({ email }).lean().exec();
        if (existingUser) {
            const hashedPassword = await argon2.hash(password);
            // update user schema if user resend the link
            const updatedUser = await User.updateOne(
                { email: email },
                {
                    username,
                    password: hashedPassword,
                    role: 'employee',
                    //house: find house id randomly assign one
                    onboardingStatus: 'pending',
                    registrationHistory: {
                        $set: {
                            email: email,
                            status: 'registered',
                        },
                    },
                }
            );
            return res.status(200).json('Register Successfully');
        }
    }catch(error){
        return res.status(500).json({ message: error.message});
    }
};
const sendRegistrationLink = async (req,res) =>{
    // Get user information
    const { email } = req.body;
    if (!email ) {
        return res.status(400).json({ message: 'Email is required.' });
      }
      const sanitizedEmail = sanitizeInput(email);
      const token = jwt.sign(
        { email: sanitizedEmail },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '3h' }
      );
      const frontendURL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : 'http://localhost:5173';
      const registrationLink = `${frontendURL}/auth/registration?token=${token}`;
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: sanitizedEmail }).lean().exec();
        if (existingUser) {
            if(existingUser.registrationHistory.status === 'registered'){
                return res.status(409).json({ message: 'User with this email already exists.' });
            }
            // Update user schema if user resend the link
            const updatedUser = await User.updateOne(
                { email: sanitizedEmail },
                {
                    registrationHistory: {
                        $set: {
                            email: sanitizedEmail,
                            status: 'pending',
                            expiresAt: Date.now() + 3 * 60 * 60 * 1000,
                            token: token
                            
                        }
                    }
                });
            if(!updatedUser.acknowledged){
                return res.status(500).json({ message: 'Failed to update user.' });
            }
        }else{
            // Create registration link and user schema when user first register
              const newUser = await User.create({
                email: sanitizedEmail,
                password: '',
                role: 'employee',
                onboardingStatus: 'pending',
                registrationHistory: {
                  email: sanitizedEmail,
                  status: 'pending',
                  expiresAt: Date.now() + 3 * 60 * 60 * 1000,
                  token: token
                },
              });
              if(!newUser){
                return res.status(500).json({ message: 'Failed to create user.' });
              }
              console.log(newUser,"USer Created");
        }
        // Send registration email
        const mailResult = await sendMail(
            registrationLink,
            sanitizedEmail,
            'Welcome to Beaconfire - Here is your Registration Link',
            'dminhnguyen161@gmail.com'
          );
        if (mailResult.error) {
            return res.status(500).json({ message: 'Failed to send email.', error: mailResult.error });
        }
        return res.status(200).json({ registrationLink, message: 'Registration link sent successfully to ' + sanitizedEmail });
    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message });
      }
    };

    // New checkRegister function
const checkRegister = async (req, res) => {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: 'Token is required.' });
    }
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const { email } = decoded;
      // Find the user with the token
      const user = await User.findOne({ email, 'registrationHistory.token': token }).exec();
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }
  
      // Check if token is expired
      if (user.registrationHistory.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'Token has expired.' });
      }
  
      // Check if the user has already registered
      if (user.password) {
        return res.status(400).json({ message: 'User has already registered.' });
      }
      // Allow access to registration page
      return res.status(200).json({ email,message: 'Token is valid. Proceed to registration.' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Token has expired.' });
      }
      return res.status(400).json({ message: 'Invalid token.', error: error.message });
    }
  };


const login = async(req,res)=>{ 
    // tested working
    await loginSchema_username.validate(req.body);
    const username = sanitizeInput(req.body.username);
    const password = sanitizeInput(req.body.password);
    try{
        const user = await User.findOne({ username })
        .select('password')
        .lean()
        .exec();

        if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
        }

        // check if password is correct
        const isPasswordCorrect = await argon2.verify(user.password, password);
        if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Invalid credentials' });
        }

        // generate JWT token
        const token = generateToken(user._id, username, user.role);
        res.cookie('auth_token', token);
        return res.status(200).json('login success');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const getOnboardingStatus = async(req,res) =>{
    // tested working
    const username = req.query.username;
    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        return res.status(200).json({status: user.onboardingStatus});
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const setOnboardingStatus = async(req,res) =>{
    // tested working
    const username = req.query.username;
    const newstatus = req.query.status;
    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        const added = await User.updateOne(
            { _id: user._id },
            { $set: { "onboardingStatus": newstatus } } 
        );
        return res.status(200).json(`updated status ${added}`);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const getEmail= async(req,res) =>{
    //tested working
    const username = req.query.username;
    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        return res.status(200).json({email: user.email});
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const setApplicationInput = async(req,res) =>{
    // not fully tested yet
    const username = req.body.username;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const middlename = req.body.middlename;
    const preferredname = req.body.preferredname;
    const profile_url = req.body.profile_url;
    const address = req.body.address;
    const phone = req.body.phone;
    const carmake = req.body.carmake;
    const carmodel = req.body.carmodel;
    const carcolor = req.body.color;
    //const email;//prefilled can not edit retrieve from user register info
    const ssn = req.body.ssn;
    const dob = req.body.dateofbirth;
    const gender = req.body.gender;
    const workauth = req.body.workauth; //gc,citizen,work auth type
    const workauth_url = req.body.workauth_url;
    const dlnum = req.body.driverlicence_num;
    const dldate = req.body.driverlicence_expdate;
    const dlurl = req.body.driverlicence_url;
    try{   
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }

        const result = await User.updateOne(
            { _id: user._id },
            { $set: { "firstName": firstname,
                "lastName":lastname,
                "middleName":middlename,
                "preferredName":preferredname,
                "profilePicture_url":profile_url,
                "address":address,
                "cellPhone":phone,
                "carMake":carmake,
                "carMmodel":carmodel,
                "carColor":carcolor,
                "ssn":ssn,
                "birthday":dob,
                "gender":gender,
                "workAuth":workauth,
                "workAuthFile_url":workauth_url,
                "driversLicenseNumber":dlnum,
                "driversLicenseExpDate":dldate,
                "driversLicenseCopy_url":dlurl,
            }
        }
        );
        if(result.acknowledged){
            return res.status(200).json(`updated status ${result.acknowledged?"success":"failed"}`);
        }
        return res.status(401).json(`updated status ${result.acknowledged?"success":"failed"}`);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const setContactInput = async(req,res) =>{
    // not tested yet
    const username = req.body.username;
    const contact_type = req.body.contact_type;// emergency or reference
    const cont_firstname = req.body.contact_firstname;
    const cont_lastname = req.body.contact_lastname;
    const cont_middlename = req.body.contact_middlename?req.body.contact_middlename:"";
    const cont_phone = req.body.contact_phone;
    const cont_email = req.body.contact_email;
    const cont_relationship = req.body.contact_relationship;

    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }

        const ref_result = await Contact.create({
            firstName:cont_firstname,
            lastName:cont_lastname,
            middleName:cont_middlename,
            cellPhone:cont_phone,
            email:cont_email,
            relationship:cont_relationship,
            relationshipToId: [user._id]
        });
        if(ref_result.acknowledged){    
            const contact = await Contact.findOne({ cont_firstname }).lean().exec();
            if (!contact) {
                return res.status(401).json({ message: 'contact not Found!' });
            }
            let query = null;
            if(contact_type === "emergency"){
                query={ 
                    "emergencyContacts": contact._id,
                }
            }else if(contact_type === "references"){
                query={ 
                    "references": contact._id,
                }
            }
            const user_result = await User.updateOne(
                { _id: user._id },
                { $push: query
                }
            );
            if(!user_result.acknowledged){
                return res.status(401).json(`updated contact for user ${user_result.acknowledged?"success":"failed"}`);
            }
            return res.status(200).json(`updated status ${user_result.acknowledged?"success":"failed"}`);
        }else{
            return res.status(401).json(`updated contact ${ref_result.acknowledged?"success":"failed"}`);
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const getNavinfo = async(req,res) =>{

};

const getPersonalinfo = async(req,res) =>{

};

const updateWorkauthdoc = async(req,res) =>{

};


module.exports = {
    register,
    login,
    getOnboardingStatus,
    setOnboardingStatus,
    getEmail,
    setApplicationInput,
    setContactInput,
    getNavinfo,
    getPersonalinfo,
    updateWorkauthdoc,
    checkRegister,
    sendRegistrationLink
}
