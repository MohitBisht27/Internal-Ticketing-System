import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError.js";

// Mock User model so middleware tests don't need a real DB connection
vi.mock("../../model/user.model.js", () => ({
  User: {
    findById: vi.fn(),
  },
}));

import { User } from "../../model/user.model.js";
import { verifyJWT, checkRole } from "../../middlewares/auth.middleware.js";

const ACCESS_SECRET = "test-access-secret-key-123";

const makeReqResNext = (overrides = {}) => {
  const req = { header: vi.fn(), cookies: {}, ...overrides };
  const res = {};
  const next = vi.fn();
  return { req, res, next };
};

describe("verifyJWT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 401 when Authorization header is missing", async () => {
    const { req, res, next } = makeReqResNext();
    req.header.mockReturnValue(undefined);

    await expect(verifyJWT(req, res, next)).rejects.toMatchObject({
      statsCode: 401,
    });
  });

  it("throws 401 when token is empty after removing 'Bearer ' prefix", async () => {
    const { req, res, next } = makeReqResNext();
    req.header.mockReturnValue("Bearer ");

    await expect(verifyJWT(req, res, next)).rejects.toMatchObject({
      statsCode: 401,
    });
  });

  it("throws 401 with 'TokenExpired' message for expired tokens", async () => {
    const { req, res, next } = makeReqResNext();
    const expiredToken = jwt.sign(
      { _id: "abc", role: "employee" },
      ACCESS_SECRET,
      { expiresIn: "0s" },
    );
    req.header.mockReturnValue(`Bearer ${expiredToken}`);

    await expect(verifyJWT(req, res, next)).rejects.toMatchObject({
      message: "TokenExpired",
    });
  });

  it("throws 401 when the token is signed with a wrong secret", async () => {
    const { req, res, next } = makeReqResNext();
    const badToken = jwt.sign({ _id: "abc" }, "wrong-secret");
    req.header.mockReturnValue(`Bearer ${badToken}`);

    await expect(verifyJWT(req, res, next)).rejects.toMatchObject({
      statsCode: 401,
    });
  });

  it("throws 401 when user is not found in the database", async () => {
    const { req, res, next } = makeReqResNext();
    const token = jwt.sign({ _id: "user123", role: "employee" }, ACCESS_SECRET, {
      expiresIn: "1d",
    });
    req.header.mockReturnValue(`Bearer ${token}`);
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    await expect(verifyJWT(req, res, next)).rejects.toMatchObject({
      statsCode: 401,
    });
  });

  it("attaches req.user and calls next() for a valid token", async () => {
    const { req, res, next } = makeReqResNext();
    const fakeUser = { _id: "user123", role: "employee" };
    const token = jwt.sign({ _id: "user123", role: "employee" }, ACCESS_SECRET, {
      expiresIn: "1d",
    });
    req.header.mockReturnValue(`Bearer ${token}`);
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(fakeUser),
    });

    await verifyJWT(req, res, next);

    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });

  it("accepts token with case-insensitive 'BEARER' prefix", async () => {
    const { req, res, next } = makeReqResNext();
    const fakeUser = { _id: "user123", role: "employee" };
    const token = jwt.sign({ _id: "user123" }, ACCESS_SECRET, { expiresIn: "1d" });
    req.header.mockReturnValue(`BEARER ${token}`);
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(fakeUser),
    });

    await verifyJWT(req, res, next);

    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("checkRole", () => {
  it("throws 401 when req.user is not set", async () => {
    const { req, res, next } = makeReqResNext({ user: undefined });
    const middleware = checkRole(["admin"]);

    await expect(middleware(req, res, next)).rejects.toMatchObject({
      statsCode: 401,
    });
  });

  it("throws 403 when the user role is not in the allowed list", async () => {
    const { req, res, next } = makeReqResNext({
      user: { role: "employee" },
    });
    const middleware = checkRole(["admin", "agent"]);

    await expect(middleware(req, res, next)).rejects.toMatchObject({
      statsCode: 403,
    });
  });

  it("calls next() when the user role is allowed", async () => {
    const { req, res, next } = makeReqResNext({ user: { role: "admin" } });
    const middleware = checkRole(["admin", "agent"]);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() when user has any of multiple allowed roles", async () => {
    const { req, res, next } = makeReqResNext({ user: { role: "agent" } });
    const middleware = checkRole(["admin", "agent"]);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
