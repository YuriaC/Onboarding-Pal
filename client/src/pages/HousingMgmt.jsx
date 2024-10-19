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
    Box
} from '@mui/material'
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
            <Box sx={{ width: '100%', mt: 3}}>
            {houses.map((house, index) => {
                return (
                    <div key={house.address}>
                        {/* <p><PhoneIcon />{house.landlordPhone} <MailIcon />{house.landlordEmail}</p>
                        <p>Number of residents: {house.employees.length}</p> */}
                        <button onClick={(e) => handleDelete(e, house._id, house.address)}><DeleteIcon /></button>
                        <Accordion key={house.address}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${index + 1}-content`}
                                id={`panel${index + 1}-header`}
                            >
                                <Typography variant='h6'>{house.address}</Typography>
                                <Typography sx={{ color: 'text.secondary', ml: 2 }}>{house.landlordName}</Typography>
                                <Typography sx={{ color: 'text.secondary' }}><PhoneIcon />{house.landlordPhone} <MailIcon />{house.landlordEmail}</Typography>
                                <Typography sx={{ color: 'text.secondary', ml: 2 }}>Number of residents: {house.employees.length}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>Hi</Typography>
                            </AccordionDetails>
                        </Accordion>
                    </div>
            )})}
            </Box>
            <ToastContainer />
        </div>
    )
}

export default HousingMgmt