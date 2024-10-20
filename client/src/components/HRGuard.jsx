import React from 'react'
import { Outlet, Navigate } from 'react-router-dom';

import axios from 'axios'


const HRGuard = () => {
    const [employeeOrHr, setEmployeeOrHr] = React.useState('');
    const [loading, setLoading] = React.useState(true);


    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const authToken = getCookie('auth_token');



    React.useEffect(() => {
        //check if user is login

        //create one API check if you are employee or hr
        axios.get('http://localhost:3000/api/users/checkuserisemployeeorhr', {
            withCredentials: true
        })
            .then((response) => {
                setEmployeeOrHr(response.data.role);
            }).catch((error) => {
                console.log(error.response.data.message);
            }).finally(() => {
                setLoading(false);
            });

    }, [authToken])

    if (loading) return <div>Loading...</div>;  // Wait until role is checked


    return (
        <>
            {
                employeeOrHr === 'hr'
                    ?
                    <Outlet />
                    :
                    <Navigate to="/auth/login" />
            }
        </>
    )
}

export default HRGuard