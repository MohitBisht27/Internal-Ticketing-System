import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/**
 * Generate a signed JWT access token for test purposes.
 * @param {object} payload - Fields to embed in the token.
 * @returns {string} Signed JWT.
 */
export const generateToken = (payload = {}) => {
  return jwt.sign(
    {
      _id: payload._id || new mongoose.Types.ObjectId().toString(),
      role: "employee",
      ...payload,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" },
  );
};

/**
 * Build a mock user object (not persisted to DB).
 * @param {object} overrides - Field overrides.
 * @returns {object} Mock user.
 */
export const buildMockUser = (overrides = {}) => {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    fullName: "Test User",
    username: "testuser",
    email: "test@example.com",
    department: "IT",
    role: "employee",
    isActive: true,
    avatar: {
      url: "https://test.example.com/avatar.jpg",
      public_id: "test_pub_id",
    },
    refreshToken: null,
    isPasswordCorrect: async (pw) => pw === "Password123!",
    generateAccessToken: () =>
      jwt.sign({ _id: id, role: overrides.role || "employee" }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      }),
    generateRefreshToken: () =>
      jwt.sign({ _id: id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
      }),
    save: async () => {},
    populate: async () => {},
    ...overrides,
  };
};

/**
 * Build a mock ticket object (not persisted to DB).
 * @param {string|ObjectId} createdBy - Creator user id.
 * @param {object} overrides - Field overrides.
 * @returns {object} Mock ticket.
 */
export const buildMockTicket = (createdBy, overrides = {}) => {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    ticketId: `TIC-${Math.floor(100000 + Math.random() * 900000)}`,
    title: "Test Ticket",
    description: "Test description",
    category: "Software",
    priority: "medium",
    status: "open",
    createdBy,
    assignedTo: null,
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    isOverdue: false,
    attachments: [],
    tags: [],
    save: async function () {
      return this;
    },
    populate: async function () {
      return this;
    },
    ...overrides,
  };
};

/**
 * Build a mock comment object (not persisted to DB).
 * @param {object} overrides - Field overrides.
 * @returns {object} Mock comment.
 */
export const buildMockComment = (overrides = {}) => {
  const id = overrides._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    ticket: overrides.ticket || new mongoose.Types.ObjectId(),
    author: overrides.author || new mongoose.Types.ObjectId(),
    content: "Test comment",
    isInternalNote: false,
    type: "message",
    attachments: [],
    parentComment: null,
    editedAt: null,
    lastEditedBy: null,
    populate: async function () {
      return this;
    },
    ...overrides,
  };
};
