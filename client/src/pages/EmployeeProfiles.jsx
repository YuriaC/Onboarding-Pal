import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm } from '../store/user/searchTerm';
import './employeeProfiles.css';
import { API_BASE_URL } from '../constants';
import { Container, Box, Button, TextField, CircularProgress, Typography } from '@mui/material'; // Material UI components

const EmployeeProfiles = () => {
    const [displayEmployee, setDsiayEmployee] = useState([]);

    const searchTermState = useSelector((state)=>state.search);
    const dispatch = useDispatch();

    const searchEmployee = async(value)=>{
        dispatch(setSearchTerm(value));

        const filteredEmployees = await axios.get(`${API_BASE_URL}/users/employeesprofile`, {
            withCredentials: true,
            params: {
                searchTerm : value
            }
        })
        const newData = filteredEmployees.data
        newData.sort((a, b) => a.lastName > b.lastName ? -1 : 1)
        setDsiayEmployee(newData)
    }

    useEffect(()=>{
        searchEmployee('')
    }, [])

    return (
        // <div className="employee-profiles">
        <Container sx={{padding: "2rem", width: '60vw'}}>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: 2, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
            <h2>Employee Profiles</h2>

            <div className="employee-summary">
                <h3>Total Employees: {displayEmployee.length}</h3>
            </div>

            <TextField
                label = "Search Bar"
                variant='outlined'
                placeholder="Search Employee by Name..."
                value={searchTermState}
                onChange={(e)=>{searchEmployee(e.target.value)}}
                className="search-bar"
                sx={{ mb: 6, margin:"0 auto 2rem auto", width: '70%', boxShadow: 1}}
                InputLabelProps={{
                    shrink: true,
                }}           
            />

            <Typography>{displayEmployee.length === 0 ? 'No records found' : displayEmployee.length === 1 ? 'One record found' : 'Multiple records found'}</Typography>

            <div className="employee-list">
                {displayEmployee.length > 0 && (
                    displayEmployee.map((employee) => (
                        <div className="employee-item" key={employee._id}>
                            <h4>
                                <Typography variant='h6' onClick={() => window.open(`/hr/employee-profiles/${employee._id}`, '_blank', 'noopener,noreferrer')} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>{`${employee.firstName} ${employee.lastName}`.trim() || 'Undefined Name'}</Typography>
                            </h4>
                            <h5>{employee.username}</h5>
                            {employee.ssn && <p>SSN: {employee.ssn}</p>}
                            {employee.isPermRes === 'Yes' ? (
                                <p>Work Authorization: {employee.permResStatus}</p>
                            ) : (
                                <>
                                    {employee.workAuth === 'Other' ? (
                                        <p>Work Authorization: {employee.visaTitle ? employee.visaTitle : 'Other (Unspecified)'}</p>
                                    ) : (
                                        <p>Work Authorization: {employee.workAuth}</p>
                                    )}
                                </>
                            )}
                            {employee.cellPhone && <p>Phone: {employee.cellPhone}</p>}
                            {employee.email && <p>Email: {employee.email}</p>}
                        </div>
                    ))
                )}
            </div>
        {/* </div> */}
        </Box>
        </Container>
    );
};

export default EmployeeProfiles;
