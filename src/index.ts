import { Midi } from "@tonejs/midi";

import { processMidiFile } from "./helpers";
import SimpleMidi from "./simple-midi";

export interface Segment {
  offset: number;
  midiJson: Midi;
  midiName: string;
  highestNote: number;
  lowestNote: number;
  centerTime: number;
  difficulty?: number | null;
}

export function segmentizeMidi(rawBase64Midi: string): Segment[] | null {
  const simpleMidi = SimpleMidi.fromBase64(rawBase64Midi);
  return simpleMidi ? processMidiFile(simpleMidi) : null;
}
