import { useState, useEffect } from 'react'
import { HOUSE_ENDPOINT } from '../constants';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete'
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail'
import {
    Typography,
    Box,
    Button,
    Card,
} from '@mui/material'

const HousingMgmt = () => {

    const navigate = useNavigate()

    const [houses, setHouses] = useState([])
    const [changed, setChanged] = useState(false)

    useEffect(() => {
        axios.get(HOUSE_ENDPOINT, {
            withCredentials: true,
        })
            .then(response => {
                console.log('response.data:', response.data)
                setHouses(response.data)
            })
            .catch(error => {
                toast.error(`Error fetching houses! Error: ${error.response.data}`)
            })
    }, [changed])

    const handleDelete = (e, houseId, address) => {
        e.preventDefault()
        axios.delete(`${HOUSE_ENDPOINT}/delete/${houseId}`, {
            withCredentials: true,
        })
            .then(response => {
                console.log('response:', response)
                setChanged(prev => !prev)
                toast.success(`Successfully deleted ${address}!`)
            })
            .catch(error => {
                toast.error(`Error deleting house! Error: ${error.response.data}`)
            })
    }

    const handleClick = (e, houseId) => {
        e.preventDefault()
        navigate(`/hr/house-details/${houseId}`)
    }

    return (
        <div>
            <h1>Housing Management</h1>
            <button onClick={() => navigate('/hr/addhouse')}>Add House</button>
            <Box sx={{ justifyContent: 'center', width: '100%' }}>
            {houses.map((house) => {
                return (
                    <div key={house.address}>
                        <Card key={house.address} sx={{ mb: '1rem' }}>
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ mr: '1rem' }}>
                                    <Typography variant='h5' sx={{ cursor: 'pointer'}} onClick={(e) => handleClick(e, house._id)}>{house.address.split(', ')[0]}</Typography>
                                    <Typography variant='body1'>{house.address.split(', ')[1]}, {house.address.split(', ')[2]}</Typography>
                                </Box>
                                <Box sx={{ mr: '1rem' }}>
                                    <Typography color='text.primary' sx={{ ml: 2 }} display='block'>{house.landlordName}</Typography>
                                </Box>
                                <Box sx={{ mr: '1rem' }}>
                                    <Typography><PhoneIcon />{house.landlordPhone}</Typography>
                                    <Typography><MailIcon />{house.landlordEmail}</Typography>
                                </Box>
                                <Box sx={{ mr: '1rem' }}>
                                    <Typography sx={{ ml: 2 }}>Residents: {house.employees.length}</Typography>
                                </Box>
                                <Button onClick={(e) => handleDelete(e, house._id, house.address)}><DeleteIcon /></Button>
                            </Box>
                        </Card>
                    </div>
            )})}
            </Box>
            <ToastContainer />
        </div>
    )
}

export default HousingMgmt