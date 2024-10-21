import { Outlet, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserThunk } from '../../store/user/userSlice';
import { useEffect } from 'react';

const RoleGuard = ({ role }) => {
    const { role: userRole, loading } = useSelector((state) => state.user); // Include loading from user state
    const dispatch = useDispatch();

    // Dispatch the userInfoThunk to get user info
    useEffect(() => {
        dispatch(getUserThunk());
    }, [dispatch]);

    // If the data is still loading, do not redirect yet
    if (loading) {
        // You can show a loader or just return null until the user info is fetched
        return <div>Loading...</div>; // Optional: you can display a loading spinner or some UI here
    }

    // If the user's role doesn't match the required role, redirect them to their correct home page
    if (userRole && userRole !== role) {
        return userRole === 'hr' ? <Navigate to="/hr/home" /> : <Navigate to="/employee/onboarding" />;
    }

    // Allow access to the page if the role matches

    console.log('userRole:', userRole, 'role:', role);
    return <Outlet /> ;
};

export default RoleGuard;
