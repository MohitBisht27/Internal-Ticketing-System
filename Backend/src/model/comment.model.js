import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: String,
        public_id: String,
      },
    ],
    isInternalNote: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["message", "activity"],
      default: "message",
    },
    editedAt: { type: Date, default: null },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);
commentSchema.index({ ticket: 1, createdAt: 1 });
commentSchema.index({ ticket: 1, isInternalNote: 1, createdAt: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
