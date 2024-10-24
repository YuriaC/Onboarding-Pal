
const User = require('../models/User');
const House = require('../models/House');
const Contact = require('../models/Contact');
const Yup = require('yup');  // 
const { JSDOM } = require('jsdom');  //
const argon2 = require("argon2");
const DOMPurify = require('isomorphic-dompurify');  //
const generateToken = require("../utils/generateToken");
const { sendMail } = require("../utils/sendMails");
const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const validator = require('validator')

const registerSchema = Yup.object().shape({
    username: Yup.string()
        .matches(/^[a-zA-Z0-9_]{3,16}$/, 'Username must be 3-16 characters long and alphanumeric.')
        .required('Username is required.'),
    email: Yup.string()
        .email('Invalid email address.')
        .required('Email is required.'),
    password: Yup.string()
        .trim()
        .required('Password cannot be empty.'),
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
        const existingUser = await User.findOne({ email:email });

        if (existingUser) {
            const hashedPassword = await argon2.hash(password);
            // update user schema if user resend the link
            existingUser.username = username;
            existingUser.password = hashedPassword;
            existingUser.role = 'employee';
            existingUser.house = randomHouse[0]._id;
            existingUser.onboardingStatus = 'Pending';
            existingUser.registrationHistory.email = email;
            existingUser.registrationHistory.status = 'Registered';
            await existingUser.save();
            // Add user ID to their assigned house as well
            const house = await House.findById(randomHouse[0]._id)
            house.employees.push(existingUser._id)
            await house.save()
        }else{
            return res.status(404).json({ message: 'Email not Found!' });
        }
        /* End section */
        
        /* If we're creating the user right here */
        //add new employee to the house
        await House.updateOne(
            {_id:randomHouse[0]._id},{
            $push:{"employees":existingUser._id}//push into the employee array
        });
        // generate JWT token
        const token = generateToken(existingUser._id.toString(), username, existingUser.role);
        
        console.log(existingUser)
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
    const { email,name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ message: 'Email is required and name is required' });
      }

      const {firstName, lastName} = name.trim().split(' ');
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedFirstName = sanitizeInput(firstName);
      const sanitizedLastName = sanitizeInput(lastName);

      console.log(sanitizedFirstName, sanitizedLastName, sanitizedEmail)
      const token = jwt.sign(
        { email: sanitizedEmail },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '3h' }
      );
      const frontendURL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : 'http://localhost:5173';
      const registrationLink = `${frontendURL}/register?token=${token}`;
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: sanitizedEmail }).lean().exec();
        if (existingUser) {
            if(existingUser.registrationHistory.status === 'Registered') {
                return res.status(409).json({ message: 'User with this email already exists.' });
            }
            // Update user schema if user resend the link
            const updatedUser = await User.updateOne(
                { email: sanitizedEmail },
                {
                    $set: {  
                        firstName: sanitizedFirstName,
                        email: sanitizedEmail,
                        lastName: sanitizedLastName,
                        registrationHistory: {
                            status: 'Pending',
                            expiresAt: Date.now() + 3 * 60 * 60 * 1000,
                            token: token,
                            link: registrationLink,
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
                firstName: sanitizedFirstName,
                lastName: sanitizedLastName,
                password: '',
                role: 'employee',
                // onboardingStatus: 'Not Started',
                registrationHistory: {
                  email: sanitizedEmail,
                //   status: 'Pending',
                  expiresAt: Date.now() + 3 * 60 * 60 * 1000,
                  token: token,
                  link: registrationLink,
                },
              });
              if(!newUser){
                return res.status(500).json({ message: 'Failed to create user.' });
              }
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

const login = async (req, res) => {
    // Tested working. User can login with either username or email
    // const loginData = req.body.form;
    // const loginData = req.body
    // await loginSchema.validate(loginData);
    // const credential = sanitizeInput(loginData.credential);
    // const password = sanitizeInput(loginData.password);
    // console.log(credential, password);  // debug
    const { username, password } = req.body


    try {
        let user = await User.findOne({email: username})
            .select(['username','password','role'])
            .lean()
            .exec();

        if (!user) {
            // console.log('no matching email found, searching username');  // debug
            user = await User.findOne({username: username})
                .select(['username','password', 'role'])
                .lean()
                .exec();

            if (!user) {
                // console.log('did not find matching username either...');  // debug
                return res.status(404).send({message:"User doesn't exist."});
            } 
        }

        // verify hashed password
        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            return res.status(401).json({message:"Wrong password!"});
        }

        //generate JWT TOKEN
        const token = generateToken(user._id, user.username, user.role);
        // console.log(`JWT token, ${token}, generated. \n`);  // debug
        res.cookie('auth_token', token, {
            maxAge: 3600000,
            sameSite: 'strict',
                    }); 

        return res.status(200).json({data: user, message:`Login Successful. Welcome, ${user.username}!`});
        } catch (e) {
            return res.status(500).json({message: `ERROR: ${e}.`});  
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
    const { userId } = req.user
    // const username = req.body.username;
    const firstname = req.body.firstName;
    const lastname = req.body.lastName;
    const middlename = req.body.middleName;
    const preferredname = req.body.preferredName;
    let profilePictureURL = ''
    let optReceiptURL = ''
    let dlCopyURL = ''
    const { files } = req
    const { AccessKeyId, SecretAccessKey, SessionToken } = req.credentials
    const { building, street, city, state, zip } = req.body
    const address = `${building} ${street}, ${city}, ${state} ${zip}`
    const { isPermRes, permResStatus } = req.body
    const cellPhone = req.body.cellPhone;
    const workPhone = req.body.workPhone
    const { carMake, carModel, carColor } = req.body
    const { onboardingStatus } = req.body
    const ssn = req.body.ssn;
    const dob = req.body.dob;
    const gender = req.body.gender;
    const workauth = req.body.nonPermWorkAuth; //gc,citizen,work auth type
    const { isReferred } = req.body
    const dlnum = req.body.dlNum;
    const dldate = req.body.dlExpDate;
    const { refFirstName, refLastName, refMiddleName, refPhone, refEmail, refRelationship } = req.body
    const { visaStartDate, visaEndDate, visaTitle } = req.body
    const emergencyContacts = req.body.emergencyContacts

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
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: newFileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            })

            return s3.send(command).then(() => {
                const fileURL = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${newFileName}`
                switch (file.fieldname) {
                    case 'profilePicture':
                        profilePictureURL = fileURL
                        break
                    case 'optReceipt':
                        optReceiptURL = fileURL
                        break
                    case 'dlCopy':
                        dlCopyURL = fileURL
                        break
                }
            })
        })

        const uploadedFiles = await Promise.all(filePromises)

        const user = await User.findById(userId).lean().exec();
        if (!user) {
            return res.status(404).json('User not Found!');
        }

        let reference
        if (isReferred === 'Yes') {
            reference = await Contact.create({
                firstName: refFirstName,
                lastName: refLastName,
                middleName: refMiddleName,
                cellPhone: refPhone,
                email: refEmail,
                relationship: refRelationship,
            })
            if (!reference) {
                return res.status(500).json('Error creating reference!')
            }
        }

        const emergencyContactIds = []
        for (const emergencyContact of emergencyContacts) {
            const {
                firstName,
                lastName,
                middleName,
                phone,
                emEmail,
                relationship,
            } = emergencyContact
            const contact = await Contact.create({
                firstName,
                lastName,
                middleName,
                cellPhone: phone,
                email: emEmail,
                relationship,
            })
            if (!contact) {
                res.status(500).json(`Error creating emergency contact! Error: ${error.message}`)
            }
            emergencyContactIds.push(contact._id)
        }

        const result = await User.updateOne(
            { _id: user._id },
            { $set: {
                "firstName": firstname,
                "lastName": lastname,
                "middleName": middlename,
                "preferredName": preferredname,
                "profilePictureURL": profilePictureURL,
                "onboardingStatus": onboardingStatus,
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
                "driversLicenseNumber": dlnum,
                "driversLicenseExpDate": dldate,
                "driversLicenseCopy_url": dlCopyURL,
                "permResStatus": permResStatus,
                "isPermRes": isPermRes,
                "referer": isReferred === 'Yes' ? reference._id : null,
                "optUrl": optReceiptURL,
                "emergencyContacts": emergencyContactIds,
                "visaStartDate": visaStartDate || undefined,
                "visaEndDate": visaEndDate || undefined,
                "visaTitle": visaTitle,
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

const getUserDocs = async (req, res) => {
    try {
        let username
        const { role } = req.user
        if (role === 'hr') {
            username = req.body.username
        }
        else {
            username = req.user.username
        }
        const { AccessKeyId, SecretAccessKey, SessionToken } = req.credentials
        const s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: AccessKeyId,
                secretAccessKey: SecretAccessKey,
                sessionToken: SessionToken,
            }
        })

        const user = await User.findOne({ username: username }).lean().exec()
        if (!user) {
            return res.status(404).json('User not found!')
        }
        const { profilePictureURL, optUrl, driversLicenseCopy_url } = user
        const urls = {
            profilePictureURL,
            optUrl,
            driversLicenseCopy_url,
        }
        const ret = {}
        for (const key of ['profilePictureURL', 'optUrl', 'driversLicenseCopy_url', 'eadUrl', 'i983Url', 'i20Url']) {
            const url = urls[key]
            if (!url) {
                continue
            }
            const parts = url.split('/')
            const fileName = parts[parts.length - 1]

            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: fileName,
                ResponseContentDisposition: `attachment; filename="${fileName}"`,
            }
            const previewParams = {
                Bucket: process.env.S3_BUCKET,
                Key: fileName,
            }
            const command = new GetObjectCommand(params)
            const previewCommand = new GetObjectCommand(previewParams)
            const signedURL = await getSignedUrl(s3, command, { expiresIn: 300 })
            const previewSignedURL = await getSignedUrl(s3, previewCommand, { expiresIn: 300 })
            ret[key] = {
                download: signedURL,
                preview: previewSignedURL
            }
        }
        res.status(200).json(ret)
    }
    catch (error) {
        res.status(500).json(error.message)
    }
}


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
        // return res.status(200).json({
        //     firstName: user.firstName,
        //     lastName: user.lastName,
        //     middleName: user.middleName,
        //     preferredName: user.preferredName,
        //     profilePictureURL: user.profilePictureURL,
        //     email: user.email,
        //     ssn: user.ssn,
        //     birthday: user.birthday,
        //     gender: user.gender,
        //     address: user.address,
        //     cellPhone: user.cellPhone,
        //     workPhone: user.workPhone,
        //     visaTitle: user.visaTitle,
        //     visaStartDate: user.visaStartDate,
        //     visaEndDate: user.visaEndDate,
        //     emergency_contact_ids: user.emergencyContacts,// an array of ids, should have at least one er contact
        //     workAuthFile_url: user.workAuthFile_url,
        //     driversLicenseCopy_url: user.driversLicenseCopy_url,
        //     optUrl: user.optUrl,
        //     eadUrl: user.eadUrl,
        //     i983Url: user.i983Url,
        //     i20Url: user.i20Url,
        // });

        return res.status(200).json(user)
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const getRegistrationHistory = async(req,res) =>{
    //tested working
    try{
        const Users = await User.find({ role: "employee"}).select('-password').lean().exec(); 
        return res.status(200).json(Users)
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });    

    }
}
const getApplications = async(req,res) =>{
    try{
        const users = await User.find({ role: "employee",  "registrationHistory.status": { $ne: "Pending" } }).select('-password').lean().exec();

        if (!users) {
            return res.status(401).json({ message: 'User not Found!' });
        } 
        const pending = users.filter(user => user.onboardingStatus === 'Pending');
        const approved = users.filter(user => user.onboardingStatus === 'Approved');
        const rejected = users.filter(user => user.onboardingStatus === 'Rejected');
        return res.status(200).json({pending, approved, rejected})
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });    
    }
}

const getUserInfo = async (req, res) =>{
    const { userId } = req.user
    try {
        const user = await User.findById(userId).populate('referer').populate({
            path: 'house',
            populate: [
                { path: 'employees' },
                { path: 'reports', populate: {
                    path: 'comments'
                }
            }]
        }).populate('emergencyContacts').lean().exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        return res.status(200).json(user)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const getUserInfoById = async (req, res) =>{
    const { userId } = req.params
    console.log('userId:', userId)
    try{
        const user = await User.findById(userId)
            .populate('referer')
            .populate('emergencyContacts').lean().exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        return res.status(200).json(user)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
const updateAppStatus = async (req, res) => {
    try {
        const { employeeId } = req.params
        const { newStatus, feedback } = req.body
        const employee = await User.findById(employeeId)
        if (!employee) {
            return res.status(404).json('Employee not found!')
        }

        employee.onboardingStatus = newStatus
        if (newStatus === 'Rejected') {
            employee.hrFeedback = feedback
        }
        employee.save()

        return res.status(200).json(employee)
    }
    catch (error) {
        res.status(500).json(error)
    }
}
const logout = async (req, res) => {
    try {
        res.clearCookie('auth_token');
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
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
    const id = req.body.id;
    const optStatus = req.body.optStatus;
    const eadStatus = req.body.eadStatus;
    const i983Status = req.body.i983Status;
    const i20Status = req.body.i20Status;
    try{
        const user = await User.findById(id)
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        
        let update_status = {}
        
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


const getEmpolyeesProfileForHR = async(req, res)=>{
    const {searchTerm} = req.query;
    const regexSearchTerm = new RegExp(searchTerm, 'i');
    try{
        const filterUser = await User.find({
            role: { $ne: 'hr' },
            $or: [
                {username: regexSearchTerm},
                {firstName: regexSearchTerm},
                {lastName: regexSearchTerm},
                {middleName: regexSearchTerm},
                {preferredName: regexSearchTerm},
            ]
        }).select('-password').lean().exec();

        return res.status(200).json(filterUser);


    }catch(error){
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

const getPersonalinfoById = async(req,res) =>{
    const {employeeId} = req.query;

    try{
        const employee = await User.findById(employeeId)
        .lean()
        .exec();
        if (!employee) {
            return res.status(401).json({ message: 'User not Found!' });
        }

        return res.status(200).json(employee);

    }catch(error){
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
} 

const getAllUser = async(req,res) =>{
    try {
        const users = await User.find({role:{ $ne:"hr"}},"email firstName lastName preferredName workAuth visaStartDate visaEndDate optUrl eadUrl i983Url i20Url optStatus eadStatus i983Status i20Status");
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const sendEmailNotification = async(req,res)=>{

    // Get user information
    const { id, firstName, lastName, useremail, notification} = req.body;
    //console.log(req.body.email);
    if (!useremail || !id) {
        return res.status(400).json({ message: 'Email is required and name is required' });
    }
    const sanitizedEmail = sanitizeInput(useremail);
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);

    console.log(sanitizedFirstName, sanitizedLastName, sanitizedEmail)

    try {
    // Check if user already exists
    const existingUser = await User.findById(id).lean().exec();
    if(!existingUser){
        return res.status(409).json({ message: 'User with this email does not exists.' });
    }
    // Send registration email
    //todo need to change the email receiver
    // todo need to test the email content
    const mailResult = await sendMail(
        notification,
        sanitizedEmail,
        'Notification from Beaconfire - Please check or update your visa documents',
        'dminhnguyen161@gmail.com' 
        );
    if (mailResult.error) {
        return res.status(500).json({ message: 'Failed to send email.', error: mailResult.error });
    }
    return res.status(200).json({ message: 'Notification sent successfully to ' + sanitizedEmail });
    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
}

const postVisaDecision = async(req,res) =>{
    const {id, message} = req.body;
    if (!id||!message) {
        return res.status(400).json({ message: 'User id or update message is required and name is required' });
    }
    try{
        const user = await User.findById(id)
        .lean()
        .exec();
        if (!user) {
            return res.status(401).json({ message: 'User not Found!' });
        }
        
        const update_status = {hrVisaFeedBack:message}

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
            return res.status(401).json(`visa feedback update for user ${result.acknowledged?"success":"failed"}`);
        }
        return res.status(200).json(`uvisa feedback update for user ${result.acknowledged?"success":"failed"}`);

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
    sendRegistrationLink,
    getUserDocs,
    getUserInfo,
    getEmpolyeesProfileForHR,
    getPersonalinfoById,
    logout,
    getRegistrationHistory,
    getApplications,
    getAllUser,
    sendEmailNotification,
    getUserInfoById,
    updateAppStatus,
    postVisaDecision,
}
