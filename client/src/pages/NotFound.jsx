
import { Link, Navigate } from 'react-router-dom';
import { getUserRoleFromCookie,getCookieValue  } from '../helpers/HelperFunctions';
const NotFound = () => {
    const {userRole, status} = getUserRoleFromCookie();
    const token = getCookieValue('auth_token');




    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>{`The page you're looking for doesn't exist.`}</p>
            {token ? (
                userRole === 'hr' ? (
                    <div>
                        You are logged in as an HR. You can go to <Link style={{ color: 'black' }} to="/hr/home">HR Home</Link>
                    </div>
                ) : (
                    <div>
                        You are logged in as an Employee. You can go to {status === 'Approved' ? <Link style={{ color: 'black' }} to="/employee/visa-status">Visa Status</Link> : <Link style={{ color: 'black' }} to="/employee/onboarding">Onboarding Page</Link>}
                    </div>
                )
            ) : (
                <Navigate to="/login" />
            )}
        </div>
    );
};

export default NotFound;

