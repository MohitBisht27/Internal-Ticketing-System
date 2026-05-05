import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app.js";
import { generateToken, buildMockUser, buildMockTicket } from "../helpers.js";

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock("../../model/user.model.js", () => ({
  User: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../../model/ticket.model.js", () => ({
  Ticket: {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    find: vi.fn(),
    aggregate: vi.fn(),
    countDocuments: vi.fn(),
    updateMany: vi.fn(),
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

// ─── Auth helpers ────────────────────────────────────────────────────────────

const mockAuthUser = (user) => {
  User.findById.mockImplementation(() => ({
    select: vi.fn().mockResolvedValue(user),
  }));
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createTicket ─────────────────────────────────────────────────────────────

describe("Ticket Controller - POST /tickets (createTicket)", () => {
  it("creates a ticket successfully as an employee", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id, { title: "My Laptop Broken" });
    ticket.populate = vi.fn().mockResolvedValue(ticket);
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);
    Ticket.create.mockResolvedValue(ticket);

    const res = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "My Laptop Broken",
        description: "Screen flickering since morning.",
        category: "Hardware",
        priority: "high",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("My Laptop Broken");
  });

  it("returns 400 when required fields are missing", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Incomplete" });

    expect(res.status).toBe(400);
  });

  it("returns 403 when an agent tries to create a ticket", async () => {
    const agent = buildMockUser({ role: "agent" });
    const token = generateToken({ _id: agent._id, role: "agent" });
    mockAuthUser(agent);

    const res = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Agent ticket",
        description: "Should fail.",
        category: "Software",
      });

    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid category", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Bad category",
        description: "Invalid category.",
        category: "InvalidCategory",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid priority level", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Bad priority",
        description: "Invalid priority.",
        category: "Software",
        priority: "urgent",
      });

    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).post("/api/v1/tickets").send({
      title: "T",
      description: "D",
      category: "Software",
    });
    expect(res.status).toBe(401);
  });
});

// ─── getTickets ───────────────────────────────────────────────────────────────

describe("Ticket Controller - GET /tickets (getTickets)", () => {
  it("returns tickets for the authenticated user", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    Ticket.aggregate.mockResolvedValue([
      {
        tickets: [buildMockTicket(employee._id)],
        total: 1,
      },
    ]);

    const res = await request(app)
      .get("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.tickets).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  it("supports pagination and filtering query params", async () => {
    const admin = buildMockUser({ role: "admin" });
    const token = generateToken({ _id: admin._id, role: "admin" });
    mockAuthUser(admin);

    Ticket.aggregate.mockResolvedValue([{ tickets: [], total: 0 }]);

    const res = await request(app)
      .get("/api/v1/tickets?page=2&limit=5&status=open")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(2);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/v1/tickets");
    expect(res.status).toBe(401);
  });
});

// ─── getTicketById ────────────────────────────────────────────────────────────

