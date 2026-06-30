import { useCallback, useEffect, useRef, useState } from "react";
import {
  describeMidiAccessFailure,
  getRequestMidiAccess,
  parseMidiMessage,
  type MidiAccessLike,
  type MidiInputLike,
  type MidiNoteEvent,
} from "./midiAdapter";
import {
  loadStoredMidiInputId,
  saveStoredMidiInputId,
} from "./midiInputStorage";

export type MidiStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "no-inputs"
  | "denied"
  | "unsupported"
  | "error";

export type MidiInputInfo = {
  id: string;
  name: string;
  manufacturer: string;
};

function toInputInfo(input: MidiInputLike): MidiInputInfo {
  return {
    id: input.id,
    name: input.name?.trim() || "",
    manufacturer: input.manufacturer?.trim() || "",
  };
}

export function useMidiInput() {
  const [inputs, setInputs] = useState<MidiInputInfo[]>([]);
  const [selectedInputId, setSelectedInputId] = useState(
    loadStoredMidiInputId,
  );
  const [activeNotes, setActiveNotes] = useState<Set<number>>(() => new Set());
  const [lastNoteEvent, setLastNoteEvent] = useState<MidiNoteEvent | null>(
    null,
  );
  const [status, setStatus] = useState<MidiStatus>(() =>
    getRequestMidiAccess() ? "idle" : "unsupported",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const midiAccessRef = useRef<MidiAccessLike | null>(null);
  const shouldAutoConnectRef = useRef(Boolean(loadStoredMidiInputId()));
  const inputPortsRef = useRef<Map<string, MidiInputLike>>(new Map());

  const refreshInputs = useCallback((access: MidiAccessLike) => {
    const nextPorts = new Map<string, MidiInputLike>();
    const storedInputId = loadStoredMidiInputId();

    access.inputs.forEach((input) => {
      if (input.state === "connected") {
        nextPorts.set(input.id, input);
      }
    });

    inputPortsRef.current = nextPorts;
    const nextInputs = Array.from(nextPorts.values(), toInputInfo);
    setInputs(nextInputs);
    setActiveNotes(new Set());

    setSelectedInputId((currentId) => {
      if (currentId && nextPorts.has(currentId)) {
        saveStoredMidiInputId(currentId);
        return currentId;
      }

      if (storedInputId && nextPorts.has(storedInputId)) {
        saveStoredMidiInputId(storedInputId);
        return storedInputId;
      }

      const fallbackInputId = nextInputs[0]?.id ?? "";

      if (fallbackInputId) {
        saveStoredMidiInputId(fallbackInputId);
      }

      return fallbackInputId;
    });

    if (storedInputId && nextInputs.length > 0 && !nextPorts.has(storedInputId)) {
      setErrorMessage("midi.error.storedInputMissing");
    } else {
      setErrorMessage("");
    }

    setStatus(nextInputs.length > 0 ? "ready" : "no-inputs");
  }, []);

  const connect = useCallback(async () => {
    const requestMidiAccess = getRequestMidiAccess();

    if (!requestMidiAccess) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    setErrorMessage("");

    try {
      const access = await requestMidiAccess.call(navigator, { sysex: false });
      const previousAccess = midiAccessRef.current;

      if (previousAccess) {
        previousAccess.onstatechange = null;
      }

      access.onstatechange = () => refreshInputs(access);
      midiAccessRef.current = access;
      refreshInputs(access);
    } catch (error) {
      const failure = describeMidiAccessFailure(error);
      setStatus(failure.status);
      setErrorMessage(failure.message);
    }
  }, [refreshInputs]);

  useEffect(() => {
    if (shouldAutoConnectRef.current) {
      shouldAutoConnectRef.current = false;
      void connect();
    }
  }, [connect]);

  useEffect(() => {
    return () => {
      const access = midiAccessRef.current;

      if (access) {
        access.onstatechange = null;
      }
    };
  }, []);

  useEffect(() => {
    const selectedPort = inputPortsRef.current.get(selectedInputId) ?? null;

    if (!selectedPort) {
      return;
    }

    const handleMidiMessage = (event: { data: ArrayLike<number> }) => {
      const noteEvent = parseMidiMessage(event.data);

      if (!noteEvent) {
        return;
      }

      setLastNoteEvent(noteEvent);

      setActiveNotes((currentNotes) => {
        const nextNotes = new Set(currentNotes);

        if (noteEvent.type === "noteon") {
          nextNotes.add(noteEvent.note);
        } else {
          nextNotes.delete(noteEvent.note);
        }

        return nextNotes;
      });
    };

    let isCurrentPort = true;

    selectedPort.onmidimessage = handleMidiMessage;
    void selectedPort.open?.()
      .then(() => {
        if (isCurrentPort) {
          setStatus("ready");
          setErrorMessage("");
        }
      })
      .catch(() => {
        if (isCurrentPort) {
          setStatus("error");
          setErrorMessage("midi.error.openInputFailed");
        }
      });

    return () => {
      isCurrentPort = false;

      if (selectedPort.onmidimessage === handleMidiMessage) {
        selectedPort.onmidimessage = null;
      }
    };
  }, [inputs, selectedInputId]);

  const selectInput = useCallback((inputId: string) => {
    setActiveNotes(new Set());
    setErrorMessage("");
    setStatus(inputPortsRef.current.has(inputId) ? "ready" : "no-inputs");
    saveStoredMidiInputId(inputId);
    setSelectedInputId(inputId);
  }, []);

  return {
    status,
    errorMessage,
    inputs,
    selectedInputId,
    setSelectedInputId: selectInput,
    activeNotes,
    lastNoteEvent,
    connect,
  };
}
