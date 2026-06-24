import type { PitchClass } from "./music";

export type NoteTrainingConfig = {
  pitchClasses: PitchClass[];
  durationMinutes: number;
};

export type NoteTrainingConfigErrors = Partial<
  Record<"pitchClasses" | "durationMinutes", string>
>;

export const DEFAULT_NOTE_TRAINING_CONFIG: NoteTrainingConfig = {
  pitchClasses: [0],
  durationMinutes: 5,
};

export function validateNoteTrainingConfig(
  config: NoteTrainingConfig,
): NoteTrainingConfigErrors {
  const errors: NoteTrainingConfigErrors = {};

  if (config.pitchClasses.length === 0) {
    errors.pitchClasses = "Выберите хотя бы одну ноту.";
  }

  if (
    !Number.isInteger(config.durationMinutes) ||
    config.durationMinutes < 1 ||
    config.durationMinutes > 60
  ) {
    errors.durationMinutes = "Укажите целое число от 1 до 60 минут.";
  }

  return errors;
}

export function isNoteTrainingConfigValid(
  config: NoteTrainingConfig,
): boolean {
  return Object.keys(validateNoteTrainingConfig(config)).length === 0;
}
