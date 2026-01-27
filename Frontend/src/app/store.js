import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authApiSlice";
import authReducer from "../features/auth/authSlice";
import { ticketApi } from "../features/tickets/ticketSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(ticketApi.middleware),
});
