
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const UserSchema = new Schema({
    username: { type: String, required: false, default:"" },
    password: { type: String, required: false, default:"" },
    onboardingStatus: {type: String, enum: ['pending', 'rejected', 'approved'], required: false, default:"pending"},
    firstName: { type: String, required: false, default:"" },
    lastName: { type: String, required: false, default:"" },
    middleName: { type: String, default:"" },
    preferredName: { type: String, default:"" },
    profilePicture_url: { type: String, default:"" },
    address: { type: String, required: false, default:"" },
    cellPhone: { type: String, required: false, default:"", default:"" },
    workPhone: { type: String, default:"" },
    carMake: { type: String, default:"" },
    carModel: { type: String, default:"" },
    carColor: { type: String, default:""},
    email: { type: String, required: false, default:"" },
    ssn: { type: String, required: false, default:"" },
    birthday: { type: Date, required: false, default:Date.now },
    gender: { type: String, required: false, default:"" },
    workAuth: { type: String, required: false, default:"" },
    workAuthFile_url: { type: String, default:""},
    visaTitle: { type: String, default:""},
    visaStartDate: { type: Date, default:Date.now},
    visaEndDate: { type: Date, default:Date.now },
    citizenship:{ type: String, default:""},
    driversLicenseNumber: { type: String, default:"" },
    driversLicenseExpDate: { type: Date, default:Date.now  },
    driversLicenseCopy_url: { type: String, default:"" },
    optStatus:{ type: String, enum: ['pending', 'rejected', 'approved'], required: false, default:"pending" },
    eadStatus:{ type: String, enum: ['pending', 'rejected', 'approved'], required: false, default:"pending" },
    i983Status:{ type: String, enum: ['pending', 'rejected', 'approved'], required: false, default:"pending" },
    i20Status:{ type: String, enum: ['pending', 'rejected', 'approved'], required: false, default:"pending" },
    optUrl:{ type:String , default:""},
    eadUrl:{ type:String , default:""},
    i983Url:{ type:String , default:""},
    i20Url:{ type:String , default:""},
    house: { type: refType, required: false, ref:'House', default:null},
    references: [{ type: refType, ref: 'Contact' ,default:""}],
    emergencyContacts: [{ type: refType, ref: 'Contact', default:""}],
    registrationHistory: {
        token: { type: String, required: false, default:"" },
        email: { type: String, required: false, default:"" },
        status: { type: String, enum: ['pending', 'registered'], required: false, default:"pending" },
        expiresAt: { type: Date, required: false, default:Date.now() },
      },
    role: { type: String, enum: ['employee', 'hr'], required: false, default:"employee" },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
