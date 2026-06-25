import type { PitchClass } from "./music";

export type NoteTrainingMode = "sequential" | "timed";

export type NoteTrainingConfig = {
  pitchClasses: PitchClass[];
  mode: NoteTrainingMode;
  durationMinutes: number;
  promptPeriodSeconds: number;
};

export type NoteTrainingConfigErrors = Partial<
  Record<"pitchClasses" | "durationMinutes" | "promptPeriodSeconds", string>
>;

export const DEFAULT_NOTE_TRAINING_CONFIG: NoteTrainingConfig = {
  pitchClasses: [0],
  mode: "sequential",
  durationMinutes: 5,
  promptPeriodSeconds: 5,
};

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function validateNoteTrainingConfig(
  config: NoteTrainingConfig,
): NoteTrainingConfigErrors {
  const errors: NoteTrainingConfigErrors = {};

  if (config.pitchClasses.length === 0) {
    errors.pitchClasses = "Выберите хотя бы одну ноту.";
  }

  if (!isIntegerInRange(config.durationMinutes, 1, 60)) {
    errors.durationMinutes = "Укажите целое число от 1 до 60 минут.";
  }

  if (
    config.mode === "timed" &&
    !isIntegerInRange(config.promptPeriodSeconds, 1, 30)
  ) {
    errors.promptPeriodSeconds = "Укажите целое число от 1 до 30 секунд.";
  }

  return errors;
}

export function isNoteTrainingConfigValid(
  config: NoteTrainingConfig,
): boolean {
  return Object.keys(validateNoteTrainingConfig(config)).length === 0;
}
