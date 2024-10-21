
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const ReportSchema = new Schema({
    title: { type: String, required: true, default: '' },
    description: { type: String, required: true, default: '' },
    createdBy: { type: String, required: true, default: '' },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Open', 'In Progress', 'Closed'], required: true, default: 'Open' },
    comments: [{ type: refType, ref: 'Comment' }],
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
