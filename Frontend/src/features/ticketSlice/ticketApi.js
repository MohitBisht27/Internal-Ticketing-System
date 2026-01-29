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
  }),
});

export const { useCreateTicketMutation, useGetTicketsQuery } = ticketApi;
