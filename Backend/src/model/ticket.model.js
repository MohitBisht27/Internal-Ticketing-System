import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Detailed description is required"],
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "on-hold", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    category: {
      type: String,
      enum: ["Software", "Hardware", "Network", "Access", "Other"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachments: [
      {
        url: String,
        public_id: String,
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true },
);

ticketSchema.pre("validate", function () {
  if (this.isNew) {
    const hours = { low: 72, medium: 48, high: 24, critical: 4 };
    this.deadline = new Date(
      Date.now() + hours[this.priority] * 60 * 60 * 1000,
    );
    this.ticketId = `TIC-${Math.floor(100000 + Math.random() * 900000)}`;
  }
});

export const Ticket = mongoose.model("Ticket", ticketSchema);
