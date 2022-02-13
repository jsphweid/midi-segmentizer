import { Note } from "@tonejs/midi/dist/Note";

import {
  getSimplePartitioningArray,
  getPartitioningArrayWithMax,
  sliceAndDice,
  getDurationOfNotes
} from "./helpers";

export default class NotesProcessor {
  public static getTimeDifferenceArray = (notes: Note[]): number[] => {
    const diffArray: number[] = [0];
    for (let i = 1; i < notes.length; i++) {
      const previousNote = notes[i - 1];
      const diff = notes[i].time - (previousNote.duration + previousNote.time);
      diffArray.push(diff);
    }
    return diffArray;
  };

  public static groupNotesOnRests = (notes: Note[]): Note[][] => {
    const diffArray = NotesProcessor.getTimeDifferenceArray(notes);
    const partitioningArray = getSimplePartitioningArray(diffArray);
    return sliceAndDice(notes, partitioningArray);
  };

  public static subdivideUnderMaxBreath = (
    noteGroupings: Note[][],
    maxBreathSeconds: number
  ): Note[][] => {
    let finalNotes: Note[][] = [];
    noteGroupings.forEach((notes: Note[]) => {
      // assumes notes are touching... bad strategy
      const lengthsOfEachNote = notes.map((note: Note) => note.duration);
      const recommendedSubdivisionIndicies = getPartitioningArrayWithMax(
        lengthsOfEachNote,
        maxBreathSeconds
      );
      finalNotes = [
        ...finalNotes,
        ...sliceAndDice(notes, recommendedSubdivisionIndicies)
      ];
    });
    return finalNotes;
  };

  public static clumpTogether = (
    noteGroupings: Note[][],
    maxBreathSeconds: number
  ) => {
    let finalNotes: Note[][] = [];
    let tempNotes: Note[] = [];
    noteGroupings.forEach((notes: Note[]) => {
      const optimisticNotes = [...tempNotes, ...notes];
      if (getDurationOfNotes(optimisticNotes) < maxBreathSeconds) {
        tempNotes = [...tempNotes, ...notes];
      } else {
        finalNotes.push(tempNotes);
        tempNotes = notes;
      }
    });
    if (tempNotes.length) {
      finalNotes.push(tempNotes);
    }
    return finalNotes;
  };
}
