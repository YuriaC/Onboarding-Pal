
const User = require('../models/User');
const House = require('../models/House');
const Contact = require('../models/Contact');
const Yup = require('yup');
const { JSDOM } = require('jsdom');
const argon2 = require("argon2");
const DOMPurify = require('isomorphic-dompurify');
const generateToken = require("../utils/generateToken");
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
    await registerSchema.validate(req.body);
    const username = sanitizeInput(req.body.username);
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);
    try{
        const duplicate = await User.findOne({ username }).lean().exec();
        if (duplicate) {
          return res.status(409).json({ message: 'Username already exists' });
        }

        const randomHouse = await House.aggregate([
            { $sample: { size: 1 } } // Fetch a random document
          ]);
        
        /* If we're creating the user elsewhere */
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
                    house: randomHouse[0]._id,
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
        }else{
            return res.status(404).json({ message: 'Email not Found!' });
        }
        /* End section */
        
        /* If we're creating the user right here */
        const hashedPassword = await argon2.hash(password);
        //add new employee to the house
        await House.updateOne(
            {_id:randomHouse[0]._id},{
            $push:{"employees":existingUser._id}//push into the employee array
        });
        // generate JWT token
        const token = generateToken(existingUser._id.toString(), username, role);
        // assign cookies
        res.cookie('auth_token', token);
        return res.status(200).json('Register Successfully');
        /* End section */
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

const getHouse= async(req,res) =>{
    //tested working
    const username = req.query.username;
    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        return res.status(200).json({house: user.house});
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const setApplicationInput = async(req,res) =>{
    // tested working
    const username = req.body.username;
    const firstname = req.body.firstName;
    const lastname = req.body.lastName;
    const middlename = req.body.middleName;
    const preferredname = req.body.preferredName;
    const profile_url = req.body.profilePicture_url;
    const address = req.body.address;
    const phone = req.body.cellPhone;
    const carmake = req.body.carMake;
    const carmodel = req.body.carModel;
    const carcolor = req.body.carColor;
    //const email;//prefilled can not edit retrieve from user register info
    const ssn = req.body.ssn;
    const dob = req.body.birthday;
    const gender = req.body.gender;
    const workauth = req.body.workAuth; //gc,citizen,work auth type
    const workauth_url = req.body.workAuthFile_url;
    const dlnum = req.body.driversLicenseNumber;
    const dldate = req.body.driversLicenseExpDate;
    const dlurl = req.body.driversLicenseCopy_url;
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
                "carModel":carmodel,
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
    // tested working
    const username = req.body.username;
    const contact_type = req.body.contact_type;// emergency or reference

    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }

        const newContactQuery = {
            firstName:req.body.contact_firstname,
            lastName:req.body.contact_lastname,
            middleName:req.body.contact_middlename,
            cellPhone:req.body.contact_phone,
            email:req.body.contact_email,
            relationship:req.body.contact_relationship,
        }

        const updateEmployeeContacts = async (update_contact_type,contact_id,mongo_user)=>{
            // update the contacts for employee

            //first check if the contact already exists in user's contacts
            if(contact_id){    
                let query = null;
                if(update_contact_type === "emergency"){
                    const contactExists = mongo_user.emergencyContacts.some(id => id.equals(contact_id));
                    if(contactExists){
                        return res.status(401).json(`Emergency contacts exists`);
                    }
                    query={ 
                        "emergencyContacts": contact_id,
                    }
                }else if(update_contact_type === "references"){
                    const contactExists = mongo_user.references.some(id => id.equals(contact_id));
                    if(contactExists){
                        return res.status(401).json(`references contacts exists`);
                    }
                    query={ 
                        "references": contact_id,
                    }
                }
                else{
                    return res.status(401).json(`invalid contact type`);
                }
                const user_result = await User.updateOne(
                    { _id: user._id },
                    { $push: query
                    }
                );
                if(!user_result.acknowledged){
                    return res.status(401).json(`updated contact for user ${user_result.acknowledged?"success":"failed"}`);
                }
                return res.status(200).json(`updated status success}`);
            }else{
                return res.status(401).json(`updated contact failed`);
            }
        }

        //check if the contact exist
        const existingContact = await Contact.findOne(newContactQuery)
        .lean()
        .exec();

        if(existingContact){
            //if contact exist, update the contact relationshipToId
            // update the employee emergency/reference contact
            const existingContact_update = await Contact.updateOne(
                { _id: existingContact._id },
                { $push: {"relationshipToId":user._id}
                }
            );
            //add contact id to user emerg/referenceid
            updateEmployeeContacts(contact_type,existingContact._id,user);
        }
        else{//if contact does not exist
            newContactQuery.relationshipToId=[user._id];
            const newContact = await Contact.create(
                newContactQuery
            );
            updateEmployeeContacts(contact_type,newContact._id,user);
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};


const getPersonalinfo = async(req,res) =>{
    //tested working
    const username = req.query.username;
    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        return res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            preferredName: user.preferredName,
            profilePicture_url: user.profilePicture_url,
            email: user.email,
            ssn: user.ssn,
            birthday: user.birthday,
            gender: user.gender,
            address: user.address,
            cellPhone: user.cellPhone,
            workPhone: user.workPhone,
            visaTitle: user.visaTitle,
            visaStartDate: user.visaStartDate,
            visaEndDate: user.visaEndDate,
            emergency_contact_ids: user.emergencyContacts,// an array of ids, should have at least one er contact
            workAuthFile_url: user.workAuthFile_url,
            driversLicenseCopy_url: user.driversLicenseCopy_url,
            optUrl: user.optUrl,
            eadUrl: user.eadUrl,
            i983Url: user.i983Url,
            i20Url: user.i20Url,
        });
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const updateWorkauthdoc = async(req,res) =>{
    //tested working
    const username = req.body.username;
    const optUrl = req.body.optUrl;
    const eadUrl = req.body.eadUrl;
    const i983Url = req.body.i983Url;
    const i20Url = req.body.i20Url;
    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }

        let update_docs = { 
        }
        if(optUrl){
            update_docs.optUrl = optUrl;
        }
        if(eadUrl){
            update_docs.eadUrl = eadUrl;
        }
        if(i983Url){
            update_docs.i983Url = i983Url;
        }
        if(i20Url){
            update_docs.i20Url = i20Url;
        }

        function isObjectEmpty(obj) {
            return obj && Object.keys(obj).length === 0;
        }
        if(isObjectEmpty(update_docs)){
            return res.status(401).json(`no file to update`);
        }

        const result = await User.updateOne(
            { _id: user._id },
            { $set: update_docs
        }
        );
        if(!result.acknowledged){
            return res.status(401).json(`updated document for user ${result.acknowledged?"success":"failed"}`);
        }
        return res.status(200).json(`updated document ${result.acknowledged?"success":"failed"}`);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

};

