import { useState, useRef } from "react";
import {
  Send,
  Paperclip,
  X,
  Loader2,
  Lock,
  MessageCircle,
  Image,
  FileText,
} from "lucide-react";

const MAX_FILES = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const CommentForm = ({
  onSubmit,
  isSubmitting,
  initialContent = "",
  initialIsInternal = false,
  isReply = false,
  isEdit = false,
  onCancel,
  currentUserRole,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isInternalNote, setIsInternalNote] = useState(initialIsInternal);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const canAddInternalNote = ["admin", "agent"].includes(
    String(currentUserRole || "")
      .toLowerCase()
      .trim(),
  );

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    addFiles(selected);
  };

  const addFiles = (selected) => {
    const validFiles = selected.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length + files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    const formData = new FormData();
    formData.append("content", content);

    // Only append isInternalNote if user has permission
    // This prevents regular users from accidentally sending "false" and triggering backend validation issues
    if (canAddInternalNote) {
      formData.append("isInternalNote", isInternalNote);
    }

    files.forEach((file) => formData.append("attachments", file));

    onSubmit(formData, () => {
      setContent("");
      setFiles([]);
      if (!isEdit) setIsInternalNote(false);
    });
  };

  const placeholderText = isReply
    ? "Write your reply..."
    : isEdit
      ? "Edit your comment..."
      : "Write a comment...";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Header for non-reply/edit */}
      {!isReply && !isEdit && (
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <MessageCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Add Comment</h3>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`relative rounded-xl border-2 transition-all duration-200 ${
          dragActive
            ? "border-blue-400 bg-blue-50/50"
            : isInternalNote
              ? "border-amber-200 bg-amber-50/30"
              : "border-gray-200 bg-white hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Internal Note Banner */}
        {isInternalNote && (
          <div className="px-4 py-2 bg-amber-100 border-b border-amber-200 rounded-t-xl flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              Internal Note - Only visible to staff
            </span>
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholderText}
          rows={isReply ? 3 : 4}
          className={`w-full px-4 py-3 bg-transparent resize-none outline-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed ${
            isInternalNote ? "rounded-b-xl" : "rounded-xl"
          }`}
        />

        {/* Attached Files Preview */}
        {files.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="text-gray-500">{getFileIcon(file)}</div>
                <span className="text-sm text-gray-700 max-w-[150px] truncate">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="ml-1 p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Toolbar */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
          {/* Left Actions */}
          <div className="flex items-center gap-3">
            {!isEdit && (
              <>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/gif,application/pdf"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={files.length >= MAX_FILES}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="hidden sm:inline">Attach</span>
                  <span className="text-xs text-gray-400">
                    ({files.length}/{MAX_FILES})
                  </span>
                </button>
              </>
            )}

            {/* Internal Note Toggle - Visible for Admin AND Agent */}
            {canAddInternalNote && (
              <button
                type="button"
                onClick={() => setIsInternalNote(!isInternalNote)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isInternalNote
                    ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Internal</span>
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {(isEdit || isReply) && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && files.length === 0)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg ${
                isInternalNote
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isEdit ? "Update" : isReply ? "Reply" : "Comment"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center pointer-events-none">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg">
            <p className="font-semibold text-blue-600">Drop files here</p>
          </div>
        </div>
      )}
    </form>
  );
};

export default CommentForm;
