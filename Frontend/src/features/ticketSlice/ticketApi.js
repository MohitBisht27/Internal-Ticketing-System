import { authApi } from "../authSlice/authApiSlice";

export const ticketApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create Ticket
    createTicket: builder.mutation({
      query: (formData) => ({
        url: "/tickets",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Ticket", "Tickets", "Stats"],
    }),

    // 2. Get User's Tickets
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
                type: "Tickets",
                id: _id,
              })),
              { type: "Tickets", id: "LIST" },
            ]
          : [{ type: "Tickets", id: "LIST" }],
    }),

    // 3. Get Single Ticket
    getTicketById: builder.query({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}`,
        method: "GET",
      }),
      providesTags: (result, error, ticketId) => [
        { type: "Ticket", id: ticketId },
      ],
    }),

    // 4. Update Ticket Status
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/tickets/${ticketId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
        { type: "Tickets", id: "LIST" },
        "Stats", // Update stats on status change
      ],
    }),

    // 5. Assign Ticket
    assignTicket: builder.mutation({
      query: ({ ticketId, agentId }) => ({
        url: `/tickets/${ticketId}/assign`,
        method: "PATCH",
        body: { agentId },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
        { type: "Tickets", id: "LIST" },
        "Stats",
        "Performance", // Update agent performance
      ],
    }),

    // 6. Get Ticket Stats
    getTicketStats: builder.query({
      query: () => ({
        url: "/tickets/stats",
        method: "GET",
      }),
      providesTags: ["Stats"],
    }),

    // 7. Admin: Get All Tickets
    getAllTickets: builder.query({
      query: (params = {}) => ({
        url: "/tickets/admin/all",
        method: "GET",
        params: params,
      }),
      providesTags: ["Tickets"],
    }),

    // 8. Update Overdue
    updateOverdueTickets: builder.mutation({
      query: () => ({
        url: "/tickets/update-overdue",
        method: "PATCH",
      }),
      invalidatesTags: ["Tickets", "Stats"],
    }),

    // 9. Agent Performance
    getAgentPerformance: builder.query({
      query: () => ({
        url: "/tickets/performance",
        method: "GET",
      }),
      providesTags: ["Performance"],
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