const updateWorkauthStatus = async(req,res) => {
    //tested working
    const username = req.body.username;
    const optStatus = req.body.optStatus;
    const eadStatus = req.body.eadStatus;
    const i983Status = req.body.i983Status;
    const i20Status = req.body.i20Status;
    try{
        const user = await User.findOne({ username })
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }

        let update_status = { 
        }
        if(optStatus){
            update_status.optStatus = optStatus;
        }
        if(eadStatus){
            update_status.eadStatus = eadStatus;
        }
        if(i983Status){
            update_status.i983Status = i983Status;
        }
        if(i20Status){
            update_status.i20Status = i20Status;
        }

        function isObjectEmpty(obj) {
            return obj && Object.keys(obj).length === 0;
        }
        if(isObjectEmpty(update_status)){
            return res.status(401).json(`no file to update`);
        }

        const result = await User.updateOne(
            { _id: user._id },
            { $set: update_status
        });
        if(!result.acknowledged){
            return res.status(401).json(`updated document status for user ${result.acknowledged?"success":"failed"}`);
        }
        return res.status(200).json(`updated document status ${result.acknowledged?"success":"failed"}`);

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    register,
    login,
    getOnboardingStatus,
    setOnboardingStatus,
    getEmail,
    getHouse,
    setApplicationInput,
    setContactInput,
    getPersonalinfo,
    updateWorkauthdoc,
    updateWorkauthStatus,
    checkRegister,
    sendRegistrationLink
}
