import { useState, useEffect } from 'react';
import axios from 'axios';
import { USER_ENDPOINT } from '../constants';
import { toast, ToastContainer } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css'
import { Box, Card, CardActions, CardContent, Typography, Button } from '@mui/material'
import { useParams } from 'react-router-dom';

const EmployeeDetail = () => {

    // const navigate = useNavigate()
    const { employeeId } = useParams()

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        preferredName: '',
        profilePicture: '',
        email: '',
        ssn: '',
        dob: '',
        gender: '',
        address: {
            building: '',
            street: '',
            city: '',
            state: '',
            zip: ''
        },
        contactInfo: {
            cellPhone: '',
            workPhone: ''
        },
        employment: {
            visaTitle: '',
            startDate: '',
            endDate: ''
        },
        emergencyContact: [{
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            email: '',
            relationship: ''
        }],
        documents: {} // This could be a list of file objects or URLs
    });

    const [formDataClone, setFormDataClone] = useState({});

    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/userinfo/${employeeId}`, { withCredentials: true })
            .then(response => {
                // const { onboardingStatus } = response.data
                // if (onboardingStatus !== 'Approved') {
                //     return navigate('/employee/onboarding')
                // }
                setFormData(response.data)
            })
            .catch(error => {
                toast.error(`Error fetching user info! Error: ${error.message}`)
            })
    }, [])

    useEffect(() => {
        setFormDataClone(JSON.parse(JSON.stringify(formData)))
    }, [isEditing])


    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/getuserdocs`, {
            withCredentials: true,
        })
        .then(response => {
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
    }, [])


    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(value)
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            address: { ...prevData.address, [name]: value }
        }));
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            contactInfo: { ...prevData.contactInfo, [name]: value }
        }));
    };

    const handleEmergencyContactChange = (e, index) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const newEmergencyContact = [...prevData.emergencyContact];
            newEmergencyContact[index] = { ...newEmergencyContact[index], [name]: value};
            return{
                ...prevData,
                emergencyContact: newEmergencyContact
            }
        });
    };

    const handleEmployeeChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            return {
                ...prevData,
                employment: {
                    ...prevData.employment,
                    [name]: value
                }
            }
        })
    }

    const handleEditToggle = () => {
        if (isEditing) {
            const confirmDiscard = window.confirm("Discard changes?");
            if (confirmDiscard) {
                setFormData(formDataClone);
                setIsEditing(false);
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
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
            <h2>Employee Information</h2>
            <div className="section">
                <h3>Name</h3>
                {isEditing ? (
                    <div>
                        <img src={formData.profilePicture} alt='profilePicture' width={100} height={100} />
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
                    </div>
                ) : (
                    <div>
                        <img src={formData.profilePicture} alt='profilePicture' width={100} height={100} />
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
                    </div>
                )}
            </div>



            <div className="section">
                <h3>Contact Info</h3>
                {isEditing ? (
                    <div>
                        <input type="text" name="cellPhone" placeholder="Cell Phone" value={formData.contactInfo.cellPhone || ''} onChange={handleContactChange} />
                        <input type="text" name="workPhone" placeholder="Work Phone" value={formData.contactInfo.workPhone || ''} onChange={handleContactChange} />
                    </div>
                ) : (
                    <div>
                        <input type="text" name="cellPhone" placeholder="Cell Phone" value={formData.contactInfo.cellPhone || ''} disabled={true} />
                        <input type="text" name="workPhone" placeholder="Work Phone" value={formData.contactInfo.workPhone || ''} disabled={true} />
                    </div>
                )}
            </div>

            <div className="section">
                <h3>Address</h3>
                {isEditing ? (
                    <div>
                        <input type="text" name="building" placeholder="Building/Apt #" value={formData.address.building || ''} onChange={handleAddressChange} />
                        <input type="text" name="street" placeholder="Street Name" value={formData.address.street || ''} onChange={handleAddressChange} />
                        <input type="text" name="city" placeholder="City" value={formData.address.city || ''} onChange={handleAddressChange} />
                        <input type="text" name="state" placeholder="State" value={formData.address.state || ''} onChange={handleAddressChange} />
                        <input type="text" name="zip" placeholder="Zip Code" value={formData.address.zip || ''} onChange={handleAddressChange} />
                    </div>
                ) : (
                    <div>
                        <input type="text" name="building" placeholder="Building/Apt #" value={formData.address.building || ''} disabled={true} />
                        <input type="text" name="street" placeholder="Street Name" value={formData.address.street || ''} disabled={true} />
                        <input type="text" name="city" placeholder="City" value={formData.address.city || ''} disabled={true} />
                        <input type="text" name="state" placeholder="State" value={formData.address.state || ''} disabled={true} />
                        <input type="text" name="zip" placeholder="Zip Code" value={formData.address.zip || ''} disabled={true} />
                    </div>
                )}
            </div>

            <div className='section'>
                <h3>Employment Status</h3>
                {
                    isEditing ?
                        <div>
                            <input type='text' name='visaTitle' placeholder='Visa Title' value={formData.employment.visaTitle || ''} onChange={handleEmployeeChange} />
                            <input type='text' name='startDate' placeholder='Start Date' value={formData.employment.startDate || ''} onChange={handleEmployeeChange} />
                            <input type='text' name='endDate' placeholder='End Date' value={formData.employment.endDate || ''} onChange={handleEmployeeChange} />
                        </div>
                        :
                        <div>
                            <input type='text' name='visaTitle' placeholder='Visa Title' value={formData.employment.visaTitle || ''} disabled={true} />
                            <input type='text' name='startDate' placeholder='Start Date' value={formData.employment.startDate || ''} disabled={true} />
                            <input type='text' name='endDate' placeholder='End Date' value={formData.employment.endDate || ''} disabled={true} />
                        </div>
                }
            </div>

            <div className='section'>
                <h3>Emergency Contact</h3>
                {
                    isEditing ?
                        <div>
                            {formData.emergencyContact.map((contact, index) => {
                                return (
                                    <div key={contact.phone}>
                                        <input type='text' name='firstName' placeholder='First Name' value={contact.firstName || ''} onChange={(e)=>{handleEmergencyContactChange(e, index)}} />
                                        <input type='text' name='lastName' placeholder='Last Name' value={contact.lastName || ''} onChange={(e)=>{handleEmergencyContactChange(e, index)}} />
                                        <input type='text' name='middleName' placeholder='Middle Name' value={contact.middleName || ''} onChange={(e)=>{handleEmergencyContactChange(e, index)}} />
                                        <input type='text' name='phone' placeholder='Phone' value={contact.phone || ''} onChange={(e)=>{handleEmergencyContactChange(e, index)}} />
                                        <input type='email' name='email' placeholder='Email' value={contact.email || ''} onChange={(e)=>{handleEmergencyContactChange(e, index)}} />
                                        <input type='relationship' name='relationship' placeholder='relationship' value={contact.relationship || ''} onChange={(e)=>{handleEmergencyContactChange(e, index)}} />
                                    </div>
                                )
                            })}
                        </div>
                        :
                        <div>
                            {formData.emergencyContact.map((contact) => {
                                return (
                                    <div key={contact.phone}>
                                        <input type='text' name='firstName' placeholder='First Name' value={contact.firstName || ''} disabled={true} />
                                        <input type='text' name='lastName' placeholder='Last Name' value={contact.lastName || ''} disabled={true} />
                                        <input type='text' name='middleName' placeholder='Middle Name' value={contact.middleName || ''} disabled={true} />
                                        <input type='text' name='phone' placeholder='Phone' value={contact.phone || ''} disabled={true} />
                                        <input type='email' name='email' placeholder='Email' value={contact.email || ''} disabled={true} />
                                        <input type='relationship' name='relationship' placeholder='relationship' value={contact.relationship || ''} disabled={true} />
                                    </div>
                                )
                            })}
                        </div>
                }
            </div>

            <div className="section">
                <h3>Documents</h3>
                {isEditing ? (
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
                                )})}
                            </ul>
                        )}
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
                    </div>
                )}
            </div>

            <button onClick={handleEditToggle}>{isEditing ? 'Cancel' : 'Edit'}</button>
            {isEditing && <button onClick={handleSave}>Save</button>}
            <ToastContainer />
        </div>
    );
};

export default EmployeeDetail;
