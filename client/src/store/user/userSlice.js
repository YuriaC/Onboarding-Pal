import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { USER_ENDPOINT } from '../../constants';

// Thunks for async actions
// Thunks for async actions
export const loginUserThunk = createAsyncThunk(
    'user/login',
    async ({ form, navigate }, thunkAPI) => {
        try {
            const response = await axios.post('http://localhost:3000/api/users/login', {
                username: form.userInput,
                password: form.password
            }, {
                withCredentials: true
            });
            // Navigate based on role
            const userRole = response.data.data.role;
            if (userRole === 'hr') {
                navigate('/hr/employee-profiles'); // Redirect HR to the appropriate page
            } else if (userRole === 'employee') {
                const response = await axios.get(`${USER_ENDPOINT}/userinfo`, { withCredentials: true })
                console.log('response:', response)
                const { onboardingStatus } = response.data
                if (onboardingStatus === 'Approved') {
                    navigate('/')
                }
                else {
                    navigate('/employee/onboarding')
                }
                // navigate('/employee/profile'); // Redirect employee to the personal page
            }
            
            return response.data; // Return user data on successful login
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);
// Thunk to send registration link
export const sendRegistrationLinkThunk = createAsyncThunk(
    'user/sendRegistrationLink',
    async (email, thunkAPI) => {
        try {
            const response = await axios.post('http://localhost:3000/api/send-registration-link', { email }); // change api
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to send registration link');
        }
    }
);

// Thunk to fetch registration history
export const fetchRegistrationHistoryThunk = createAsyncThunk(
    'user/fetchRegistrationHistory',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get('http://localhost:3000/api/users/registration-history', {
                withCredentials: true
            });             
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch registration history');
        }
    }
);

// Thunk to fetch user details
export const getUserThunk = createAsyncThunk(
    'user/getUser',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get('http://localhost:3000/api/users/userinfo', {
                withCredentials: true // Ensure it passes the cookies
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

// Thunk to log out the user
export const logoutUserThunk = createAsyncThunk(
    'user/logout',
    async (_, thunkAPI) => {
        try {
            await axios.post('http://localhost:3000/api/users/logout', {}, {
                withCredentials: true
            });
            return {}; // Return an empty payload for successful logout
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to logout');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        username: '',
        userId: '',
        role: '',
        loading: false,
        isAuthenticated: false,
        error: null,
        registrationHistory: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Handle login
            .addCase(loginUserThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUserThunk.fulfilled, (state, action) => {
                state.username = action.payload.username;
                state.userId = action.payload.userId;
                state.role = action.payload.role;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(loginUserThunk.rejected, (state, action) => {
                state.error = action.payload || 'Login failed';
                state.loading = false;
            })
            // Handle fetching user data
            .addCase(getUserThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserThunk.fulfilled, (state, action) => {
                state.username = action.payload.username;
                state.userId = action.payload.userId;
                state.role = action.payload.role;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(getUserThunk.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch user data';
                state.loading = false;
            })
            // Handle logout
            .addCase(logoutUserThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUserThunk.fulfilled, (state) => {
                state.username = '';
                state.userId = '';
                state.role = '';
                state.isAuthenticated = false;
                state.loading = false;
            })
            .addCase(logoutUserThunk.rejected, (state, action) => {
                state.error = action.payload || 'Logout failed';
                state.loading = false;
            })
            .addCase(sendRegistrationLinkThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendRegistrationLinkThunk.fulfilled, (state) => {
                state.loading = false;
                // Optionally update the registration history with the new entry

            })
            .addCase(sendRegistrationLinkThunk.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })

            // Fetching Registration History
            .addCase(fetchRegistrationHistoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRegistrationHistoryThunk.fulfilled, (state, action) => {
                state.registrationHistory = action.payload;
                state.loading = false;
            })
            .addCase(fetchRegistrationHistoryThunk.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
    },
});

export default userSlice.reducer;
