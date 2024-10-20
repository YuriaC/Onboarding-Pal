import {createSlice} from '@reduxjs/toolkit';

const searchTermSlice = createSlice({
    name: 'search',
    initialState: '',
    reducers: {
        setSearchTerm: (state, action) => action.payload,
    }
});

export const {setSearchTerm} = searchTermSlice.actions;
export default searchTermSlice.reducer