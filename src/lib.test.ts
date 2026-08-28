import { describe, expect, it } from "vitest";
import { dateKey, distanceMeters, formatCurrency, generatePassword } from "./lib";

describe("utility functions", () => {
  it("formats rupiah without decimals", () => {
    expect(formatCurrency(1_250_000)).toContain("1.250.000");
  });

  it("returns near-zero distance for identical points", () => {
    expect(distanceMeters(-6.2, 106.8, -6.2, 106.8)).toBe(0);
  });

  it("creates a Jakarta date key", () => {
    expect(dateKey(new Date("2026-08-28T10:00:00Z"))).toBe("2026-08-28");
  });

  it("creates non-trivial temporary passwords", () => {
    const password = generatePassword();
    expect(password).toHaveLength(14);
    expect(generatePassword()).not.toBe(password);
  });
});
