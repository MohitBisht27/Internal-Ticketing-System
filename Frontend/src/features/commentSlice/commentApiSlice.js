import { authApi } from "../authSlice/authApiSlice";

export const commentApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query({
      query: ({ ticketId, page = 1, limit = 20 }) => ({
        url: `/comments/${ticketId}/comments`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, { ticketId }) =>
        result?.comments
          ? [
              // Tag individual comments so we can update them specifically
              ...result.comments.map(({ _id }) => ({
                type: "Comment",
                id: _id,
              })),
              // Tag the specific Ticket List to force refresh on add/delete
              { type: "Comment", id: `LIST-${ticketId}` },
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
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Comment", id: `LIST-${ticketId}` }, // Refresh the list
        { type: "Ticket", id: ticketId }, // Refresh ticket stats/activity
      ],
    }),

    updateComment: builder.mutation({
      query: ({ commentId, content, isInternalNote }) => ({
        url: `/comments/${commentId}`,
        method: "PATCH",
        body: {
          content,
          isInternalNote,
        },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { commentId, ticketId }) => [
        { type: "Comment", id: commentId }, // Update the specific comment UI
        { type: "Comment", id: `LIST-${ticketId}` }, // Refresh list to update 'updatedAt' timestamps
      ],
    }),

    deleteComment: builder.mutation({
      query: ({ commentId, force }) => {
        // Construct params object only if force is true
        const params = {};
        if (force) params.force = "true";

        return {
          url: `/comments/${commentId}`,
          method: "DELETE",
          params,
        };
      },
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { ticketId, commentId }) => [
        { type: "Comment", id: commentId }, // Remove from cache
        { type: "Comment", id: `LIST-${ticketId}` }, // Refresh list
        { type: "Ticket", id: ticketId }, // Refresh ticket stats
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
