
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const CommentSchema = new Schema({
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isEdited: { type: Boolean, default: false },
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
