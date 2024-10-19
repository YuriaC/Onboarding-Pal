import { useState, useEffect } from 'react'
import { HOUSE_ENDPOINT, token } from '../constants';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete'
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail'
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Stack,
} from '@mui/joy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const HousingMgmt = () => {

    const navigate = useNavigate()

    const [houses, setHouses] = useState([])

    useEffect(() => {
        axios.get(HOUSE_ENDPOINT, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            // withCredentials: true,
        })
            .then(response => {
                console.log('response.data:', response.data)
                setHouses(response.data)
            })
            .catch(error => {
                toast.error(`Error fetching houses! Error: ${error.response.data}`)
            })
    }, [])

    const handleDelete = (e, houseId, address) => {
        e.preventDefault()
        axios.delete(`${HOUSE_ENDPOINT}/delete/${houseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
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
            <Stack sx={{ justifyContent: 'center', padding: '3rem' }}>
            {houses.map((house, index) => {
                return (
                    <div key={house.address}>
                        <button onClick={(e) => handleDelete(e, house._id, house.address)}><DeleteIcon /></button>
                        <Accordion key={house.address}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${index + 1}-content`}
                                id={`panel${index + 1}-header`}
                                sx={{ color: 'text.primary' }}
                            >
                                <Typography variant='h2'>{house.address}</Typography>
                                <Typography variant='h4' sx={{ ml: 2 }} display='block'>{house.landlordName}</Typography>
                                <Typography><PhoneIcon />{house.landlordPhone} <MailIcon />{house.landlordEmail}</Typography>
                                <Typography sx={{ ml: 2 }}>Residents: {house.employees.length}</Typography>
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
                        </Accordion>
                    </div>
            )})}
            </Stack>
            <ToastContainer />
        </div>
    )
}

export default HousingMgmt