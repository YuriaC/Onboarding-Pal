import { useState, useEffect } from 'react'
import { HOUSE_ENDPOINT, token } from '../constants';
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
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // },
            withCredentials: true,
        })
            .then(response => {
                console.log('response:', response)
                // setHouses(prev => prev.filter(house => house._id !== houseId))
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
            <button onClick={() => navigate('/addhouse')}>Add House</button>
            <Box sx={{ justifyContent: 'center', width: '100%' }}>
            {houses.map((house, index) => {
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
                        {/* <Accordion key={house.address} sx={{ width: '100%', mb: '1rem' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                    <Box sx={{ mr: '1rem' }}>
                                        <Typography variant='h5'>{house.address.split(', ')[0]}</Typography>
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
                            </AccordionSummary>
                            <AccordionDetails sx={{ color: 'text.secondary' }}>
                                <Typography>Beds: {house.numBeds}</Typography>
                                <Typography>Mattresses: {house.numMattresses}</Typography>
                                <Typography>Tables: {house.numTables}</Typography>
                                <Typography>Chairs: {house.numChairs}</Typography>
                                {house.reports.length > 0
                                    ? '' 
                                    : <h4>No reports for this residence!</h4>
                                }
                                {house.employees.length > 0 ? house.employees.map((employee) => {
                                    return (
                                        <div key={employee._id}>
                                            <h3>{employee.firstName}</h3>
                                        </div>
                                    )
                                }) : <h4>No employees live here!</h4>}
                            </AccordionDetails>
                        </Accordion> */}
                    </div>
            )})}
            </Box>
            <ToastContainer />
        </div>
    )
}

export default HousingMgmt