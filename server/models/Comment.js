
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const CommentSchema = new Schema({
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
