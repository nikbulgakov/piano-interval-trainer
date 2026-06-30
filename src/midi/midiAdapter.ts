export type MidiNoteEvent = {
  type: "noteon" | "noteoff";
  note: number;
  velocity: number;
  channel: number;
};

export type MidiMessageLike = {
  data: ArrayLike<number>;
};

export type MidiInputLike = {
  id: string;
  name: string | null;
  manufacturer: string | null;
  state: "connected" | "disconnected";
  onmidimessage: ((event: MidiMessageLike) => void) | null;
  open?: () => Promise<unknown>;
};

export type MidiAccessLike = {
  inputs: {
    forEach: (callback: (input: MidiInputLike) => void) => void;
  };
  onstatechange: (() => void) | null;
};

export type MidiAccessFailure = {
  status: "denied" | "error";
  message: string;
};

type NavigatorWithMidi = Navigator & {
  requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<MidiAccessLike>;
};

export function parseMidiMessage(data: ArrayLike<number>): MidiNoteEvent | null {
  if (data.length < 3) {
    return null;
  }

  const status = data[0];
  const note = data[1];
  const velocity = data[2];

  if (
    status === undefined ||
    note === undefined ||
    velocity === undefined ||
    note < 0 ||
    note > 127 ||
    velocity < 0 ||
    velocity > 127
  ) {
    return null;
  }

  const command = status & 0xf0;
  const channel = status & 0x0f;

  if (command === 0x90) {
    return {
      type: velocity === 0 ? "noteoff" : "noteon",
      note,
      velocity,
      channel,
    };
  }

  if (command === 0x80) {
    return { type: "noteoff", note, velocity, channel };
  }

  return null;
}

export function getRequestMidiAccess():
  | NavigatorWithMidi["requestMIDIAccess"]
  | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return (navigator as NavigatorWithMidi).requestMIDIAccess;
}

export function describeMidiAccessFailure(error: unknown): MidiAccessFailure {
  const errorName = error instanceof DOMException ? error.name : "";

  if (errorName === "NotAllowedError" || errorName === "SecurityError") {
    return {
      status: "denied",
      message: "midi.error.accessDenied",
    };
  }

  return {
    status: "error",
    message: "midi.error.connectionFailed",
  };
}
