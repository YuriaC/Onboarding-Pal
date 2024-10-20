import React from 'react'
import { Outlet, Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode'

// import axios from 'axios'


const Guard = () => {
    const [employeeOrHr, setEmployeeOrHr] = React.useState('');
    const [loading, setLoading] = React.useState(true);


    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const checkUserRole = (token) => {
        try {
          const decoded = jwtDecode(token);
          return decoded.role; // Assuming the role is stored as 'role' in the token
        } catch (error) {
          console.error(`Error checking user role: ${error}`);
          return null;
        }
    }

    const authToken = getCookie('auth_token');

    React.useEffect(() => {
        //check if user is login

        //create one API check if you are employee or hr
        // axios.get('http://localhost:3000/api/users/checkuserisemployeeorhr', {
        //     withCredentials: true
        // })
        //     .then((response) => {
        //         setEmployeeOrHr(response.data.role);
        //     }).catch((error) => {
        //         console.log(error.response.data.message);
        //     }).finally(() => {
        //         setLoading(false);
        //     });
        const role = checkUserRole(authToken)
        setEmployeeOrHr(role)
        setLoading(false)

    }, [authToken])

    if (loading) return <div>Loading...</div>;  // Wait until role is checked


    return (
        <>
            {
                employeeOrHr === 'employee'
                    ?
                    <Outlet />
                    :
                    <Navigate to="/auth/login" />
            }
        </>
    )
}

export default Guard