describe("Ticket Controller - GET /tickets/:ticketId (getTicketById)", () => {
  it("fetches a ticket by its ID for the owner employee", async () => {
    const employee = buildMockUser({ role: "employee" });
    const ticket = buildMockTicket(employee._id);
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    Ticket.aggregate.mockResolvedValue([
      {
        ...ticket,
        isOwnTicket: true,
        canEdit: true,
      },
    ]);

    const res = await request(app)
      .get(`/api/v1/tickets/${ticket._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 404 for a non-existent ticket", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    Ticket.aggregate.mockResolvedValue([]); // no ticket found

    const res = await request(app)
      .get(`/api/v1/tickets/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 403 when an employee accesses another user's ticket", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    Ticket.aggregate.mockResolvedValue([
      {
        ...buildMockTicket(new mongoose.Types.ObjectId()),
        isOwnTicket: false,
        canEdit: false,
      },
    ]);

    const res = await request(app)
      .get(`/api/v1/tickets/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ─── updateTicketStatus ───────────────────────────────────────────────────────

describe("Ticket Controller - PATCH /tickets/:ticketId (updateTicketStatus)", () => {
  it("allows an agent to update status from open to in-progress", async () => {
    const agent = buildMockUser({ role: "agent" });
    const ticket = buildMockTicket(new mongoose.Types.ObjectId(), {
      status: "open",
    });
    ticket.save = vi.fn().mockResolvedValue(ticket);
    ticket.populate = vi.fn().mockResolvedValue(ticket);
    const token = generateToken({ _id: agent._id, role: "agent" });
    mockAuthUser(agent);
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticket._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in-progress" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("in-progress");
  });

  it("returns 400 for an invalid status transition (open → closed)", async () => {
    const agent = buildMockUser({ role: "agent" });
    const ticket = buildMockTicket(new mongoose.Types.ObjectId(), {
      status: "open",
    });
    const token = generateToken({ _id: agent._id, role: "agent" });
    mockAuthUser(agent);
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticket._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "closed" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when status field is missing", async () => {
    const agent = buildMockUser({ role: "agent" });
    const token = generateToken({ _id: agent._id, role: "agent" });
    mockAuthUser(agent);

    const res = await request(app)
      .patch(`/api/v1/tickets/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 403 when an employee tries to update status", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .patch(`/api/v1/tickets/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in-progress" });

    expect(res.status).toBe(403);
  });

  it("returns 404 when ticket does not exist", async () => {
    const agent = buildMockUser({ role: "agent" });
    const token = generateToken({ _id: agent._id, role: "agent" });
    mockAuthUser(agent);
    Ticket.findById.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/v1/tickets/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in-progress" });

    expect(res.status).toBe(404);
  });

  it("clears isOverdue when ticket is resolved", async () => {
    const agent = buildMockUser({ role: "agent" });
    const ticket = buildMockTicket(new mongoose.Types.ObjectId(), {
      status: "in-progress",
      isOverdue: true,
      deadline: new Date(Date.now() - 1000),
    });
    ticket.save = vi.fn().mockImplementation(async function () {
      return this;
    });
    ticket.populate = vi.fn().mockResolvedValue(ticket);
    const token = generateToken({ _id: agent._id, role: "agent" });
    mockAuthUser(agent);
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticket._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(200);
    expect(res.body.data.isOverdue).toBe(false);
  });
});

// ─── assignTicket ─────────────────────────────────────────────────────────────

