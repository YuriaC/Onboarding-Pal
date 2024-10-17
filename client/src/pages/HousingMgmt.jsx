import { useState, useEffect } from 'react'
import { HOUSE_ENDPOINT, token } from '../constants';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const HousingMgmt = () => {

    const navigate = useNavigate()

    const [houses, setHouses] = useState([])

    useEffect(() => {
        axios.get(HOUSE_ENDPOINT, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                console.log('response.data:', response.data)
                setHouses(response.data)
            })
    }, [])

    const handleDelete = (e, houseId, address) => {
        e.preventDefault()
        axios.delete(`${HOUSE_ENDPOINT}/delete/${houseId}`)
            .then(response => {
                console.log('response:', response)
                setHouses(prev => prev.filter(house => house._id !== houseId))
                toast.success(`Successfully deleted ${address}!`)
            })
            .catch(error => {
                toast.error(`Error deleting house! Error: ${error.response.data}`)
            })
    }

    return (
        <div>
            <h1>Housing Management</h1>
            <button onClick={() => navigate('/addhouse')}>Add House</button>
            {houses.map((house) => {
                return (
                    <div key={house.address}>
                        <h3>{house.address}</h3>
                        <p>{house.landlordName}: {house.landlordPhone}, {house.landlordEmail}</p>
                        <p>Number of residents: {house.employees.length}</p>
                        <button onClick={(e) => handleDelete(e, house._id, house.address)}>Delete House</button>
                    </div>
            )})}
            <ToastContainer />
        </div>
    )
}

export default HousingMgmt