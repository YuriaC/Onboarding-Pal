import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
const Guard = () => {
    const token = localStorage.getItem('token');

    React.useEffect(() => {
    }, [])

    return (
        <>
            {token ?
                <Outlet />
                :
                <Navigate to={'/auth/login'} />}
        </>
    )
}

export default Guard