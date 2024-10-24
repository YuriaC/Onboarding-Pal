import { useState, useEffect } from 'react';
import './Personal.css';
import axios from 'axios';
import { USER_ENDPOINT, username } from '../constants';
import { toast, ToastContainer } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css'
import { Box, Card, CardActions, CardContent, Typography, Button } from '@mui/material'

const Personal = () => {
    //const [isEditing, setIsEditing] = useState(false);
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
        documents: {} // This could be a list of file objects or URLs
    });

    const [formDataClone, setFormDataClone] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [editSections, setEditSections] = useState([]);

    // useEffect(() => {
    //     axios.get(`${USER_ENDPOINT}/userinfo`, { withCredentials: true })
    //         .then(response => {
    //             const { onboardingStatus } = response.data
    //             if (onboardingStatus !== 'Approved') {
    //                 return navigate('/employee/onboarding')
    //             }
    //         }
    //     )
    // }, [])

    useEffect(() => {
        setFormDataClone(JSON.parse(JSON.stringify(formData)))
    }, [editSections.length])


    /*    useEffect(() => {
            axios.get(`${USER_ENDPOINT}/getuserdocs`, {
                // headers: {
                //     'Authorization': `Bearer ${token}`
                // },
                withCredentials: true,
            })
            .then(response => {
                // toast.success('Successfully fetched user files!')
                console.log('response.data:', response.data)
                setFormData({
                    ...formData,
                    documents: response.data
                })
            })
            .catch(error => {
                console.log('error:', error)
                toast.error(`Error fetching user files! Error ${error.message}`)
            })
        }, []);*/

    const getUserInfo = async () => {
        try {
            const userInfoResponse = await axios.get(`${USER_ENDPOINT}/userinfo`, {
                withCredentials: true,
            })

            const urlResponse = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
                // headers: {
                //     'Authorization': `Bearer ${token}`
                // },
                withCredentials: true,
            })


            setFormData((formData) => {
                return {
                    ...formData,
                    ...userInfoResponse.data,
                    documents: urlResponse.data
                }
            })

        } catch (error) {
            console.log('error:', error)
            toast.error(`Error fetching user info! Error: ${error.message}`)
        }
    }



    useEffect(() => {
        getUserInfo();
    }, [submitted])


    const handleChange = (e) => {
        const { type, name, value } = e.target
        setFormData({
            ...formData,
            [name]: type === 'file' ? e.target.files[0] : value,
        })
    }


    const handleEmergencyContactChange = (e, index) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const newEmergencyContact = [...prevData.emergencyContacts];
            newEmergencyContact[index] = { ...newEmergencyContact[index], [name]: value };
            return {
                ...prevData,
                emergencyContacts: newEmergencyContact
            }
        });
    };



    const handleEditToggle = (section) => {
        if (editSections.includes(section)) {
            const confirmDiscard = window.confirm("Discard changes?");
            if (confirmDiscard) {
                setFormData(formDataClone);
                //setIsEditing(false);
                setEditSections((prevSections) => {
                    return prevSections.filter((s) => {
                        return s !== section
                    })
                })
            }
        } else {
            //setIsEditing(true);
            setEditSections((prevSections) => {
                return [
                    ...prevSections,
                    section
                ]
            })
        }
    };

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


    const handleSave = async (section) => {
        const data = createFormData(formData)

        await axios.patch(`${USER_ENDPOINT}/userinfo`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
        })


        setEditSections((prevSections) => {
            return prevSections.filter((s) => {
                return s !== section
            })
        })

        setSubmitted((old) => (!old));
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        const updatedDocuments = [...formData.documents, ...files];
        setFormData((prevData) => ({
            ...prevData,
            documents: updatedDocuments,
        }));
    };

    const previewDocument = (doc) => {
        const fileURL = URL.createObjectURL(doc);
        window.open(fileURL, '_blank');
    };

    const downloadDocument = (key, doc) => {
        // const fileURL = URL.createObjectURL(doc);
        const link = document.createElement('a');
        link.href = doc;
        link.download = key;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };




    return (
        <div className="personal-information">
            <h2>Personal Information</h2>
            <div className="section">
                <h3>Name:</h3>
                {editSections.includes('name') ? (
                    <section>
                        <img src={formData.profilePicture || 'https://th.bing.com/th/id/R.634c153f9405f89ccfb5ab38f689f51c?rik=IzY0V%2fpVJiFoAQ&pid=ImgRaw&r=0'}
                            alt='profilePicture' width={100} height={100} />
                        <input type='file' name='profilePicture' onChange={handleChange} accept='image/*' />
                        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
                        <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} />
                        <input type="text" name="preferredName" placeholder="Preferred Name" value={formData.preferredName} onChange={handleChange} />
                        <input type="email" name="email" placeholder="email" value={formData.email} onChange={handleChange} />
                        <input type="text" name="ssn" placeholder="ssn" value={formData.ssn} onChange={handleChange} />
                        <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} />
                        <select name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <button onClick={() => { handleEditToggle('name') }}>{editSections.includes('name') ? 'Cancel' : 'Edit'}</button>
                        {editSections.includes('name') && <button onClick={() => { handleSave('name') }}>Save</button>}

                    </section>
                ) : (
                    <div>
                        <img src={formData.profilePicture || 'https://th.bing.com/th/id/R.634c153f9405f89ccfb5ab38f689f51c?rik=IzY0V%2fpVJiFoAQ&pid=ImgRaw&r=0'}
                            alt='profilePicture' width={100} height={100} />
                        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} disabled />
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} disabled />
                        <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} disabled />
                        <input type="text" name="preferredName" placeholder="Preferred Name" value={formData.preferredName} disabled />
                        <input type="email" name="email" placeholder="email" value={formData.email} disabled />
                        <input type="text" name="ssn" placeholder="ssn" value={formData.ssn} disabled />
                        <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} disabled />
                        <select name="gender" value={formData.gender} disabled>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <button onClick={() => { handleEditToggle('name') }}>{editSections.includes('name') ? 'Cancel' : 'Edit'}</button>

                    </div>
                )}
            </div>



            <div className="section">
                <h3>Contact Info</h3>
                {editSections.includes('contactInfo') ? (
                    <div>
                        <input type="text" name="cellPhone" placeholder="Cell Phone" value={formData.cellPhone || ''} onChange={handleChange} />
                        <input type="text" name="workPhone" placeholder="Work Phone" value={formData.workPhone || ''} onChange={handleChange} />
                        <button onClick={() => { handleEditToggle('contactInfo') }}>{editSections.includes('contactInfo') ? 'Cancel' : 'Edit'}</button>
                        {editSections.includes('contactInfo') && <button onClick={() => { handleSave('contactInfo') }}>Save</button>}
                    </div>
                ) : (
                    <div>
                        <input type="text" name="cellPhone" placeholder="Cell Phone" value={formData.cellPhone || ''} disabled={true} />
                        <input type="text" name="workPhone" placeholder="Work Phone" value={formData.workPhone || ''} disabled={true} />
                        <button onClick={() => { handleEditToggle('contactInfo') }}>{editSections.includes('contactInfo') ? 'Cancel' : 'Edit'}</button>
                    </div>
                )}
            </div>

            <div className="section">
                <h3>Address</h3>
                {editSections.includes('address') ? (
                    <div>
                        <input type="text" name="building" placeholder="Building/Apt #" value={formData.building} onChange={handleChange} />
                        <input type="text" name="street" placeholder="Street Name" value={formData.street} onChange={handleChange} />
                        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                        <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                        <input type="text" name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} />
                        <button onClick={() => { handleEditToggle('address') }}>{editSections.includes('address') ? 'Cancel' : 'Edit'}</button>
                        {editSections.includes('address') && <button onClick={() => { handleSave('address') }}>Save</button>}
                    </div>
                ) : (
                    <div>
                        <input type="text" name="building" placeholder="Building/Apt #" value={formData.building || ''} disabled={true} />
                        <input type="text" name="street" placeholder="Street Name" value={formData.street || ''} disabled={true} />
                        <input type="text" name="city" placeholder="City" value={formData.city || ''} disabled={true} />
                        <input type="text" name="state" placeholder="State" value={formData.state || ''} disabled={true} />
                        <input type="text" name="zip" placeholder="Zip Code" value={formData.zip || ''} disabled={true} />
                        <button onClick={() => { handleEditToggle('address') }}>{editSections.includes('address') ? 'Cancel' : 'Edit'}</button>
                    </div>
                )}
            </div>

            <div className='section'>
                <h3>Employment Status</h3>
                {
                    editSections.includes('status') ?
                        <div>
                            <input type='text' name='visaTitle' placeholder='Visa Title' value={formData.visaTitle || ''} onChange={handleChange} />
                            <input type='text' name='startDate' placeholder='Start Date' value={formData.visaStartDate || ''} onChange={handleChange} />
                            <input type='text' name='endDate' placeholder='End Date' value={formData.visaEndDate || ''} onChange={handleChange} />
                            <button onClick={() => { handleEditToggle('status') }}>{editSections.includes('status') ? 'Cancel' : 'Edit'}</button>
                            {editSections.includes('status') && <button onClick={() => { handleSave('status') }}>Save</button>}
                        </div>
                        :
                        <div>
                            <input type='text' name='visaTitle' placeholder='Visa Title' value={formData.visaTitle || ''} disabled={true} />
                            <input type='text' name='startDate' placeholder='Start Date' value={formData.visaStartDate || ''} disabled={true} />
                            <input type='text' name='endDate' placeholder='End Date' value={formData.visaEndDate || ''} disabled={true} />
                            <button onClick={() => { handleEditToggle('status') }}>{editSections.includes('status') ? 'Cancel' : 'Edit'}</button>
                        </div>
                }
            </div>

            <div className='section'>
                <h3>Emergency Contact</h3>
                {
                    editSections.includes('emergency') ?
                        <div>
                            {formData.emergencyContacts.map((contact, index) => {
                                return (
                                    <div key={contact.phone}>
                                        <input type='text' name='firstName' placeholder='First Name' value={contact.firstName || ''} onChange={(e) => { handleEmergencyContactChange(e, index) }} />
                                        <input type='text' name='lastName' placeholder='Last Name' value={contact.lastName || ''} onChange={(e) => { handleEmergencyContactChange(e, index) }} />
                                        <input type='text' name='middleName' placeholder='Middle Name' value={contact.middleName || ''} onChange={(e) => { handleEmergencyContactChange(e, index) }} />
                                        <input type='text' name='phone' placeholder='Phone' value={contact.phone || ''} onChange={(e) => { handleEmergencyContactChange(e, index) }} />
                                        <input type='email' name='email' placeholder='Email' value={contact.emEmail || ''} onChange={(e) => { handleEmergencyContactChange(e, index) }} />
                                        <input type='relationship' name='relationship' placeholder='relationship' value={contact.relationship || ''} onChange={(e) => { handleEmergencyContactChange(e, index) }} />
                                    </div>
                                )
                            })}
                            <button onClick={() => { handleEditToggle('emergency') }}>{editSections.includes('emergency') ? 'Cancel' : 'Edit'}</button>
                            {editSections.includes('emergency') && <button onClick={() => { handleSave('emergency') }}>Save</button>}
                        </div>
                        :
                        <div>
                            {formData.emergencyContacts.map((contact) => {
                                return (
                                    <div key={contact.phone}>
                                        <input type='text' name='firstName' placeholder='First Name' value={contact.firstName || ''} disabled={true} />
                                        <input type='text' name='lastName' placeholder='Last Name' value={contact.lastName || ''} disabled={true} />
                                        <input type='text' name='middleName' placeholder='Middle Name' value={contact.middleName || ''} disabled={true} />
                                        <input type='text' name='phone' placeholder='Phone' value={contact.phone || ''} disabled={true} />
                                        <input type='email' name='email' placeholder='Email' value={contact.email || ''} disabled={true} />
                                        <input type='relationship' name='relationship' placeholder='relationship' value={contact.relationship || ''} disabled={true} />
                                        <button onClick={() => { handleEditToggle('emergency') }}>{editSections.includes('emergency') ? 'Cancel' : 'Edit'}</button>
                                    </div>
                                )
                            })}
                        </div>
                }
            </div>

            <div className="section">
                <h3>Documents</h3>
                {editSections.includes('documents') ? (
                    <div>
                        <input type="file" multiple onChange={handleDocumentUpload} accept=".pdf,.jpg,.jpeg,.png" />
                        {formData.documents.length > 0 && (
                            <ul>
                                {Object.keys(formData.documents).map((key) => {

                                    // Might need to look over this
                                    const doc = formData.documents[key]
                                    console.log('doc:', doc)

                                    return (
                                        <li key={doc.name}>
                                            {doc.name}
                                            <button onClick={() => previewDocument(doc)}>Preview</button>
                                            <button onClick={() => downloadDocument(doc)}>Download</button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                        <button onClick={() => { handleEditToggle('documents') }}>{editSections.includes('documents') ? 'Cancel' : 'Edit'}</button>
                        {editSections.includes('documents') && <button onClick={() => { handleSave('documents') }}>Save</button>}
                    </div>
                ) : (
                    <div>
                        {Object.keys(formData.documents).length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: '2rem' }}>
                                {Object.keys(formData.documents).map((key) => {
                                    const docs = formData.documents
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
                        ) : (
                            <p>No documents uploaded</p>
                        )}
                        <button onClick={() => { handleEditToggle('documents') }}>{editSections.includes('documents') ? 'Cancel' : 'Edit'}</button>

                    </div>

                )}

            </div>


            <ToastContainer />
        </div>
    );
};

export default Personal;
