import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'material-react-toastify'
import { alphanumRegex, phoneRegex, USER_ENDPOINT, username } from '../constants'
import axios from 'axios'
import { Box, Container, Button, Radio, RadioGroup, Card, CardActions, CardContent, InputLabel, Typography, CardHeader, TextField, FormControlLabel, FormControl, FormLabel, Select, MenuItem } from '@mui/material'
import 'material-react-toastify/dist/ReactToastify.css'
import ErrorHelperText from '../components/ErrorHelperText';
import { useNavigate } from 'react-router-dom'
import { checkZIP } from '../helpers/HelperFunctions'

const Onboarding = () => {

    const navigate = useNavigate()

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
        zip: '',
        ssn: '',
        dob: '',
        gender: 'I do not wish to answer',
        carMake: '',
        carModel: '',
        carColor: '',
        cellPhone: '',
        workPhone: '',
        isPermRes: '',
        permResStatus: '',
        nonPermWorkAuth: 'H1-B',
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

    const [errors, setErrors] = useState({
        dlNum: false,
        zip: false,
        dob: false,
        visaEndDate: false,
        cellPhone: false,
        workPhone: false,
    })
    const helperTexts = {
        dlNum: "Driver's license number must be alphanumeric!",
        zip: 'ZIP code must have 5 digits!',
        dob: 'Birthday must be in the past!',
        visaEndDate: 'Visa end date must be in the future!',
        cellPhone: 'Phone number must be in a proper format!',
        workPhone: 'Phone number must be in a proper format!',
    }

    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/userinfo`, {
            withCredentials: true,
        })
        .then(response => {
            setUserEmail(response.data.email)
            const status = response.data.onboardingStatus
            if (status === 'Approved') {
                return navigate('/employee/profile')
            }
            setAppStatus(status)
            // console.log('appStatus:', status)
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
            isPermRes,
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
        const stateAndZip = address.split(', ')[2]
        const lastSpaceIndex = stateAndZip.lastIndexOf(' ')
        const state = stateAndZip.substring(0, lastSpaceIndex)
        const zip = stateAndZip.substring(lastSpaceIndex + 1)
        const buildingAndStreet = address.split(', ')[0]
        const firstSpaceIndex = buildingAndStreet.indexOf(' ')
        const building = buildingAndStreet.substring(0, firstSpaceIndex)
        const street = buildingAndStreet.substring(firstSpaceIndex + 1)
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
            isPermRes,
            hasDriversLicense: data.driversLicenseNumber ? 'Yes' : 'No',
            dlNum: driversLicenseNumber,
            dlExpDate: driversLicenseExpDate ? driversLicenseExpDate.split('T')[0] : '',
            isReferred: referer ? 'Yes' : 'No',
            emergencyContacts: newEmContacts,
            building,
            street,
            city: address.split(', ')[1],
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

    const getDocs = async () => {
        const response = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
            withCredentials: true,
        })
        setDocs(response.data)
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


        const newErrorObject = {}
        for (const key in errors) {
            newErrorObject[key] = false
        }
        if (!checkZIP(formData.zip)) {
            newErrorObject['zip'] = true
        }
        if (new Date(formData.dob) > new Date()) {
            newErrorObject['dob'] = true
        }
        if (new Date(formData.visaEndDate) < new Date()) {
            newErrorObject['visaEndDate'] = true
        }
        if (formData.dlNum && !alphanumRegex.test(formData.dlNum)) {
            newErrorObject['dlNum'] = true
        }
        if (!phoneRegex.test(formData.cellPhone)) {
            newErrorObject['cellPhone'] = true
        }
        if (formData.workPhone && !phoneRegex.test(formData.workPhone)) {
            newErrorObject['workPhone'] = true
        }
        for (const key in newErrorObject) {
            if (newErrorObject[key]) {
                toast.error('Please fix input errors!')
                return setErrors(newErrorObject)
            }
        }


        setErrors(newErrorObject)

        const data = createFormData(formData)

        try {
            await axios.post(`${USER_ENDPOINT}/applicationinput`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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
        <Container maxWidth="md" sx={{ marginTop: 15}}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, boxShadow: 3, borderRadius: 2,  backgroundColor: 'white'}}>
            <Typography variant='h4' sx={{ color: appStatus === 'Rejected' ? 'red' : 'black', mb: 1 }}>Status: {appStatus}</Typography>
            {appStatus === 'Pending' && <Typography variant='h5' sx={{ mb: 2 }}>Please wait for HR to review your application.</Typography>}
            {appStatus === 'Rejected' && (formData.hrFeedback ?
                <Box sx={{ mt: 2, mb: 4 }}>
                    <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                        <CardHeader title='Feedback from HR:' sx={{ paddingBottom: 0 }} />
                        <CardContent>
                            <Typography variant='body1'>
                                {formData.hrFeedback}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                : (
                    <Box sx={{ mt: 2, mb: 4 }}>
                        <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                            <CardContent>
                                <Typography variant='body1'>
                                    No feedback provided
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))
            }
            <form onSubmit={handleSubmit}>
                <TextField label='First Name' name='firstName' value={formData.firstName} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' fullWidth required sx={{ mb: 2 }} />
                <TextField label='Last Name' name='lastName' value={formData.lastName} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' fullWidth required sx={{ mb: 2 }} />
                <TextField label='Middle Name' name='middleName' value={formData.middleName} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' fullWidth sx={{ mb: 2 }} />
                <TextField label='Preferred Name' name='preferredName' value={formData.preferredName} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' fullWidth sx={{ mb: 2 }} />
                <Typography gutterBottom>Profile Picture</Typography>
                <TextField type='file' name='profilePicture' onChange={handleChange} disabled={appStatus === 'Pending'} accept='image/*' variant='outlined' fullWidth sx={{ mb: 2 }} />
                <fieldset>
                    <legend>Address</legend>
                    <TextField label='Building/Apartment Number' type='number' name='building' value={formData.building} onChange={handleChange} disabled={appStatus === 'Pending'} required fullWidth sx={{ mb: 2 }} />
                    <TextField label='Street' name='street' value={formData.street} onChange={handleChange} disabled={appStatus === 'Pending'} required fullWidth sx={{ mb: 2 }} />
                    <TextField label='City' name='city' value={formData.city} onChange={handleChange} disabled={appStatus === 'Pending'} required fullWidth sx={{ mb: 2 }} />
                    <TextField label='State' name='state' value={formData.state} onChange={handleChange} disabled={appStatus === 'Pending'} required fullWidth sx={{ mb: 2 }} />
                    <TextField label='ZIP' name='zip' type='number' value={formData.zip} variant='outlined' onChange={handleChange} fullWidth error={errors.zip} disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                    <ErrorHelperText hasError={errors.zip} message={helperTexts.zip} />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Phone Numbers</legend>
                    <TextField label='Cell Phone Number' name='cellPhone' value={formData.cellPhone} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' required fullWidth error={errors.cellPhone} sx={{ mb: 2 }} />
                    <ErrorHelperText hasError={errors.cellPhone} message={helperTexts.cellPhone} />
                    <TextField label='Work Phone Number' name='workPhone' value={formData.workPhone} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' fullWidth error={errors.workPhone} sx={{ mb: 2 }} />
                    <ErrorHelperText hasError={errors.workPhone} message={helperTexts.workPhone} />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Car Info</legend>
                    <TextField label="Make" name='carMake' value={formData.carMake} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} sx={{ mb: 2 }} />
                    <TextField label="Model" name='carModel' value={formData.carModel} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} sx={{ mb: 2 }} />
                    <TextField label="Color" name='carColor' value={formData.carColor} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} sx={{ mb: 1 }} />
                </fieldset>
                <br />
                <TextField label='Email' value={userEmail} variant='outlined' fullWidth sx={{ mb: 2 }} disabled />
                <TextField label='SSN' type='password' name='ssn' value={formData.ssn} onChange={handleChange} disabled={appStatus === 'Pending'} required variant='outlined' fullWidth sx={{ mb: 2 }} />
                <TextField label='Date of Birth' type='date' name='dob' value={formData.dob} onChange={handleChange} disabled={appStatus === 'Pending'} required variant='outlined' error={errors.dob} fullWidth sx={{ mb: 2 }} />
                <ErrorHelperText hasError={errors.dob} message={helperTexts.dob} />
                <InputLabel>Gender</InputLabel>
                <Select name='gender' label='Gender' value={formData.gender} onChange={handleChange} disabled={appStatus === 'Pending'} fullWidth sx={{ mb: 2 }}>
                    <MenuItem value='Male'>Male</MenuItem>
                    <MenuItem value='Female'>Female</MenuItem>
                    <MenuItem value='I do not wish to answer'>I do not wish to answer</MenuItem>
                </Select>
                <fieldset>
                    <legend>Work Authorization</legend>
                    <FormControl component='fieldset' disabled={appStatus === 'Pending'} required>
                        <FormLabel component='legend'>Are you a citizen or permanent resident of the US?</FormLabel>
                        <RadioGroup row value={formData.isPermRes} name='isPermRes' onChange={handleChange} disabled={appStatus === 'Pending'} required>
                            <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                            <FormControlLabel value='No' control={<Radio />} label='No' />
                        </RadioGroup>
                    </FormControl>
                    {formData.isPermRes === 'Yes' &&
                        <>
                            <br />
                            <FormControl component='fieldset' disabled={appStatus === 'Pending'} required>
                                <FormLabel component='legend'>What kind of permanent residence?</FormLabel>
                                <RadioGroup row value={formData.permResStatus} name='permResStatus' onChange={handleChange} disabled={appStatus === 'Pending'} required>
                                    <FormControlLabel value='Citizen' control={<Radio />} label='Citizen' />
                                    <FormControlLabel value='Green Card' control={<Radio />} label='Green Card' />
                                </RadioGroup>
                            </FormControl>
                        </>
                    }
                    {formData.isPermRes === 'No' &&
                        <>
                            {/* <br />
                            <label>What is your work authorization? </label>
                            <select name='nonPermWorkAuth' value={formData.nonPermWorkAuth} onChange={handleChange} disabled={appStatus === 'Pending'} required>
                                <option value='' disabled selected>Select work auth</option>
                                <option value='H1-B'>H1-B</option>
                                <option value='L2'>L2</option>
                                <option value='F1(CPT/OPT)'>F1(CPT/OPT)</option>
                                <option value='H4'>H4</option>
                                <option value='Other'>Other</option>
                            </select> */}
                            <InputLabel>What is your work authorization?</InputLabel>
                            <Select name='nonPermWorkAuth' value={formData.nonPermWorkAuth} onChange={handleChange} disabled={appStatus === 'Pending'} fullWidth sx={{ mb: 2 }}>
                                <MenuItem value='H1-B'>H1-B</MenuItem>
                                <MenuItem value='L2'>L2</MenuItem>
                                <MenuItem value='F1(CPT/OPT)'>F1(CPT/OPT)</MenuItem>
                                <MenuItem value='H4'>H4</MenuItem>
                                <MenuItem value='Other'>Other</MenuItem>
                            </Select>
                            {formData.nonPermWorkAuth === 'F1(CPT/OPT)' &&
                                <>
                                    <Typography gutterBottom>Upload Your OPT Receipt *</Typography>
                                    <TextField type='file' name='optReceipt' onChange={handleChange} disabled={appStatus === 'Pending'} required variant='outlined' fullWidth sx={{ mb: 2 }} />
                                </>
                            }
                            {formData.nonPermWorkAuth === 'Other' &&
                                <>
                                    <br />
                                    <label>Visa title: </label>
                                    <input type='text' name='visaTitle' value={formData.visaTitle} onChange={handleChange} disabled={appStatus === 'Pending'} />
                                </>
                            }
                            <TextField label='Visa Start Date' type='date' name='visaStartDate' value={formData.visaStartDate} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' fullWidth sx={{ mb: 2 }} />
                            <TextField label='Visa End Date' type='date' name='visaEndDate' value={formData.visaEndDate} onChange={handleChange} disabled={appStatus === 'Pending'} variant='outlined' error={errors.visaEndDate} fullWidth sx={{ mb: 2 }} />
                            <ErrorHelperText hasError={errors.visaEndDate} message={helperTexts.visaEndDate} />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Driver&#39;s License</legend>
                    <FormControl component='fieldset' disabled={appStatus === 'Pending'} required sx={{ mb: 2 }}>
                        <FormLabel component='legend'>Do you have a driver&#39;s license?</FormLabel>
                        <RadioGroup row value={formData.hasDriversLicense} name='hasDriversLicense' onChange={handleChange} disabled={appStatus === 'Pending'} required>
                            <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                            <FormControlLabel value='No' control={<Radio />} label='No' />
                        </RadioGroup>
                    </FormControl>
                    {formData.hasDriversLicense === 'Yes' &&
                        <>
                            <TextField label="Driver's License Number" name='dlNum' value={formData.dlNum} variant='outlined' onChange={handleChange} fullWidth error={errors.dlNum} disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <ErrorHelperText hasError={errors.dlNum} message={helperTexts.dlNum} />
                            <TextField label="Driver's License Expiration Date" type='date' name='dlExpDate' value={formData.dlExpDate} onChange={handleChange} disabled={appStatus === 'Pending'} required variant='outlined' fullWidth sx={{ mb: 2 }} />
                            <Typography gutterBottom>Driver&#39;s License Copy *</Typography>
                            <TextField type='file' name='dlCopy' onChange={handleChange} disabled={appStatus === 'Pending'} required variant='outlined' fullWidth sx={{ mb: 2 }} />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Reference</legend>
                    <FormControl component='fieldset' disabled={appStatus === 'Pending'} required sx={{ mb: 2 }}>
                        <FormLabel component='legend'>Did someone refer you to this company?</FormLabel>
                        <RadioGroup row value={formData.isReferred} name='isReferred' onChange={handleChange} disabled={appStatus === 'Pending'} required>
                            <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                            <FormControlLabel value='No' control={<Radio />} label='No' />
                        </RadioGroup>
                    </FormControl>
                    {formData.isReferred === 'Yes' &&
                        <>
                            <TextField label="Referer's First Name" name='refFirstName' value={formData.refFirstName} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Referer's Last Name" name='refLastName' value={formData.refLastName} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Referer's Middle Name" name='refMiddleName' value={formData.refMiddleName} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} sx={{ mb: 2 }} />
                            <TextField label="Referer's Phone" name='refPhone' value={formData.refPhone} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Referer's Email" name='refEmail' value={formData.refEmail} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Referer's Relationship to You" name='refRelationship' value={formData.refRelationship} variant='outlined' onChange={handleChange} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Emergency Contact{formData.emergencyContacts.length === 1 ? '' : 's'}</legend>
                    {formData.emergencyContacts.map((contact, index) => (
                        <div key={index} style={{ marginTop: '1rem' }}>
                            <TextField label="First Name" name='firstName' value={contact.firstName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Last Name" name='lastName' value={contact.lastName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Middle Name" name='middleName' value={contact.middleName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={appStatus === 'Pending'} sx={{ mb: 2 }} />
                            <TextField label="Phone" name='phone' value={contact.phone} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Email" name='emEmail' value={contact.emEmail} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            <TextField label="Relationship to You" name='relationship' value={contact.relationship} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={appStatus === 'Pending'} required sx={{ mb: 2 }} />
                            {formData.emergencyContacts.length !== 1 && appStatus !== 'Pending' &&
                                <Button onClick={(e) => removeEmergencyContact(e, index)} disabled={appStatus === 'Pending'}>Remove Contact</Button>
                            }
                            <br />
                        </div>
                    ))}
                    {appStatus !== 'Pending' && <Button onClick={addEmergencyContact} disabled={appStatus === 'Pending'}>Add Contact</Button>}
                </fieldset>
                <Button type='submit' variant='contained' color='primary' disabled={appStatus === 'Pending'} fullWidth sx={{ p: 2, mt: 2, mb: 2 }}>Submit</Button>
                {/* <input type='submit' value='Submit' disabled={appStatus === 'Pending'} /> */}
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
            </Box>
        </Container>
    )
}

export default Onboarding