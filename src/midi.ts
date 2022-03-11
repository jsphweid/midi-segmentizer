import { Midi as ToneJsMidi } from "@tonejs/midi";
import { Note } from ".";

class Midi extends ToneJsMidi {
  readonly simpleBpm: number;

  private constructor(buffer: ArrayBuffer, bpm: number) {
    super(buffer);
    this.simpleBpm = bpm;
  }

  public static fromBuffer(buffer: ArrayBuffer): Midi | null {
    try {
      const midi = new ToneJsMidi(buffer);
      const bpm = midi.header.tempos[0].bpm;
      return new Midi(buffer, bpm);
    } catch (e) {
      console.info("Buffer isn't valid Midi or SimpleMidi");
      console.info(e);
      return null;
    }
  }

  public static fromBase64(str: string) {
    return Midi.fromBuffer(Buffer.from(str, "base64"));
  }

  public getAllNotes(): Note[] {
    const res = [] as Note[];
    for (const track of this.tracks) {
      for (const note of track.notes) {
        res.push({
          time: note.time,
          midi: note.midi,
          duration: note.duration,
          velocity: note.velocity,
        });
      }
    }
    return res;
  }
}

export default Midi;
