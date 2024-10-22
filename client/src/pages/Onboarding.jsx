import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'material-react-toastify'
import { USER_ENDPOINT, username } from '../constants'
import axios from 'axios'
import { Box, Button, Card, CardActions, CardContent, Typography, CardHeader } from '@mui/material'
import 'material-react-toastify/dist/ReactToastify.css'

const Onboarding = () => {

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
        emergencyContacts: [
            {
                firstName: '',
                lastName: '',
                middleName: '',
                phone: '',
                emEmail: '',
                relationship: '',
                counter: 0,
            }
        ],
        hrFeedback: '',
    })

    const [emCounter, setEmCounter] = useState(1)
    const [userEmail, setUserEmail] = useState('')
    const [appStatus, setAppStatus] = useState('')
    const [docs, setDocs] = useState([])
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/userinfo`, {
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // },
            withCredentials: true,
        })
        .then(response => {
            setUserEmail(response.data.email)
            const status = response.data.onboardingStatus
            setAppStatus(status)
            console.log('appStatus:', status)
            if (status === 'Pending') {
                getDocs()
            }
            if (['Pending', 'Rejected'].includes(status)) {
                setDataToForm(response.data)
            }
        })
        .catch(error => {
            console.log('error:', error)
            toast.error(`Error fetching user info! Error: ${error.message}`)
        })
    }, [submitted])

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
        console.log('data:', data)
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
            dob: birthday.split('T')[0],
            gender,
            permResStatus,
            isPermRes: ['Citizen', 'Green Card'].includes(permResStatus) ? 'Yes' : 'No',
            hasDriversLicense: Object.keys(data).includes('driversLicenseNumber') ? 'Yes' : 'No',
            dlNum: driversLicenseNumber,
            dlExpDate: driversLicenseExpDate.split('T')[0],
            isReferred: referer ? 'Yes' : 'No',
            emergencyContacts: newEmContacts,
            building: address.split(', ')[0],
            street: address.split(', ')[1],
            city: address.split(', ')[2],
            state: address.split(', ')[3].split(' ')[0],
            zip: address.split(', ')[3].split(' ')[1],
            hrFeedback: onboardingStatus === 'Rejected' ? hrFeedback : '',
            refFirstName: referer.firstName,
            refLastName: referer.lastName,
            refPhone: referer.cellPhone,
            refEmail: referer.email,
            refMiddleName: referer.middleName,
            refRelationship: referer.relationship,
            nonPermWorkAuth: workAuth,
            visaStartDate: visaStartDate ? visaStartDate.split('T')[0] : '',
            visaEndDate: visaEndDate ? visaEndDate.split('T')[0] : '',
            visaTitle,
        })
    }

    const getDocs = async () => {
        const response = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // },
            withCredentials: true,
        })
        setDocs(response.data)
        console.log('response:', response)
    }

    const handleChange = (e) => {
        const { type, name, value } = e.target
        setFormData({
            ...formData,
            [name]: type === 'file' ? e.target.files[0] : value,
        })
    }

    const handleEmContactChange = (e, index) => {
        const { name, value } = e.target
        const newContacts = [...formData.emergencyContacts]
        newContacts[index][name] = value
        setFormData({...formData, emergencyContacts: newContacts})
    }

    const buildFormData = (formData, data, parentKey) => {
        if (data && typeof data === 'object' && !(data instanceof File)) {
          Object.keys(data).forEach(key => {
            buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
          });
        } else {
          formData.append(parentKey, data);
        }
      };
      
    const createFormData = (data) => {
        const formData = new FormData();
        buildFormData(formData, data);
        formData.append('username', username)
        formData.append('onboardingStatus', 'Pending')
        return formData;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('formData:', formData)
        const data = createFormData(formData)

        try {
            await axios.post(`${USER_ENDPOINT}/applicationinput`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // 'Authorization': `Bearer ${token}`,
                },
                withCredentials: true,
            })
            toast.success('Successfully submitted application!')
            setSubmitted(!submitted)
        }
        catch (error) {
            toast.error(`Error submitting application! Error: ${error.response.data}`)
        }
    }

    const addEmergencyContact = (e) => {
        e.preventDefault()
        const newContacts = [...formData.emergencyContacts]
        newContacts.push({
                firstName: '',
                lastName: '',
                middleName: '',
                phone: '',
                emEmail: '',
                relationship: '',
                counter: emCounter,
        })
        setEmCounter(prev => prev + 1)
        setFormData({
            ...formData,
            emergencyContacts: newContacts,
        })
    }

    const removeEmergencyContact = (e, index) => {
        e.preventDefault()
        if (formData.emergencyContacts.length === 1) {
            return
        }
        const newContacts = formData.emergencyContacts.filter((_, i) => i !== index)
        setFormData({
            ...formData,
            emergencyContacts: newContacts
        })
    }

    return (
        <div>
            <h2 style={{ color: appStatus === 'Rejected' ? 'red' : 'black' }}>Status: {appStatus}</h2>
            {appStatus === 'Pending' && <h3>Please wait for HR to review your application.</h3>}
            {formData.hrFeedback &&
                <Box sx={{ maxWidth: 400, margin: 'auto', mt: 2, mb: 2 }}>
                    <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                        <CardHeader title='Feedback from HR:' sx={{ paddingBottom: 0 }} />
                        <CardContent>
                            <Typography variant='body1'>
                                {formData.hrFeedback}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            }
            <form onSubmit={handleSubmit}>
                <label>First Name: </label>
                <input type='text' name='firstName' value={formData.firstName} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Last Name: </label>
                <input type='text' name='lastName' value={formData.lastName} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Middle Name: </label>
                <input type='text' name='middleName' value={formData.middleName} onChange={handleChange} disabled={appStatus === 'Pending'} />
                <label>Preferred Name: </label>
                <input type='text' name='preferredName' value={formData.preferredName} onChange={handleChange} disabled={appStatus === 'Pending'} />
                <label>Profile Picture: </label>
                <input type='file' name='profilePicture' onChange={handleChange} disabled={appStatus === 'Pending'} /> {/* Default placeholder??? */}
                <fieldset>
                    <legend>Address</legend>
                    <label>Building/Apartment #: </label>
                    <input type='text' name='building' value={formData.building} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Street Name: </label>
                    <input type='text' name='street' value={formData.street} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>City: </label>
                    <input type='text' name='city' value={formData.city} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>State: </label>
                    <input type='text' name='state' value={formData.state} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>ZIP: </label>
                    <input type='number' name='zip' value={formData.zip} min={10000} max={99999} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Phone Numbers</legend>
                    <label>Cell Phone Number: </label>
                    <input type='tel' name='cellPhone' value={formData.cellPhone} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Work Phone Number: </label>
                    <input type='tel' name='workPhone' value={formData.workPhone} onChange={handleChange} disabled={appStatus === 'Pending'} />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Car Info</legend>
                    <label>Make: </label>
                    <input type='text' name='carMake' value={formData.carMake} onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>Model: </label>
                    <input type='text' name='carModel' value={formData.carModel} onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>Color: </label>
                    <input type='text' name='carColor' value={formData.carColor} onChange={handleChange} disabled={appStatus === 'Pending'} />
                </fieldset>
                <br />
                <label>Email: </label>
                <input type='text' value={userEmail} disabled />
                <label>SSN: </label>
                <input type='password' name='ssn' value={formData.ssn} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Date of Birth: </label>
                <input type='date' name='dob' value={formData.dob} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Gender: </label>
                <select name='gender' value={formData.gender} onChange={handleChange} disabled={appStatus === 'Pending'}>
                    <option value='' selected>Select gender</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='I do not wish to answer'>I do not wish to answer</option>
                </select>
                <br />
                <fieldset>
                    <legend>Work Authorization</legend>
                    <label>Are you a citizen or permanent resident of the US?</label>
                    <input type='radio' name='isPermRes' checked={formData.isPermRes === 'Yes'} value='Yes' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Yes</label>
                    <input type='radio' name='isPermRes' checked={formData.isPermRes === 'No'} value='No' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>No</label>
                    {formData.isPermRes === 'Yes' &&
                        <>
                            <br />
                            <label>What kind of permanent residence?</label>
                            <input type='radio' name='permResStatus' checked={formData.permResStatus === 'Citizen'} value='Citizen' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Citizen</label>
                            <input type='radio' name='permResStatus' checked={formData.permResStatus === 'Green Card'} value='Green Card' onChange={handleChange} disabled={appStatus === 'Pending'} />
                            <label>Green Card</label>
                        </>
                    }
                    {formData.isPermRes === 'No' &&
                        <>
                            <br />
                            <label>What is your work authorization? </label>
                            <select name='nonPermWorkAuth' value={formData.nonPermWorkAuth} onChange={handleChange} disabled={appStatus === 'Pending'} required>
                                <option value='' disabled selected>Select work auth</option>
                                <option value='H1-B'>H1-B</option>
                                <option value='L2'>L2</option>
                                <option value='F1(CPT/OPT)'>F1(CPT/OPT)</option>
                                <option value='H4'>H4</option>
                                <option value='Other'>Other</option>
                            </select>
                            {formData.nonPermWorkAuth === 'F1(CPT/OPT)' &&
                                <>
                                    <br />
                                    <label>Upload your OPT Receipt: </label>
                                    <input type='file' name='optReceipt' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                                </>
                            }
                            {formData.nonPermWorkAuth === 'Other' &&
                                <>
                                    <br />
                                    <label>Visa title: </label>
                                    <input type='text' name='visaTitle' value={formData.visaTitle} onChange={handleChange} disabled={appStatus === 'Pending'} />
                                </>
                            }
                            <br />
                            <label>Work authorization start date: </label>
                            <input type='date' name='visaStartDate' value={formData.visaStartDate} onChange={handleChange} disabled={appStatus === 'Pending'} />
                            <br />
                            <label>Work authorization end date: </label>
                            <input type='date' name='visaEndDate' value={formData.visaEndDate} onChange={handleChange} disabled={appStatus === 'Pending'} />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Driver&#39;s License</legend>
                    <label>Do you have a driver&#39;s license?</label>
                    <input type='radio' name='hasDriversLicense' checked={formData.hasDriversLicense === 'Yes'} value='Yes' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Yes</label>
                    <input type='radio' name='hasDriversLicense' checked={formData.hasDriversLicense === 'No'} value='No' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>No</label>
                    {formData.hasDriversLicense === 'Yes' &&
                        <>
                            <br />
                            <label>Driver&#39;s License Number: </label>
                            <input type='number' name='dlNum' value={formData.dlNum} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <br />
                            <label>Driver&#39;s License Expiration: </label>
                            <input type='date' name='dlExpDate' value={formData.dlExpDate} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <br />
                            <label>Driver&#39;s License Copy: </label>
                            <input type='file' name='dlCopy' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Reference</legend>
                    <label>Did someone refer you to this company?</label>
                    <input type='radio' name='isReferred' checked={formData.isReferred === 'Yes'} value='Yes' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Yes</label>
                    <input type='radio' name='isReferred' checked={formData.isReferred === 'No'} value='No' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>No</label>
                    {formData.isReferred === 'Yes' &&
                        <>
                            <br />
                            <label>First Name: </label>
                            <input type='text' name='refFirstName' value={formData.refFirstName} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Last Name: </label>
                            <input type='text' name='refLastName' value={formData.refLastName} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Middle Name: </label>
                            <input type='text' name='refMiddleName' value={formData.refMiddleName} onChange={handleChange} disabled={appStatus === 'Pending'} />
                            <label>Phone: </label>
                            <input type='tel' name='refPhone' value={formData.refPhone} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Email: </label>
                            <input type='email' name='refEmail' value={formData.refEmail} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Relationship: </label>
                            <input type='text' name='refRelationship' value={formData.refRelationship} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Emergency Contact{formData.emergencyContacts.length === 1 ? '' : 's'}</legend>
                    {formData.emergencyContacts.map((contact, index) => (
                        <div key={index}>
                            <label>First Name</label>
                            <input type='text' name='firstName' value={contact.firstName} onChange={(e) => handleEmContactChange(e, index)} disabled={appStatus === 'Pending'} required />
                            <label>Last Name</label>
                            <input type='text' name='lastName' value={contact.lastName} onChange={(e) => handleEmContactChange(e, index)} disabled={appStatus === 'Pending'} required />
                            <label>Middle Name</label>
                            <input type='text' name='middleName' value={contact.middleName} onChange={(e) => handleEmContactChange(e, index)} disabled={appStatus === 'Pending'} />
                            <label>Phone</label>
                            <input type='tel' name='phone' value={contact.phone} onChange={(e) => handleEmContactChange(e, index)} disabled={appStatus === 'Pending'} required />
                            <label>Email</label>
                            <input type='email' name='emEmail' value={contact.emEmail} onChange={(e) => handleEmContactChange(e, index)} disabled={appStatus === 'Pending'} required />
                            <label>Relationship</label>
                            <input type='text' name='relationship' value={contact.relationship} onChange={(e) => handleEmContactChange(e, index)} disabled={appStatus === 'Pending'} required />
                            {formData.emergencyContacts.length !== 1 && appStatus !== 'Pending' &&
                                <button onClick={(e) => removeEmergencyContact(e, index)} disabled={appStatus === 'Pending'}>Remove Contact</button>
                            }
                            <br />
                        </div>
                    ))}
                    {appStatus !== 'Pending' && <button onClick={addEmergencyContact} disabled={appStatus === 'Pending'}>Add Contact</button>}
                </fieldset>
                <input type='submit' value='Submit' disabled={appStatus === 'Pending'} />
            </form>
            {appStatus === 'Pending' &&
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: '2rem' }}>
                    {Object.keys(docs).map((key) => {
                        const doc = docs[key]
                        let fileName
                        switch (key) {
                            case 'profilePictureURL':
                                fileName = 'Profile Picture'
                                break
                            case 'driversLicenseCopy_url':
                                fileName = "Driver's License"
                                break
                            case 'optUrl':
                                fileName = 'OPT Receipt'
                                break
                        }
                        return (
                            <>
                                <Card key={`${key}-download`} sx={{ minWidth: 275 }}>
                                    <CardContent>
                                        <Typography variant='h6'>{fileName}</Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center' }}>
                                        <Button href={doc.download} download>
                                            Download
                                        </Button>
                                        <Button onClick={() => window.open(doc.preview, '_blank')}>
                                            Preview
                                        </Button>
                                    </CardActions>
                                </Card>
                            </>
                        )
                    })}
                </Box>
            }
            <ToastContainer />
        </div>
    )
}

export default Onboarding