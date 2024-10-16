
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const ReportSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true, default: '蓝湛' },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Open', 'In Progress', 'Closed'], required: true, default: 'Open' },
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
