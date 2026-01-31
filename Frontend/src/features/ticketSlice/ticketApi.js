import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
  }),
  tagTypes: ["Ticket", "Tickets"],
  endpoints: (builder) => ({
    // Create Ticket
    createTicket: builder.mutation({
      query: (formData) => ({
        url: "/tickets",
        method: "POST",
        body: formData,
      }),
      // ✅ Invalidate both Ticket and Tickets lists
      invalidatesTags: ["Ticket", "Tickets"],
    }),

    // Get User's Tickets
    getTickets: builder.query({
      query: (params = {}) => ({
        url: "/tickets",
        method: "GET",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          priority: params.priority,
          category: params.category,
          isOverdue: params.isOverdue,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      }),
      providesTags: (result) =>
        result?.data?.tickets
          ? [
              ...result.data.tickets.map(({ _id }) => ({
                type: "Ticket",
                id: _id,
              })),
              { type: "Ticket", id: "LIST" },
            ]
          : [{ type: "Ticket", id: "LIST" }],
    }),

    // Get Single Ticket by ID
    getTicketById: builder.query({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}`,
        method: "GET",
      }),
      // ✅ Fixed: ticketId comes directly, not as object
      providesTags: (result, error, ticketId) => [
        { type: "Ticket", id: ticketId },
      ],
    }),

    // Update Ticket Status
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/tickets/${ticketId}`,
        method: "PATCH",
        body: { status },
      }),
      // ✅ Invalidate both singular ticket and all lists
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
        { type: "Ticket", id: "LIST" },
        { type: "Tickets", id: ticketId },
        { type: "Tickets", id: "LIST" },
      ],
    }),

    // ✅ FIXED: Assign Ticket - Now invalidates both "Ticket" and "Tickets"
    assignTicket: builder.mutation({
      query: ({ ticketId, agentId }) => ({
        url: `/tickets/${ticketId}/assign`,
        method: "PATCH",
        body: { agentId },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
        { type: "Ticket", id: "LIST" },
        { type: "Tickets", id: ticketId },
        { type: "Tickets", id: "LIST" },
      ],
    }),

    // Get Ticket Stats
    getTicketStats: builder.query({
      query: () => ({
        url: "/tickets/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Ticket", id: "STATS" }],
    }),

    // Get All Tickets (Admin)
    getAllTickets: builder.query({
      query: (params = {}) => ({
        url: "/tickets/admin/all",
        method: "GET",
        params: {
          status: params.status,
          priority: params.priority,
          category: params.category,
          isOverdue: params.isOverdue,
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }),
      providesTags: (result) =>
        result?.data?.tickets
          ? [
              ...result.data.tickets.map(({ _id }) => ({
                type: "Tickets",
                id: _id,
              })),
              { type: "Tickets", id: "LIST" },
            ]
          : [{ type: "Tickets", id: "LIST" }],
    }),

    // Update Overdue Tickets
    updateOverdueTickets: builder.mutation({
      query: () => ({
        url: "/tickets/update-overdue",
        method: "PATCH",
      }),
      // ✅ Invalidate all ticket lists
      invalidatesTags: ["Ticket", "Tickets"],
    }),

    // Get Agent Performance
    getAgentPerformance: builder.query({
      query: () => ({
        url: "/tickets/performance",
        method: "GET",
      }),
      providesTags: [{ type: "Ticket", id: "PERFORMANCE" }],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useGetTicketStatsQuery,
  useUpdateOverdueTicketsMutation,
  useGetAgentPerformanceQuery,
  useGetAllTicketsQuery,
} = ticketApi;
