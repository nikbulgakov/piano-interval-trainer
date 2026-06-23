import { describe, expect, it } from "vitest";
import { formatDuration, getRemainingMilliseconds } from "./time";

describe("session time", () => {
  it("uses an absolute deadline", () => {
    expect(getRemainingMilliseconds(10_000, 4_000)).toBe(6_000);
    expect(getRemainingMilliseconds(10_000, 12_000)).toBe(0);
  });

  it("formats remaining time without negative values", () => {
    expect(formatDuration(300_000)).toBe("5:00");
    expect(formatDuration(59_001)).toBe("1:00");
    expect(formatDuration(59_000)).toBe("0:59");
    expect(formatDuration(-1)).toBe("0:00");
  });
});

