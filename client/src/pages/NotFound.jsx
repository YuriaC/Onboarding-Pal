import React, { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserThunk } from '../store/user/userSlice';

const NotFound = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, role } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserThunk());
    }, [dispatch]);
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>{`The page you're looking for doesn't exist.`}</p>
            {isAuthenticated ? (
                role === 'hr' ? (
                    <div>
                        You are logged in as an HR. You can go to <Link style={{ color: 'black' }} to="/hr/home">HR Home</Link>
                    </div>
                ) : (
                    <div>
                        You are logged in as an Employee. You can go to <Link style={{ color: 'black' }} to="/employee/profile">Employee Profile</Link>
                    </div>
                )
            ) : (
                <Navigate to="/login" />
            )}
        </div>
    );
};

export default NotFound;

