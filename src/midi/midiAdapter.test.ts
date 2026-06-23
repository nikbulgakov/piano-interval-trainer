import { describe, expect, it } from "vitest";
import {
  describeMidiAccessFailure,
  parseMidiMessage,
} from "./midiAdapter";

describe("parseMidiMessage", () => {
  it("parses Note On and keeps the MIDI channel", () => {
    expect(parseMidiMessage([0x92, 60, 100])).toEqual({
      type: "noteon",
      note: 60,
      velocity: 100,
      channel: 2,
    });
  });

  it("parses an explicit Note Off", () => {
    expect(parseMidiMessage([0x80, 64, 32])).toEqual({
      type: "noteoff",
      note: 64,
      velocity: 32,
      channel: 0,
    });
  });

  it("treats Note On with zero velocity as Note Off", () => {
    expect(parseMidiMessage([0x9f, 67, 0])).toEqual({
      type: "noteoff",
      note: 67,
      velocity: 0,
      channel: 15,
    });
  });

  it("ignores control changes and incomplete data", () => {
    expect(parseMidiMessage([0xb0, 64, 127])).toBeNull();
    expect(parseMidiMessage([0x90, 60])).toBeNull();
  });

  it("ignores invalid note and velocity values", () => {
    expect(parseMidiMessage([0x90, 128, 100])).toBeNull();
    expect(parseMidiMessage([0x90, 60, 200])).toBeNull();
  });
});

describe("describeMidiAccessFailure", () => {
  it("returns a recoverable permission message for denied access", () => {
    const failure = describeMidiAccessFailure(
      new DOMException("Denied", "NotAllowedError"),
    );

    expect(failure.status).toBe("denied");
    expect(failure.message).toContain("настройках сайта");
  });

  it("uses a generic retry message for other failures", () => {
    expect(describeMidiAccessFailure(new Error("Disconnected"))).toEqual({
      status: "error",
      message: "Не удалось подключиться к MIDI. Попробуйте ещё раз.",
    });
  });
});
