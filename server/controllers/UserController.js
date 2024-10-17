
const User = require('../models/User');
const House = require('../models/House');
const Contact = require('../models/Contact');
const Yup = require('yup');
const { JSDOM } = require('jsdom');
const argon2 = require("argon2");
const DOMPurify = require('isomorphic-dompurify');
const {generateToken} = require("../utils/generateToken");

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
        const hashedPassword = await argon2.hash(password);
        // create user login
        const role = "employee";
        const login = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            //house: find house id randomly assign one
            onboardingStatus:'pending',

          });
        // generate JWT token
        const token = generateToken(login._id.toString(), username, role);
        
        res.cookie('auth_token', token);
        return res.status(201).json("register success!");
    }catch(error){
        return res.status(500).json({ message: error.message});
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
    updateWorkauthdoc
}
