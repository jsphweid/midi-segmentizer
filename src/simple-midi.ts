import { Midi } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";

import { getValidTracks } from "./helpers";
import NotesProcessor from "./notes-processor";

function midiHasMultipleTempos(midi: Midi) {
  return midi.header.tempos.length !== 1;
}

function midiHasMultipleTimeSignatures(midi: Midi) {
  return midi.header.timeSignatures.length !== 1;
}

function midiHasNonFourBasedTimeSignature(midi: Midi) {
  return midi.header.timeSignatures[0].timeSignature[1] !== 4;
}

function isPolyphonicMidiFile(midi: Midi): boolean {
  function noteSequenceIsPolyphonic(notes: Note[]): boolean {
    const timeDiffs = NotesProcessor.getTimeDifferenceArray(notes);
    return timeDiffs.filter((num: number) => num < 0).length > 0;
  }

  return getValidTracks(midi)
    .map(track => track.notes)
    .map(noteSequenceIsPolyphonic)
    .some(b => !!b);
}

class SimpleMidi extends Midi {
  readonly simpleBpm: number;
  readonly simpleTimeSignature: number[];

  private constructor(
    buffer: ArrayBuffer,
    bpm: number,
    timeSignature: number[]
  ) {
    super(buffer);
    this.simpleBpm = bpm;
    this.simpleTimeSignature = timeSignature;
  }

  private static validateMidi(midi: Midi) {
    if (midiHasMultipleTempos(midi)) {
      throw new Error("SimpleMidi must have only 1 tempo!");
    }

    if (midiHasMultipleTimeSignatures(midi)) {
      throw new Error("SimpleMidi must have only 1 time signature!");
    }
    //
    if (midiHasNonFourBasedTimeSignature(midi)) {
      throw new Error(
        "SimpleMidi time signature must have bottom number of 4!"
      );
    }

    if (isPolyphonicMidiFile(midi)) {
      throw new Error(
        "Midi file contains polyphony. This isn't supported yet. Please make sure your midi file contains no tracks that have overlapping notes."
      );
    }
  }

  public static fromBuffer(buffer: ArrayBuffer): SimpleMidi | null {
    try {
      const midi = new Midi(buffer);
      SimpleMidi.validateMidi(midi);
      const bpm = midi.header.tempos[0].bpm;
      const timeSignature = midi.header.timeSignatures[0].timeSignature;
      return new SimpleMidi(buffer, bpm, timeSignature);
    } catch (e) {
      console.info("Buffer isn't valid Midi or SimpleMidi");
      console.info(e);
      return null;
    }
  }

  public static fromBase64(str: string) {
    return SimpleMidi.fromBuffer(Buffer.from(str, "base64"));
  }
}

export default SimpleMidi;
