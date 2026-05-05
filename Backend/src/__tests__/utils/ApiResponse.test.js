import { describe, it, expect } from "vitest";
import { ApiResponse } from "../../utils/ApiResponse.js";

describe("ApiResponse", () => {
  it("creates a successful response (2xx)", () => {
    const res = new ApiResponse(200, { id: 1 }, "OK");
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual({ id: 1 });
    expect(res.message).toBe("OK");
    expect(res.success).toBe(true);
  });

  it("uses default message 'success'", () => {
    const res = new ApiResponse(201, null);
    expect(res.message).toBe("success");
  });

  it("sets success to false for 4xx status codes", () => {
    const res = new ApiResponse(400, null, "Bad request");
    expect(res.success).toBe(false);
  });

  it("sets success to false for 5xx status codes", () => {
    const res = new ApiResponse(500, null, "Internal server error");
    expect(res.success).toBe(false);
  });

  it("sets success to true for 3xx status codes", () => {
    const res = new ApiResponse(301, null, "Moved");
    expect(res.success).toBe(true);
  });

  it("stores the data payload correctly", () => {
    const payload = { users: [1, 2, 3], total: 3 };
    const res = new ApiResponse(200, payload);
    expect(res.data).toBe(payload);
  });

  it("handles null data", () => {
    const res = new ApiResponse(204, null, "No content");
    expect(res.data).toBeNull();
  });
});
