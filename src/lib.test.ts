import { describe, expect, it } from "vitest";
import { dateKey, daysInclusive, distanceMeters, formatCurrency, generatePassword } from "./lib";

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

  it("counts leave dates inclusively and rejects reversed periods", () => {
    expect(daysInclusive("2026-08-28", "2026-08-30")).toBe(3);
    expect(daysInclusive("2026-08-30", "2026-08-28")).toBe(0);
  });
});
