import React from 'react';
import { NavLink } from 'react-router-dom';
import { Outlet } from 'react-router-dom';


const Navbar = () => {
    return (
        <main className='mainContainer'>
            <nav className="navbar">
                <ul className="navbar-links">
                    <li>
                        <NavLink to="/"
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Onboarding
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/visastatusemployees"
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Visa Status
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/housing"
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Housing
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/personal"
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Personal
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <Outlet />
        </main>

    );
};

export default Navbar;
