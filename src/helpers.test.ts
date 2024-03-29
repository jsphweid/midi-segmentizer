// import { Note } from "@tonejs/midi";
import { Note } from "@tonejs/midi/src/Note";

import {
  getSimplePartitioningArray,
  getPartitioningArrayWithMax,
  sliceAndDice,
  getDurationOfNotes,
} from "./helpers";

describe("helpers", () => {
  describe("getLengthOfNotes", () => {
    it("should work in a basic use case", () => {
      const notes = [{ duration: 1, time: 0 }] as Note[];
      expect(getDurationOfNotes(notes)).toEqual(1);
    });
    it("should work with more than 1 note", () => {
      const notes = [
        { duration: 1, time: 0 },
        { duration: 1, time: 3 },
      ] as Note[];
      expect(getDurationOfNotes(notes)).toEqual(4);
    });
    it("should work with a fairly sophisticated example", () => {
      const notes = [
        { duration: 1, time: 0 },
        { duration: 0.5, time: 2 },
        { duration: 0.111, time: 5 },
        { duration: 3, time: 6 },
      ] as Note[];
      expect(getDurationOfNotes(notes)).toEqual(9);
    });
    it("should work with more than 1 note and offset", () => {
      const notes = [
        { duration: 1, time: 3 },
        { duration: 1, time: 5 },
      ] as Note[];
      expect(getDurationOfNotes(notes)).toEqual(3);
    });
  });

  describe("sliceAndDice", () => {
    it("should slice basic example", () => {
      expect(sliceAndDice([1, 1, 1, 1, 1, 1], [0, 3])).toEqual([
        [1, 1, 1],
        [1, 1, 1],
      ]);
    });
    it("should slice and dice a more complicated example", () => {
      expect(
        sliceAndDice([1, 1, 1, 1, 1, 1, 5, 2, 1, 2, 1, 2], [0, 4, 5, 6, 10])
      ).toEqual([[1, 1, 1, 1], [1], [1], [5, 2, 1, 2], [1, 2]]);
    });
    it("should work with multiple types", () => {
      expect(
        sliceAndDice(["test", "one", "hi", "lolz", "wat"], [0, 2, 4])
      ).toEqual([["test", "one"], ["hi", "lolz"], ["wat"]]);
    });
  });

  describe("getSimplePartitioningArray", () => {
    it("should divide on non-zeros in a simple case", () => {
      const arr = [0, 0, 0, 1, 0, 0];
      expect(getSimplePartitioningArray(arr)).toEqual([0, 3]);
    });

    it("should divide on non-zeros in a case where there are 3 divisions", () => {
      const arr = [0, 0, 0, 1, 0, 1];
      expect(getSimplePartitioningArray(arr)).toEqual([0, 3, 5]);
    });

    it("should divide on non-zeros even where there are none", () => {
      const arr = [1, 2, 1, 2, 1];
      expect(getSimplePartitioningArray(arr)).toEqual([0, 1, 2, 3, 4]);
    });

    it("should divide on non-zeros even when only zeros", () => {
      const arr = [0, 0, 0, 0];
      expect(getSimplePartitioningArray(arr)).toEqual([0]);
    });
  });

  describe("getPartitioningArrayWithMax", () => {
    it("should divide with a simple split and 10 max num", () => {
      const arr = [2, 3, 8, 2];
      expect(getPartitioningArrayWithMax(arr, 10)).toEqual([0, 2]);
    });

    it("should divide with a simple split and 9 max num", () => {
      const arr = [2, 3, 8, 2];
      expect(getPartitioningArrayWithMax(arr, 9)).toEqual([0, 2, 3]);
    });

    it("should divide with a simple split and 8 max num", () => {
      const arr = [2, 3, 8, 2];
      expect(getPartitioningArrayWithMax(arr, 8)).toEqual([0, 2, 3]);
    });

    it("should divide with a simple split even with max num smaller than largest num in arr", () => {
      const arr = [2, 3, 8, 2];
      expect(getPartitioningArrayWithMax(arr, 7)).toEqual([0, 2, 3]);
    });

    it("should divide appropriately when numbers are at max evenly", () => {
      const arr = [1, 1, 1, 2, 2, 2, 1, 1];
      expect(getPartitioningArrayWithMax(arr, 2)).toEqual([0, 2, 3, 4, 5, 6]);
    });

    it("should divide appropriately when random numbers and random max", () => {
      const arr = [1, 6, 4, 3, 7, 1, 8, 3, 2, 7];
      expect(getPartitioningArrayWithMax(arr, 20)).toEqual([0, 4, 8]);
    });

    it("should divide appropriately when random numbers and random max smaller", () => {
      const arr = [1, 6, 4, 3, 7, 1, 8, 3, 2, 7];
      expect(getPartitioningArrayWithMax(arr, 14)).toEqual([0, 4, 6, 9]);
    });

    it("should divide appropriately when faced with decimals", () => {
      const arr = [0.1, 0.4, 0.9, 2.0, 1.1, 1.4];
      expect(getPartitioningArrayWithMax(arr, 1)).toEqual([0, 2, 3, 4, 5]);
    });

    it("should divide appropriately when faced with a large starting number", () => {
      const arr = [5, 1];
      expect(getPartitioningArrayWithMax(arr, 2)).toEqual([0, 1]);
    });
  });
});
