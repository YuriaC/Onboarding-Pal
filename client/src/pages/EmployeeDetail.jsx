import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Personal.css';

const EmployeeDetail = () => {
    const { employeeId } = useParams();

    const [formData, setFormData] = useState({});

    const getEmployeeDetail = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/users/personalinfobyid`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    employeeId: employeeId
                }
            });
            setFormData(response.data); 
        } catch (error) {
            console.error('Error fetching employee details', error);
        }
    };

    useEffect(() => {
        getEmployeeDetail();
    }, [employeeId]);

    return (
        <>
            {formData && (
                <div className="personal-information">
                    <h2>Personal Information</h2>
                    <div className="section">
                        <h3>Name</h3>
                        <div>
                            {formData.profilePicture && <img src={formData.profilePicture} alt='profilePicture' width={100} height={100} />}
                            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName || ''} disabled={true} />
                            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName || ''} disabled={true} />
                            <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName || ''} disabled={true} />
                            <input type="text" name="preferredName" placeholder="Preferred Name" value={formData.preferredName || ''} disabled={true} />
                            <input type="email" name="email" placeholder="Email" value={formData.email || ''} disabled={true} />
                            <input type="text" name="ssn" placeholder="SSN" value={formData.ssn || ''} disabled={true} />
                            <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob || ''} disabled={true} />
                            <select name="gender" value={formData.gender || ''} disabled={true}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="section">
                        <h3>Contact Info</h3>
                        <div>
                            <input type="text" name="workPhone" placeholder="Work Phone" value={formData.workPhone || ''} disabled={true} />
                        </div>
                    </div>

                    <div className="section">
                        <h3>Address</h3>
                        <div>
                            <input type="text" name="address" placeholder="Address" value={formData.address || ''} disabled={true} />
                        </div>
                    </div>

                    <div className='section'>
                        <h3>Employment Status</h3>
                        <div>
                            <input type='text' name='visaTitle' placeholder='Visa Title' value={formData.visaTitle || ''} disabled={true} />
                            <input type='text' name='startDate' placeholder='Start Date' value={formData.startDate || ''} disabled={true} />
                            <input type='text' name='endDate' placeholder='End Date' value={formData.endDate || ''} disabled={true} />
                        </div>
                    </div>

                    <div className='section'>
                        <h3>Emergency Contact</h3>
                        <div>
                            {formData.emergencyContact?.map((contact, index) => (
                                <div key={index}>
                                    <input type='text' name='firstName' placeholder='First Name' value={contact.firstName || ''} disabled={true} />
                                    <input type='text' name='lastName' placeholder='Last Name' value={contact.lastName || ''} disabled={true} />
                                    <input type='text' name='middleName' placeholder='Middle Name' value={contact.middleName || ''} disabled={true} />
                                    <input type='text' name='phone' placeholder='Phone' value={contact.phone || ''} disabled={true} />
                                    <input type='email' name='email' placeholder='Email' value={contact.email || ''} disabled={true} />
                                    <input type='text' name='relationship' placeholder='Relationship' value={contact.relationship || ''} disabled={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeDetail;
