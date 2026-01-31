import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/authSlice/authApiSlice";
import authReducer from "../features/authSlice/authSlice";
import { ticketApi } from "../features/ticketSlice/ticketApi";
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware, ticketApi.middleware),
});
