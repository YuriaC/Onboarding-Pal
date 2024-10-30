import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, checkToken } from '../store/user/userSlice'; // import checkToken from the slice
import validator from 'validator';
import { Box, Button, TextField, CircularProgress, Typography } from '@mui/material'; // Material UI components

const Registration = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
    });
    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, email } = useSelector((state) => state.user); // get state from redux

    // Set email if it's available from the Redux store
    useEffect(() => {
        if (email) {
            setForm((prev) => ({ ...prev, email }));
        }
    }, [email]);

    const validatorForm = () => {
        let errors = {};

        if (!validator.isLength(form.username, { min: 3, max: 16 })) {
            errors.username = 'Username must be between 3 and 16 characters';
        }

        if (!validator.isEmail(form.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!validator.isStrongPassword(form.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            errors.password = 'Password must have:\nAt least 8 characters\nAt least 1 lowercase letter\nAt least 1 uppercase letter\nAt least 1 number\nAt least 1 symbol.';
        }

        if (form.password !== form.repeatPassword) {
            errors.repeatPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const userRegister = (e) => {
        e.preventDefault();

        if (validatorForm()) {
            dispatch(registerUser({
                username: form.username,
                email: form.email,
                password: form.password
            }))
            .unwrap() // Unwrap the result to handle navigation after the async call
            .then(() => {
                navigate('/login');
            })
            .catch((err) => console.log(err)); // Handle registration error
        }
    }

    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');
        if (!token) {
            navigate('/login');
        }
        if (token) {
            dispatch(checkToken({token})) // Dispatch checkToken via Redux
            .unwrap()
            .catch((err) => {
                console.log(err);
                navigate('/login');
            });
        }
        setTimeout(() => setIsVisible(true), 300);
    }, [dispatch, navigate]);

    return (
        <Box className={`register-form ${isVisible ? 'visible' : ''}`} sx={{ width: 300, mx: 'auto', mt: 4 }}>
            <form>
                <Box sx={{ mb: 2 }}>
                    {error && <Typography color="error">{error}</Typography>}
                    <TextField
                        fullWidth
                        required
                        label="Username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        error={!!formErrors.username}
                        helperText={formErrors.username}
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        required
                        disabled
                        label="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        required
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        error={!!formErrors.password}
                        helperText={
                            formErrors.password && (
                                <>
                                    {/* {formErrors.password.slice(0, formErrors.password.length / 2)} <br /> */}
                                    {/* {formErrors.password.slice(formErrors.password.length / 2)} */}
                                    {formErrors.password.split('\n').map((str) => (
                                        <p key={str} style={{ margin: 0 }}>{str}</p>
                                    ))}
                                </>
                            )
                        }
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        required
                        label="Repeat Password"
                        type="password"
                        value={form.repeatPassword}
                        onChange={(e) => setForm({ ...form, repeatPassword: e.target.value })}
                        error={!!formErrors.repeatPassword}
                        helperText={formErrors.repeatPassword}
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    {loading ? <CircularProgress /> : (
                        <Button variant="contained" onClick={userRegister}>
                            Register
                        </Button>
                    )}
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">
                        Already have an account? <NavLink to="/auth/login">Sign in</NavLink>
                    </Typography>
                </Box>
            </form>
        </Box>
    );
}

export default Registration;
