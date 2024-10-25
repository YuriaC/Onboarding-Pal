import { useState } from 'react'
import { emailRegex, HOUSE_ENDPOINT, phoneRegex } from '../constants'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import { checkZIP, resetObject } from '../helpers/HelperFunctions';
import { TextField, Box, Button } from '@mui/material';
import ErrorHelperText from '../components/ErrorHelperText';

const AddHouse = () => {

    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        landlordName: '',
        landlordPhone: '',
        landlordEmail: '',
        numBeds: '',
        numMattresses: '',
        numTables: '',
        numChairs: '',
    })

    const [errors, setErrors] = useState({
        landlordEmail: false,
        landlordPhone: false,
        zip: false,
    })
    const helperTexts = {
        landlordEmail: 'Invalid email format!',
        landlordPhone: 'Invalid phone format!',
        zip: 'ZIP code must have 5 digits!',
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const newErrorObject = {}
        for (const key in errors) {
            newErrorObject[key] = false
        }
        if (!checkZIP(formData.zip)) {
            newErrorObject['zip'] = true
        }
        if (!phoneRegex.test(formData.landlordPhone)) {
            newErrorObject['landlordPhone'] = true
        }
        if (!emailRegex.test(formData.landlordEmail)) {
            newErrorObject['landlordEmail'] = true
        }
        for (const key in newErrorObject) {
            if (newErrorObject[key]) {
                toast.error('Please fix input errors!')
                return setErrors(newErrorObject)
            }
        }
        axios.post(HOUSE_ENDPOINT, formData, {
            withCredentials: true,
        })
            .then(() => {
                toast.success(`Successfully added new house!`)
                setErrors(newErrorObject)
                setFormData(resetObject(formData))
            })
            .catch(error => {
                toast.error(`Error adding new house! Error: ${error.response.data.message}`)
            })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Address</legend>
                    <Box>
                        <TextField label='Street' name='street' value={formData.street} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2, mt: 1 }} />
                        <TextField label='City' name='city' value={formData.city} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
                        <TextField label='State' name='state' value={formData.state} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
                        <TextField label='ZIP' name='zip' type='number' value={formData.zip} variant='outlined' onChange={handleChange} fullWidth error={errors.zip} required sx={{ mb: 2 }} />
                        <ErrorHelperText hasError={errors.zip} message={helperTexts.zip} />
                    </Box>
                </fieldset>
                <fieldset>
                    <legend>Landlord Information</legend>
                    <TextField label='Full Name' name='landlordName' value={formData.landlordName} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2, mt: 1 }} />
                    <TextField label='Phone' name='landlordPhone' value={formData.landlordPhone} variant='outlined' onChange={handleChange} fullWidth error={errors.landlordPhone} required sx={{ mb: 2 }} />
                    <ErrorHelperText hasError={errors.landlordPhone} message={helperTexts.landlordPhone} />
                    <TextField label='Email' name='landlordEmail' value={formData.landlordEmail} variant='outlined' onChange={handleChange} fullWidth error={errors.landlordEmail} required sx={{ mb: 2 }} />
                    <ErrorHelperText hasError={errors.landlordEmail} message={helperTexts.landlordEmail} />
                </fieldset>
                <fieldset>
                    <legend>Facility Information</legend>
                    {/* <label>Number of Beds:</label> */}
                    {/* <input type='number' value={formData.numBeds} name='numBeds' min={0} onChange={handleChange} required /> */}
                    <TextField label='Number of Beds' type='number' name='numBeds' value={formData.numBeds} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2, mt: 1 }} />
                    {/* <label>Number of Mattresses:</label> */}
                    {/* <input type='number' value={formData.numMattresses} name='numMattresses' min={0} onChange={handleChange} required /> */}
                    <TextField label='Number of Mattresses' type='number' name='numMattresses' value={formData.numMattresses} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
                    {/* <label>Number of Tables:</label> */}
                    {/* <input type='number' value={formData.numTables} name='numTables' min={0} onChange={handleChange} required /> */}
                    <TextField label='Number of Tables' type='number' name='numTables' value={formData.numTables} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2, mt: 1 }} />
                    {/* <label>Number of Chairs:</label> */}
                    {/* <input type='number' value={formData.numChairs} name='numChairs' min={0} onChange={handleChange} required /> */}
                    <TextField label='Number of Chairs' type='number' name='numChairs' value={formData.numChairs} variant='outlined' onChange={handleChange} fullWidth required sx={{ mb: 2, mt: 1 }} />
                </fieldset>
                {/* <input type='submit' value='Submit' /> */}
                <Button type='submit' fullWidth sx={{ p: 2, mt: 2, mb: 4 }}>Add House</Button>
            </form>
            <ToastContainer />
        </div>
    )
}

export default AddHouse