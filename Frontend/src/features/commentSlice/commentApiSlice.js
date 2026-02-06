import { authApi } from "../authSlice/authApiSlice";

export const commentApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query({
      query: ({ ticketId, page = 1, limit = 10 }) => ({
        url: `/comments/${ticketId}/comments`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (response) => response.data,

      providesTags: (result, error, { ticketId }) =>
        result?.comments
          ? [
              { type: "Comment", id: `LIST-${ticketId}` }, // Tag for the whole list
              ...result.comments.map(({ _id }) => ({
                type: "Comment",
                id: _id,
              })),
            ]
          : [{ type: "Comment", id: `LIST-${ticketId}` }],
    }),

    createComment: builder.mutation({
      query: ({ ticketId, formData }) => ({
        url: `/comments/${ticketId}/comments`,
        method: "POST",
        body: formData,
      }),
      transformResponse: (response) => response.data,
      //  Invalidates the list tag, forcing a re-fetch
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Comment", id: `LIST-${ticketId}` },
        { type: "Ticket", id: ticketId }, // To update ticket comment count/activity
      ],
    }),

    updateComment: builder.mutation({
      query: ({ commentId, content, isInternalNote }) => ({
        url: `/comments/${commentId}`,
        method: "PATCH",
        body: { content, isInternalNote },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { commentId, ticketId }) => [
        { type: "Comment", id: commentId },
        { type: "Comment", id: `LIST-${ticketId}` },
      ],
    }),

    deleteComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Comment", id: `LIST-${ticketId}` },
        { type: "Ticket", id: ticketId },
      ],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
