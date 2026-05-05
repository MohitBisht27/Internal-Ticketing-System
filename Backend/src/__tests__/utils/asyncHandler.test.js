import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../../utils/asyncHandler.js";

describe("asyncHandler", () => {
  it("calls the wrapped handler with req, res, next", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);

    const req = { body: {} };
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes errors to next() when the handler throws", async () => {
    const error = new Error("Async failure");
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("passes errors to next() for synchronous throws inside async handler", async () => {
    const handler = vi.fn(async () => {
      throw new Error("Sync-like throw");
    });
    const wrapped = asyncHandler(handler);
    const next = vi.fn();

    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe("Sync-like throw");
  });

  it("returns a function", () => {
    const wrapped = asyncHandler(vi.fn());
    expect(typeof wrapped).toBe("function");
  });
});
