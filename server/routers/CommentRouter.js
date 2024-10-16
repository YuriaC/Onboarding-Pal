
const express = require('express')
const { addComment } = require('../controllers/CommentController')

const commentRouter = express.Router()

commentRouter.post('/', addComment)

module.exports = commentRouter
