import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    console.error("API Error:", result.error);
  }

  return result;
};

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Ticket", "Stats", "Performance"],
  endpoints: (builder) => ({
    // Create ticket - POST /tickets
    createTicket: builder.mutation({
      query: (formData) => ({
        url: "/tickets",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Ticket", "Stats"],
      transformResponse: (response) => response.data,
    }),

    // Get tickets (role-based) - GET /tickets
    getTickets: builder.query({
      query: (params = {}) => {
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== "" && v !== undefined,
          ),
        );
        const queryString = new URLSearchParams(filteredParams).toString();
        return `/tickets${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Ticket"],
      transformResponse: (response) => response.data,
    }),

    // Get all tickets (admin only) - GET /tickets/admin/all
    getAllTickets: builder.query({
      query: (params = {}) => {
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== "" && v !== undefined,
          ),
        );
        const queryString = new URLSearchParams(filteredParams).toString();
        return `/tickets/admin/all${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Ticket"],
      transformResponse: (response) => response.data,
    }),

    // Get single ticket - GET /tickets/:ticketId
    getTicketById: builder.query({
      query: (ticketId) => `/tickets/${ticketId}`,
      providesTags: (result, error, id) => [{ type: "Ticket", id }],
      transformResponse: (response) => response.data,
    }),

    // Update ticket status - PATCH /tickets/:ticketId
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/tickets/${ticketId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Ticket", "Stats"],
      transformResponse: (response) => response.data,
    }),

    // Assign ticket - PATCH /tickets/:ticketId/assign
    assignTicket: builder.mutation({
      query: ({ ticketId, agentId }) => ({
        url: `/tickets/${ticketId}/assign`,
        method: "PATCH",
        body: { agentId },
      }),
      invalidatesTags: ["Ticket", "Stats", "Performance"],
      transformResponse: (response) => response.data,
    }),

    // Get ticket stats - GET /tickets/stats
    getTicketStats: builder.query({
      query: () => "/tickets/stats",
      providesTags: ["Stats"],
      transformResponse: (response) => response.data,
    }),

    // Get agent performance - GET /tickets/performance
    getAgentPerformance: builder.query({
      query: () => "/tickets/performance",
      providesTags: ["Performance"],
      transformResponse: (response) => response.data,
    }),

    // Update overdue tickets - PATCH /tickets/update-overdue
    updateOverdueTickets: builder.mutation({
      query: () => ({
        url: "/tickets/update-overdue",
        method: "PATCH",
      }),
      invalidatesTags: ["Ticket", "Stats"],
      transformResponse: (response) => response.data,
    }),

    // Get agents list (for assignment dropdown)
    getAgents: builder.query({
      query: () => "/users/agents",
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useGetAllTicketsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useGetTicketStatsQuery,
  useGetAgentPerformanceQuery,
  useUpdateOverdueTicketsMutation,
  useGetAgentsQuery,
} = ticketApi;
