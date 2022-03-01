import { Note } from "@tonejs/midi/dist/Note";

import NotesProcessor from "./notes-processor";

describe("notes-processor", () => {
  describe("getTimeDifferenceArray", () => {
    it("should get an array of all zeros if all notes are smoothly connected but don't overlap", () => {
      const notes = [
        { time: 1, duration: 1 },
        { time: 2, duration: 2 },
        { time: 4, duration: 2 },
        { time: 6, duration: 1 },
      ] as Note[];
      expect(NotesProcessor.getTimeDifferenceArray(notes)).toEqual([
        0, 0, 0, 0,
      ]);
    });

    it("should get the correct difference array when there are negative values", () => {
      const notes = [
        { time: 1, duration: 1 },
        { time: 2, duration: 2 },
        { time: 3, duration: 5 },
        { time: 5, duration: 1 },
      ] as Note[];
      expect(NotesProcessor.getTimeDifferenceArray(notes)).toEqual([
        0, 0, -1, -3,
      ]);
    });

    it("should get the correct difference array when nothing overlaps but there is space in between", () => {
      const notes = [
        { time: 1, duration: 1 },
        { time: 3, duration: 0.5 },
        { time: 4, duration: 5 },
        { time: 14, duration: 1 },
      ] as Note[];
      expect(NotesProcessor.getTimeDifferenceArray(notes)).toEqual([
        0, 1, 0.5, 5,
      ]);
    });
  });

  describe("groupNotesOnRests", () => {
    it("should partition the notes appropriately in a basic case with no rests", () => {
      const notes = [
        { time: 1, duration: 1 },
        { time: 2, duration: 2 },
        { time: 4, duration: 2 },
        { time: 6, duration: 1 },
      ] as Note[];
      expect(NotesProcessor.groupNotesOnRests(notes)).toEqual([notes]);
    });

    it("should partition the notes correctly with a rest in between each note", () => {
      const notes = [
        { time: 1, duration: 1 },
        { time: 3, duration: 0.5 },
        { time: 4, duration: 5 },
        { time: 14, duration: 1 },
      ] as Note[];
      expect(NotesProcessor.groupNotesOnRests(notes)).toEqual([
        [{ time: 1, duration: 1 }],
        [{ time: 3, duration: 0.5 }],
        [{ time: 4, duration: 5 }],
        [{ time: 14, duration: 1 }],
      ]);
    });

    it("should partition the notes correctly with a rest in there", () => {
      const notes = [
        { time: 1, duration: 2 },
        { time: 3, duration: 0.5 },
        { time: 4, duration: 5 },
        { time: 9, duration: 1 },
      ] as Note[];
      expect(NotesProcessor.groupNotesOnRests(notes)).toEqual([
        [
          { time: 1, duration: 2 },
          { time: 3, duration: 0.5 },
        ],
        [
          { time: 4, duration: 5 },
          { time: 9, duration: 1 },
        ],
      ]);
    });
  });

  describe("clumpTogether", () => {
    it("should fill up items to max breath if pieces are small", () => {
      const notes = [
        [{ time: 1, duration: 0.5 }],
        [{ time: 2, duration: 0.5 }],
        [{ time: 3, duration: 0.5 }],
        [{ time: 4, duration: 1 }],
        [{ time: 7, duration: 0.5 }],
        [{ time: 8, duration: 0.5 }],
        [{ time: 9, duration: 0.5 }],
        [{ time: 10, duration: 1 }],
        [
          { time: 11, duration: 2 },
          { time: 13, duration: 2 },
        ],
      ] as Note[][];
      expect(NotesProcessor.clumpTogether(notes, 5)).toEqual([
        [
          { time: 1, duration: 0.5 },
          { time: 2, duration: 0.5 },
          { time: 3, duration: 0.5 },
          { time: 4, duration: 1 },
        ],
        [
          { time: 7, duration: 0.5 },
          { time: 8, duration: 0.5 },
          { time: 9, duration: 0.5 },
          { time: 10, duration: 1 },
        ],
        [
          { time: 11, duration: 2 },
          { time: 13, duration: 2 },
        ],
      ]);
    });
  });

  describe("subdivideUnderMaxBreath", () => {
    it("should partition notes further to almost nothing when max is so low", () => {
      const groupsOfNotes = [
        [
          { time: 1, duration: 2 },
          { time: 3, duration: 0.5 },
        ],
        [
          { time: 4, duration: 5 },
          { time: 9, duration: 1 },
        ],
      ] as Note[][];
      expect(NotesProcessor.subdivideUnderMaxBreath(groupsOfNotes, 2)).toEqual([
        [{ time: 1, duration: 2 }],
        [{ time: 3, duration: 0.5 }],
        [{ time: 4, duration: 5 }],
        [{ time: 9, duration: 1 }],
      ]);
    });

    it("should partition just a few places when max is higher", () => {
      const groupsOfNotes = [
        [
          { time: 1, duration: 2 },
          { time: 3, duration: 0.5 },
        ],
        [
          { time: 4, duration: 5 },
          { time: 9, duration: 1 },
        ],
      ] as Note[][];
      expect(NotesProcessor.subdivideUnderMaxBreath(groupsOfNotes, 4)).toEqual([
        [
          { time: 1, duration: 2 },
          { time: 3, duration: 0.5 },
        ],
        [{ time: 4, duration: 5 }],
        [{ time: 9, duration: 1 }],
      ]);
    });

    it("should partition correctly when there are lots of small notes", () => {
      const notes = [
        [
          { time: 1, duration: 1 },
          { time: 2, duration: 1 },
          { time: 3, duration: 1 },
          { time: 4, duration: 1 },
        ],
        [
          { time: 6, duration: 0.5 },
          { time: 6.5, duration: 0.5 },
          { time: 7, duration: 0.5 },
          { time: 7.5, duration: 1 },
          { time: 8.5, duration: 1 },
          { time: 9.5, duration: 0.5 },
        ],
      ] as Note[][];
      expect(NotesProcessor.subdivideUnderMaxBreath(notes, 2)).toEqual([
        [
          { time: 1, duration: 1 },
          { time: 2, duration: 1 },
        ],
        [
          { time: 3, duration: 1 },
          { time: 4, duration: 1 },
        ],
        [
          { time: 6, duration: 0.5 },
          { time: 6.5, duration: 0.5 },
          { time: 7, duration: 0.5 },
        ],
        [
          { time: 7.5, duration: 1 },
          { time: 8.5, duration: 1 },
        ],
        [{ time: 9.5, duration: 0.5 }],
      ]);
    });
  });
});
