import { Outlet, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserThunk } from '../../store/user/userSlice';

import { useEffect } from 'react';

const RoleGuard = ({ role }) => {
    const { role: userRole } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    // Dispatch the userInfoThunk to get user info
    useEffect(() => {
        dispatch(getUserThunk());
    }, [dispatch]);

    // If the user's role doesn't match the required role, redirect them to their correct home page
    if (userRole !== role) {
        return userRole === 'hr' ? <Navigate to="/hr/home" /> : <Navigate to="/employee/profile" />;
    }

    // Allow access to the page if the role matches
    return role ? <Outlet /> : <Navigate to="/" />;
};

export default RoleGuard;

