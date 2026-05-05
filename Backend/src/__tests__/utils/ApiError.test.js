import { describe, it, expect } from "vitest";
import { ApiError } from "../../utils/ApiError.js";

describe("ApiError", () => {
  it("creates an instance with required fields", () => {
    const err = new ApiError(404, "Not found");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statsCode).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.success).toBe(false);
    expect(err.data).toBeNull();
    expect(err.errors).toEqual([]);
  });

  it("uses default message when none is provided", () => {
    const err = new ApiError(500);
    expect(err.message).toBe("Something went Wrong");
  });

  it("stores errors array when provided", () => {
    const errors = [{ field: "email", msg: "Invalid" }];
    const err = new ApiError(400, "Validation failed", errors);
    expect(err.errors).toEqual(errors);
  });

  it("uses a custom stack trace when provided", () => {
    const customStack = "Error\n    at custom:1:1";
    const err = new ApiError(500, "Error", [], customStack);
    expect(err.stack).toBe(customStack);
  });

  it("generates a stack trace when no custom stack is provided", () => {
    const err = new ApiError(500, "Server Error");
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("ApiError");
  });

  it("always sets success to false", () => {
    const err200 = new ApiError(200, "Weird");
    expect(err200.success).toBe(false);
  });
});
