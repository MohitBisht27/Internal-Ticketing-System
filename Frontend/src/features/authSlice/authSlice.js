import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      // MERGE user data instead of replacing
      // This prevents wiping fields during partial updates (like avatar)
      if (user) {
        state.user = state.user ? { ...state.user, ...user } : user;
      }

      // Only update token if explicitly provided
      if (token !== undefined) {
        state.token = token;
      }

      // Derive auth status from the CURRENT state (after merge)
      state.isAuthenticated = !!state.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export default authSlice.reducer;
