import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SLA_HOURS, calculateDeadline } from "../../utils/sla.js";

describe("SLA_HOURS", () => {
  it("defines the correct hours for each priority", () => {
    expect(SLA_HOURS.low).toBe(72);
    expect(SLA_HOURS.medium).toBe(48);
    expect(SLA_HOURS.high).toBe(24);
    expect(SLA_HOURS.critical).toBe(4);
  });

  it("is frozen (immutable)", () => {
    expect(Object.isFrozen(SLA_HOURS)).toBe(true);
  });

  it("throws when attempting to mutate", () => {
    expect(() => {
      "use strict";
      SLA_HOURS.low = 999;
    }).toThrow();
  });
});

describe("calculateDeadline", () => {
  const FIXED_NOW = new Date("2024-01-01T00:00:00.000Z").getTime();

  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calculates deadline for 'low' priority (72 hours)", () => {
    const deadline = calculateDeadline("low");
    const expected = new Date(FIXED_NOW + 72 * 60 * 60 * 1000);
    expect(deadline).toEqual(expected);
  });

  it("calculates deadline for 'medium' priority (48 hours)", () => {
    const deadline = calculateDeadline("medium");
    const expected = new Date(FIXED_NOW + 48 * 60 * 60 * 1000);
    expect(deadline).toEqual(expected);
  });

  it("calculates deadline for 'high' priority (24 hours)", () => {
    const deadline = calculateDeadline("high");
    const expected = new Date(FIXED_NOW + 24 * 60 * 60 * 1000);
    expect(deadline).toEqual(expected);
  });

  it("calculates deadline for 'critical' priority (4 hours)", () => {
    const deadline = calculateDeadline("critical");
    const expected = new Date(FIXED_NOW + 4 * 60 * 60 * 1000);
    expect(deadline).toEqual(expected);
  });

  it("defaults to 'medium' (48 hours) when no priority is given", () => {
    const deadline = calculateDeadline();
    const expected = new Date(FIXED_NOW + 48 * 60 * 60 * 1000);
    expect(deadline).toEqual(expected);
  });

  it("defaults to 'medium' (48 hours) for an unknown priority", () => {
    const deadline = calculateDeadline("unknown");
    const expected = new Date(FIXED_NOW + 48 * 60 * 60 * 1000);
    expect(deadline).toEqual(expected);
  });

  it("returns a Date object", () => {
    expect(calculateDeadline("high")).toBeInstanceOf(Date);
  });
});
