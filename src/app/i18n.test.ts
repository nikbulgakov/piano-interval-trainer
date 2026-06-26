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
});
