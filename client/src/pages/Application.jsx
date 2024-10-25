import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { USER_ENDPOINT } from '../constants'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import {
    Box,
    Button,
    TextField,
    RadioGroup,
    FormControl,
    FormLabel,
    FormControlLabel,
    Radio,
    Typography,
    Paper,
    Card,
    CardHeader,
    CardContent,
} from '@mui/material'

const Application = () => {
    const navigate = useNavigate()
    const { employeeId } = useParams()
    const [feedback, setFeedback] = useState('')
    const [isRejecting, setIsRejecting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        preferredName: '',
        profilePicture: '',
        optReceipt: null,
        dlCopy: null,
        building: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        ssn: '',
        dob: '',
        gender: '',
        carMake: '',
        carModel: '',
        carColor: '',
        cellPhone: '',
        workPhone: '',
        isPermRes: '',
        permResStatus: '',
        nonPermWorkAuth: '',
        hasDriversLicense: '',
        isReferred: '',
        dlNum: '',
        dlExpDate: '',
        refFirstName: '',
        refLastName: '',
        refMiddleName: '',
        refPhone: '',
        refEmail: '',
        refRelationship: '',
        visaStartDate: '',
        visaEndDate: '',
        visaTitle: '',
        email: '',
        emergencyContacts: [],
        hrFeedback: '',
        onboardingStatus: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            await axios.get(`${USER_ENDPOINT}/userinfo/${employeeId}`, {
                withCredentials: true,
            })
                .then(response => {
                    const { data } = response
                    axios.get(`${USER_ENDPOINT}/getuserdocs/${employeeId}`, {
                        withCredentials: true,
                    }).then(docsResponse => {
                        const profilePicture = docsResponse.data.profilePictureURL?.preview ? docsResponse.data.profilePictureURL?.preview : ''
                        const newData = {
                            ...data,
                            profilePicture,
                        }
                        setDataToForm(newData)
                    })
                })
                .catch(error => {
                    toast.error(`Error fetching user info! Error: ${error.message}`)
                })
            
            setIsLoading(false)
        }
        fetchData()
    }, [])

    const setDataToForm = (data) => {
        const {
            firstName,
            lastName,
            middleName,
            preferredName,
            address,
            cellPhone,
            workPhone,
            carMake,
            carModel,
            carColor,
            ssn,
            birthday,
            email,
            gender,
            permResStatus,
            driversLicenseNumber,
            driversLicenseExpDate,
            referer,
            emergencyContacts,
            hrFeedback,
            onboardingStatus,
            workAuth,
            visaStartDate,
            visaEndDate,
            visaTitle,
            profilePicture,
        } = data
        const newEmContacts = []
        for (const emContact of emergencyContacts) {
            const { firstName, lastName, middleName, cellPhone, email, relationship } = emContact
            newEmContacts.push({
                firstName,
                lastName,
                middleName,
                phone: cellPhone,
                emEmail: email,
                relationship,
            })
        }
        const stateAndZip = address ? address.split(', ')[2] : ''
        const lastSpaceIndex = address ? stateAndZip.lastIndexOf(' ') : 0
        const state = address ? stateAndZip.substring(0, lastSpaceIndex) : ''
        const zip = address ? stateAndZip.substring(lastSpaceIndex + 1) : ''
        const buildingAndStreet = address ? address.split(', ')[0] : ''
        const firstSpaceIndex = address ? buildingAndStreet.indexOf(' ') : 0
        const building = address ? buildingAndStreet.substring(0, firstSpaceIndex) : ''
        const street = address ? buildingAndStreet.substring(firstSpaceIndex + 1) : ''
        setFormData({
            ...formData,
            firstName,
            lastName,
            middleName,
            preferredName,
            cellPhone,
            workPhone,
            carMake,
            carModel,
            carColor,
            profilePicture,
            ssn,
            email,
            dob: birthday ? birthday.split('T')[0] : null,
            gender,
            permResStatus,
            isPermRes: ['Citizen', 'Green Card'].includes(permResStatus) ? 'Yes' : 'No',
            hasDriversLicense: data['driversLicenseNumber'] ? 'Yes' : 'No',
            dlNum: driversLicenseNumber,
            dlExpDate: driversLicenseExpDate ? driversLicenseExpDate.split('T')[0] : null,
            isReferred: referer ? 'Yes' : 'No',
            emergencyContacts: newEmContacts,
            building,
            street,
            city: address ? address.split(', ')[1] : '',
            state,
            zip,
            onboardingStatus,
            hrFeedback: onboardingStatus === 'Rejected' ? hrFeedback : '',
            refFirstName: referer ? referer.firstName : '',
            refLastName: referer ? referer.lastName : '',
            refPhone: referer ? referer.cellPhone : '',
            refEmail: referer ? referer.email : '',
            refMiddleName: referer ? referer.middleName : '',
            refRelationship: referer ? referer.relationship : '',
            nonPermWorkAuth: workAuth,
            visaStartDate: visaStartDate ? visaStartDate.split('T')[0] : '',
            visaEndDate: visaEndDate ? visaEndDate.split('T')[0] : '',
            visaTitle,
        })
    }

    const handleApproval = async () => {
        axios.put(`${USER_ENDPOINT}/updateappstatus/${employeeId}`, { newStatus: 'Approved' }, {
            withCredentials: true,
        })
            .then(() => {
                // window.close()
                navigate('/hr/hiring')
            })
            .catch(error => {
                toast.error(`Error approving application! Error: ${error.message}`)
            })
    }

    const handleRejection = async () => {
        axios.put(`${USER_ENDPOINT}/updateappstatus/${employeeId}`, { newStatus: 'Rejected', feedback }, {
            withCredentials: true,
        })
            .then(() => {
                // window.close()
                navigate('/hr/hiring')
            })
            .catch(error => {
                toast.error(`Error rejecting application! Error: ${error.message}`)
            })
    }

    const handleChange = (e) => {
        e.preventDefault()
        const { value } = e.target
        setFeedback(value)
    }

    return (
        <>
            {!isLoading ? (
                <Paper sx={{ p: 3, width: '60vw' }}>
                    <Typography variant='h4' sx={{ color: formData.onboardingStatus === 'Rejected' ? 'red' : formData.onboardingStatus === 'Approved' ? 'green' : 'black', mb: 2 }}>
                        Status: {formData.onboardingStatus}
                    </Typography>
                    {formData.onboardingStatus === 'Rejected' &&
                        <Box sx={{ mt: 2, mb: 4 }}>
                            <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                                <CardHeader title='Feedback given:' sx={{ paddingBottom: 0 }} />
                                <CardContent>
                                    <Typography variant='body1'>
                                        {formData.hrFeedback.length > 0 ? formData.hrFeedback : 'No feedback given.'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    }
                    


                    <form>
                        <TextField
                            fullWidth
                            label="First Name"
                            value={formData.firstName}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={formData.lastName}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Middle Name"
                            value={formData.middleName}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Preferred Name"
                            value={formData.preferredName}
                            disabled
                            margin="normal"
                        />

                        <Typography variant="h6" margin="normal">Address</Typography>
                        <TextField
                            fullWidth
                            label="Building/Apartment #"
                            value={formData.building}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Street Name"
                            value={formData.street}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="City"
                            value={formData.city}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="State"
                            value={formData.state}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="ZIP"
                            value={formData.zip}
                            disabled
                            type="number"
                            margin="normal"
                        />

                        <Typography variant="h6" margin="normal">Phone Numbers</Typography>
                        <TextField
                            fullWidth
                            label="Cell Phone Number"
                            value={formData.cellPhone}
                            disabled
                            type="tel"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Work Phone Number"
                            value={formData.workPhone}
                            disabled
                            type="tel"
                            margin="normal"
                        />

                        <Typography variant="h6" margin="normal">Car Info</Typography>
                        <TextField
                            fullWidth
                            label="Make"
                            value={formData.carMake}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Model"
                            value={formData.carModel}
                            disabled
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Color"
                            value={formData.carColor}
                            disabled
                            margin="normal"
                        />

                        <Typography variant="h6" margin="normal">Other Info</Typography>
                        <TextField
                            fullWidth
                            label="Email"
                            value={formData.email}
                            disabled
                            type="email"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="SSN"
                            value={formData.ssn}
                            disabled
                            type="password"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Date of Birth"
                            value={formData.dob}
                            disabled
                            type={formData.dob ? 'date' : 'text'}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Gender"
                            value={formData.gender}
                            disabled
                            margin="normal"
                        />

                        <Typography variant="h6" margin="normal">Work Authorization</Typography>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Are you a permanent resident?</FormLabel>
                            <RadioGroup row value={formData.isPermRes}>
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio />}
                                    label="Yes"
                                    disabled
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio />}
                                    label="No"
                                    disabled
                                />
                            </RadioGroup>
                        </FormControl>
                        {formData.isPermRes === 'No' ? (
                            <>
                                <TextField
                                    fullWidth
                                    label="Work Authorization"
                                    value={formData.nonPermWorkAuth}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Visa Start Date"
                                    value={formData.visaStartDate ? formData.visaStartDate : ''}
                                    disabled
                                    type={formData.visaStartDate ? "date" : "text"}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Visa End Date"
                                    value={formData.visaEndDate ? formData.visaEndDate : ''}
                                    disabled
                                    type={formData.visaEndDate ? "date" : "text"}
                                    margin="normal"
                                />
                            </>
                        ) : (
                            <FormControl fullWidth margin="normal">
                                <FormLabel>What kind of permanent resident?</FormLabel>
                                <RadioGroup row value={formData.permResStatus}>
                                    <FormControlLabel
                                        value="Citizen"
                                        control={<Radio />}
                                        label="Citizen"
                                        disabled
                                    />
                                    <FormControlLabel
                                        value="Green Card"
                                        control={<Radio />}
                                        label="Green Card"
                                        disabled
                                    />
                                </RadioGroup>
                            </FormControl>
                        )}

                        <Typography variant="h6" margin="normal">{`Driver's License`}</Typography>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Do you have a {`driver's license`}?</FormLabel>
                            <RadioGroup row value={formData.hasDriversLicense}>
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio />}
                                    label="Yes"
                                    disabled
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio />}
                                    label="No"
                                    disabled
                                />
                            </RadioGroup>
                        </FormControl>
                        {formData.hasDriversLicense === 'Yes' && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Driver's License Number"
                                    value={formData.dlNum}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Driver's License Expiration"
                                    value={formData.dlExpDate}
                                    disabled
                                    type= {formData.dlExpDate ? "date" : "text"}
                                    margin="normal"
                                />
                            </>
                        )}

                        <Typography variant="h6" margin="normal">Reference</Typography>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Did someone refer you to this company?</FormLabel>
                            <RadioGroup row value={formData.isReferred}>
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio />}
                                    label="Yes"
                                    disabled
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio />}
                                    label="No"
                                    disabled
                                />
                            </RadioGroup>
                        </FormControl>
                        {formData.isReferred === 'Yes' && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Referer's First Name"
                                    value={formData.refFirstName}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Referer's Middle Name"
                                    value={formData.refMiddleName}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Referer's Last Name"
                                    value={formData.refLastName}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Referer's Phone"
                                    value={formData.refPhone}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Referer's Email"
                                    value={formData.refEmail}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label={`Referer's Relationship to ${formData.firstName}`}
                                    value={formData.refRelationship}
                                    disabled
                                    margin="normal"
                                />
                            </>
                        )}

                        <Typography variant="h6" margin="normal">Emergency Contacts</Typography>
                        {formData.emergencyContacts.map((contact, index) => (
                            <Box key={index} sx={{ mb: 4 }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={contact.firstName}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={contact.lastName}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Middle Name"
                                    value={contact.middleName}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={contact.phone}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={contact.emEmail}
                                    disabled
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label={`Relationship to ${formData.firstName}`}
                                    value={contact.relationship}
                                    disabled
                                    margin="normal"
                                />
                            </Box>
                        ))}

                        {formData.onboardingStatus == 'Pending' && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                                <Button
                                    variant='contained'
                                    sx={{ backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }}
                                    onClick={handleApproval}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant='contained'
                                    sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' } }}
                                    onClick={() => setIsRejecting(!isRejecting)}
                                >
                                    Reject
                                </Button>
                            </Box>
                        )}

                        {isRejecting && (
                            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    required
                                    placeholder='Provide rejection feedback'
                                    onChange={handleChange}
                                    value={feedback}
                                />
                                <Button
                                    sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' } }}
                                    onClick={handleRejection}
                                >
                                    Submit Rejection
                                </Button>
                            </Box>
                        )}
                        <ToastContainer />
                    </form>
                </Paper>
            ) : (
                'Loading...'
            )}
        </>
    )
}

export default Application

