import { useState } from 'react'

const Onboarding = () => {

    const [formData, setFormData] = useState({
        isPermRes: '',
        nonPermWorkAuth: '',
        hasDriversLicense: '',
        isReferred: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        console.log('name:', name)
        console.log('value:', value)
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>First Name: </label>
                <input type='text' name='firstName' required />
                <label>Last Name: </label>
                <input type='text' name='lastName' required />
                <label>Middle Name: </label>
                <input type='text' name='middleName' />
                <label>Preferred Name: </label>
                <input type='text' name='preferredName' />
                <label>Profile Picture: </label>
                <input type='file' name='preferredName' /> {/* Default placeholder??? */}
                <fieldset>
                    <legend>Address</legend>
                    <label>Building/Apartment #: </label>
                    <input type='text' name='building' required />
                    <label>Street Name: </label>
                    <input type='text' name='street' required />
                    <label>City: </label>
                    <input type='text' name='city' required />
                    <label>State: </label>
                    <input type='text' name='state' required />
                    <label>ZIP: </label>
                    <input type='number' name='zip' min={10000} max={99999} required />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Phone Numbers</legend>
                    <label>Cell Phone Number: </label>
                    <input type='tel' name='cellPhone' required />
                    <label>Work Phone Number: </label>
                    <input type='tel' name='workPhone' />
                </fieldset>
                <br />
                <fieldset>
                    <legend>Car Info</legend>
                    <label>Make: </label>
                    <input type='text' name='carMake' />
                    <label>Model: </label>
                    <input type='text' name='carModel' />
                    <label>Color: </label>
                    <input type='text' name='carColor' />
                </fieldset>
                <br />
                <label>Email: </label>
                <input type='text' name='email' disabled />
                <label>SSN: </label>
                <input type='password' name='ssn' required />
                <label>Date of Birth: </label>
                <input type='date' name='dob' required />
                <label>Gender: </label>
                <select name='gender'>
                    <option value='Male'>Male</option>
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
                                <option value='H1-B'>H1-B</option>
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
                            <input type='date' name='visaStartDate' />
                            <br />
                            <label>Work authorization end date: </label>
                            <input type='date' name='visaEndDate' />
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
                            <input type='number' name='dlNum' required />
                            <br />
                            <label>Driver&#39;s License Expiration: </label>
                            <input type='date' name='dlExpDate' required />
                            <br />
                            <label>Driver&#39;s License Copy: </label>
                            <input type='file' name='licenseCopy' required />
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
                            <input type='text' name='refFirstName' required />
                            <label>Last Name: </label>
                            <input type='text' name='refLastName' required />
                            <label>Middle Name: </label>
                            <input type='text' name='refMiddleName' />
                            <label>Phone: </label>
                            <input type='tel' name='refPhone' required />
                            <label>Email: </label>
                            <input type='email' name='refEmail' required />
                            <label>Relationship: </label>
                            <input type='text' name='refRelationship' required />
                        </>
                    }
                </fieldset>
                <br />
                <fieldset>
                    <legend>Emergency Contacts</legend>
                    <label>First Name</label>
                    <input type='text' name='emergencyFirstName' onChange={handleChange} required />
                    <label>Last Name</label>
                    <input type='text' name='emergencyLastName' onChange={handleChange} required />
                    <label>Middle Name</label>
                    <input type='text' name='emergencyMiddleName' onChange={handleChange} />
                    <label>Phone</label>
                    <input type='tel' name='emergencyPhone' required />
                    <label>Email</label>
                    <input type='email' name='emergencyEmail' onChange={handleChange} required />
                    <label>Relationship</label>
                    <input type='text' name='emergencyRelationship' onChange={handleChange} required />
                </fieldset>
            </form>
        </div>
    )
}

export default Onboarding