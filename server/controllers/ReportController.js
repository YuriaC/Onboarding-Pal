
const Report = require('../models/Report.js')

const addReport = async (request, response) => {
    try {
        const { title, description } = request.body

        const report = await Report.create({
            title,
            description
        })

        response.status(200).json(report)
    }
    catch (error) {
        response.status(500).json(error)
    }
}

const getReports = async (request, response) => {
    try {
        const { createdBy } = request.body


        const reports = await Report.find({ createdBy }).populate('comments').exec()

        if (!reports) {
            return response.status(404).json('No reports found!')
        }

        response.status(200).json(reports)
    }
    catch (error) {
        response.status(500).json(error)
    }
}

module.exports = {
    addReport,
    getReports,
}
