import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom'
import axios from 'axios';
import './Personal.css';

const EmployeeDetail = () => {
    const {employeeId} = useParams();

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
        documents: [] // This could be a list of file objects or URLs
    });


    const getEmployeeDetail = async()=>{
        const newEmployee = await axios.get(`http://localhost:3000/api/users`, {
            headers:{
                'Content-Type': 'application/json'
            },
            params: {
                employeeId: employeeId
            }
        })

        setFormData(newEmployee);
    }

    useEffect(() => {
        getEmployeeDetail()
    }, [employeeId])



    return (
        <div className="personal-information">
            <h2>Personal Information</h2>
            <div className="section">
                <h3>Name</h3>
                    <div>
                        <img src={formData.profilePicture} alt='profilePicture' width={100} height={100} />
                        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} disabled={true} />
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} disabled={true} />
                        <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} disabled={true} />
                        <input type="text" name="preferredName" placeholder="Preferred Name" value={formData.preferredName} disabled={true} />
                        <input type="email" name="email" placeholder="email" value={formData.email} disabled={true} />
                        <input type="text" name="ssn" placeholder="ssn" value={formData.ssn} disabled={true} />
                        <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} disabled={true} />
                        <select name="gender" value={formData.gender} disabled={true}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                
            </div>



            <div className="section">
                <h3>Contact Info</h3>
                    <div>
                        <input type="text" name="cellPhone" placeholder="Cell Phone" value={formData.contactInfo.cellPhone || ''} disabled={true} />
                        <input type="text" name="workPhone" placeholder="Work Phone" value={formData.contactInfo.workPhone || ''} disabled={true} />
                    </div>
            </div>

            <div className="section">
                <h3>Address</h3>
                    <div>
                        <input type="text" name="building" placeholder="Building/Apt #" value={formData.address.building || ''} disabled={true} />
                        <input type="text" name="street" placeholder="Street Name" value={formData.address.street || ''} disabled={true} />
                        <input type="text" name="city" placeholder="City" value={formData.address.city || ''} disabled={true} />
                        <input type="text" name="state" placeholder="State" value={formData.address.state || ''} disabled={true} />
                        <input type="text" name="zip" placeholder="Zip Code" value={formData.address.zip || ''} disabled={true} />
                    </div>
            </div>

            <div className='section'>
                <h3>Employment Status</h3>

                        <div>
                            <input type='text' name='visaTitle' placeholder='Visa Title' value={formData.employment.visaTitle || ''} disabled={true} />
                            <input type='text' name='startDate' placeholder='Start Date' value={formData.employment.startDate || ''} disabled={true} />
                            <input type='text' name='endDate' placeholder='End Date' value={formData.employment.endDate || ''} disabled={true} />
                        </div>
                
            </div>

            <div className='section'>
                <h3>Emergency Contact</h3>

                        <div>
                            {formData.emergencyContact.map((contact, index) => {
                                return (
                                    <>
                                        <input type='text' name='firstName' placeholder='First Name' value={contact.firstName || ''} disabled={true} />
                                        <input type='text' name='lastName' placeholder='Last Name' value={contact.lastName || ''} disabled={true} />
                                        <input type='text' name='middleName' placeholder='Middle Name' value={contact.middleName || ''} disabled={true} />
                                        <input type='text' name='phone' placeholder='Phone' value={contact.phone || ''} disabled={true} />
                                        <input type='email' name='email' placeholder='Email' value={contact.email || ''} disabled={true} />
                                        <input type='relationship' name='relationship' placeholder='relationship' value={contact.relationship || ''} disabled={true} />
                                    </>
                                )
                            })}
                        </div>
                
            </div>

            <div className="section">
                <h3>Documents</h3>

                    <div>
                        {formData.documents.length > 0 ? (
                            <ul>
                                {formData.documents.map((doc, index) => (
                                    <li key={index}>
                                        {doc.name}
                                        <button onClick={() => previewDocument(doc)}>Preview</button>
                                        <button onClick={() => downloadDocument(doc)}>Download</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No documents uploaded</p>
                        )}
                    </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;
