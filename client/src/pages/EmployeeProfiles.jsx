import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm } from '../store/user/searchTerm';
import './EmployeeProfiles.css';


const EmployeeProfiles = () => {
    const [displayEmployee, setDsiayEmployee] = useState([]);

    const searchTermState = useSelector((state)=>state.search);
    const dispatch = useDispatch();

    const searchEmployee = async(value)=>{
        dispatch(setSearchTerm(value));

        const filteredEmployees = await axios.get(`http://localhost:3000/api/users/employeesprofile`, {
            withCredentials: true,
            params: {
                searchTerm : value
            }
        })
        setDsiayEmployee(filteredEmployees.data)
    }

    useEffect(()=>{
        searchEmployee('')
    }, [])


    return (
        <div className="employee-profiles">
            <h2>Employee Profiles</h2>

            <div className="employee-summary">
                <h3>Total Employees: {displayEmployee.length}</h3>
            </div>

            <input
                type="text"
                placeholder="Search by name..."
                value={searchTermState}
                onChange={(e)=>{searchEmployee(e.target.value)}}
                className="search-bar"
            />

            <div className="employee-list">
                {displayEmployee.length > 0 ? (
                    displayEmployee.map((employee) => (
                        <div className="employee-item" key={employee._id}>
                            <h4>
                                <Link
                                    to={`/hr/employee-profiles/${employee._id}`}
                                    rel="noopener noreferrer"
                                >
                                    {`${employee.firstName} ${employee.lastName} ${employee.username}`.trim() || 'Undefined Name'}
                                </Link>
                            </h4>
                            <p>SSN: {employee.ssn || 'Undefined SSN'}</p>
                            <p>Work Authorization: {employee.workAuth || 'Undefined Work Authorization'}</p>
                            <p>Phone: {employee.workPhone || 'Undefined Phone'}</p>
                            <p>Email: {employee.email || 'Undefined Email'}</p>
                        </div>
                    ))
                ) : (
                    <p>No employees found.</p>
                )}
            </div>
        </div>
    );
};

export default EmployeeProfiles;
