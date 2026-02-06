import React, { useState } from "react";

import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  useGetCommentsQuery,
  useCreateCommentMutation,
} from "../../features/commentSlice/commentApiSlice";

import { useGetCurrentUserQuery } from "../../features/authSlice/authApiSlice";
import CommentForm from "../CommentUI/CommentForm";
import CommentItem from "../CommentUI/CommentItem";

const TicketComments = ({ ticketId }) => {
  const [page, setPage] = useState(1);

  const { data: userData } = useGetCurrentUserQuery();

  const currentUser = userData?.data || userData || {};

  // RTK Queries
  const { data, isLoading, error, isFetching } = useGetCommentsQuery(
    {
      ticketId,
      page,
      limit: 10,
    },
    {
      skip: !ticketId,
      refetchOnMountOrArgChange: true,
    },
  );

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();

  const handleCreateComment = async (formData, onSuccess) => {
    try {
      await createComment({ ticketId, formData }).unwrap();
      onSuccess();
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-red-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Error loading comments. Please try again.</p>
      </div>
    );
  }

  const comments = data?.comments || [];
  const { currentPage, totalPages, totalComments } = data?.pagination || {};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Comments
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
            {totalComments || 0}
          </span>
        </h2>
      </div>

      {/* Comment List */}
      <div className="p-6 space-y-8 flex-1 overflow-y-auto max-h-[600px]">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              ticketId={ticketId}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No comments yet</p>
            <p className="text-gray-400 text-sm">
              Be the first to share your thoughts.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isFetching}
            className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isFetching}
            className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Comment Input */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <CommentForm
          isSubmitting={isCreating}
          onSubmit={handleCreateComment}
          currentUserRole={currentUser?.role}
        />
      </div>
    </div>
  );
};

export default TicketComments;
