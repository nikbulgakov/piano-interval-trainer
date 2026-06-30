import type { IntervalSemitones, PitchClass } from "./music";

export type TrainingMode = "sequential" | "timed";

export type TrainingConfig = {
  pitchClasses: PitchClass[];
  intervalSemitones: IntervalSemitones[];
  mode: TrainingMode;
  durationMinutes: number;
  promptPeriodSeconds: number;
};

export type TrainingConfigErrors = Partial<
  Record<
    | "pitchClasses"
    | "intervalSemitones"
    | "durationMinutes"
    | "promptPeriodSeconds",
    string
  >
>;

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  pitchClasses: [0],
  intervalSemitones: [3, 4],
  mode: "sequential",
  durationMinutes: 5,
  promptPeriodSeconds: 5,
};

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function validateTrainingConfig(
  config: TrainingConfig,
): TrainingConfigErrors {
  const errors: TrainingConfigErrors = {};

  if (config.pitchClasses.length === 0) {
    errors.pitchClasses = "validation.intervalPitchClassesRequired";
  }

  if (config.intervalSemitones.length === 0) {
    errors.intervalSemitones = "validation.intervalsRequired";
  }

  if (!isIntegerInRange(config.durationMinutes, 1, 60)) {
    errors.durationMinutes = "validation.durationMinutes";
  }

  if (
    config.mode === "timed" &&
    !isIntegerInRange(config.promptPeriodSeconds, 1, 30)
  ) {
    errors.promptPeriodSeconds = "validation.promptPeriodSeconds";
  }

  return errors;
}

export function isTrainingConfigValid(config: TrainingConfig): boolean {
  return Object.keys(validateTrainingConfig(config)).length === 0;
}
