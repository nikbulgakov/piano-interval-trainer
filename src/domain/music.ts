export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type PitchClassInfo = {
  value: PitchClass;
  latinName: string;
  russianName: string;
  isBlack: boolean;
};

export type IntervalSemitones =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export type IntervalInfo = {
  semitones: IntervalSemitones;
  shortName: string;
  russianName: string;
};

export const PITCH_CLASSES: readonly PitchClassInfo[] = [
  { value: 0, latinName: "C", russianName: "До", isBlack: false },
  { value: 1, latinName: "C♯/D♭", russianName: "До♯/Ре♭", isBlack: true },
  { value: 2, latinName: "D", russianName: "Ре", isBlack: false },
  { value: 3, latinName: "D♯/E♭", russianName: "Ре♯/Ми♭", isBlack: true },
  { value: 4, latinName: "E", russianName: "Ми", isBlack: false },
  { value: 5, latinName: "F", russianName: "Фа", isBlack: false },
  { value: 6, latinName: "F♯/G♭", russianName: "Фа♯/Соль♭", isBlack: true },
  { value: 7, latinName: "G", russianName: "Соль", isBlack: false },
  { value: 8, latinName: "G♯/A♭", russianName: "Соль♯/Ля♭", isBlack: true },
  { value: 9, latinName: "A", russianName: "Ля", isBlack: false },
  { value: 10, latinName: "A♯/B♭", russianName: "Ля♯/Си♭", isBlack: true },
  { value: 11, latinName: "B", russianName: "Си", isBlack: false },
];

export const INTERVALS: readonly IntervalInfo[] = [
  { semitones: 1, shortName: "m2", russianName: "малая секунда" },
  { semitones: 2, shortName: "M2", russianName: "большая секунда" },
  { semitones: 3, shortName: "m3", russianName: "малая терция" },
  { semitones: 4, shortName: "M3", russianName: "большая терция" },
  { semitones: 5, shortName: "P4", russianName: "чистая кварта" },
  { semitones: 6, shortName: "TT", russianName: "тритон" },
  { semitones: 7, shortName: "P5", russianName: "чистая квинта" },
  { semitones: 8, shortName: "m6", russianName: "малая секста" },
  { semitones: 9, shortName: "M6", russianName: "большая секста" },
  { semitones: 10, shortName: "m7", russianName: "малая септима" },
  { semitones: 11, shortName: "M7", russianName: "большая септима" },
  { semitones: 12, shortName: "P8", russianName: "чистая октава" },
];

export function normalizePitchClass(value: number): PitchClass {
  return (((value % 12) + 12) % 12) as PitchClass;
}

export function getPitchClassInfo(value: number): PitchClassInfo {
  return PITCH_CLASSES[normalizePitchClass(value)];
}

export function getIntervalInfo(
  semitones: number,
): IntervalInfo | undefined {
  return INTERVALS.find((interval) => interval.semitones === semitones);
}

