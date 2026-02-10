import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "./authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://internalticketingsystem.onrender.com/api/v1",
  credentials: "include", // Essential for sending the Refresh Cookie
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    // console.log(
    //   "%c TOKEN IN HEADERS: ",
    //   "background: #222; color: #bada55",
    //   token,
    // );
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401 error and not on login page, try to refresh
  if (result.error && result.error.status === 401 && args.url !== "/login") {
    const refreshResult = await baseQuery(
      { url: "/users/refresh-token", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Assuming backend returns { data: { accessToken: "...", user: {...} } }
      const { accessToken, user } = refreshResult.data.data;

      api.dispatch(setCredentials({ token: accessToken, user }));

      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
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
        url: "/users/register",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response) => response.data,
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
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
    refresh: builder.mutation({
      query: () => ({
        url: "/users/refresh-token",
        method: "POST",
      }),
      // Normalize response so 'data' contains accessToken directly
      transformResponse: (response) => response.data,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // console.log("REFRESH SUCCESS - NEW TOKEN:", data.accessToken); // Debug Log

          if (!data.accessToken) {
            console.error("REFRESH ERROR: No access token in response");
          }

          // Update Redux Store
          dispatch(
            setCredentials({
              user: data.user,
              token: data.accessToken,
            }),
          );
        } catch (err) {
          console.error("REFRESH FAIL:", err);
          dispatch(logout());
        }
      },
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "/users/current-user",
        method: "GET",
      }),
      transformResponse: (response) => response.data,
      providesTags: ["User"],
    }),

    getAllAgents: builder.query({
      query: () => ({
        url: "/users/agents",
        method: "GET",
      }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: "User", id: "AGENT_LIST" }],
    }),
    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: "/users/avatar",
        method: "PATCH",
        body: formData,
      }),
      transformResponse: (response) => response.data,

      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: updatedUser } = await queryFulfilled;

          if (!updatedUser) {
            console.error("No user data returned from avatar update");
            return;
          }

          // Update Redux auth state (for components using useSelector)
          dispatch(
            setCredentials({
              user: updatedUser,
            }),
          );
        } catch (error) {
          console.error("Avatar update failed:", error);
        }
      },

      // This automatically refetches getCurrentUser
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/users/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Logout failed on server", err);
        }

        // 1. Clear Auth State (User/Token)
        dispatch(logout());

        // 2. CRITICAL: Clear all API Cache (Tickets, Stats, etc.)
        // This prevents User B from seeing User A's tickets for a split second
        dispatch(authApi.util.resetApiState());
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetAllAgentsQuery,
  useGetCurrentUserQuery,
  useUpdateAvatarMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
