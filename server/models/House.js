
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const HouseSchema = new Schema({
    address: { type: String, required: true },
    landlordName: { type: String, required: true },
    landlordPhone: { type: String, required: true },
    landlordEmail: { type: String, required: true },
    numBeds: { type: Number, required: true },
    numMattresses: { type: Number, required: true },
    numTables: { type: Number, required: true },
    numChairs: { type: Number, required: true },
    numEmployees: { type: Number, require: true, default: 0 },
    reports: [{ type: refType, ref: 'Report' }],
    employees: [{ type: refType, ref: 'User' }],
});

const House = mongoose.model('House', HouseSchema);

module.exports = House;
