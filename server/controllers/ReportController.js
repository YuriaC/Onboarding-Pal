
const Report = require('../models/Report.js')
const House = require('../models/House.js')

const addReport = async (request, response) => {
    try {
        const { title, description, houseId } = request.body
        const { username } = request.user

        const report = await Report.create({
            title,
            description,
            createdBy: username,
        })
        if (!report) {
            return res.status(404).json('Error creating report!')
        }

        const house = await House.findById(houseId)
        if (!house) {
            return res.status(404).json('House not found!')
        }
        house.reports.push(report._id)
        await house.save()

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
