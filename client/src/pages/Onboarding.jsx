import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { token, USER_ENDPOINT, username } from '../constants'
import axios from 'axios'
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/joy'

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
        gender: 'Male',
        carMake: '',
        carModel: '',
        CarColor: '',
        cellPhone: '',
        workPhone: '',
        isPermRes: '',
        permResStatus: '',
        nonPermWorkAuth: 'H1-B',
        hasDriversLicense: '',
        isReferred: '',
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
        ]
    })

    const [emCounter, setEmCounter] = useState(1)
    const [userEmail, setUserEmail] = useState('')
    const [appStatus, setAppStatus] = useState('')
    const [docs, setDocs] = useState([])
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setUserEmail(response.data.email)
            const status = response.data.onboardingStatus
            setAppStatus(status)
            console.log('appStatus:', status)
            if (status === 'Pending') {
                getDocs()
            }
        })
        .catch(error => {
            toast.error(`Error fetching user info! Error: ${error.message}`)
        })
    }, [])

    const getDocs = async () => {
        const response = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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
                    'Authorization': `Bearer ${token}`,
                }
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
            <h2>Status: {appStatus}</h2>
            {appStatus === 'Pending' && <h3>Please wait for HR to review your application.</h3>}
            <form onSubmit={handleSubmit}>
                <label>First Name: </label>
                <input type='text' name='firstName' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Last Name: </label>
                <input type='text' name='lastName' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Middle Name: </label>
                <input type='text' name='middleName' onChange={handleChange} disabled={appStatus === 'Pending'} />
                <label>Preferred Name: </label>
                <input type='text' name='preferredName' onChange={handleChange} disabled={appStatus === 'Pending'} />
                <label>Profile Picture: </label>
                <input type='file' name='profilePicture' onChange={handleChange} disabled={appStatus === 'Pending'} /> {/* Default placeholder??? */}
                <fieldset>
                    <legend>Address</legend>
                    <label>Building/Apartment #: </label>
                    <input type='text' name='building' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Street Name: </label>
                    <input type='text' name='street' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>City: </label>
                    <input type='text' name='city' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>State: </label>
                    <input type='text' name='state' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>ZIP: </label>
                    <input type='number' name='zip' min={10000} max={99999} onChange={handleChange} disabled={appStatus === 'Pending'} required />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Phone Numbers</legend>
                    <label>Cell Phone Number: </label>
                    <input type='tel' name='cellPhone' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Work Phone Number: </label>
                    <input type='tel' name='workPhone' onChange={handleChange} disabled={appStatus === 'Pending'} />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Car Info</legend>
                    <label>Make: </label>
                    <input type='text' name='carMake' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>Model: </label>
                    <input type='text' name='carModel' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>Color: </label>
                    <input type='text' name='carColor' onChange={handleChange} disabled={appStatus === 'Pending'} />
                </fieldset>
                <br />
                <label>Email: </label>
                <input type='text' value={userEmail} disabled />
                <label>SSN: </label>
                <input type='password' name='ssn' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Date of Birth: </label>
                <input type='date' name='dob' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                <label>Gender: </label>
                <select name='gender' onChange={handleChange} disabled={appStatus === 'Pending'}>
                    <option value='Male' selected>Male</option>
                    <option value='Female'>Female</option>
                    <option value='I do not wish to answer'>I do not wish to answer</option>
                </select>
                <br />
                <fieldset>
                    <legend>Work Authorization</legend>
                    <label>Are you a citizen or permanent resident of the US?</label>
                    <input type='radio' name='isPermRes' value='Yes' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Yes</label>
                    <input type='radio' name='isPermRes' value='No' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>No</label>
                    {formData.isPermRes === 'Yes' &&
                        <>
                            <br />
                            <label>What kind of permanent residence?</label>
                            <input type='radio' name='permResStatus' value='Citizen' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Citizen</label>
                            <input type='radio' name='permResStatus' value='Green Card' onChange={handleChange} disabled={appStatus === 'Pending'} />
                            <label>Green Card</label>
                        </>
                    }
                    {formData.isPermRes === 'No' &&
                        <>
                            <br />
                            <label>What is your work authorization? </label>
                            <select name='nonPermWorkAuth' onChange={handleChange} disabled={appStatus === 'Pending'} required>
                                <option value='H1-B' selected>H1-B</option>
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
                                    <input type='text' name='visaTitle' onChange={handleChange} disabled={appStatus === 'Pending'} />
                                </>
                            }
                            <br />
                            <label>Work authorization start date: </label>
                            <input type='date' name='visaStartDate' onChange={handleChange} disabled={appStatus === 'Pending'} />
                            <br />
                            <label>Work authorization end date: </label>
                            <input type='date' name='visaEndDate' onChange={handleChange} disabled={appStatus === 'Pending'} />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Driver&#39;s License</legend>
                    <label>Do you have a driver&#39;s license?</label>
                    <input type='radio' name='hasDriversLicense' value='Yes' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Yes</label>
                    <input type='radio' name='hasDriversLicense' value='No' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>No</label>
                    {formData.hasDriversLicense === 'Yes' &&
                        <>
                            <br />
                            <label>Driver&#39;s License Number: </label>
                            <input type='number' name='dlNum' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <br />
                            <label>Driver&#39;s License Expiration: </label>
                            <input type='date' name='dlExpDate' onChange={handleChange} disabled={appStatus === 'Pending'} required />
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
                    <input type='radio' name='isReferred' value='Yes' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                    <label>Yes</label>
                    <input type='radio' name='isReferred' value='No' onChange={handleChange} disabled={appStatus === 'Pending'} />
                    <label>No</label>
                    {formData.isReferred === 'Yes' &&
                        <>
                            <br />
                            <label>First Name: </label>
                            <input type='text' name='refFirstName' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Last Name: </label>
                            <input type='text' name='refLastName' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Middle Name: </label>
                            <input type='text' name='refMiddleName' onChange={handleChange} disabled={appStatus === 'Pending'} />
                            <label>Phone: </label>
                            <input type='tel' name='refPhone' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Email: </label>
                            <input type='email' name='refEmail' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                            <label>Relationship: </label>
                            <input type='text' name='refRelationship' onChange={handleChange} disabled={appStatus === 'Pending'} required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Emergency Contacts</legend>
                    {formData.emergencyContacts.map((contact, index) => (
                        <div key={contact.counter}>
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
                            {formData.emergencyContacts.length !== 1 &&
                                <button onClick={(e) => removeEmergencyContact(e, index)} disabled={appStatus === 'Pending'}>Remove Contact</button>
                            }
                            <br />
                        </div>
                    ))}
                    <button onClick={addEmergencyContact} disabled={appStatus === 'Pending'}>Add Contact</button>
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
                                        <a href={doc} download>
                                            <Button size='small' href={doc} download>
                                                Download
                                            </Button>
                                        </a>
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