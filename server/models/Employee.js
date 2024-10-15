
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const EmployeeSchema = new Schema({
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
    birthday: { type: String, required: true },
    gender: { type: String },
    workAuth: { type: String, required: true },
    workAuthFile: { type: String },
    visaTitle: { type: String },
    visaTitle: { type: String },
    visaStartDate: { type: String },
    visaEndDate: { type: String },
    driversLicenseNumber: { type: String },
    driversLicenseExpDate: { type: String },
    driversLicenseCopy: { type: String },
    ref: { type: refType, ref: 'Contact' },
    emergencyContacts: [{ type: refType, ref: 'Contact' }],
});

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;
