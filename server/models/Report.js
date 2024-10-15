
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const ReportSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, required: true },
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
