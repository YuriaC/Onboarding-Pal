import React from 'react';
import { NavLink } from 'react-router-dom';
import { Outlet } from 'react-router-dom';


const HRNavbar = () => {
    return (
        <main className='mainContainer'>
            <nav className="navbar">
                <ul className="navbar-links">
                    <li>
                        <NavLink to="/hr/employeeprofiles"
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Employee Profiles
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/hr/hiring"
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Hiring
                        </NavLink>
                    </li>


                </ul>
            </nav>
            <Outlet />
        </main>

    );
};

export default HRNavbar;
