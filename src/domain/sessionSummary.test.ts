import { describe, expect, it } from "vitest";
import { createSessionSummary } from "./sessionSummary";

describe("session summary", () => {
  it("includes missed tasks in total accuracy", () => {
    expect(
      createSessionSummary(
        { correctAnswers: 2, wrongAttempts: 1, missedTasks: 1 },
        60,
        60,
        false,
      ).accuracyPercent,
    ).toBe(50);
  });

  it("returns zero accuracy when there were no attempts", () => {
    expect(
      createSessionSummary(
        { correctAnswers: 0, wrongAttempts: 0, missedTasks: 0 },
        60,
        0,
        true,
      ).accuracyPercent,
    ).toBe(0);
  });
});

