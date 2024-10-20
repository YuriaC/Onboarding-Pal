import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



const userSlice = createSlice({
    name: 'user',
    initialState: {
        username: '',
        userId: '',
        role: '',
        loading: false,
        error: null,
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
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
            state.error = action.payload;
            state.loading = false;
          });
      },
})


export const loginUserThunk = createAsyncThunk(
    'users/login',
    async (form, thunkAPI) => {
        try {
            const response = await axios.post('http://localhost:3000/api/users/login', {
                username: form.userInput,
                password: form.password
            }, {
                withCredentials: true
            });
            return response.data; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);


export default userSlice.reducer