describe("Ticket Controller - PATCH /tickets/:ticketId/assign (assignTicket)", () => {
  it("allows admin to assign a ticket to an agent", async () => {
    const admin = buildMockUser({ role: "admin" });
    const agent = buildMockUser({ role: "agent" });
    const ticket = buildMockTicket(new mongoose.Types.ObjectId(), { status: "open" });
    ticket.save = vi.fn().mockResolvedValue(ticket);
    ticket.populate = vi.fn().mockResolvedValue(ticket);
    const token = generateToken({ _id: admin._id, role: "admin" });
    mockAuthUser(admin);

    User.findById
      .mockImplementationOnce(() => ({ select: vi.fn().mockResolvedValue(admin) })) // verifyJWT
      .mockImplementationOnce(async () => agent); // inside assignTicket
    Ticket.countDocuments.mockResolvedValue(0); // no active tickets
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticket._id}/assign`)
      .set("Authorization", `Bearer ${token}`)
      .send({ agentId: agent._id });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("in-progress");
  });

  it("returns 403 when a non-admin tries to assign a ticket", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .patch(`/api/v1/tickets/${new mongoose.Types.ObjectId()}/assign`)
      .set("Authorization", `Bearer ${token}`)
      .send({ agentId: new mongoose.Types.ObjectId() });

    expect(res.status).toBe(403);
  });

  it("returns 400 when agentId is not provided", async () => {
    const admin = buildMockUser({ role: "admin" });
    const token = generateToken({ _id: admin._id, role: "admin" });
    mockAuthUser(admin);

    const res = await request(app)
      .patch(`/api/v1/tickets/${new mongoose.Types.ObjectId()}/assign`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 when target user is not an agent", async () => {
    const admin = buildMockUser({ role: "admin" });
    const notAgent = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: admin._id, role: "admin" });

    User.findById
      .mockImplementationOnce(() => ({ select: vi.fn().mockResolvedValue(admin) })) // verifyJWT
      .mockImplementationOnce(async () => notAgent); // inside assignTicket

    const res = await request(app)
      .patch(`/api/v1/tickets/${new mongoose.Types.ObjectId()}/assign`)
      .set("Authorization", `Bearer ${token}`)
      .send({ agentId: notAgent._id });

    expect(res.status).toBe(400);
  });

  it("returns 400 when agent workload exceeds the limit", async () => {
    const admin = buildMockUser({ role: "admin" });
    const agent = buildMockUser({ role: "agent" });
    const ticket = buildMockTicket(new mongoose.Types.ObjectId());
    const token = generateToken({ _id: admin._id, role: "admin" });

    User.findById
      .mockImplementationOnce(() => ({ select: vi.fn().mockResolvedValue(admin) }))
      .mockImplementationOnce(async () => agent);
    Ticket.countDocuments.mockResolvedValue(5); // already at limit
    Ticket.findById.mockResolvedValue(ticket);

    const res = await request(app)
      .patch(`/api/v1/tickets/${ticket._id}/assign`)
      .set("Authorization", `Bearer ${token}`)
      .send({ agentId: agent._id });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/overloaded/i);
  });
});

// ─── getTicketStats ───────────────────────────────────────────────────────────

describe("Ticket Controller - GET /tickets/stats (getTicketStats)", () => {
  it("returns statistics for an employee", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    Ticket.aggregate.mockResolvedValue([
      {
        byStatus: [{ status: "open", count: 2 }],
        byPriority: [{ priority: "high", count: 1 }],
        overview: [{ total: 2, overdue: 0, resolved: 0 }],
      },
    ]);

    const res = await request(app)
      .get("/api/v1/tickets/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("byStatus");
    expect(res.body.data).toHaveProperty("byPriority");
    expect(res.body.data).toHaveProperty("overview");
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/v1/tickets/stats");
    expect(res.status).toBe(401);
  });
});

// ─── getAgentPerformance ──────────────────────────────────────────────────────

describe("Ticket Controller - GET /tickets/performance (getAgentPerformance)", () => {
  it("returns performance data for admin", async () => {
    const admin = buildMockUser({ role: "admin" });
    const token = generateToken({ _id: admin._id, role: "admin" });
    mockAuthUser(admin);

    Ticket.aggregate.mockResolvedValue([
      {
        agentId: new mongoose.Types.ObjectId(),
        agentName: "Test Agent",
        metrics: { totalAssigned: 5, resolved: 3, closed: 1, overdue: 0, resolutionRate: 60 },
      },
    ]);

    const res = await request(app)
      .get("/api/v1/tickets/performance")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns 403 for non-admin", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .get("/api/v1/tickets/performance")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ─── updateOverdueTickets ─────────────────────────────────────────────────────

describe("Ticket Controller - PATCH /tickets/update-overdue (updateOverdueTickets)", () => {
  it("marks past-deadline tickets as overdue", async () => {
    const admin = buildMockUser({ role: "admin" });
    const token = generateToken({ _id: admin._id, role: "admin" });
    mockAuthUser(admin);

    Ticket.updateMany.mockResolvedValue({ modifiedCount: 3 });

    const res = await request(app)
      .patch("/api/v1/tickets/update-overdue")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.updated).toBe(3);
  });

  it("returns 403 for non-admin", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .patch("/api/v1/tickets/update-overdue")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ─── getAllTickets (admin) ─────────────────────────────────────────────────────

describe("Ticket Controller - GET /tickets/admin/all (getAllTickets)", () => {
  it("returns paginated list for admin", async () => {
    const admin = buildMockUser({ role: "admin" });
    const token = generateToken({ _id: admin._id, role: "admin" });
    mockAuthUser(admin);

    const mockTickets = [buildMockTicket(new mongoose.Types.ObjectId())];
    Ticket.find.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockTickets),
    });
    Ticket.countDocuments.mockResolvedValue(1);

    const res = await request(app)
      .get("/api/v1/tickets/admin/all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.tickets).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  it("returns 403 for non-admin", async () => {
    const employee = buildMockUser({ role: "employee" });
    const token = generateToken({ _id: employee._id, role: "employee" });
    mockAuthUser(employee);

    const res = await request(app)
      .get("/api/v1/tickets/admin/all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
