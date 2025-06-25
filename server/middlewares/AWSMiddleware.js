
const multer = require('multer')
const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts')


const stsClient = new STSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const getTemporaryCredentials = async () => {

    const command = new AssumeRoleCommand({
        RoleArn: process.env.AWS_ROLE_ARN,
        RoleSessionName: 'beaconfire-hr-session',
    })
    const data = await stsClient.send(command)

    return data.Credentials
}

const AWSCredentialsMiddleware = async (req, res, next) => {
    try {
        req.credentials = await getTemporaryCredentials()
        console.log('Got AWS credentials')
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
