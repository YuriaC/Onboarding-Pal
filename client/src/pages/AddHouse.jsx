import { useState } from 'react'
import { HOUSE_ENDPOINT } from '../constants'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import resetObject from '../helpers/HelperFunctions';

const AddHouse = () => {

    const [formData, setFormData] = useState({
        address: '',
        landlordName: '',
        landlordPhone: '',
        landlordEmail: '',
        numBeds: 0,
        numMattresses: 0,
        numTables: 0,
        numChairs: 0,
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post(HOUSE_ENDPOINT, formData)
            .then(response => {
                console.log('response:', response)
                toast.success(`Successfully added ${formData.address}!`)
                setFormData(resetObject(formData))
            })
            .catch(error => {
                console.log('error:', error)
                toast.error('Erroring adding new house!')
            })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Address</legend>
                    <input className='address-input' type='text' value={formData.address} name='address' onChange={handleChange} required />
                </fieldset>
                <fieldset>
                    <legend>Landlord Information</legend>
                    <label>Name:</label>
                    <input type='text' value={formData.landlordName} name='landlordName' onChange={handleChange} required />
                    <label>Phone:</label>
                    <input type='tel' value={formData.landlordPhone} name='landlordPhone' onChange={handleChange} required />
                    <label>Email:</label>
                    <input type='email' value={formData.landlordEmail} name='landlordEmail' onChange={handleChange} required />
                </fieldset>
                <fieldset>
                    <legend>Facility Information</legend>
                    <label>Number of Beds:</label>
                    <input type='number' value={formData.numBeds} name='numBeds' min={0} onChange={handleChange} required />
                    <label>Number of Mattresses:</label>
                    <input type='number' value={formData.numMattresses} name='numMattresses' min={0} onChange={handleChange} required />
                    <label>Number of Tables:</label>
                    <input type='number' value={formData.numTables} name='numTables' min={0} onChange={handleChange} required />
                    <label>Number of Chairs:</label>
                    <input type='number' value={formData.numChairs} name='numChairs' min={0} onChange={handleChange} required />
                </fieldset>
                <input type='submit' value='Submit' />
            </form>
            <ToastContainer />
        </div>
    )
}

export default AddHouse