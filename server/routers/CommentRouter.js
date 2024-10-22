
const express = require('express')
const { addComment, editComment } = require('../controllers/CommentController')
const { authenticateJWT } = require("../middlewares/AuthMiddleware");

const commentRouter = express.Router()

commentRouter
    .post('/', authenticateJWT, addComment)
    .put('/', editComment)

module.exports = commentRouter
