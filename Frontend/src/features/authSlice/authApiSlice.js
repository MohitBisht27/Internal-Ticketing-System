import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../../features/authSlice/authSlice";

// 1. Define standard base query
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000/api/v1/users", // Pointing directly to /users
  credentials: "include", // Essential for cookies
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// 2. Define wrapper to handle 401 errors (Token Expiration)
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If error is 401 (Unauthorized) and we are not trying to login/refresh already
  if (result.error && result.error.status === 401 && args.url !== "/login") {
    // Try to get a new token using the Refresh Token cookie
    const refreshResult = await baseQuery(
      { url: "/refresh-token", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Store the new token
      const newAccessToken = refreshResult.data.data.accessToken;
      const user = api.getState().auth.user;

      api.dispatch(setCredentials({ token: newAccessToken, user }));

      // Retry the original query that failed
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed (cookie expired), force logout
      api.dispatch(logout());
    }
  }
  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (formData) => ({
        url: "/register",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response) => response.data,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Matches your ApiResponse structure
          if (data?.accessToken && data?.user) {
            dispatch(
              setCredentials({ user: data.user, token: data.accessToken }),
            );
          }
        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),

    getCurrentUser: builder.query({
      query: () => ({
        url: "/current-user",
        method: "GET",
      }),
      transformResponse: (response) => response.data,
      providesTags: ["User"],
    }),

    getAllAgents: builder.query({
      query: () => ({
        url: "/agents",
        method: "GET",
      }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: "User", id: "AGENT_LIST" }],
    }),

    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: "/avatar",
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (response) => response.data,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update the user object in Redux state immediately
          dispatch(setCredentials({ user: data }));
        } catch (error) {}
      },
      invalidatesTags: ["User"],
    }),

    updateAccount: builder.mutation({
      query: (details) => ({
        url: "/update-account",
        method: "PATCH",
        body: details,
      }),
      transformResponse: (response) => response.data,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data }));
        } catch (error) {}
      },
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Optimistic logout: Clear state immediately
        dispatch(logout());
        try {
          await queryFulfilled;
        } catch (err) {
          // already handled
        }
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetAllAgentsQuery,
  useGetCurrentUserQuery,
  useUpdateAvatarMutation,
  useUpdateAccountMutation,
  useLogoutMutation,
} = authApi;
