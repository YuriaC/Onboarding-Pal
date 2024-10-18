
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const ContactSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    cellPhone: { type: String, required: true },
    email: { type: String, required: true },
    relationship: { type: String, required: true },
    relationshipToId: { type: refType, ref: 'User', default: null },
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
