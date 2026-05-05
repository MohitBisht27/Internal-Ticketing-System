import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app.js";
import { generateToken, buildMockUser, buildMockTicket, buildMockComment } from "../helpers.js";

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock("../../model/user.model.js", () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock("../../model/ticket.model.js", () => ({
  Ticket: {
    findById: vi.fn(),
  },
}));

vi.mock("../../model/comment.model.js", () => ({
  Comment: {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    find: vi.fn(),
    aggregate: vi.fn(),
    countDocuments: vi.fn(),
    deleteMany: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock("../../utils/cloudinary.js", () => ({
  uploadOnCloudinary: vi.fn().mockResolvedValue({
    url: "https://res.cloudinary.com/test/file.jpg",
    public_id: "test_pub_id",
  }),
}));

vi.mock("cloudinary", () => ({
  v2: { config: vi.fn(), uploader: { upload: vi.fn(), destroy: vi.fn() } },
}));

vi.mock("../../middlewares/multer.middleware.js", () => ({
  upload: {
    fields: () => (req, res, next) => next(),
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => {
      req.files = [];
      next();
    },
  },
}));

// ─── Imports after mocks ─────────────────────────────────────────────────────

import { User } from "../../model/user.model.js";
import { Ticket } from "../../model/ticket.model.js";
import { Comment } from "../../model/comment.model.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockAuthUser = (user) => {
  User.findById.mockImplementation(() => ({
    select: vi.fn().mockResolvedValue(user),
  }));
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createComment ────────────────────────────────────────────────────────────

describe("Comment Controller - POST /:ticketId/comments (createComment)", () => {
  it("creates a comment on a ticket owned by the employee", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const comment = buildMockComment({ ticket: ticket._id, author: employee._id, content: "This is a comment." });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);
    Comment.create.mockResolvedValue(comment);

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "This is a comment." });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe("This is a comment.");
  });

  it("returns 400 when comment content is empty", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "   " });

    expect(res.status).toBe(400);
  });

  it("returns 400 when content is missing", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 403 when employee comments on another user's ticket", async () => {
    const employee = buildMockUser({ role: "employee" });
    const otherOwner = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(otherOwner._id); // owned by someone else
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Sneaky comment" });

    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existent ticket", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/v1/comments/${new mongoose.Types.ObjectId()}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Comment" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid ticket ID format", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .post(`/api/v1/comments/not-an-id/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Comment" });

    expect(res.status).toBe(400);
  });

  it("allows an agent to post a comment on any ticket", async () => {
    const agent = buildMockUser({ role: "agent" });
    const ticket = buildMockTicket(new mongoose.Types.ObjectId());
    const comment = buildMockComment({ ticket: ticket._id, author: agent._id, content: "Agent note." });
    const token = generateToken({ _id: agent._id, role: "agent" });

    mockAuthUser(agent);
    Ticket.findById.mockResolvedValue(ticket);
    Comment.create.mockResolvedValue(comment);

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Agent note." });

    expect(res.status).toBe(201);
  });

  it("allows agent to create an internal note", async () => {
    const agent = buildMockUser({ role: "agent" });
    const ticket = buildMockTicket(new mongoose.Types.ObjectId());
    const comment = buildMockComment({ ticket: ticket._id, author: agent._id, isInternalNote: true });
    const token = generateToken({ _id: agent._id, role: "agent" });

    mockAuthUser(agent);
    Ticket.findById.mockResolvedValue(ticket);
    Comment.create.mockResolvedValue(comment);

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Internal note.", isInternalNote: true });

    expect(res.status).toBe(201);
    expect(res.body.data.isInternalNote).toBe(true);
  });

  it("ignores isInternalNote flag for employees", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const comment = buildMockComment({ ticket: ticket._id, author: employee._id, isInternalNote: false });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);
    Comment.create.mockResolvedValue(comment);

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Not internal.", isInternalNote: true });

    expect(res.status).toBe(201);
    expect(res.body.data.isInternalNote).toBe(false);
  });

  it("returns 404 when parentComment does not exist", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);
    Comment.findById.mockResolvedValue(null); // parent not found

    const res = await request(app)
      .post(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Reply", parentComment: new mongoose.Types.ObjectId() });

    expect(res.status).toBe(404);
  });
});

// ─── getCommentsByTicket ──────────────────────────────────────────────────────

describe("Comment Controller - GET /:ticketId/comments (getCommentsByTicket)", () => {
  it("returns comments with pagination info", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);
    Comment.aggregate.mockResolvedValue([
      {
        metadata: [{ total: 1 }],
        data: [buildMockComment({ ticket: ticket._id })],
      },
    ]);

    const res = await request(app)
      .get(`/api/v1/comments/${ticket._id}/comments`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  it("supports page and limit query params", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Ticket.findById.mockResolvedValue(ticket);
    Comment.aggregate.mockResolvedValue([{ metadata: [], data: [] }]);

    const res = await request(app)
      .get(`/api/v1/comments/${ticket._id}/comments?page=1&limit=5`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.perPage).toBe(5);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get(
      `/api/v1/comments/${new mongoose.Types.ObjectId()}/comments`,
    );
    expect(res.status).toBe(401);
  });
});

