import { useState } from 'react'

const Onboarding = () => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        preferredName: '',
        profilePicture: null,
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
        nonPermWorkAuth: 'H1-B',
        hasDriversLicense: '',
        isReferred: '',
    })

    const [emergencyContacts, setEmergencyContacts] = useState([
        {
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            email: '',
            relationship: '',
        }
    ])

    const handleChange = (e) => {
        const { type, name, value } = e.target
        console.log('type:', type)
        console.log('name:', name)
        console.log('value:', value)
        setFormData({
            ...formData,
            [name]: type === 'file' ? e.target.files[0] : value,
        })
    }

    const handleEmContactChange = (e, index) => {
        const { name, value } = e.target
        const newContacts = [...emergencyContacts]
        newContacts[index][name] = value
        setEmergencyContacts(newContacts)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('formData:', formData)
    }

    const addEmergencyContact = (e) => {
        e.preventDefault()
        setEmergencyContacts([
            ...emergencyContacts,
            {
                firstName: '',
                lastName: '',
                middleName: '',
                phone: '',
                email: '',
                relationship: '',
            }
        ])
    }

    const removeEmergencyContact = (e, index) => {
        e.preventDefault()
        if (emergencyContacts.length === 1) {
            return
        }
        const newContacts = emergencyContacts.filter((_, i) => i !== index)
        setEmergencyContacts(newContacts)
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>First Name: </label>
                <input type='text' name='firstName' onChange={handleChange} required />
                <label>Last Name: </label>
                <input type='text' name='lastName' onChange={handleChange} required />
                <label>Middle Name: </label>
                <input type='text' name='middleName' onChange={handleChange} />
                <label>Preferred Name: </label>
                <input type='text' name='preferredName' onChange={handleChange} />
                <label>Profile Picture: </label>
                <input type='file' name='profilePicture' onChange={handleChange} /> {/* Default placeholder??? */}
                <fieldset>
                    <legend>Address</legend>
                    <label>Building/Apartment #: </label>
                    <input type='text' name='building' onChange={handleChange} required />
                    <label>Street Name: </label>
                    <input type='text' name='street' onChange={handleChange} required />
                    <label>City: </label>
                    <input type='text' name='city' onChange={handleChange} required />
                    <label>State: </label>
                    <input type='text' name='state' onChange={handleChange} required />
                    <label>ZIP: </label>
                    <input type='number' name='zip' min={10000} max={99999} onChange={handleChange} required />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Phone Numbers</legend>
                    <label>Cell Phone Number: </label>
                    <input type='tel' name='cellPhone' onChange={handleChange} required />
                    <label>Work Phone Number: </label>
                    <input type='tel' name='workPhone' onChange={handleChange} />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Car Info</legend>
                    <label>Make: </label>
                    <input type='text' name='carMake' onChange={handleChange} />
                    <label>Model: </label>
                    <input type='text' name='carModel' onChange={handleChange} />
                    <label>Color: </label>
                    <input type='text' name='carColor' onChange={handleChange} />
                </fieldset>
                <br />
                <label>Email: </label>
                <input type='text' name='email' disabled />
                <label>SSN: </label>
                <input type='password' name='ssn' onChange={handleChange} required />
                <label>Date of Birth: </label>
                <input type='date' name='dob' onChange={handleChange} required />
                <label>Gender: </label>
                <select name='gender' onChange={handleChange}>
                    <option value='Male' selected>Male</option>
                    <option value='Female'>Female</option>
                    <option value='I do not wish to answer'>I do not wish to answer</option>
                </select>
                <br />
                <fieldset>
                    <legend>Work Authorization</legend>
                    <label>Are you a citizen or permanent resident of the US?</label>
                    <input type='radio' name='isPermRes' value='Yes' onChange={handleChange} required />
                    <label>Yes</label>
                    <input type='radio' name='isPermRes' value='No' onChange={handleChange} />
                    <label>No</label>
                    {formData.isPermRes === 'Yes' &&
                        <>
                            <br />
                            <label>What kind of permanent residence?</label>
                            <input type='radio' name='permResStatus' value='Citizen' onChange={handleChange} required />
                            <label>Citizen</label>
                            <input type='radio' name='permResStatus' value='Green Card' onChange={handleChange} />
                            <label>Green Card</label>
                        </>
                    }
                    {formData.isPermRes === 'No' &&
                        <>
                            <br />
                            <label>What is your work authorization? </label>
                            <select name='nonPermWorkAuth' onChange={handleChange} required>
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
                                    <input type='file' name='optReceipt' onChange={handleChange} required />
                                </>
                            }
                            {formData.nonPermWorkAuth === 'Other' &&
                                <>
                                    <br />
                                    <label>Visa title: </label>
                                    <input type='text' name='visaTitle' onChange={handleChange} />
                                </>
                            }
                            <br />
                            <label>Work authorization start date: </label>
                            <input type='date' name='visaStartDate' onChange={handleChange} />
                            <br />
                            <label>Work authorization end date: </label>
                            <input type='date' name='visaEndDate' onChange={handleChange} />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Driver&#39;s License</legend>
                    <label>Do you have a driver&#39;s license?</label>
                    <input type='radio' name='hasDriversLicense' value='Yes' onChange={handleChange} required />
                    <label>Yes</label>
                    <input type='radio' name='hasDriversLicense' value='No' onChange={handleChange} />
                    <label>No</label>
                    {formData.hasDriversLicense === 'Yes' &&
                        <>
                            <br />
                            <label>Driver&#39;s License Number: </label>
                            <input type='number' name='dlNum' onChange={handleChange} required />
                            <br />
                            <label>Driver&#39;s License Expiration: </label>
                            <input type='date' name='dlExpDate' onChange={handleChange} required />
                            <br />
                            <label>Driver&#39;s License Copy: </label>
                            <input type='file' name='licenseCopy' onChange={handleChange} required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Reference</legend>
                    <label>Did someone refer you to this company?</label>
                    <input type='radio' name='isReferred' value='Yes' onChange={handleChange} required />
                    <label>Yes</label>
                    <input type='radio' name='isReferred' value='No' onChange={handleChange} />
                    <label>No</label>
                    {formData.isReferred === 'Yes' &&
                        <>
                            <br />
                            <label>First Name: </label>
                            <input type='text' name='refFirstName' onChange={handleChange} required />
                            <label>Last Name: </label>
                            <input type='text' name='refLastName' onChange={handleChange} required />
                            <label>Middle Name: </label>
                            <input type='text' name='refMiddleName' onChange={handleChange} />
                            <label>Phone: </label>
                            <input type='tel' name='refPhone' onChange={handleChange} required />
                            <label>Email: </label>
                            <input type='email' name='refEmail' onChange={handleChange} required />
                            <label>Relationship: </label>
                            <input type='text' name='refRelationship' onChange={handleChange} required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Emergency Contacts</legend>
                    {emergencyContacts.map((contact, index) => (
                        <div key={contact.email}>
                            <label>First Name</label>
                            <input type='text' name='firstName' value={contact.firstName} onChange={(e) => handleEmContactChange(e, index)} required />
                            <label>Last Name</label>
                            <input type='text' name='lastName' value={contact.lastNameName} onChange={(e) => handleEmContactChange(e, index)} required />
                            <label>Middle Name</label>
                            <input type='text' name='middleName' value={contact.middleNameName} onChange={(e) => handleEmContactChange(e, index)} />
                            <label>Phone</label>
                            <input type='tel' name='phone' value={contact.phone} onChange={(e) => handleEmContactChange(e, index)} required />
                            <label>Email</label>
                            <input type='email' name='email' value={contact.email} onChange={(e) => handleEmContactChange(e, index)} required />
                            <label>Relationship</label>
                            <input type='text' name='relationship' value={contact.relationship} onChange={(e) => handleEmContactChange(e, index)} required />
                            {emergencyContacts.length !== 1 &&
                                <button onClick={(e) => removeEmergencyContact(e, index)}>Remove Contact</button>
                            }
                            <br />
                        </div>
                    ))}
                    <button onClick={addEmergencyContact}>Add Contact</button>
                </fieldset>
                <input type='submit' value='Submit' />
            </form>
        </div>
    )
}

export default Onboarding