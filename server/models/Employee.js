
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const EmployeeSchema = new Schema({
});

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;
