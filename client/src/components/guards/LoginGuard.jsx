import { Outlet, Navigate } from 'react-router-dom';
import { getCookieValue } from '../../helpers/HelperFunctions';

const LoginGuard = () => {
    const token = getCookieValue('auth_token'); // Check if token exists in the cookie
    // If token exists, allow access to protected routes
    
    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default LoginGuard;
