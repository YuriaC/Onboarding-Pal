import React, { useState, useEffect } from 'react';
import './Personal.css'; 

const Personal = () => {
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
        emergencyContact: {
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            email: '',
            relationship: ''
        },
        documents: [] // This could be a list of file objects or URLs
    });

    const [formDataClone, setFormDataClone] = useState({});



    useEffect(()=>{
        setFormDataClone(JSON.parse(JSON.stringify(formData)))
    }, [isEditing])

    const handleChange = (e) => {
        const { name, value } = e.target;
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

    const handleEmergencyContactChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            emergencyContact: { ...prevData.emergencyContact, [name]: value }
        }));
    };

    const handleEmployeeChange = (e) =>{
        const {name, value} = e.target;
        setFormData((prevData)=>{
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

    return (
        <div className="personal-information">
            <h2>Personal Information</h2>
            <div className="section">
                <h3>Name</h3>
                {isEditing ? (
                    <div>
                        <img src={formData.profilePicture} alt='profilePicture' width={100} height={100}/>
                        <input type='file' name='profilePicture' onChange={handleChange} accept='image/*'/>
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
                        <img src={formData.profilePicture} alt='profilePicture' width={100} height={100}/>
                        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} disabled={true}/>
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} disabled={true}/>
                        <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} disabled={true}/>
                        <input type="text" name="preferredName" placeholder="Preferred Name" value={formData.preferredName} disabled={true}/>
                        <input type="email" name="email" placeholder="email" value={formData.email} disabled={true} />
                        <input type="text" name="ssn" placeholder="ssn" value={formData.ssn} disabled={true} />
                        <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} disabled={true} />
                        <select name="gender" value={formData.gender} disabled={true}>
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
                    isEditing?
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
                    isEditing?
                    <div>
                        <input type='text' name='firstName' placeholder='First Name' value={formData.emergencyContact.firstName || ''} onChange={handleEmergencyContactChange} />
                        <input type='text' name='lastName' placeholder='Last Name' value={formData.emergencyContact.lastName || ''} onChange={handleEmergencyContactChange} />
                        <input type='text' name='middleName' placeholder='Middle Name' value={formData.emergencyContact.middleName || ''} onChange={handleEmergencyContactChange} />
                        <input type='text' name='phone' placeholder='Phone' value={formData.emergencyContact.phone || ''} onChange={handleEmergencyContactChange} />
                        <input type='email' name='email' placeholder='Email' value={formData.emergencyContact.email || ''} onChange={handleEmergencyContactChange} />
                        <input type='relationship' name='relationship' placeholder='relationship' value={formData.emergencyContact.relationship || ''} onChange={handleEmergencyContactChange}/>
                    </div>
                    :
                    <div>
                        <input type='text' name='firstName' placeholder='First Name' value={formData.emergencyContact.firstName || ''} disabled={true} />
                        <input type='text' name='lastName' placeholder='Last Name' value={formData.emergencyContact.lastName || ''} disabled={true} />
                        <input type='text' name='middleName' placeholder='Middle Name' value={formData.emergencyContact.middleName || ''} disabled={true} />
                        <input type='text' name='phone' placeholder='Phone' value={formData.emergencyContact.phone || ''} disabled={true} />
                        <input type='email' name='email' placeholder='Email' value={formData.emergencyContact.email || ''} disabled={true} />
                        <input type='relationship' name='relationship' placeholder='relationship' value={formData.emergencyContact.relationship || ''} disabled={true}/>
                    </div>
                }
            </div>

            <button onClick={handleEditToggle}>{isEditing ? 'Cancel' : 'Edit'}</button>
            {isEditing && <button onClick={handleSave}>Save</button>}
        </div>
    );
};

export default Personal;
