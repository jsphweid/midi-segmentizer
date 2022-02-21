import { Midi, Track } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";

import NotesProcessor from "./notes-processor";
import { Segment } from ".";
import SimpleMidi from "./simple-midi";

export const MAX_BREATH_SECONDS = 4;

export const getValidTracks = (midi: Midi) => {
  return midi.tracks.filter(
    (track: Track) => track.notes.length > 0 && track.channel >= 0
  );
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

export const determineMeasureLength = (
  bpm: number,
  timeSignature: number[]
): number => {
  const secondsPerBeat = 1 / (bpm / 60);
  return timeSignature[0] * secondsPerBeat;
};

export const getDurationOfNotes = (notes: Note[]): number => {
  const startTime = notes[0].time;
  const lastNote = notes[notes.length - 1];
  const { time, duration } = lastNote;
  return time + duration - startTime;
};

export const base64ToBinary = (base64String: string): ArrayBuffer =>
  Buffer.from(base64String, "base64").toString("binary") as any;

export const processMidiFile = (midi: SimpleMidi): Segment[] => {
  const tracks: Track[] = getValidTracks(midi);
  const measureLengthInSeconds = determineMeasureLength(
    midi.simpleBpm,
    midi.simpleTimeSignature
  );
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

    finalDivisions.forEach((notes: Note[]) => {
      const firstNoteStartTime = notes[0].time;
      const lastNoteStartTime = notes[notes.length - 1].time;
      const offset =
        firstNoteStartTime - (firstNoteStartTime % measureLengthInSeconds);

      const midiJson = new Midi();
      midiJson.header = midi.header;
      const midiTrack = midiJson.addTrack();
      midiTrack.channel = track.channel;
      midiTrack.instrument = track.instrument;

      let lowestNote = Infinity;
      let highestNote = -Infinity;
      notes.forEach((note: Note) => {
        lowestNote = Math.min(lowestNote, note.midi);
        highestNote = Math.max(highestNote, note.midi);
        midiTrack.addNote({
          midi: note.midi,
          duration: note.duration,
          velocity: note.velocity,
          time: note.time - offset,
        });
      });

      segmentInfos.push({
        offset,
        midiJson,
        lowestNote,
        highestNote,
        midiName: midi.header.name,
        centerTime: (lastNoteStartTime - firstNoteStartTime) / 2,
      });
    });
  });

  return segmentInfos;
};
