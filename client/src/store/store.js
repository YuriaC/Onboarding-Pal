import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
const store = configureStore({
    reducer: {
        user: userReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
})

export default store;