// ─── updateComment ────────────────────────────────────────────────────────────

describe("Comment Controller - PATCH /:commentId (updateComment)", () => {
  it("allows comment owner to update their comment", async () => {
    const employee = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: employee._id, content: "Old" });
    const updatedComment = { ...comment, content: "Updated content", editedAt: new Date() };
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(comment);
    Comment.findByIdAndUpdate.mockReturnValue({
      populate: vi.fn().mockResolvedValue(updatedComment),
    });

    const res = await request(app)
      .patch(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Updated content" });

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe("Updated content");
  });

  it("returns 403 when non-owner non-admin tries to update", async () => {
    const owner = buildMockUser({ role: "employee" });
    const other = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: owner._id });
    const token = generateToken({ _id: other._id, role: "employee" });

    mockAuthUser(other);
    Comment.findById.mockResolvedValue(comment);

    const res = await request(app)
      .patch(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Stolen edit" });

    expect(res.status).toBe(403);
  });

  it("returns 400 when trying to edit a system activity log", async () => {
    const employee = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: employee._id, type: "activity" });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(comment);

    const res = await request(app)
      .patch(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Edit log" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when updated content is empty", async () => {
    const employee = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: employee._id });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(comment);

    const res = await request(app)
      .patch(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "  " });

    expect(res.status).toBe(400);
  });

  it("returns 400 when no updateable fields are provided (employee sends only isInternalNote)", async () => {
    const employee = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: employee._id });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(comment);

    const res = await request(app)
      .patch(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isInternalNote: true }); // ignored for employees

    expect(res.status).toBe(400);
  });

  it("returns 404 when comment does not exist", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/v1/comments/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "New content" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid comment ID format", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .patch(`/api/v1/comments/invalid-id`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "New content" });

    expect(res.status).toBe(400);
  });

  it("allows admin to update any comment", async () => {
    const admin = buildMockUser({ role: "admin" });
    const owner = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: owner._id, content: "Original" });
    const updated = { ...comment, content: "Admin edit" };
    const token = generateToken({ _id: admin._id, role: "admin" });

    mockAuthUser(admin);
    Comment.findById.mockResolvedValue(comment);
    Comment.findByIdAndUpdate.mockReturnValue({
      populate: vi.fn().mockResolvedValue(updated),
    });

    const res = await request(app)
      .patch(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Admin edit" });

    expect(res.status).toBe(200);
  });
});

// ─── deleteComment ────────────────────────────────────────────────────────────

describe("Comment Controller - DELETE /:commentId (deleteComment)", () => {
  it("allows comment owner to delete their comment", async () => {
    const employee = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: employee._id });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(comment);
    Comment.countDocuments.mockResolvedValue(0);
    Comment.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const res = await request(app)
      .delete(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Comment.deleteOne).toHaveBeenCalled();
  });

  it("also deletes all replies when parent is deleted", async () => {
    const employee = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: employee._id });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(comment);
    Comment.countDocuments.mockResolvedValue(3); // has 3 replies
    Comment.deleteMany.mockResolvedValue({ deletedCount: 3 });
    Comment.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const res = await request(app)
      .delete(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Comment.deleteMany).toHaveBeenCalled();
    expect(Comment.deleteOne).toHaveBeenCalled();
  });

  it("returns 403 when non-owner non-admin tries to delete", async () => {
    const owner = buildMockUser({ role: "employee" });
    const other = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: owner._id });
    const token = generateToken({ _id: other._id, role: "employee" });

    mockAuthUser(other);
    Comment.findById.mockResolvedValue(comment);

    const res = await request(app)
      .delete(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("allows admin to delete any comment", async () => {
    const admin = buildMockUser({ role: "admin" });
    const owner = buildMockUser({ role: "employee" });
    const comment = buildMockComment({ author: owner._id });
    const token = generateToken({ _id: admin._id, role: "admin" });

    mockAuthUser(admin);
    Comment.findById.mockResolvedValue(comment);
    Comment.countDocuments.mockResolvedValue(0);
    Comment.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const res = await request(app)
      .delete(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 404 when comment does not exist", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });

    mockAuthUser(employee);
    Comment.findById.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/v1/comments/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid comment ID format", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .delete(`/api/v1/comments/not-valid-id`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).delete(
      `/api/v1/comments/${new mongoose.Types.ObjectId()}`,
    );
    expect(res.status).toBe(401);
  });
});
