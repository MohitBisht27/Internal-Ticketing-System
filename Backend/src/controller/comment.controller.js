import mongoose from "mongoose";
import { Comment } from "../model/comment.model.js";
import { Ticket } from "../model/ticket.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { io } from "../app.js";

const MAX_FILES = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const checkTicketAccess = async (ticketId, user) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new ApiError(400, "Invalid ticket ID");
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }
  if (user.role === "employee") {
    const isOwner = ticket.createdBy.toString() === user._id.toString();

    if (!isOwner) {
      throw new ApiError(403, "You don't have access to this ticket");
    }
  }

  return ticket;
};

const uploadFiles = async (files) => {
  if (!files || files.length === 0) {
    return [];
  }
  if (files.length > MAX_FILES) {
    throw new ApiError(400, `You can only upload ${MAX_FILES} files at once`);
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(
        400,
        `File "${file.originalname}" is too big. Max size is 10MB`,
      );
    }
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new ApiError(
        400,
        `File type "${file.mimetype}" is not allowed. Use JPG, PNG, GIF, or PDF`,
      );
    }
  }
  const uploadPromises = files.map((file) => uploadOnCloudinary(file.path));
  const results = await Promise.all(uploadPromises);

  const attachments = results
    .filter((result) => result?.url)
    .map((result) => ({
      url: result.url,
      public_id: result.public_id,
    }));

  return attachments;
};

const sendSocketEvent = (eventName, ticketId, data) => {
  try {
    if (data.isInternalNote) {
      io.to(`ticket:${ticketId}:staff`).emit(eventName, data);
    } else {
      io.to(`ticket:${ticketId}`).emit(eventName, data);
    }
  } catch (error) {
    console.error("Socket error:", error);
  }
};

// ==========================================
// 📝 CREATE COMMENT
// ==========================================
export const createComment = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { content, parentComment, isInternalNote, type = "message" } = req.body;

  await checkTicketAccess(ticketId, req.user);

  // Validate content
  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  // If this is a reply to another comment, check parent exists
  if (parentComment) {
    const parent = await Comment.findById(parentComment);

    if (!parent) {
      throw new ApiError(404, "Parent comment not found");
    }

    if (parent.ticket.toString() !== ticketId) {
      throw new ApiError(400, "Parent comment is from a different ticket");
    }
  }

  const attachments = await uploadFiles(req.files);

  // Only admins/agents can create internal notes
  let finalIsInternalNote = false;
  if (req.user.role === "admin" || req.user.role === "agent") {
    finalIsInternalNote = isInternalNote === true || isInternalNote === "true";
  }

  const comment = await Comment.create({
    ticket: ticketId,
    parentComment: parentComment || null,
    author: req.user._id,
    content: content.trim(),
    attachments,
    isInternalNote: finalIsInternalNote,
    type,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "name email role avatar",
  );

  sendSocketEvent("comment:new", ticketId, populatedComment);

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedComment, "Comment created successfully"),
    );
});

export const getCommentsByTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  await checkTicketAccess(ticketId, req.user);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { ticket: ticketId };

  // Employees can't see internal notes
  if (req.user.role === "employee") {
    query.isInternalNote = false;
  }

  const [comments, totalComments] = await Promise.all([
    Comment.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email role avatar"),

    Comment.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          perPage: limit,
        },
      },
      "Comments fetched successfully",
    ),
  );
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content, isInternalNote } = req.body;

  // Validate ID
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Can't edit system logs
  if (comment.type === "activity") {
    throw new ApiError(400, "Cannot edit system logs");
  }

  // Check permissions
  const isOwner = comment.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only edit your own comments");
  }

  // Build update object
  const updates = {};

  if (content !== undefined) {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new ApiError(400, "Comment cannot be empty");
    }
    updates.content = trimmed;
  }

  if (isInternalNote !== undefined) {
    // Only staff can change internal note flag
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      throw new ApiError(403, "Only staff can change internal note status");
    }
    updates.isInternalNote =
      isInternalNote === true || isInternalNote === "true";
  }

  // Must have something to update
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  // Track edit
  updates.editedAt = new Date();
  updates.lastEditedBy = req.user._id;

  // Update
  const updatedComment = await Comment.findByIdAndUpdate(commentId, updates, {
    new: true,
  }).populate("author", "name email role avatar");

  sendSocketEvent(
    "comment:update",
    updatedComment.ticket.toString(),
    updatedComment,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { force } = req.query;

  // Validate ID
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check permissions
  const isOwner = comment.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  // Employees can't delete internal notes
  if (req.user.role === "employee" && comment.isInternalNote) {
    throw new ApiError(403, "You cannot delete internal notes");
  }

  const replyCount = await Comment.countDocuments({
    parentComment: commentId,
  });

  if (replyCount > 0 && force !== "true") {
    throw new ApiError(
      400,
      `This comment has ${replyCount} ${replyCount === 1 ? "reply" : "replies"}. ` +
        `Add ?force=true to URL to delete all.`,
    );
  }

  // Delete replies first (if any)
  if (replyCount > 0) {
    await Comment.deleteMany({ parentComment: commentId });
  }

  // Delete the comment
  await Comment.deleteOne({ _id: commentId });

  sendSocketEvent("comment:delete", comment.ticket.toString(), {
    commentId,
    deletedReplies: replyCount,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});
