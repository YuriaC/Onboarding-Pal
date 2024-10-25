import { useState, useEffect, useRef } from 'react';
import './Personal.css';
import axios from 'axios';
import { toast, ToastContainer } from 'material-react-toastify';
import { useNavigate } from 'react-router-dom'
import 'material-react-toastify/dist/ReactToastify.css';
import { Avatar, Select, MenuItem, InputLabel, FormControl, Dialog, DialogTitle, DialogActions, Radio, FormControlLabel, FormLabel, RadioGroup, Container, TextField, Box, Card, CardActions, CardContent, Typography, Button } from '@mui/material';
import { isEmail, isAddress, checkZIP, isAlphabetic, isAlphaNumeric } from '../helpers/HelperFunctions';
import { phoneRegex, USER_ENDPOINT } from '../constants';
import ErrorHelperText from '../components/ErrorHelperText';

const Personal = () => {
    const navigate = useNavigate()

    const profilePictureRef = useRef(null)
    const optReceiptRef = useRef(null)
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        username: '',
        preferredName: '',
        profilePicture: '',
        profilePictureURL: '',
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
        cellPhone: '',
        permResStatus: '',
        isPermRes: '',
        workPhone: '',
        visaTitle: '',
        nonPermWorkAuth: '',
        visaStartDate: '',
        visaEndDate: '',
        emergencyContacts: [{
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            emEmail: '',
            relationship: '',
            counter: 0,
        }],
    });

    const [openDialogue, setOpenDialogue] = useState(false)
    const [formDataClone, setFormDataClone] = useState({});
    const [isLoading, setIsLoading] = useState(true)
    const [docs, setDocs] = useState([]);  // for containing files from AWS 
    // const [files, setfiles] = useState([]);
    const [emCounter, setEmCounter] = useState(1)

    // fetch uploaded file from AWS
    const getDocs = async () => {
        const response = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
            withCredentials: true,
        })
        setDocs(response.data);
    }

    const setDataToForm = (data) => {
        const {
            username,
            firstName,
            lastName,
            middleName,
            preferredName,
            email,
            ssn,
            birthday,
            gender,
            cellPhone,
            workPhone,
            address,
            isPermRes,
            permResStatus,
            workAuth,
            visaStartDate,
            visaEndDate,
            emergencyContacts,
            profilePictureURL,
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
            username,
            firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
            lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
            middleName,
            preferredName,
            email,
            ssn,
            dob: birthday.split('T')[0],
            gender,
            profilePictureURL,
            cellPhone,
            workPhone,
            isPermRes,
            nonPermWorkAuth: workAuth,
            permResStatus,
            workAuth,
            visaStartDate: visaStartDate ? visaStartDate.split('T')[0] : '',
            visaEndDate: visaEndDate ? visaEndDate.split('T')[0] : '',
            emergencyContacts: newEmContacts,
            building,
            street,
            city: address.split(', ')[1],
            state,
            zip,
            visaTitle,
        })
    }

    const [errors, setErrors] = useState({
        firstName: false,
        middleName: false,
        preferredName: false,
        lastName: false,
        email: false,
        ssn: false,
        dob: false,
        building: false,
        street: false,
        city: false,
        state: false,
        zip: false,
        visaEndDate: false,
        cellPhone: false,
        workPhone: false,
        emFirstName: false,
        emLastName: false,
        emMiddleName: false,
        emPhone: false,
        emEmail: false,
    })

    const helperTexts = {
        name: "Name must contain only English characters.", 
        dlNum: "Driver's license number must be alphanumeric!",
        building: "Building Adress can only contain alphanumeric characters!",
        ssn: "SSN must be 9-digit long",
        address: "Street/ City/ State entry must be english characters!",
        zip: 'ZIP code must have 5 digits!',
        dob: 'Birthday must be in the past!',
        visaEndDate: 'Visa end date must be in the future!',
        cellPhone: 'Phone number must be in a proper format!',
        workPhone: 'Phone number must be in a proper format!',
        email: 'Email must be in a proper format!',
    }

    useEffect(() => {
        setFormDataClone(JSON.parse(JSON.stringify(formData)));
    }, [isEditing])


    useEffect(() => {
        const fetchData = async () => {
            await axios.get(`${USER_ENDPOINT}/userinfo`, {
                withCredentials: true,
            })
                .then(response => {
                    const { data } = response
                    const { onboardingStatus } = data
                    if (onboardingStatus !== 'Approved') {
                        return navigate('/onboarding')
                    }
                    setDataToForm(data);
                    getDocs();
                    toast.success('Successfully fetched user data and files!')
                })
                .catch(error => {
                    toast.error(`Error fetching user info! Error: ${error.message}`)
                })
            
            setIsLoading(false)
        }
        fetchData()
    }, [])

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

    const handleEditToggle = () => {
        // if (isEditing) {
        //     const confirmDiscard = window.confirm("Discard changes?");
        //     if (confirmDiscard) {
        //         setFormData(formDataClone);
        //         setIsEditing(false);
        //     }
        // } else {
        //     setIsEditing(true);
        // }
        if (isEditing) {
            setOpenDialogue(true)
        }
        else {
            setIsEditing(true)
        }
    };

    const handleDiscard = () => {
        setFormData(formDataClone);
        setIsEditing(false);
        setOpenDialogue(false)
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
        return formData;
    }

    const handleClose = () => {
        setOpenDialogue(false)
    }


    const handleSubmit = async (e) => {
        e.preventDefault();   

        const newErrorObject = {}
        for (const key in errors) {
            newErrorObject[key] = false
        }
        if (!isAlphabetic(formData.firstName)) {
            newErrorObject['firstName'] = true
        }
        if (formData.middleName && !isAlphabetic(formData.middleName)) {
            newErrorObject['middleName'] = true
        }
        if (!isAlphabetic(formData.lastName)) {
            newErrorObject['lastName'] = true
        }
        if (!isEmail(formData.email)) {
            newErrorObject['email'] = true
        }
        if (!isAlphaNumeric(formData.building)) {
            newErrorObject['building'] = true
        }
        if (!isAddress(formData.street)) {
            newErrorObject['street'] = true
        }
        // if (!isAlphaNumeric(formData.city)) {
        //     newErrorObject['city'] = true
        // }
        // if (!isAlphaNumeric(formData.state)) {
        //     newErrorObject['state'] = true
        // }
        if (!checkZIP(formData.zip)) {
            newErrorObject['zip'] = true
        }
        if (new Date(formData.dob) > new Date()) {
            newErrorObject['dob'] = true
        }
        if (new Date(formData.visaEndDate) < new Date()) {
            newErrorObject['visaEndDate'] = true
        }
        if (!phoneRegex.test(formData.cellPhone)) {
            newErrorObject['cellPhone'] = true
        }
        if (formData.workPhone && !phoneRegex.test(formData.workPhone)) {
            newErrorObject['workPhone'] = true
        }
        // formData.emergencyContacts.map((contact) => {
        //     if (!isAlphabetic(contact.firstName)) {
        //         newErrorObject['emFirstName'] = true
        //     }
        //     if (contact.middleName && !isAlphabetic(contact.middleName)) {
        //         newErrorObject['emMiddleName'] = true
        //     }
        //     if (!isAlphabetic(contact.lastName)) {
        //         newErrorObject['emLastName'] = true
        //     }
        //     if (!phoneRegex.test(contact.phone)) {
        //         newErrorObject['emPhone'] = true
        //     }
        //     if (!isEmail(contact.emEmail)) {
        //         newErrorObject['emEmail'] = true
        //     }
        // })
        for (const key in newErrorObject) {
            if (newErrorObject[key]) {
                toast.error('Please fix input errors!')
                return setErrors(newErrorObject)
            }
        }
        setErrors(newErrorObject)

        const data = createFormData(formData)

        try {
            await axios.post(`${USER_ENDPOINT}/updateProfile`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            })
            setIsEditing(false);
            getDocs();
            toast.success('Successfully updated user profile.')
        }
        catch (error) {
            toast.error(`Error submitting application! Error: ${error.response.data}`)
        }
    }

    const profilePicCheck = docs.profilePictureURL ? docs.profilePictureURL.preview : '';  // for profile picture display

    return (
        <>
        {!isLoading ? (<Container sx={{ width: "65vw", marginTop: 8, padding: "2rem" }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
            <Typography variant="h4">Personal Information</Typography>
                {/* Basic Info Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2}} >
                <Typography variant="h6">Basic Info</Typography>
                {profilePicCheck ? (
                    <img src={profilePicCheck} alt='profilePicture' />
                ) : (
                    <Avatar sx={{ bgcolor: "blue", margin: "0 auto 2rem auto", width: "4rem", height: "4rem"}}>
                        {`${formData.firstName[0]}${formData.lastName[0]}`}
                    </Avatar>
                )}
                    {/* <img src={formData.profilePicture} alt='profilePicture'/> */}
                    {/* {isEditing && (
                        <TextField                        
                            type='file'
                            name='profilePicture'
                            onChange={handleChange}
                            accept='image/*'
                            fullWidth
                            label="Upload New Profile Picture" 
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    )} */}
                    {['firstName', 'lastName', 'middleName', 'preferredName', 'email', 'ssn'].map((field) => (
                        <div key={field}>
                        <TextField
                            name={field}
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={formData[field]}
                            onChange={handleChange}
                            error={errors[field]}
                            fullWidth
                            required={['firstName', 'lastName', 'email', 'ssn'].includes(field)}
                            disabled={!isEditing}
                            sx={{ mb: 2 }}
                            type={field === 'ssn' ? 'password' : 'text'}
                        />
                        <ErrorHelperText 
                            hasError={errors[field]} 
                            message={['firstName', 'lastName', 'middleName', 'preferredName'].includes(field) ? helperTexts['name'] : helperTexts[field]}
                            marginTop="10rem" 
                        />
                        </div>
                    ))}
                    <Typography gutterBottom>Profile Picture</Typography>
                    <TextField type='file' ref={profilePictureRef} name='profilePicture' onChange={handleChange} disabled={!isEditing} accept='image/*' variant='outlined' fullWidth sx={{ mb: 2 }} />
                        <TextField 
                            label='Date of Birth' 
                            type='date' 
                            name='dob' 
                            value={formData.dob} 
                            onChange={handleChange} 
                            disabled={!isEditing} 
                            required 
                            variant='outlined' 
                            error={errors.dob} 
                        />
                        <ErrorHelperText hasError={errors.dob} message={helperTexts.dob} />

                    <TextField
                        select
                        name="gender"
                        label="Gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                        fullWidth
                    >
                        {['Male', 'Female', 'I do not wish to answer'].map(gender => (
                            <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                        ))}
                    </TextField>
                </Box>
                    
                {/* Address Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
                <Typography variant="h6" marginTop={-2}>Address</Typography>
                    <TextField label='Building/Apartment Number' name='building' value={formData.building} onChange={handleChange} error={errors.building} disabled={!isEditing} required fullWidth />
                    <ErrorHelperText hasError={errors.building} message={helperTexts.building} />
                    <TextField label='Street' name='street' value={formData.street} onChange={handleChange} disabled={!isEditing} error={errors.street} required fullWidth />
                    <ErrorHelperText hasError={errors.street} message={helperTexts.address} />
                    <TextField label='City' name='city' value={formData.city} onChange={handleChange} disabled={!isEditing} error={errors.city} required fullWidth />
                    <ErrorHelperText hasError={errors.city} message={helperTexts.location} />
                    <TextField label='State' name='city' value={formData.state} onChange={handleChange} disabled={!isEditing} error={errors.state} required fullWidth />
                    <ErrorHelperText hasError={errors.zip} message={helperTexts.location} />
                    <TextField label='ZIP' name='zip' type='number' value={formData.zip} variant='outlined' onChange={handleChange} fullWidth error={errors.zip} disabled={!isEditing} required />
                    <ErrorHelperText hasError={errors.zip} message={helperTexts.zip} />
                </Box>

                {/* Contact Info Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
                <Typography variant="h6" marginTop={-2}>Contact Info</Typography>
                    <TextField label='Cell Phone Number' name='cellPhone' value={formData.cellPhone} onChange={handleChange} disabled={!isEditing} variant='outlined' required fullWidth error={errors.cellPhone} />                    
                    <ErrorHelperText hasError={errors.cellPhone} message={helperTexts.cellPhone} />
                    <TextField label='Work Phone Number' name='workPhone' value={formData.workPhone} onChange={handleChange} disabled={!isEditing} variant='outlined' fullWidth error={errors.workPhone} />
                    <ErrorHelperText hasError={errors.workPhone} message={helperTexts.workPhone} />
                </Box>

                {/* Employment Status Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
                    <Typography variant="h6" marginTop={-4}>Employment</Typography>
                    <FormControl fullWidth margin="normal">
                            <FormLabel>Are you a permanent resident? *</FormLabel>
                            <RadioGroup row value={formData.isPermRes} name='isPermRes' required onChange={handleChange}>
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio />}
                                    label="Yes"
                                    disabled={!isEditing}
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio />}
                                    label="No"
                                    disabled={!isEditing}
                                />
                            </RadioGroup>
                        </FormControl>
                        {formData.isPermRes === 'No' ? (
                            <>
                                <InputLabel>What is your work authorization? *</InputLabel>
                                <Select name='nonPermWorkAuth' label='Work Authorization' value={formData.nonPermWorkAuth} onChange={handleChange} required disabled={!isEditing} fullWidth sx={{ mb: 2 }}>
                                    <MenuItem value='H1-B'>H1-B</MenuItem>
                                    <MenuItem value='L2'>L2</MenuItem>
                                    <MenuItem value='F1(CPT/OPT)'>F1(CPT/OPT)</MenuItem>
                                    <MenuItem value='H4'>H4</MenuItem>
                                    <MenuItem value='Other'>Other</MenuItem>
                                </Select>
                                {formData.nonPermWorkAuth === 'F1(CPT/OPT)' &&
                                <>
                                    <Typography gutterBottom>Upload Your OPT Receipt *</Typography>
                                    <TextField type='file' ref={optReceiptRef} name='optReceipt' onChange={handleChange} disabled={!isEditing} required variant='outlined' fullWidth sx={{ mb: 2 }} />
                                </>
                                }
                                {formData.nonPermWorkAuth === 'Other' &&
                                    <>
                                        <TextField label='Visa Title' name='visaTitle' value={formData.visaTitle} onChange={handleChange} disabled={!isEditing} fullWidth sx={{ mb: 2 }} />
                                    </>
                                }
                                <TextField
                                    fullWidth
                                    name='visaStartDate'
                                    label="Visa Start Date"
                                    value={formData.visaStartDate}
                                    disabled={!isEditing}
                                    onChange={handleChange}
                                    type={formData.visaStartDate? 'date' : 'text'}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    name='visaEndDate'
                                    label="Visa End Date"
                                    value={formData.visaEndDate}
                                    disabled={!isEditing}
                                    onChange={handleChange}
                                    type={formData.visaEndDate? 'date' : 'text'}
                                    margin="normal"
                                />
                            </>
                        ) : (
                            <FormControl fullWidth margin="normal">
                                <FormLabel>What kind of permanent resident?</FormLabel>
                                <RadioGroup row value={formData.permResStatus} name='permResStatus' onChange={handleChange}>
                                    <FormControlLabel
                                        value="Citizen"
                                        control={<Radio />}
                                        label="Citizen"
                                        disabled={!isEditing}
                                    />
                                    <FormControlLabel
                                        value="Green Card"
                                        control={<Radio />}
                                        label="Green Card"
                                        disabled={!isEditing}
                                    />
                                </RadioGroup>
                            </FormControl>
                        )}
                    <ErrorHelperText hasError={errors.visaEndDate} message={helperTexts.visaEndDate} />
                </Box>

                {/* Emergency Contact Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
                    <Typography variant="h6" marginTop={-2} marginBottom={-2}>Emergency Contact</Typography>
                    {formData.emergencyContacts.map((contact, index) => (
                        <div key={index} style={{ marginTop: '1rem' }}>
                            <TextField label="First Name" name='firstName' value={contact.firstName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!isEditing} required sx={{ mb: 2 }} />
                            <ErrorHelperText hasError={errors.emFirstName} message={helperTexts.name} />
                            <TextField label="Last Name" name='lastName' value={contact.lastName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!isEditing} required sx={{ mb: 2 }} />
                            <ErrorHelperText hasError={errors.emLastName} message={helperTexts.name} />
                            <TextField label="Middle Name" name='middleName' value={contact.middleName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!isEditing} sx={{ mb: 2 }} />
                            <ErrorHelperText hasError={errors.emMiddleName} message={helperTexts.name} />
                            <TextField label="Phone" name='phone' value={contact.phone} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!isEditing} required sx={{ mb: 2 }} />
                            <ErrorHelperText hasError={errors.emPhone} message={helperTexts.cellPhone} />
                            <TextField label="Email" name='emEmail' value={contact.emEmail} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!isEditing} required sx={{ mb: 2 }} />
                            <ErrorHelperText hasError={errors.emEmail} message={helperTexts.email} />
                            <TextField label="Relationship to You" name='relationship' value={contact.relationship} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!isEditing} required sx={{ mb: 2 }} />
                            {formData.emergencyContacts.length !== 1 && isEditing &&
                                <Button onClick={(e) => removeEmergencyContact(e, index)} disabled={!isEditing}>Remove Contact</Button>
                            }
                            <br />
                        </div>
                    ))}
                    {isEditing && <Button onClick={addEmergencyContact} disabled={!isEditing}>Add Contact</Button>}
                </Box>

                {/* Documents Section */}
                <Typography variant="h6">Documents</Typography>
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
                            case 'eadUrl':
                                fileName = 'OPT EAD'
                                break
                            case 'i983Url':
                                fileName = 'I-983 Form'
                                break
                            case 'i20Url':
                                fileName = 'I-20 Form'
                                break
                            default:
                                fileName = 'Unknown Upload';
                        }
                        return (
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
                        )
                    })}
                </Box>

                <Button variant="outlined" onClick={handleEditToggle}>{isEditing ? 'Cancel' : 'Edit'}</Button>
                {isEditing && <Button variant="contained" onClick={handleSubmit}>Save</Button>}
                <Dialog open={openDialogue}>
                    <DialogTitle>Do you want to discard your changes for this section?</DialogTitle>
                    <DialogActions>
                        <Button onClick={handleDiscard} color='error'>Yes</Button>
                        <Button onClick={handleClose} color='primary'>No</Button>
                    </DialogActions>
                </Dialog>
                <ToastContainer />
            </Box>
        </Container>
    ) : (
        'Loading...'
    )}
    </>
    )
}

export default Personal
