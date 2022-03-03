import { Note as LibNote } from "@tonejs/midi/dist/Note";

import {
  getSimplePartitioningArray,
  getPartitioningArrayWithMax,
  sliceAndDice,
  getDurationOfNotes,
} from "./helpers";

export default class NotesProcessor {
  public static getTimeDifferenceArray = (notes: LibNote[]): number[] => {
    const diffArray: number[] = [0];
    for (let i = 1; i < notes.length; i++) {
      const previousNote = notes[i - 1];
      const diff = notes[i].time - (previousNote.duration + previousNote.time);
      diffArray.push(diff);
    }
    return diffArray;
  };

  public static groupNotesOnRests = (notes: LibNote[]): LibNote[][] => {
    const diffArray = NotesProcessor.getTimeDifferenceArray(notes);
    const partitioningArray = getSimplePartitioningArray(diffArray);
    return sliceAndDice(notes, partitioningArray);
  };

  public static subdivideUnderMaxBreath = (
    noteGroupings: LibNote[][],
    maxBreathSeconds: number
  ): LibNote[][] => {
    let finalNotes: LibNote[][] = [];
    noteGroupings.forEach((notes: LibNote[]) => {
      // assumes notes are touching... bad strategy
      const lengthsOfEachNote = notes.map((note: LibNote) => note.duration);
      const recommendedSubdivisionIndicies = getPartitioningArrayWithMax(
        lengthsOfEachNote,
        maxBreathSeconds
      );
      finalNotes = [
        ...finalNotes,
        ...sliceAndDice(notes, recommendedSubdivisionIndicies),
      ];
    });
    return finalNotes;
  };

  public static clumpTogether = (
    noteGroupings: LibNote[][],
    maxBreathSeconds: number
  ) => {
    let finalNotes: LibNote[][] = [];
    let tempNotes: LibNote[] = [];
    noteGroupings.forEach((notes: LibNote[]) => {
      const optimisticNotes = [...tempNotes, ...notes];
      if (getDurationOfNotes(optimisticNotes) <= maxBreathSeconds) {
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
