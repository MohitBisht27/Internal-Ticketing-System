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

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery,
  tagTypes: ["Ticket", "Stats", "Performance"],
  endpoints: (builder) => ({
    // Create ticket
    createTicket: builder.mutation({
      query: (formData) => ({
        url: "/tickets",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Ticket", "Stats"],
      transformResponse: (response) => response.data,
    }),

    // Get tickets (role-based)
    getTickets: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/tickets?${queryString}`;
      },
      providesTags: ["Ticket"],
      transformResponse: (response) => response.data,
    }),

    // Get all tickets (admin only)
    getAllTickets: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/tickets/all?${queryString}`;
      },
      providesTags: ["Ticket"],
      transformResponse: (response) => response.data,
    }),

    // Get single ticket
    getTicketById: builder.query({
      query: (ticketId) => `/tickets/${ticketId}`,
      providesTags: (result, error, id) => [{ type: "Ticket", id }],
      transformResponse: (response) => response.data,
    }),

    // Update ticket status
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/tickets/${ticketId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Ticket", "Stats"],
      transformResponse: (response) => response.data,
    }),

    // Assign ticket
    assignTicket: builder.mutation({
      query: ({ ticketId, agentId }) => ({
        url: `/tickets/${ticketId}/assign`,
        method: "PATCH",
        body: { agentId },
      }),
      invalidatesTags: ["Ticket", "Stats", "Performance"],
      transformResponse: (response) => response.data,
    }),

    // Get ticket stats
    getTicketStats: builder.query({
      query: () => "/tickets/stats",
      providesTags: ["Stats"],
      transformResponse: (response) => response.data,
    }),

    // Get agent performance
    getAgentPerformance: builder.query({
      query: () => "/tickets/performance",
      providesTags: ["Performance"],
      transformResponse: (response) => response.data,
    }),

    // Update overdue tickets
    updateOverdueTickets: builder.mutation({
      query: () => ({
        url: "/tickets/overdue",
        method: "PATCH",
      }),
      invalidatesTags: ["Ticket", "Stats"],
      transformResponse: (response) => response.data,
    }),

    // Get agents list (for assignment)
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
