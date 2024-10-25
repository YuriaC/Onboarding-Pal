import { useState, useEffect } from 'react'
import { HOUSE_ENDPOINT } from '../constants';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete'
import {
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,

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
            <Button onClick={() => navigate('/hr/addhouse')} sx={{ p: 2, mb: 2 }} fullWidth>Add House</Button>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Address</TableCell>
                            <TableCell>Landlord</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Email </TableCell>
                            <TableCell>Residents</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {houses.map((house) => (
                            <TableRow
                                key={house.address}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    <Typography variant='h5' sx={{ cursor: 'pointer'}} onClick={(e) => handleClick(e, house._id)}>{house.address.split(', ')[0]}</Typography>
                                    <Typography variant='body1'>{house.address.split(', ')[1]}, {house.address.split(', ')[2]}</Typography>
                                </TableCell>
                                <TableCell>{house.landlordName}</TableCell>
                                <TableCell>{house.landlordPhone}</TableCell>
                                <TableCell>{house.landlordEmail}</TableCell>
                                <TableCell align='center'>{house.employees.length}</TableCell>
                                <TableCell align="right">
                                    <Button onClick={(e) => handleDelete(e, house._id, house.address)}><DeleteIcon /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ToastContainer />
        </div>
    )
}

export default HousingMgmt