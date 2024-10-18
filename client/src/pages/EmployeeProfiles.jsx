import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeProfiles.css';

const employees = [
    { 
        firstName: 'John', 
        lastName: 'Doe', 
        ssn: '123-45-6789', 
        workAuthorizationTitle: 'H1B', 
        phoneNumber: '123-456-7890', 
        email: 'john.doe@example.com', 
        id: 1 
    },
    { 
        firstName: 'Jane', 
        lastName: 'Smith', 
        ssn: '987-65-4321', 
        workAuthorizationTitle: 'OPT', 
        phoneNumber: '098-765-4321', 
        email: 'jane.smith@example.com', 
        id: 2 
    },
    // More employee data...
];

const EmployeeProfiles = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [displayEmployee, setDsiayEmployee] = useState([]);

    const searchEmployee = async(value)=>{
        setSearchTerm(value);

        const filteredEmployees = await axios.get(`http://localhost:3000/api/users`/**/, {
            withCredentials: true,
            params: {
                searchTerm : value
            }
        })
        setDsiayEmployee(filteredEmployees)
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
                value={searchTerm}
                onChange={(e)=>{searchEmployee(e.target.value)}}
                className="search-bar"
            />

            <div className="employee-list">
                {displayEmployee.length > 0 ? (
                    displayEmployee.map((employee) => (
                        <div className="employee-item" key={employee.id}>
                            <h4>
                                <a
                                    href={`/employee/${employee.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {`${employee.firstName} ${employee.lastName}`}
                                </a>
                            </h4>
                            <p>SSN: {employee.ssn}</p>
                            <p>Work Authorization: {employee.workAuthorizationTitle}</p>
                            <p>Phone: {employee.phoneNumber}</p>
                            <p>Email: {employee.email}</p>
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
