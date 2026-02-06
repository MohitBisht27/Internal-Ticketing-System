import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
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
  const scrollRef = useRef(null);

  // State for "Fake" Instant Comment
  const [tempComment, setTempComment] = useState(null);

  const { data: userData } = useGetCurrentUserQuery();
  const currentUser = userData?.data || userData || {};

  // RTK Query with POLLING (The Real-Time Trick)
  const { data, isLoading, error, isFetching } = useGetCommentsQuery(
    { ticketId, page, limit: 10 },
    {
      skip: !ticketId,
      // 1. Check for new comments every 3 seconds
      pollingInterval: 3000,
      // 2. Refetch immediately if user clicks back on this window
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();

  const comments = data?.comments || [];
  const { currentPage, totalPages, totalComments } = data?.pagination || {};

  // Auto-scroll to bottom when comments change
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [comments.length, tempComment]); // Also scroll when temp comment is added

  const handleCreateComment = async (formData, onSuccess) => {
    // 1. Create a "Fake" Comment for instant feedback
    const contentText = formData.get("content");
    const fakeId = Date.now().toString();

    setTempComment({
      _id: fakeId,
      content: contentText,
      author: currentUser,
      createdAt: new Date().toISOString(),
      attachments: [], // We can't easily show file previews here without more code, keeping it simple
      isInternalNote: formData.get("isInternalNote") === "true",
      isOptimistic: true, // Flag to style it differently
    });

    try {
      // 2. Send to Server
      await createComment({ ticketId, formData }).unwrap();

      // 3. Success! Remove fake comment (Real one will appear from invalidatesTags)
      setTempComment(null);
      onSuccess();

      // 4. If we aren't on the last page, jump there to see our new comment
      if (totalPages && page < totalPages) {
        setPage(totalPages);
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      setTempComment(null); // Remove fake comment on error
      alert("Failed to send. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-red-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Error loading comments.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Comments
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
            {totalComments || 0}
          </span>
        </h2>
        {isFetching && !isLoading && (
          <span className="text-xs text-blue-500 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Updating...
          </span>
        )}
      </div>

      {/* Comment List */}
      <div
        ref={scrollRef}
        className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[600px] scroll-smooth"
      >
        {comments.length > 0 || tempComment ? (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                ticketId={ticketId}
              />
            ))}

            {/* Show "Fake" Comment while uploading */}
            {tempComment && (
              <div className="opacity-70 transition-opacity">
                <CommentItem comment={tempComment} ticketId={ticketId} />
                <div className="text-right text-xs text-blue-500 -mt-2 pr-2">
                  Sending...
                </div>
              </div>
            )}
          </>
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
          isSubmitting={isCreating || !!tempComment} // Disable while fake comment is showing
          onSubmit={handleCreateComment}
          currentUserRole={currentUser?.role}
        />
      </div>
    </div>
  );
};

export default TicketComments;
