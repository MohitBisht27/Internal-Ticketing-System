import { useState } from "react";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Reply,
  FileText,
  Lock,
  User,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
} from "lucide-react";
import {
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useCreateCommentMutation,
} from "../../features/commentSlice/commentApiSlice";
import { useGetCurrentUserQuery } from "../../features/authSlice/authApiSlice";
import CommentForm from "./CommentForm";

// --- Helpers ---
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const CommentItem = ({ comment, ticketId }) => {
  const { data: userData } = useGetCurrentUserQuery();
  const userInfo = userData?.data || userData || {};

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [imgError, setImgError] = useState(false);

  // API
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [createReply, { isLoading: isReplyingLoad }] =
    useCreateCommentMutation();

  // --- Data Extraction ---
  const authorExists = !!comment.author;
  const authorName =
    comment.author?.fullName || comment.author?.name || "Unknown";
  const authorAvatar = comment.author?.avatar;
  const authorRole = comment.author?.role || "user";

  const parentExists = !!comment.parentComment;
  const parentAuthorName = comment.parentComment?.author?.fullName || "Unknown";

  const isEdited = comment.editedAt || comment.createdAt !== comment.updatedAt;
  const isOwner =
    userInfo?._id && comment.author?._id && userInfo._id === comment.author._id;
  const isAdmin = userInfo?.role === "admin";
  const canEdit = authorExists && (isOwner || isAdmin);
  const canDelete = isOwner || isAdmin;

  // --- Handlers ---
  const handleDelete = async () => {
    setShowActions(false);
    if (window.confirm("Delete comment?")) {
      try {
        await deleteComment({ commentId: comment._id, ticketId }).unwrap();
      } catch (err) {
        if (err.status === 400 && err.data.message.includes("replies")) {
          if (window.confirm("Delete comment AND its replies?")) {
            await deleteComment({
              commentId: comment._id,
              ticketId,
              force: true,
            });
          }
        }
      }
    }
  };

  const handleUpdate = async (formData, onSuccess) => {
    try {
      const content = formData.get("content");
      const isInternalNote = formData.get("isInternalNote");
      await updateComment({
        commentId: comment._id,
        ticketId,
        content,
        isInternalNote: isInternalNote === "true",
      }).unwrap();
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to update", error);
    }
  };

  const handleReply = async (formData, onSuccess) => {
    try {
      formData.append("parentComment", comment._id);
      await createReply({ ticketId, formData }).unwrap();
      setIsReplying(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to reply", error);
    }
  };

  // --- Components ---
  const UserAvatar = ({ src, alt, role, exists }) => {
    if (exists && src && !imgError) {
      return (
        <img
          src={src}
          alt={alt}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
          onError={() => setImgError(true)}
        />
      );
    }
    const bgColors = {
      admin: "bg-indigo-600",
      agent: "bg-blue-500",
      user: "bg-slate-500",
      unknown: "bg-gray-300",
    };
    const bgClass = !exists
      ? bgColors.unknown
      : bgColors[role] || bgColors.user;
    return (
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${bgClass}`}
      >
        {exists ? getInitials(alt) : <User className="w-3 h-3" />}
      </div>
    );
  };

  const RoleBadge = ({ role }) => {
    const baseClass =
      "inline-flex items-center gap-0.5 px-1.5 rounded-[4px] text-[9px] font-bold uppercase border";
    if (role === "admin")
      return (
        <span
          className={`${baseClass} bg-indigo-50 text-indigo-700 border-indigo-100`}
        >
          Admin
        </span>
      );
    if (role === "agent")
      return (
        <span
          className={`${baseClass} bg-blue-50 text-blue-700 border-blue-100`}
        >
          Agent
        </span>
      );
    return null;
  };

  // Styles based on Internal Note status
  const containerClass = comment.isInternalNote
    ? "bg-amber-50/30 border-l-[3px] border-l-amber-400 border-y border-r border-y-amber-100 border-r-amber-100"
    : "bg-white border border-gray-200 hover:border-gray-300";

  return (
    <div
      className={`relative group mb-3 rounded-md transition-all duration-200 ${containerClass}`}
    >
      <div className="p-3">
        {/* --- Header Row --- */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Avatar & Connector logic */}
            <div className="relative flex-shrink-0">
              <UserAvatar
                src={authorAvatar}
                alt={authorName}
                role={authorRole}
                exists={authorExists}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
              <span
                className={`text-sm font-semibold truncate ${authorExists ? "text-slate-900" : "text-slate-400"}`}
              >
                {authorName}
              </span>

              <RoleBadge role={authorRole} />

              {comment.isInternalNote && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 rounded-[4px]">
                  <Lock className="w-2.5 h-2.5" /> STAFF ONLY
                </span>
              )}

              <span className="text-[11px] text-slate-400 flex-shrink-0">
                • {formatTimeAgo(comment.createdAt)}
                {isEdited && !comment.isInternalNote && " (edited)"}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Actions Menu */}
            <div className="relative">
              {(canEdit || canDelete) && !isEditing && !isCollapsed && (
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-6 w-32 bg-white rounded shadow-xl border border-gray-100 z-20 py-1 text-xs animate-in zoom-in-95">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowActions(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* --- Collapsed Preview --- */}
        {isCollapsed && (
          <div
            className="ml-9 mt-1 text-xs text-slate-400 truncate cursor-pointer hover:text-slate-600"
            onClick={() => setIsCollapsed(false)}
          >
            {parentExists && (
              <span className="font-medium mr-1">@{parentAuthorName}</span>
            )}
            {comment.content}
          </div>
        )}

        {/* --- Expanded Content --- */}
        {!isCollapsed && (
          <div className="ml-9">
            {/* Replying Context */}
            {parentExists && !isEditing && (
              <div className="flex items-center gap-1.5 mt-1 mb-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded max-w-fit">
                <CornerDownRight className="w-3 h-3 text-slate-400" />
                <span>
                  Reply to{" "}
                  <span className="font-medium text-slate-700">
                    {parentAuthorName}
                  </span>
                </span>
              </div>
            )}

            {/* Main Text */}
            {isEditing ? (
              <div className="mt-2">
                <CommentForm
                  isEdit
                  initialContent={comment.content}
                  initialIsInternal={comment.isInternalNote}
                  currentUserRole={userInfo?.role}
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <div
                className={`text-[13px] leading-relaxed whitespace-pre-wrap break-words mt-1 ${comment.isInternalNote ? "text-slate-800" : "text-slate-700"}`}
              >
                {comment.content}
              </div>
            )}

            {/* Attachments (Compact List) */}
            {comment.attachments?.length > 0 && !isEditing && (
              <div className="mt-2 flex flex-wrap gap-2">
                {comment.attachments.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-blue-300 hover:bg-white transition-all group/file"
                  >
                    <div className="w-4 h-4 text-slate-400">
                      {/\.(jpg|jpeg|png|gif)$/i.test(file.url) ? (
                        <img
                          src={file.url}
                          alt=""
                          className="w-full h-full object-cover rounded-[2px]"
                        />
                      ) : (
                        <FileText className="w-full h-full" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 group-hover/file:text-blue-600 max-w-[120px] truncate">
                      Attachment {i + 1}
                    </span>
                  </a>
                ))}
              </div>
            )}

            {/* Action Bar (Reply) */}
            {!isEditing && !isReplying && authorExists && (
              <div className="mt-2">
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Reply className="w-3 h-3" /> Reply
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Nested Reply Form --- */}
      {isReplying && !isCollapsed && (
        <div className="px-3 pb-3 pt-0 ml-9 animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="relative border-l-2 border-slate-200 pl-3 pt-1">
            <CommentForm
              isReply
              isSubmitting={isReplyingLoad}
              currentUserRole={userInfo?.role}
              initialIsInternal={comment.isInternalNote}
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
