import { Midi, Track } from "@tonejs/midi";
import { Note as LibNote } from "@tonejs/midi/dist/Note";

import NotesProcessor from "./notes-processor";
import { Note, Segment } from ".";
import SimpleMidi from "./simple-midi";

export const MAX_BREATH_SECONDS = 7;

export const getValidTracks = (midi: Midi) => {
  return midi.tracks.filter(
    (track: Track) => track.notes.length > 0 && track.channel >= 0
  );
};

export const shiftMidi = (midi: Midi, amount: number) => {
  for (const track of midi.tracks) {
    for (const note of track.notes) {
      note.time += amount;
    }
  }
};

export const getSimplePartitioningArray = (arr: number[]): number[] => {
  return arr
    .map((num: number, index: number) => (index === 0 || num !== 0 ? index : 0))
    .filter((num: number, index: number) => index === 0 || num !== 0);
};

export const getPartitioningArrayWithMax = (
  arr: number[],
  max: number
): number[] => {
  const dividingIndicies: number[] = [];
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (sum > max || i === 0) {
      dividingIndicies.push(i);
      sum = arr[i];
    }
  }
  return dividingIndicies;
};

export const sliceAndDice = <T>(
  arr: T[],
  indicesToSliceAt: number[]
): T[][] => {
  let ret: T[][] = [];
  for (let i = 0; i < indicesToSliceAt.length; i++) {
    const partitionIndex: number = indicesToSliceAt[i];
    const nextPartitionIndex: number = indicesToSliceAt[i + 1];
    ret.push(arr.slice(partitionIndex, nextPartitionIndex));
  }
  return ret;
};

export const getBeatLength = (bpm: number) => 1 / (bpm / 60);

export const getDurationOfNotes = (notes: Note[]): number => {
  const startTime = notes[0].time;
  const lastNote = notes[notes.length - 1];
  const { time, duration } = lastNote;
  return time + duration - startTime;
};

export const base64ToBinary = (base64String: string): ArrayBuffer =>
  Buffer.from(base64String, "base64").toString("binary") as any;

export const processMidiFile = (midi: SimpleMidi): Segment[] => {
  const beatLength = getBeatLength(midi.simpleBpm);
  const shift = beatLength * 2;
  shiftMidi(midi, shift);

  const tracks: Track[] = getValidTracks(midi);
  const segmentInfos: Segment[] = [];

  // segmentize
  tracks.forEach((track: Track) => {
    const notesGroupedOnRests = NotesProcessor.groupNotesOnRests(track.notes);
    const divisions = NotesProcessor.subdivideUnderMaxBreath(
      notesGroupedOnRests,
      MAX_BREATH_SECONDS
    );

    // clump them together
    const finalDivisions = NotesProcessor.clumpTogether(
      divisions,
      MAX_BREATH_SECONDS
    );

    finalDivisions.forEach((notes: LibNote[]) => {
      const offset = getSegmentOffset(notes[0].time, beatLength, shift);

      let lowestNote = Infinity;
      let highestNote = -Infinity;
      const finalNotes: Note[] = notes.map((note: LibNote) => {
        lowestNote = Math.min(lowestNote, note.midi);
        highestNote = Math.max(highestNote, note.midi);
        return {
          midi: note.midi,
          duration: note.duration,
          velocity: note.velocity,
          time: note.time - offset,
        };
      });

      segmentInfos.push({
        bpm: midi.simpleBpm,
        offset,
        notes: finalNotes,
        lowestNote,
        highestNote,
      });
    });
  });

  return segmentInfos;
};

export function getSegmentOffset(
  firstNoteStart: number,
  beatLength: number,
  shift: number
) {
  const minimumOffset = firstNoteStart - (firstNoteStart % beatLength);
  const offset = minimumOffset - shift;
  return offset;
}
