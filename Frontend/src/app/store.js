import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/authSlice/authApiSlice";
import authReducer from "../features/authSlice/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});
