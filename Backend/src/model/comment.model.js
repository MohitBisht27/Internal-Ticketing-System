import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
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
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
