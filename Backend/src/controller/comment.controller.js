import mongoose from "mongoose";
import { Comment } from "../model/comment.model.js";
import { Ticket } from "../model/ticket.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const MAX_FILES = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

// Helper: Check access rights
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

// Helper: Upload files
const uploadFiles = async (files) => {
  if (!files || files.length === 0) return [];

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
      throw new ApiError(400, `File type "${file.mimetype}" is not allowed.`);
    }
  }
  const uploadPromises = files.map((file) => uploadOnCloudinary(file.path));
  const results = await Promise.all(uploadPromises);

  return results
    .filter((result) => result?.url)
    .map((result) => ({
      url: result.url,
      public_id: result.public_id,
    }));
};

export const createComment = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { content, parentComment, isInternalNote, type = "message" } = req.body;

  await checkTicketAccess(ticketId, req.user);

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) throw new ApiError(404, "Parent comment not found");
    if (parent.ticket.toString() !== ticketId) {
      throw new ApiError(400, "Parent comment is from a different ticket");
    }
  }

  const attachments = await uploadFiles(req.files);

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

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"));
});

export const getCommentsByTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  await checkTicketAccess(ticketId, req.user);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const matchStage = {
    ticket: new mongoose.Types.ObjectId(ticketId),
  };

  // Hide internal notes from regular employees/customers
  if (req.user.role === "employee") {
    matchStage.isInternalNote = false;
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { createdAt: 1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          // 1. LOOKUP: Get details of the COMMENT AUTHOR
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1, // Added: Assuming this field exists in your User model
                    email: 1,
                    role: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$author" },

          // 2. LOOKUP: Get details of the PARENT COMMENT (if it exists)
          {
            $lookup: {
              from: "comments",
              localField: "parentComment",
              foreignField: "_id",
              as: "parentComment",
              pipeline: [
                { $project: { content: 1, author: 1 } },
                // 3. NESTED LOOKUP: Get the AUTHOR of the PARENT comment
                {
                  $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author",
                    pipeline: [
                      {
                        $project: {
                          username: 1,
                          fullName: 1,
                          email: 1,
                          role: 1,
                          avatar: 1,
                        },
                      },
                    ],
                  },
                },
                { $unwind: "$author" },
              ],
            },
          },
          // Unwind parentComment, but keep it null if there is no parent
          {
            $unwind: {
              path: "$parentComment",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
  ];

  const result = await Comment.aggregate(pipeline);

  const comments = result[0].data;
  const totalComments = result[0].metadata[0]?.total || 0;

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

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  // 1. Restriction: System activities cannot be edited
  if (comment.type === "activity") {
    throw new ApiError(400, "Cannot edit system logs");
  }

  // 2. Permission Check: Must be Owner OR Admin
  const isOwner = comment.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only edit your own comments");
  }

  const updates = {};

  if (content !== undefined) {
    const trimmed = content.trim();
    if (!trimmed) throw new ApiError(400, "Comment cannot be empty");
    updates.content = trimmed;
  }

  if (isInternalNote !== undefined) {
    if (req.user.role === "admin" || req.user.role === "agent") {
      updates.isInternalNote =
        isInternalNote === true || isInternalNote === "true";
    }
  }

  // 5. Ensure there is something to update
  if (Object.keys(updates).length === 0) {
    // If a regular user sent only isInternalNote (which we ignored) and no content change
    throw new ApiError(400, "Nothing to update");
  }

  updates.editedAt = new Date();
  updates.lastEditedBy = req.user._id;

  const updatedComment = await Comment.findByIdAndUpdate(commentId, updates, {
    new: true,
  }).populate("author", "name fullName email role avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const isOwner = comment.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  if (req.user.role === "employee" && comment.isInternalNote) {
    throw new ApiError(403, "You cannot delete internal notes");
  }

  const replyCount = await Comment.countDocuments({ parentComment: commentId });

  if (replyCount > 0) {
    await Comment.deleteMany({ parentComment: commentId });
  }

  await Comment.deleteOne({ _id: commentId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});
