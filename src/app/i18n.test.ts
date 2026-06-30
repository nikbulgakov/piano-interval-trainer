import { describe, expect, it } from "vitest";
import { getText, TEXT, type TextKey } from "./i18n";

describe("i18n", () => {
  it("returns text for the selected language", () => {
    expect(getText("ru", "home.title")).toBe("Выберите тренировку");
    expect(getText("en", "home.title")).toBe("Choose a training mode");
  });

  it("has English text for every Russian text key", () => {
    const ruKeys = Object.keys(TEXT.ru).sort();
    const enKeys = Object.keys(TEXT.en).sort();

    expect(enKeys).toEqual(ruKeys);
  });

  it("keeps text keys typed", () => {
    const key: TextKey = "settings.language.title";

    expect(getText("en", key)).toBe("Interface language");
  });

  it("uses exercise display wording for notation settings", () => {
    expect(getText("ru", "settings.general.title")).toBe(
      "Отображение заданий",
    );
    expect(getText("en", "settings.general.title")).toBe("Exercise display");
    expect(getText("ru", "settings.noteNotation.russian")).toBe(
      "Сольфеджио",
    );
    expect(getText("en", "settings.noteNotation.russian")).toBe(
      "Solfège names",
    );
    expect(getText("ru", "settings.intervalNotation.symbols")).toBe(
      "Сокращения",
    );
    expect(getText("en", "settings.intervalNotation.symbols")).toBe(
      "Abbreviations",
    );
  });
});
