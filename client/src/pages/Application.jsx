import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { USER_ENDPOINT } from '../constants'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { Avatar, Box, Button, TextField } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

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
        profilePicture: null,
        optReceipt: null,
        dlCopy: null,
        building: '',
        street: '',
        city: '',
        state: '',
        zip: null,
        ssn: null,
        dob: null,
        gender: '',
        carMake: '',
        carModel: '',
        CarColor: '',
        cellPhone: '',
        workPhone: '',
        isPermRes: '',
        permResStatus: '',
        nonPermWorkAuth: '',
        hasDriversLicense: '',
        isReferred: '',
        dlNum: '',
        dlExpDate: null,
        refFirstName: '',
        refLastName: '',
        refMiddleName: '',
        refPhone: '',
        refEmail: '',
        refRelationship: '',
        visaStartDate: null,
        visaEndDate: null,
        visaTitle: '',
        email: '',
        emergencyContacts: [],
        hrFeedback: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            await axios.get(`${USER_ENDPOINT}/userinfo/${employeeId}`, {
                withCredentials: true,
            })
                .then(response => {
                    const { data } = response
                    setDataToForm(data)
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
            ssn,
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
            city: address ? address.split(', ')[2] : '',
            state,
            zip,
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
        {!isLoading ? <div>
            {formData.profilePicture ? <></> :
                <Avatar>
                    <FontAwesomeIcon icon={faUser} />
                </Avatar>
            }
            <form>
                <label>First Name: </label>
                <input type='text' name='firstName' value={formData.firstName} disabled required />
                <label>Last Name: </label>
                <input type='text' name='lastName' value={formData.lastName} disabled required />
                <label>Middle Name: </label>
                <input type='text' name='middleName' value={formData.middleName} disabled />
                <label>Preferred Name: </label>
                <input type='text' name='preferredName' value={formData.preferredName} disabled />
                <fieldset>
                    <legend>Address</legend>
                    <label>Building/Apartment #: </label>
                    <input type='text' name='building' value={formData.building} disabled required />
                    <label>Street Name: </label>
                    <input type='text' name='street' value={formData.street} disabled required />
                    <label>City: </label>
                    <input type='text' name='city' value={formData.city} disabled required />
                    <label>State: </label>
                    <input type='text' name='state' value={formData.state} disabled required />
                    <label>ZIP: </label>
                    <input type='number' name='zip' value={formData.zip} min={10000} max={99999} disabled required />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Phone Numbers</legend>
                    <label>Cell Phone Number: </label>
                    <input type='tel' name='cellPhone' value={formData.cellPhone} disabled required />
                    <label>Work Phone Number: </label>
                    <input type='tel' name='workPhone' value={formData.workPhone} disabled />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Car Info</legend>
                    <label>Make: </label>
                    <input type='text' name='carMake' value={formData.carMake} disabled />
                    <label>Model: </label>
                    <input type='text' name='carModel' value={formData.carModel} disabled />
                    <label>Color: </label>
                    <input type='text' name='carColor' value={formData.carColor} disabled />
                </fieldset>
                <br />
                <label>Email: </label>
                <input type='text' value={formData.email} disabled />
                <label>SSN: </label>
                <input type='password' name='ssn' value={formData.ssn} disabled required />
                <label>Date of Birth: </label>
                <input type='date' name='dob' value={formData.dob} disabled required />
                <label>Gender: {formData.gender || 'Not specified'}</label>
                <br />
                <fieldset>
                    <legend>Work Authorization</legend>
                    {formData.isPermRes === 'Yes' &&
                        <>
                            <br />
                            <label>What kind of permanent residence?</label>
                            <input type='radio' name='permResStatus' checked={formData.permResStatus === 'Citizen'} value='Citizen' disabled required />
                            <label>Citizen</label>
                            <input type='radio' name='permResStatus' checked={formData.permResStatus === 'Green Card'} value='Green Card' disabled />
                            <label>Green Card</label>
                            <label>Permanent Residence: {formData.permResStatus}</label>
                        </>
                    }
                    {formData.isPermRes === 'No' &&
                        <>
                            <br />
                            <label>Work Authorization: {formData.workAuth || 'Not specified'}</label>
                            {formData.nonPermWorkAuth === 'F1(CPT/OPT)' &&
                                <>
                                    <br />
                                    <label>Upload your OPT Receipt: </label>
                                    <input type='file' name='optReceipt' disabled required />
                                </>
                            }
                            {formData.nonPermWorkAuth === 'Other' &&
                                <>
                                    <br />
                                    <label>Visa title: </label>
                                    <input type='text' name='visaTitle' value={formData.visaTitle} disabled />
                                </>
                            }
                            <br />
                            <label>Work authorization start date: </label>
                            <input type='date' name='visaStartDate' value={formData.visaStartDate} disabled />
                            <br />
                            <label>Work authorization end date: </label>
                            <input type='date' name='visaEndDate' value={formData.visaEndDate} disabled />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Driver&#39;s License</legend>
                    <label>Do you have a driver&#39;s license?</label>
                    <input type='radio' name='hasDriversLicense' checked={formData.hasDriversLicense === 'Yes'} value='Yes' disabled required />
                    <label>Yes</label>
                    <input type='radio' name='hasDriversLicense' checked={formData.hasDriversLicense === 'No'} value='No' disabled />
                    <label>No</label>
                    {formData.hasDriversLicense === 'Yes' &&
                        <>
                            <br />
                            <label>Driver&#39;s License Number: </label>
                            <input type='number' name='dlNum' value={formData.dlNum} disabled required />
                            <br />
                            <label>Driver&#39;s License Expiration: </label>
                            <input type='date' name='dlExpDate' value={formData.dlExpDate} disabled required />
                            <br />
                            <label>Driver&#39;s License Copy: </label>
                            <input type='file' name='dlCopy' disabled required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Reference</legend>
                    <label>Did someone refer you to this company?</label>
                    <input type='radio' name='isReferred' checked={formData.isReferred === 'Yes'} value='Yes' disabled required />
                    <label>Yes</label>
                    <input type='radio' name='isReferred' checked={formData.isReferred === 'No'} value='No' disabled />
                    <label>No</label>
                    {formData.isReferred === 'Yes' &&
                        <>
                            <br />
                            <label>First Name: </label>
                            <input type='text' name='refFirstName' value={formData.refFirstName} disabled required />
                            <label>Last Name: </label>
                            <input type='text' name='refLastName' value={formData.refLastName} disabled required />
                            <label>Middle Name: </label>
                            <input type='text' name='refMiddleName' value={formData.refMiddleName} disabled />
                            <label>Phone: </label>
                            <input type='tel' name='refPhone' value={formData.refPhone} disabled required />
                            <label>Email: </label>
                            <input type='email' name='refEmail' value={formData.refEmail} disabled required />
                            <label>Relationship: </label>
                            <input type='text' name='refRelationship' value={formData.refRelationship} disabled required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Emergency Contact{formData.emergencyContacts.length === 1 ? '' : 's'}</legend>
                    {formData.emergencyContacts.map((contact, index) => (
                        <div key={index}>
                            <label>First Name</label>
                            <input type='text' name='firstName' value={contact.firstName} disabled required />
                            <label>Last Name</label>
                            <input type='text' name='lastName' value={contact.lastName} disabled required />
                            <label>Middle Name</label>
                            <input type='text' name='middleName' value={contact.middleName} disabled />
                            <label>Phone</label>
                            <input type='tel' name='phone' value={contact.phone} disabled required />
                            <label>Email</label>
                            <input type='email' name='emEmail' value={contact.emEmail} disabled required />
                            <label>Relationship</label>
                            <input type='text' name='relationship' value={contact.relationship} disabled required />
                            <br />
                        </div>
                    ))}
                </fieldset>
            </form>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 4 }}>
                <Button variant='contained' sx={{ backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }} onClick={handleApproval}>
                    Approve
                </Button>
                <Button variant='contained' sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' } }} onClick={() => setIsRejecting(!isRejecting)}>
                    Reject
                </Button>
            </Box>
            {isRejecting &&
                <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <TextField fullWidth required placeholder='Give feedback' onChange={handleChange} value={feedback} />
                    <Button sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' } }} onClick={handleRejection}>Submit Rejection</Button>
                </Box>
            }
            <ToastContainer />
        </div> : 'Loading...'}
        </>
    )
}

export default Application