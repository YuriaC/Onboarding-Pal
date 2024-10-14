
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const ReportSchema = new Schema({
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
