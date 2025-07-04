import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserThunk } from '../store/user/userSlice';
import { TextField, Button, Typography, Box, Container, withTheme } from '@mui/material';
import { USER_ENDPOINT } from '../constants';
import { getCookieValue, getUserRoleFromCookie } from '../helpers/HelperFunctions';

const Login = () => {
    const [form, setForm] = useState({
        userInput: '',
        password: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    useEffect(() => {
        const checkAuth = async () => {
            await setTimeout(() => {
                console.log('Log out')
            }, 1000)
            const cookie = getCookieValue('auth_token')
            const { userRole } = getUserRoleFromCookie()
            if (cookie) {
                return navigate(`${userRole === 'hr' ? '/hr/home' : '/employee/profile'}`)
            }
        }

        checkAuth()
    }, [])

    // Function to handle the login process
    const userLogin = (e) => {
        e.preventDefault();
        dispatch(loginUserThunk({ form, navigate }));
    };

 
    return (
        <Container sx={{ width: '25vw', marginTop: 15}}>
            <Box
                component="form"
                onSubmit={userLogin}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, boxShadow: 3, borderRadius: 2,  backgroundColor: 'white'}}
            >
                <Typography variant="h4" align="center" gutterBottom>
                    Login
                </Typography>

                {user.error && (
                    <Typography color="error" align="center">
                        {user.error}
                    </Typography>
                )}

                <TextField
                    required
                    label="Username or Email"
                    name="userInput"
                    fullWidth
                    value={form.userInput}
                    onChange={(e) => setForm({ ...form, userInput: e.target.value })}

                />

                <TextField
                    required
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />


                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2, mb: 1 }}
                >
                    Login

                </Button>
            </Box>
        </Container>
    );
};

export default Login;

