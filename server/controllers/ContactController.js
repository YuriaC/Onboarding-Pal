
const Contact = require('../models/Contact.js')

const addContact = async (request, response) => {
    try {
        const {
            firstName,
            lastName,
            middleName,
            cellPhone,
            email,
            relationship,
            relationshipToId
        } = request.body

        const contact = await Contact.create({
            firstName,
            lastName,
            middleName,
            cellPhone,
            email,
            relationship,
            relationshipToId
        })
        
        response.status(200).json(contact)
    }
    catch (error) {
        response.status(500).json(error)
    }
}

module.exports = {
    addContact,
}
