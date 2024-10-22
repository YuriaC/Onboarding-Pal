
const Comment = require('../models/Comment.js')
const Report = require('../models/Report.js')

const addComment = async (request, response) => {
    try {
        const { description, reportId } = request.body
        const { username } = request.user

        console.log('request.body:', request.body)

        console.log('description:', description)

        const report = await Report.findById(reportId)

        if (!report) {
            return response.status(404).json('Report not found')
        }

        const comment = await Comment.create({
            description,
            createdBy: username,
        })
        
        report.comments.push(comment._id)
        await report.save()

        const ret = {
            report,
            comment,
        }

        response.status(200).json(ret)
    }
    catch (error) {
        response.status(500).json(error)
    }
}

const editComment = async (request, response) => {
    try {
        const { description, commentId } = request.body
        
        const comment = await Comment.findByIdAndUpdate(commentId, {
            description,
            timestamp: new Date(),
            isEdited: true,
        }, {
            new: true,
            runValidators: true,
        })
        if (!comment) {
            return response.status(400).json('Comment not found!')
        }

        await comment.save()

        return response.status(200).json('Successfully edited comment!')
    }
    catch (error) {
        response.status(500).json(error.message)
    }
}

module.exports = {
    addComment,
    editComment,
}
