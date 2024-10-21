import { Outlet, Navigate } from 'react-router-dom';

const LoginGuard = () => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('auth_token='));

    return (
        cookie ? <Outlet /> : <Navigate to="/login" />
    )
};

export default LoginGuard;
