
const Report = require('../models/Report.js')

const addReport = async (request, response) => {
    try {
        const { title, description } = request.body

        const report = await Report.create({
            title,
            description
        })
        console.log('report:', report)

        response.status(200).json(report)
    }
    catch (error) {
        response.status(500).json(error)
    }
}

module.exports = {
    addReport,
}
