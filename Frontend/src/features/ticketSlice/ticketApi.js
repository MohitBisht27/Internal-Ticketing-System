import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
  }),
  tagTypes: ["Ticket"],
  endpoints: (builder) => ({
    createTicket: builder.mutation({
      query: (formData) => ({
        url: "/tickets",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Ticket"],
    }),

    getTickets: builder.query({
      query: () => ({
        url: "/tickets",
        method: "GET",
      }),
      providesTags: ["Ticket"],
    }),
    getTicketById: builder.query({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}`,
        method: "GET",
      }),
      providesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
      ],
    }),
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/tickets/${ticketId}`,
        method: "PATCH",
        body: { status },
      }),

      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
      ],
    }),
    assignTicket: builder.mutation({
      query: ({ ticketId, agentId }) => ({
        url: `/tickets/${ticketId}/assign`,
        method: "PATCH",
        body: { agentId },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
      ],
    }),
    getTicketStats: builder.query({
      query: () => ({
        url: "/tickets/stats",
        method: "GET",
      }),
      providesTags: ["Ticket"],
    }),
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
      providesTags: ["Ticket"],
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
} = ticketApi;
