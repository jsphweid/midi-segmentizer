import { processMidiFile } from "./helpers";
import SimpleMidi from "./simple-midi";

export interface Note {
  time: number;
  midi: number;
  duration: number;
  velocity: number;
  lyric?: string | null;
}

export interface Segment {
  offset: number;
  bpm: number;
  notes: Note[];
  highestNote: number;
  lowestNote: number;
  difficulty?: number | null;
}

export function segmentizeMidi(rawBase64Midi: string): Segment[] | null {
  const simpleMidi = SimpleMidi.fromBase64(rawBase64Midi);
  return simpleMidi ? processMidiFile(simpleMidi) : null;
}
