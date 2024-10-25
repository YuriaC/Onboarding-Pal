import { useState, useEffect } from 'react';
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
        const newData = filteredEmployees.data
        newData.sort((a, b) => a.lastName > b.lastName ? -1 : 1)
        setDsiayEmployee(newData)
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
                                    {`${employee.firstName} ${employee.lastName}`.trim() || 'Undefined Name'}
                                </Link>
                            </h4>
                            <h5>{employee.username}</h5>
                            {employee.ssn && <p>SSN: {employee.ssn}</p>}
                            {employee.isPermRes === 'Yes' ? (
                                <p>Work Authorization: {employee.permResStatus}</p>
                            ) : (
                                <p>Work Authorization: {employee.workAuth}</p>
                            )}
                            {employee.cellPhone && <p>Phone: {employee.cellPhone}</p>}
                            {employee.email && <p>Email: {employee.email}</p>}
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
