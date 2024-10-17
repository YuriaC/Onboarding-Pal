
const Comment = require('../models/Comment.js')
const Report = require('../models/Report.js')

const addComment = async (request, response) => {
    try {
        const { description, reportId } = request.body

        const report = await Report.findById(reportId)

        if (!report) {
            return response.status(404).json('Report not found')
        }

        const comment = await Comment.create({
            description
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

module.exports = {
    addComment,
}
