export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type PitchClassInfo = {
  value: PitchClass;
  letterName: string;
  solfegeNames: {
    ru: string;
    en: string;
  };
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

type LocalizedIntervalNames = {
  full: string;
  short: string;
};

export type IntervalInfo = {
  semitones: IntervalSemitones;
  names: {
    ru: LocalizedIntervalNames;
    en: LocalizedIntervalNames;
  };
};

export const PITCH_CLASSES: readonly PitchClassInfo[] = [
  {
    value: 0,
    letterName: "C",
    solfegeNames: { ru: "До", en: "Do" },
    isBlack: false,
  },
  {
    value: 1,
    letterName: "C♯/D♭",
    solfegeNames: { ru: "До♯/Ре♭", en: "Do♯/Re♭" },
    isBlack: true,
  },
  {
    value: 2,
    letterName: "D",
    solfegeNames: { ru: "Ре", en: "Re" },
    isBlack: false,
  },
  {
    value: 3,
    letterName: "D♯/E♭",
    solfegeNames: { ru: "Ре♯/Ми♭", en: "Re♯/Mi♭" },
    isBlack: true,
  },
  {
    value: 4,
    letterName: "E",
    solfegeNames: { ru: "Ми", en: "Mi" },
    isBlack: false,
  },
  {
    value: 5,
    letterName: "F",
    solfegeNames: { ru: "Фа", en: "Fa" },
    isBlack: false,
  },
  {
    value: 6,
    letterName: "F♯/G♭",
    solfegeNames: { ru: "Фа♯/Соль♭", en: "Fa♯/Sol♭" },
    isBlack: true,
  },
  {
    value: 7,
    letterName: "G",
    solfegeNames: { ru: "Соль", en: "Sol" },
    isBlack: false,
  },
  {
    value: 8,
    letterName: "G♯/A♭",
    solfegeNames: { ru: "Соль♯/Ля♭", en: "Sol♯/La♭" },
    isBlack: true,
  },
  {
    value: 9,
    letterName: "A",
    solfegeNames: { ru: "Ля", en: "La" },
    isBlack: false,
  },
  {
    value: 10,
    letterName: "A♯/B♭",
    solfegeNames: { ru: "Ля♯/Си♭", en: "La♯/Si♭" },
    isBlack: true,
  },
  {
    value: 11,
    letterName: "B",
    solfegeNames: { ru: "Си", en: "Si" },
    isBlack: false,
  },
];

export const INTERVALS: readonly IntervalInfo[] = [
  {
    semitones: 1,
    names: {
      ru: { full: "малая секунда", short: "м2" },
      en: { full: "minor second", short: "m2" },
    },
  },
  {
    semitones: 2,
    names: {
      ru: { full: "большая секунда", short: "б2" },
      en: { full: "major second", short: "M2" },
    },
  },
  {
    semitones: 3,
    names: {
      ru: { full: "малая терция", short: "м3" },
      en: { full: "minor third", short: "m3" },
    },
  },
  {
    semitones: 4,
    names: {
      ru: { full: "большая терция", short: "б3" },
      en: { full: "major third", short: "M3" },
    },
  },
  {
    semitones: 5,
    names: {
      ru: { full: "чистая кварта", short: "ч4" },
      en: { full: "perfect fourth", short: "P4" },
    },
  },
  {
    semitones: 6,
    names: {
      ru: { full: "тритон", short: "тритон" },
      en: { full: "tritone", short: "TT" },
    },
  },
  {
    semitones: 7,
    names: {
      ru: { full: "чистая квинта", short: "ч5" },
      en: { full: "perfect fifth", short: "P5" },
    },
  },
  {
    semitones: 8,
    names: {
      ru: { full: "малая секста", short: "м6" },
      en: { full: "minor sixth", short: "m6" },
    },
  },
  {
    semitones: 9,
    names: {
      ru: { full: "большая секста", short: "б6" },
      en: { full: "major sixth", short: "M6" },
    },
  },
  {
    semitones: 10,
    names: {
      ru: { full: "малая септима", short: "м7" },
      en: { full: "minor seventh", short: "m7" },
    },
  },
  {
    semitones: 11,
    names: {
      ru: { full: "большая септима", short: "б7" },
      en: { full: "major seventh", short: "M7" },
    },
  },
  {
    semitones: 12,
    names: {
      ru: { full: "чистая октава", short: "ч8" },
      en: { full: "perfect octave", short: "P8" },
    },
  },
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
