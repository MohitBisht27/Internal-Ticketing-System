import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/authSlice/authApiSlice";
import authReducer from "../features/authSlice/authSlice"; // Import the new reducer

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});
