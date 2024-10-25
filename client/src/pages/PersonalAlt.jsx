import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { isAlphabetic } from '../helpers/HelperFunctions';
import {
    Avatar,
    Box,
    TextField,
    RadioGroup,
    FormControl,
    FormLabel,
    FormControlLabel,
    Radio,
    Typography,
    Paper,
    Card,
    CardActions,
    CardContent,
    Button,
    Dialog, DialogActions, DialogTitle,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material'
import { USER_ENDPOINT } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

const PersonalAlt = () => {

    const profilePictureRef = useRef(null)
    const optReceiptRef = useRef(null)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        username: '',
        preferredName: '',
        profilePicture: '',
        optReceipt: null,
        building: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        ssn: '',
        dob: '',
        gender: '',
        cellPhone: '',
        workPhone: '',
        isPermRes: '',
        permResStatus: '',
        nonPermWorkAuth: '',
        visaStartDate: '',
        visaEndDate: '',
        visaTitle: '',
        email: '',
        emergencyContacts: [],
    })
    const [newFormData, setNewFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        username: '',
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
        cellPhone: '',
        workPhone: '',
        isPermRes: '',
        permResStatus: '',
        nonPermWorkAuth: '',
        visaStartDate: '',
        visaEndDate: '',
        visaTitle: '',
        email: '',
        emergencyContacts: [],
    })

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

    // const helperTexts = {
    //     name: "Name must contain only English characters.", 
    //     dlNum: "Driver's license number must be alphanumeric!",
    //     building: "Building Adress can only contain alphanumeric characters!",
    //     ssn: "SSN must be 9-digit long",
    //     address: "Street/ City/ State entry must be english characters!",
    //     zip: 'ZIP code must have 5 digits!',
    //     dob: 'Birthday must be in the past!',
    //     visaEndDate: 'Visa end date must be in the future!',
    //     cellPhone: 'Phone number must be in a proper format!',
    //     workPhone: 'Phone number must be in a proper format!',
    //     email: 'Email must be in a proper format!',
    // }

    const [editSections, setEditSections] = useState({
        nameSection: false,
        addressSection: false,
        contactSection: false,
        employmentSection: false,
        emergencySection: false,
    })

    const [openDialogue, setOpenDialogue] = useState(false)

    const [changed, setChanged] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [discardSection, setDiscardSection] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            await axios.get(`${USER_ENDPOINT}/userinfo`, {
                withCredentials: true,
            })
                .then(response => {
                    const { data } = response
                    axios.get(`${USER_ENDPOINT}/getuserdocs`, {
                        withCredentials: true,
                    }).then(docsResponse => {
                        console.log('docsResponse:', docsResponse)
                        const profilePicture = docsResponse.data.profilePictureURL?.preview ? docsResponse.data.profilePictureURL?.preview : ''
                        const newData = {
                            ...data,
                            profilePicture,
                            docs: docsResponse.data,
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
    }, [submitted])

    const setDataToForm = (data) => {
        const {
            firstName,
            lastName,
            middleName,
            username,
            preferredName,
            address,
            cellPhone,
            workPhone,
            profilePicture,
            ssn,
            birthday,
            email,
            gender,
            permResStatus,
            emergencyContacts,
            workAuth,
            visaStartDate,
            visaEndDate,
            visaTitle,
            docs,
            isPermRes,
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
        const newData = {
            ...formData,
            firstName,
            lastName,
            middleName,
            username,
            preferredName,
            profilePicture,
            cellPhone,
            workPhone,
            ssn,
            email,
            dob: birthday ? birthday.split('T')[0] : null,
            gender,
            permResStatus,
            isPermRes,
            hasDriversLicense: data['driversLicenseNumber'] ? 'Yes' : 'No',
            emergencyContacts: newEmContacts,
            building,
            street,
            city: address ? address.split(', ')[1] : '',
            state,
            zip,
            nonPermWorkAuth: workAuth,
            visaStartDate: visaStartDate ? visaStartDate.split('T')[0] : '',
            visaEndDate: visaEndDate ? visaEndDate.split('T')[0] : '',
            visaTitle,
            docs,
        }
        setFormData(newData)
        setNewFormData(newData)
    }

    const toggleEditSection = (section) => {
        const newEditSections = editSections
        newEditSections[section] = !newEditSections[section]
        setEditSections(newEditSections)
        setChanged(!changed)
    }

    const cancelEdit = (section) => {
        setOpenDialogue(true)
        setDiscardSection(section)
    }

    const handleClose = () => {
        setOpenDialogue(false)
    }

    const handleDiscard = () => {
        setOpenDialogue(false)
        setEditSections({
            ...editSections,
            [discardSection]: false,
        })
        if (discardSection === 'nameSection') {
            const { firstName, lastName, middleName, preferredName, ssn, dob, gender } = formData
            // profilePictureRef.current.value = ''
            setNewFormData({
                ...newFormData,
                firstName,
                lastName,
                middleName,
                preferredName,
                ssn,
                dob,
                gender,
            })
        }
        else if (discardSection === 'addressSection') {
            const { building, street, city, state, zip } = formData
            setNewFormData({
                ...newFormData,
                building,
                street,
                city,
                state,
                zip,
            })
        }
        else if (discardSection === 'contactSection') {
            const { cellPhone, workPhone } = formData
            setNewFormData({
                ...newFormData,
                cellPhone,
                workPhone,
            })
        }
        else if (discardSection === 'employmentSection') {
            const { permResStatus, isPermRes, visaEndDate, visaStartDate, visaTitle, nonPermWorkAuth } = formData
            console.log('formData:', formData)
            console.log('newFormData:', newFormData)
            // optReceiptRef.current.value = ''
            setNewFormData({
                ...newFormData,
                visaTitle,
                permResStatus,
                nonPermWorkAuth,
                visaEndDate,
                visaStartDate,
                isPermRes,
            })
        }
        else if (discardSection === 'emergencySection') {
            const { emergencyContacts } = formData
            setNewFormData({
                ...newFormData,
                emergencyContacts,
            })
        }
    }

    const saveEdit = async (section) => {
        const newErrorObject = {}
        for (const key in errors) {
            newErrorObject[key] = false
        }
        if (!isAlphabetic(formData.firstName)) {
            newErrorObject['firstName'] = true
        }
        // if (formData.middleName && !isAlphabetic(formData.middleName)) {
        //     newErrorObject['middleName'] = true
        // }
        // if (!isAlphabetic(formData.lastName)) {
        //     newErrorObject['lastName'] = true
        // }
        // if (!isEmail(formData.email)) {
        //     newErrorObject['email'] = true
        // }
        // if (!isAlphaNumeric(formData.building)) {
        //     newErrorObject['building'] = true
        // }
        // if (!isAddress(formData.street)) {
        //     newErrorObject['street'] = true
        // }
        // if (!isAlphabetic(formData.city)) {
        //     newErrorObject['city'] = true
        // }
        // if (!isAlphabetic(formData.state)) {
        //     newErrorObject['state'] = true
        // }
        // if (!checkZIP(formData.zip)) {
        //     newErrorObject['zip'] = true
        // }
        // if (new Date(formData.dob) > new Date()) {
        //     newErrorObject['dob'] = true
        // }
        // if (new Date(formData.visaEndDate) < new Date()) {
        //     newErrorObject['visaEndDate'] = true
        // }
        // if (!phoneRegex.test(formData.cellPhone)) {
        //     newErrorObject['cellPhone'] = true
        // }
        // if (formData.workPhone && !phoneRegex.test(formData.workPhone)) {
        //     newErrorObject['workPhone'] = true
        // }
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

        const data = createFormData(newFormData)
        console.log('newFormData:', newFormData)
        // data.append('file', newFormData.profilePicture)
        // data.append('file', newFormData.optReceipt)

        try {
            await axios.post(`${USER_ENDPOINT}/updateProfile`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            })
            setSubmitted(!submitted)
            toast.success('Successfully updated user profile.')
        }
        catch (error) {
            toast.error(`Error submitting application! Error: ${error.response.data}`)
        }
        const newForm = JSON.parse(JSON.stringify(formData))
        setEditSections({
            ...editSections,
            [section]: false,
        })
        console.log('newForm:', newForm)
    }

    const handleChange = (e) => {
        const { type, name, value } = e.target
        setNewFormData({
            ...newFormData,
            [name]: type === 'file' ? e.target.files[0] : value,
        })
    }

    const handleEmContactChange = (e, index) => {
        const { name, value } = e.target
        const newContacts = [...newFormData.emergencyContacts]
        newContacts[index][name] = value
        setNewFormData({...newFormData, emergencyContacts: newContacts})
    }

    const addEmergencyContact = (e) => {
        e.preventDefault()
        const newContacts = [...newFormData.emergencyContacts]
        newContacts.push({
                firstName: '',
                lastName: '',
                middleName: '',
                phone: '',
                emEmail: '',
                relationship: '',
        })
        setNewFormData({
            ...newFormData,
            emergencyContacts: newContacts,
        })
    }

    const removeEmergencyContact = (e, index) => {
        e.preventDefault()
        if (newFormData.emergencyContacts.length === 1) {
            return
        }
        const newContacts = newFormData.emergencyContacts.filter((_, i) => i !== index)
        setNewFormData({
            ...newFormData,
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

    return (
        <>
            {!isLoading ? (
                <Paper sx={{ p: 3, width: '60vw' }}>
                    <Typography variant='h4' sx={{ mb: 1 }}>
                        {formData.firstName} {formData.lastName} ({formData.username})
                    </Typography>
                    {formData.profilePicture ? <img src={formData.profilePicture} alt={'Profile Picture'} style={{ maxWidth: '10rem', maxHeight: '10rem' }} /> : (
                       <Avatar sx={{  width: 60, margin: 'auto', height: 60 }}>
                            { formData.firstName ?formData.firstName[0]:              

                            <FontAwesomeIcon icon={faUser} />
                        }

                        </Avatar>
                    )}

                    <form>
                        <TextField
                            fullWidth
                            name='firstName'
                            label="First Name"
                            value={newFormData.firstName}
                            disabled={!editSections.nameSection}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name='lastName'
                            label="Last Name"
                            value={newFormData.lastName}
                            disabled={!editSections.nameSection}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name='middleName'
                            label="Middle Name"
                            value={newFormData.middleName}
                            disabled={!editSections.nameSection}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name='preferredName'
                            label="Preferred Name"
                            value={newFormData.preferredName}
                            disabled={!editSections.nameSection}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <Typography gutterBottom>Profile Picture</Typography>
                        <TextField type='file' ref={profilePictureRef} name='profilePicture' onChange={handleChange} disabled={!editSections.nameSection} accept='image/*' variant='outlined' fullWidth sx={{ mb: 2 }} />
                        <TextField
                            fullWidth
                            label="Email"
                            value={newFormData.email}
                            disabled
                            type="email"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="SSN"
                            name='ssn'
                            value={newFormData.ssn}
                            disabled={!editSections.nameSection}
                            onChange={handleChange}
                            type="password"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name='dob'
                            label="Date of Birth"
                            value={newFormData.dob}
                            disabled={!editSections.nameSection}
                            onChange={handleChange}
                            type='date'
                            margin="normal"
                        />
                        <InputLabel>Gender</InputLabel>
                        <Select name='gender' label='Gender' value={newFormData.gender} onChange={handleChange} disabled={!editSections.nameSection} fullWidth sx={{ mb: 2 }}>
                            <MenuItem value='Male'>Male</MenuItem>
                            <MenuItem value='Female'>Female</MenuItem>
                            <MenuItem value='I do not wish to answer'>I do not wish to answer</MenuItem>
                        </Select>
                        {!editSections.nameSection ? <Button onClick={() => toggleEditSection('nameSection')}>Edit</Button> : (
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Button onClick={() => cancelEdit('nameSection')}>Cancel</Button>
                                <Button onClick={() => saveEdit('nameSection')}>Save</Button>
                            </Box>
                        )}

                        <Typography variant="h6" margin="normal">Address</Typography>
                        <TextField
                            fullWidth
                            name='building'
                            onChange={handleChange}
                            label="Building/Apartment #"
                            value={newFormData.building}
                            disabled={!editSections.addressSection}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Street Name"
                            name='street'
                            onChange={handleChange}
                            value={newFormData.street}
                            disabled={!editSections.addressSection}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="City"
                            name='city'
                            onChange={handleChange}
                            value={newFormData.city}
                            disabled={!editSections.addressSection}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="State"
                            name='state'
                            onChange={handleChange}
                            value={newFormData.state}
                            disabled={!editSections.addressSection}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="ZIP"
                            name='zip'
                            onChange={handleChange}
                            value={newFormData.zip}
                            disabled={!editSections.addressSection}
                            type="number"
                            margin="normal"
                        />
                        {!editSections.addressSection ? <Button onClick={() => toggleEditSection('addressSection')}>Edit</Button> : (
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Button onClick={() => cancelEdit('addressSection')}>Cancel</Button>
                                <Button onClick={() => saveEdit('addressSection')}>Save</Button>
                            </Box>
                        )}

                        <Typography variant="h6" margin="normal">Phone Numbers</Typography>
                        <TextField
                            fullWidth
                            label="Cell Phone Number"
                            name='cellPhone'
                            value={newFormData.cellPhone}
                            disabled={!editSections.contactSection}
                            onChange={handleChange}
                            type="tel"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name='workPhone'
                            label="Work Phone Number"
                            value={newFormData.workPhone}
                            disabled={!editSections.contactSection}
                            onChange={handleChange}
                            type="tel"
                            margin="normal"
                        />
                        {!editSections.contactSection ? <Button onClick={() => toggleEditSection('contactSection')}>Edit</Button> : (
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Button onClick={() => cancelEdit('contactSection')}>Cancel</Button>
                                <Button onClick={() => saveEdit('contactSection')}>Save</Button>
                            </Box>
                        )}

                        <Typography variant="h6" margin="normal">Employment</Typography>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Are you a permanent resident?</FormLabel>
                            <RadioGroup row value={newFormData.isPermRes} name='isPermRes' onChange={handleChange}>
                                <FormControlLabel
                                    value="Yes"
                                    control={<Radio />}
                                    label="Yes"
                                    disabled={!editSections.employmentSection}
                                />
                                <FormControlLabel
                                    value="No"
                                    control={<Radio />}
                                    label="No"
                                    disabled={!editSections.employmentSection}
                                />
                            </RadioGroup>
                        </FormControl>
                        {newFormData.isPermRes === 'No' ? (
                            <>
                                <InputLabel>What is your work authorization?</InputLabel>
                                <Select name='nonPermWorkAuth' value={newFormData.nonPermWorkAuth} onChange={handleChange} disabled={!editSections.employmentSection} fullWidth sx={{ mb: 2 }}>
                                    <MenuItem value='H1-B'>H1-B</MenuItem>
                                    <MenuItem value='L2'>L2</MenuItem>
                                    <MenuItem value='F1(CPT/OPT)'>F1(CPT/OPT)</MenuItem>
                                    <MenuItem value='H4'>H4</MenuItem>
                                    <MenuItem value='Other'>Other</MenuItem>
                                </Select>
                                {newFormData.nonPermWorkAuth === 'F1(CPT/OPT)' &&
                                <>
                                    <Typography gutterBottom>Upload Your OPT Receipt *</Typography>
                                    <TextField type='file' ref={optReceiptRef} name='optReceipt' onChange={handleChange} disabled={!editSections.employmentSection} required variant='outlined' fullWidth sx={{ mb: 2 }} />
                                </>
                                }
                                {newFormData.nonPermWorkAuth === 'Other' &&
                                    <>
                                        <TextField label='Visa Title' name='visaTitle' value={newFormData.visaTitle} onChange={handleChange} disabled={!editSections.employmentSection} fullWidth sx={{ mb: 2 }} />
                                    </>
                                }
                                <TextField
                                    fullWidth
                                    name='visaStartDate'
                                    label="Visa Start Date"
                                    value={newFormData.visaStartDate}
                                    disabled={!editSections.employmentSection}
                                    onChange={handleChange}
                                    type={newFormData.visaStartDate? 'date' : 'text'}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    name='visaEndDate'
                                    label="Visa End Date"
                                    value={newFormData.visaEndDate}
                                    disabled={!editSections.employmentSection}
                                    onChange={handleChange}
                                    type={newFormData.visaEndDate? 'date' : 'text'}
                                    margin="normal"
                                />
                            </>
                        ) : (
                            <FormControl fullWidth margin="normal">
                                <FormLabel>What kind of permanent resident?</FormLabel>
                                <RadioGroup row value={newFormData.permResStatus} name='permResStatus' onChange={handleChange}>
                                    <FormControlLabel
                                        value="Citizen"
                                        control={<Radio />}
                                        label="Citizen"
                                        disabled={!editSections.employmentSection}
                                    />
                                    <FormControlLabel
                                        value="Green Card"
                                        control={<Radio />}
                                        label="Green Card"
                                        disabled={!editSections.employmentSection}
                                    />
                                </RadioGroup>
                            </FormControl>
                        )}
                        {!editSections.employmentSection ? <Button onClick={() => toggleEditSection('employmentSection')}>Edit</Button> : (
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Button onClick={() => cancelEdit('employmentSection')}>Cancel</Button>
                                <Button onClick={() => saveEdit('employmentSection')}>Save</Button>
                            </Box>
                        )}

                        <Typography variant="h6" margin="normal">Emergency Contact{newFormData.emergencyContacts.length > 1 ? 's' : ''}</Typography>
                        {newFormData.emergencyContacts.map((contact, index) => (
                        <div key={index} style={{ marginTop: '1rem' }}>
                            <TextField label="First Name" name='firstName' value={contact.firstName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!editSections.emergencySection} required sx={{ mb: 2 }} />
                            <TextField label="Last Name" name='lastName' value={contact.lastName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!editSections.emergencySection} required sx={{ mb: 2 }} />
                            <TextField label="Middle Name" name='middleName' value={contact.middleName} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!editSections.emergencySection} sx={{ mb: 2 }} />
                            <TextField label="Phone" name='phone' value={contact.phone} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!editSections.emergencySection} required sx={{ mb: 2 }} />
                            <TextField label="Email" name='emEmail' value={contact.emEmail} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!editSections.emergencySection} required sx={{ mb: 2 }} />
                            <TextField label="Relationship to You" name='relationship' value={contact.relationship} variant='outlined' onChange={(e) => handleEmContactChange(e, index)} fullWidth disabled={!editSections.emergencySection} required sx={{ mb: 2 }} />
                            {newFormData.emergencyContacts.length !== 1 && editSections.emergencySection &&
                                <Button onClick={(e) => removeEmergencyContact(e, index)} disabled={!editSections.emergencySection}>Remove Contact</Button>
                            }
                            <br />
                        </div>
                    ))}
                    {editSections.emergencySection && <Button onClick={addEmergencyContact} disabled={!editSections.emergencySection}>Add Contact</Button>}
                        {!editSections.emergencySection ? <Button onClick={() => toggleEditSection('emergencySection')}>Edit</Button> : (
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Button onClick={() => cancelEdit('emergencySection')}>Cancel</Button>
                                <Button onClick={() => saveEdit('emergencySection')}>Save</Button>
                            </Box>
                        )}

                        <Typography variant="h6">Documents</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: '2rem' }}>
                                {newFormData.docs && Object.keys(newFormData.docs).map((key) => {
                                    const doc = newFormData.docs[key]
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

                        <ToastContainer />
                    </form>
                    <Dialog open={openDialogue}>
                        <DialogTitle>Do you want to discard your changes for this section?</DialogTitle>
                        <DialogActions>
                            <Button onClick={handleDiscard} color='error'>Yes</Button>
                            <Button onClick={handleClose} color='primary'>No</Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            ) : (
                'Loading...'
            )}
        </>
    )
}

export default PersonalAlt
