
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    preferredName: { type: String },
    profilePicture: { type: String },
    address: { type: String, required: true },
    cellPhone: { type: String, required: true },
    workPhone: { type: String },
    carMake: { type: String },
    carMmodel: { type: String },
    carColor: { type: String },
    email: { type: String, required: true },
    ssn: { type: String, required: true },
    birthday: { type: Date, required: true },
    gender: { type: String },
    workAuth: { type: String, required: true },
    workAuthFile: { type: String },
    visaTitle: { type: String },
    visaStartDate: { type: Date },
    visaEndDate: { type: Date },
    driversLicenseNumber: { type: String },
    driversLicenseExpDate: { type: Date },
    driversLicenseCopy: { type: String },
    reference: { type: refType, ref: 'Contact' },
    emergencyContacts: [{ type: refType, ref: 'Contact' }],
    role: { type: String, enum: ['employee', 'hr'], required: true },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
