import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Ticket } from "../model/ticket.model.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { calculateDeadline } from "../utils/sla.js";
import mongoose from "mongoose";
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, priority, category, tags } = req.body;
  if (!title || !description || !category) {
    throw new ApiError(400, "Title, description and category are required");
  }

  if (req.user.role !== "employee") {
    throw new ApiError(403, "Only employees can raise tickets");
  }
  const validCategories = [
    "Software",
    "Hardware",
    "Network",
    "Access",
    "Other",
  ];
  const validPriorities = ["low", "medium", "high", "critical"];

  if (!validCategories.includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  if (priority && !validPriorities.includes(priority)) {
    throw new ApiError(400, "Invalid priority level");
  }
  const deadline = calculateDeadline(priority);
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadedFile = await uploadOnCloudinary(file.path);
      if (uploadedFile) {
        attachments.push({
          url: uploadedFile.url,
          public_id: uploadedFile.public_id,
        });
      }
    }
  }

  const ticket = await Ticket.create({
    title,
    description,
    priority: priority || "medium",
    category,
    tags: tags || [],
    createdBy: req.user._id,
    attachments,
    deadline,
  });
  await ticket.populate("createdBy", "fullName email");

  return res
    .status(201)
    .json(new ApiResponse(201, ticket, "Ticket raised successfully"));
});

const getTickets = asyncHandler(async (req, res) => {
  let {
    status,
    priority,
    category,
    isOverdue,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  page = Math.max(1, Number(page));
  limit = Math.min(50, Math.max(1, Number(limit)));
  const skip = (page - 1) * limit;

  // Build match conditions
  const matchStage = {};

  // Role-based access control
  if (req.user.role === "employee") {
    matchStage.createdBy = req.user._id;
  }

  if (req.user.role === "agent") {
    // Agents can see assigned tickets OR unassigned tickets in their category
    matchStage.$or = [
      { assignedTo: req.user._id },
      { assignedTo: null, status: "open" },
    ];
  }

  // Filters
  if (status) matchStage.status = status;
  if (priority) matchStage.priority = priority;
  if (category) matchStage.category = category;
  if (isOverdue === "true") matchStage.isOverdue = true;
  if (isOverdue === "false") matchStage.isOverdue = false;

  // Build sort object
  const sortStage = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const pipeline = [
    // Match stage - filter documents
    { $match: matchStage },

    // Lookup createdBy user
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [{ $project: { fullName: 1, email: 1 } }],
      },
    },
    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

    // Lookup assignedTo user
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [{ $project: { fullName: 1, email: 1 } }],
      },
    },
    { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },

    // Optional: Search on populated fields
    ...(search
      ? [
          {
            $match: {
              $or: [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { ticketId: { $regex: search, $options: "i" } },
                { "createdBy.fullName": { $regex: search, $options: "i" } },
                { "createdBy.email": { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
      : []),

    // Facet for pagination + count in single query
    {
      $facet: {
        metadata: [{ $count: "total" }],
        tickets: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
      },
    },

    // Reshape output
    {
      $project: {
        tickets: 1,
        total: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
      },
    },
  ];

  const [result] = await Ticket.aggregate(pipeline);

  const { tickets, total } = result;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
      "Tickets fetched successfully",
    ),
  );
});

const getTicketById = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  // Validate ticketId format
  const isObjectId = mongoose.Types.ObjectId.isValid(ticketId);

  const matchCondition = isObjectId
    ? { $or: [{ _id: new mongoose.Types.ObjectId(ticketId) }, { ticketId }] }
    : { ticketId };

  const pipeline = [
    { $match: matchCondition },

    // Lookup createdBy
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [{ $project: { fullName: 1, email: 1, avatar: 1 } }],
      },
    },
    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

    // Lookup assignedTo
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [{ $project: { fullName: 1, email: 1, avatar: 1 } }],
      },
    },
    { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },

    // Lookup comments with nested user lookup
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "ticket",
        as: "comments",
        pipeline: [
          { $sort: { createdAt: -1 } },
          { $limit: 20 },
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
              pipeline: [{ $project: { fullName: 1, email: 1, avatar: 1 } }],
            },
          },
          { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
        ],
      },
    },

    // Add computed fields
    {
      $addFields: {
        commentCount: { $size: "$comments" },
        isOwnTicket: { $eq: ["$createdBy._id", req.user._id] },
        canEdit: {
          $or: [
            { $eq: ["$createdBy._id", req.user._id] },
            { $in: [req.user.role, ["admin", "agent"]] },
          ],
        },
      },
    },
  ];

  const [ticket] = await Ticket.aggregate(pipeline);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Access control
  if (req.user.role === "employee" && !ticket.isOwnTicket) {
    throw new ApiError(403, "You can only access your own tickets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket fetched successfully"));
});
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { ticketId } = req.params;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  if (!["agent", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Not authorized to update ticket status");
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const validTransitions = {
    open: ["in-progress"],
    "in-progress": ["on-hold", "resolved"],
    "on-hold": ["in-progress", "resolved"],
    resolved: ["closed"],
    closed: [],
  };

  if (!validTransitions[ticket.status]?.includes(status)) {
    throw new ApiError(
      400,
      `Cannot change status from ${ticket.status} to ${status}`,
    );
  }

  ticket.status = status;

  if (
    new Date() > ticket.deadline &&
    !["resolved", "closed"].includes(status)
  ) {
    ticket.isOverdue = true;
  } else if (["resolved", "closed"].includes(status)) {
    ticket.isOverdue = false;
  }

  await ticket.save();
  await ticket.populate("createdBy assignedTo", "fullName email");

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket status updated successfully"));
});

