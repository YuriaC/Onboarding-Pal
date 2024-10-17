
const AWS = require('aws-sdk')
const multer = require('multer')

const sts = new AWS.STS({ region: process.env.AWS_REGION })

const getTemporaryCredentials = async () => {
    const data = await sts.assumeRole({
        RoleArn: process.env.AWS_ROLE_ARN,
        RoleSessionName: 'beaconfire-hr-session',
    }).promise()

    return data.Credentials
}

const AWSCredentialsMiddleware = async (req, res, next) => {
    try {
        req.credentials = await getTemporaryCredentials()
        next()
    }
    catch (error) {
        console.log(`Error getting AWS credentials: ${error.message}`)
        res.status(500).json(`Error getting AWS credentials: ${error.message}`)
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
})

module.exports = {
    upload,
    AWSCredentialsMiddleware,
}
