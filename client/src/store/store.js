import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import searchReducer from "./user/searchTerm";
const store = configureStore({
    reducer: {
        user: userReducer,
        search: searchReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
})

export default store;