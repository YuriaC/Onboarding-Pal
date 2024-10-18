
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
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

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

const setApplicationInput = async(req, res) =>{
    // tested working
    const username = req.body.username;
    const firstname = req.body.firstName;
    const lastname = req.body.lastName;
    const middlename = req.body.middleName;
    const preferredname = req.body.preferredName;
    let profilePictureURL = ''
    const { files } = req
    console.log('files:', files)
    const { AccessKeyId, SecretAccessKey, SessionToken } = req.credentials
    const { building, street, city, state, zip } = req.body
    const address = `${building}, ${street}, ${city}, ${state} ${zip}`
    const { permResStatus } = req.body
    const cellPhone = req.body.cellPhone;
    const workPhone = req.body.workPhone
    const { carMake, carModel, carColor } = req.body
    //const email;//prefilled can not edit retrieve from user register info
    const ssn = req.body.ssn;
    const dob = req.body.dob;
    const gender = req.body.gender;
    const workauth = req.body.nonPermWorkAuth; //gc,citizen,work auth type
    const workauth_url = req.body.workAuthFile_url;
    const dlnum = req.body.dlNum;
    const dldate = req.body.dlExpDate;
    const dlurl = req.body.driversLicenseCopy_url;
    const { refFirstName, refLastName, refMiddleName, refPhone, refEmail, refRelationship } = req.body
    const emergencyContacts = req.body.emergencyContacts
    // console.log('emergencyContacts:', emergencyContacts)
    // for (const emergencyContact of emergencyContacts) {
    //     console.log('emergencyContact:', emergencyContact.firstName)
    // }

    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: AccessKeyId,
            secretAccessKey: SecretAccessKey,
            sessionToken: SessionToken,
        }
    })

    try {
        const filePromises = files.map(file => {
            const newFileName = `${Date.now().toString()}-${file.originalname}`
            console.log('file:', file)
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: newFileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            })

            return s3.send(command).then(() => {
                const fileURL = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${newFileName}`
                if (file.fieldname === 'profilePicture') {
                    profilePictureURL = fileURL
                }
            })
        })

        const uploadedFiles = await Promise.all(filePromises)

        const user = await User.findOne({ username }).lean().exec();
        if (!user) {
            return res.status(404).json('User not Found!');
        }

        const reference = await Contact.create({
            firstName: refFirstName,
            lastName: refLastName,
            middleName: refMiddleName,
            cellPhone: refPhone,
            email: refEmail,
            relationship: refRelationship,
            relationshipToId: "6711edc999bed2d3ff6f0f45",
        })
        if (!reference) {
            return res.status(500).json('Error creating reference!')
        }

        const result = await User.updateOne(
            { _id: user._id },
            { $set: {
                "firstName": firstname,
                "lastName": lastname,
                "middleName": middlename,
                "preferredName": preferredname,
                "profilePictureURL": profilePictureURL,
                "address": address,
                "cellPhone": cellPhone,
                "workPhone": workPhone,
                "carMake": carMake,
                "carModel": carModel,
                "carColor": carColor,
                "ssn": ssn,
                "birthday": dob,
                "gender": gender,
                "workAuth": workauth,
                "workAuthFile_url": workauth_url,
                "driversLicenseNumber": dlnum,
                "driversLicenseExpDate": dldate,
                "driversLicenseCopy_url": dlurl,
                "permResStatus": permResStatus,
                "referer": reference._id,
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
            profilePictureURL: user.profilePictureURL,
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
