import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRAINING_CONFIG,
  isTrainingConfigValid,
  validateTrainingConfig,
  type TrainingConfig,
} from "./trainingConfig";

function configWith(overrides: Partial<TrainingConfig>): TrainingConfig {
  return { ...DEFAULT_TRAINING_CONFIG, ...overrides };
}

describe("training config validation", () => {
  it("accepts the default sequential config", () => {
    expect(validateTrainingConfig(DEFAULT_TRAINING_CONFIG)).toEqual({});
    expect(isTrainingConfigValid(DEFAULT_TRAINING_CONFIG)).toBe(true);
  });

  it("requires notes and intervals", () => {
    const errors = validateTrainingConfig(
      configWith({ pitchClasses: [], intervalSemitones: [] }),
    );

    expect(errors.pitchClasses).toBe("validation.intervalPitchClassesRequired");
    expect(errors.intervalSemitones).toBe("validation.intervalsRequired");
  });

  it("accepts only whole session minutes from 1 to 60", () => {
    expect(validateTrainingConfig(configWith({ durationMinutes: 0 }))).toHaveProperty(
      "durationMinutes",
    );
    expect(
      validateTrainingConfig(configWith({ durationMinutes: 10.5 })),
    ).toHaveProperty("durationMinutes");
    expect(validateTrainingConfig(configWith({ durationMinutes: 60 }))).toEqual(
      {},
    );
  });

  it("validates prompt period only in timed mode", () => {
    expect(
      validateTrainingConfig(
        configWith({ mode: "sequential", promptPeriodSeconds: 0 }),
      ),
    ).toEqual({});
    expect(
      validateTrainingConfig(
        configWith({ mode: "timed", promptPeriodSeconds: 0 }),
      ),
    ).toHaveProperty("promptPeriodSeconds");
    expect(
      validateTrainingConfig(
        configWith({ mode: "timed", promptPeriodSeconds: 30 }),
      ),
    ).toEqual({});
  });
});
