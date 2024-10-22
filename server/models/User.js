
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const statuses = ['Not Started', 'Pending', 'Rejected', 'Approved']

const UserSchema = new Schema({
    username: { type: String, default: null },
    password: { type: String, default: null },
    onboardingStatus: {type: String, enum: statuses, default: "Not Started" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    middleName: { type: String, default: "" },
    preferredName: { type: String, default: "" },
    profilePictureURL: { type: String, default: "" },
    address: { type: String, default: "" },
    cellPhone: { type: String, default: "" },
    workPhone: { type: String, default: "" },
    carMake: { type: String, default: "" },
    carModel: { type: String, default: "" },
    carColor: { type: String, default: ""},
    email: { type: String, default: "" },
    ssn: { type: String, default: "" },
    birthday: { type: Date, default: null },
    gender: { type: String, default:"" },
    workAuth: { type: String, default:"" },
    workAuthFile_url: { type: String, default:"" },
    visaTitle: { type: String, default:"" },
    visaStartDate: { type: Date, default: null },
    visaEndDate: { type: Date, default: null },
    permResStatus: { type: String, default: null },
    driversLicenseNumber: { type: String, default: "" },
    driversLicenseExpDate: { type: Date, default: null },
    driversLicenseCopy_url: { type: String, default: "" },
    optStatus: { type: String, enum: statuses, default: "Not Started" },
    eadStatus: { type: String, enum: statuses, default: "Not Started" },
    i983Status: { type: String, enum: statuses, default: "Not Started" },
    i20Status: { type: String, enum: statuses, default: "Not Started" },
    optUrl: { type: String , default: "" },
    eadUrl: { type: String , default: "" },
    i983Url: { type: String , default: "" },
    i20Url:{ type: String , default: "" },
    house: { type: refType, ref: 'House', default: null },
    referer: { type: refType, ref: 'Contact', default: null },
    emergencyContacts: [{ type: refType, ref: 'Contact' }],
    registrationHistory: {
        token: { type: String, default: "" },
        email: { type: String, default: "" },
        status: { type: String, enum: ['Pending', 'Registered'], default: "Pending" },
        expiresAt: { type: Date, default: null },
      },
    role: { type: String, enum: ['employee', 'hr'], default: "employee" },
    hrFeedback: { type: String, default: '' },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