const assignTicket = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const { ticketId } = req.params;

  if (!agentId) {
    throw new ApiError(400, "Agent ID is required");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can assign tickets");
  }

  const agent = await User.findById(agentId);

  if (!agent) {
    throw new ApiError(404, "Agent not found");
  }

  if (agent.role !== "agent") {
    throw new ApiError(
      400,
      "Tickets can only be assigned to agents, not employees or admins",
    );
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  ticket.assignedTo = agentId;

  if (ticket.status === "open") {
    ticket.status = "in-progress";
  }

  await ticket.save();
  await ticket.populate("assignedTo createdBy", "fullName email");

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket assigned successfully"));
});
const getTicketStats = asyncHandler(async (req, res) => {
  const match = req.user.role === "employee" ? { createdBy: req.user._id } : {};

  const stats = await Ticket.aggregate([
    { $match: match },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              status: "$_id",
              count: 1,
            },
          },
        ],
        byPriority: [
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              priority: "$_id",
              count: 1,
            },
          },
        ],
        overview: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              overdue: {
                $sum: { $cond: ["$isOverdue", 1, 0] },
              },
              resolved: {
                $sum: {
                  $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              total: 1,
              overdue: 1,
              resolved: 1,
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats[0], "Ticket statistics fetched successfully"),
    );
});

const getAgentPerformance = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }

  const performance = await Ticket.aggregate([
    {
      $match: {
        assignedTo: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        totalAssigned: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
          },
        },
        closed: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed"] }, 1, 0],
          },
        },
        overdue: {
          $sum: { $cond: ["$isOverdue", 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "agent",
      },
    },
    { $unwind: "$agent" },
    {
      $project: {
        _id: 0,
        agentId: "$_id",
        agentName: "$agent.fullName",
        agentEmail: "$agent.email",
        metrics: {
          totalAssigned: "$totalAssigned",
          resolved: "$resolved",
          closed: "$closed",
          overdue: "$overdue",
          resolutionRate: {
            $multiply: [{ $divide: ["$resolved", "$totalAssigned"] }, 100],
          },
        },
      },
    },
    { $sort: { "metrics.resolved": -1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        performance,
        "Agent performance fetched successfully",
      ),
    );
});

const updateOverdueTickets = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }

  const currentDate = new Date();

  const result = await Ticket.updateMany(
    {
      deadline: { $lt: currentDate },
      status: { $nin: ["resolved", "closed"] },
      isOverdue: false,
    },
    {
      $set: { isOverdue: true },
    },
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        updated: result.modifiedCount,
        message: `${result.modifiedCount} tickets marked as overdue`,
      },
      "Overdue tickets updated",
    ),
  );
});

const getAllTickets = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }

  let {
    status,
    priority,
    category,
    isOverdue,
    page = 1,
    limit = 10,
  } = req.query;

  page = Math.max(1, Number(page));
  limit = Math.min(50, Math.max(1, Number(limit)));

  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;

  if (isOverdue === "true") query.isOverdue = true;
  if (isOverdue === "false") query.isOverdue = false;

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(query)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Ticket.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
      "All tickets fetched successfully",
    ),
  );
});

export {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  getTicketStats,
  getAgentPerformance,
  updateOverdueTickets,
  getAllTickets,
};
