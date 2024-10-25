import { Outlet, Navigate } from 'react-router-dom';
import { getUserRoleFromCookie } from '../../helpers/HelperFunctions';
const RoleGuard = () => {


    const {status} = getUserRoleFromCookie();

    console.log(status);
    // If the user's role doesn't match the required role, redirect them to their correct home page
    // Get the url params, if the string after role/ doesn't exist, redirect them to the home page
    const currentURL = window.location.href;
    if (!currentURL.includes('/employee/profile') && 
        !currentURL.includes('/employee/housing') && 
        !currentURL.includes('/employee/visa-status')){
        return <Navigate to="/not-found" />;


    }
    // Allow access to the page if the role matches
    if (
        status &&
        status === 'Approved' &&
        (currentURL.includes('/employee/visa-status') ||
            currentURL.includes('/employee/housing') ||
            currentURL.includes('/employee/profile'))
    ) {
        return <Outlet />;

    }else{

        return <Navigate to="/not-found" />;

    }
};

export default RoleGuard;
