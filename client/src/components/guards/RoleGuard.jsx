import { Outlet, Navigate } from 'react-router-dom';
import { getUserRoleFromCookie } from '../../helpers/HelperFunctions';
const RoleGuard = ({ role }) => {

    const userRole = getUserRoleFromCookie();
    // If the user's role doesn't match the required role, redirect them to their correct home page
    // Get the url params, if the string after role/ doesn't exist, redirect them to the home page
    const currentURL = window.location.href;
    if (!currentURL.includes('/employee/onboarding') && 
        !currentURL.includes('/employee/housing') && 
        !currentURL.includes('/employee/visa-status') && 
        !currentURL.includes('/employee/profile') &&
        !currentURL.includes('/hr/home') && 
        !currentURL.includes('/hr/employee-profiles') && 
        !currentURL.includes('/hr/visa-status') && 
        !currentURL.includes('/hr/addhouse') && 
        !currentURL.includes('/hr/house-details') && 
        !currentURL.includes('/hr/housing-management') && 
        !currentURL.includes('/hr/hiring')) {

        return <Navigate to="/not-found" />;
    }

    if (userRole && userRole !== role) {
        return userRole === 'hr' ? <Navigate to="/hr/home" /> : <Navigate to="/employee/onboarding" />;
    }

    // Allow access to the page if the role matches

    console.log('In RoleGuard. userRole:', userRole, 'role:', role);
    return <Outlet /> ;
};

export default RoleGuard;
