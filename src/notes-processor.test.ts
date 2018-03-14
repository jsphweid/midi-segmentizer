import NotesProcessor from './notes-processor'
import { Note } from 'midiconvert'

describe('notes-processor', () => {
	describe('getTimeDifferenceArray', () => {
		it("should get an array of all zeros if all notes are smoothly connected but don't overlap", () => {
			const notes = [
				{ time: 1, duration: 1 },
				{ time: 2, duration: 2 },
				{ time: 4, duration: 2 },
				{ time: 6, duration: 1 }
			] as Note[]
			expect(NotesProcessor.getTimeDifferenceArray(notes)).toEqual([0, 0, 0, 0])
		})

		it('should get the correct difference array when there are negative values', () => {
			const notes = [
				{ time: 1, duration: 1 },
				{ time: 2, duration: 2 },
				{ time: 3, duration: 5 },
				{ time: 5, duration: 1 }
			] as Note[]
			expect(NotesProcessor.getTimeDifferenceArray(notes)).toEqual([0, 0, -1, -3])
		})

		it('should get the correct difference array when nothing overlaps but there is space in between', () => {
			const notes = [
				{ time: 1, duration: 1 },
				{ time: 3, duration: 0.5 },
				{ time: 4, duration: 5 },
				{ time: 14, duration: 1 }
			] as Note[]
			expect(NotesProcessor.getTimeDifferenceArray(notes)).toEqual([0, 1, 0.5, 5])
		})
	})

	describe('groupNotesOnRests', () => {
		it('should partition the notes appropriately in a basic case with no rests', () => {
			const notes = [
				{ time: 1, duration: 1 },
				{ time: 2, duration: 2 },
				{ time: 4, duration: 2 },
				{ time: 6, duration: 1 }
			] as Note[]
			expect(NotesProcessor.groupNotesOnRests(notes)).toEqual([notes])
		})

		it('should partition the notes correctly with a rest in between each note', () => {
			const notes = [
				{ time: 1, duration: 1 },
				{ time: 3, duration: 0.5 },
				{ time: 4, duration: 5 },
				{ time: 14, duration: 1 }
			] as Note[]
			expect(NotesProcessor.groupNotesOnRests(notes)).toEqual([
				[{ time: 1, duration: 1 }],
				[{ time: 3, duration: 0.5 }],
				[{ time: 4, duration: 5 }],
				[{ time: 14, duration: 1 }]
			])
		})

		it('should partition the notes correctly with a rest in there', () => {
			const notes = [
				{ time: 1, duration: 2 },
				{ time: 3, duration: 0.5 },
				{ time: 4, duration: 5 },
				{ time: 9, duration: 1 }
			] as Note[]
			expect(NotesProcessor.groupNotesOnRests(notes)).toEqual([
				[{ time: 1, duration: 2 }, { time: 3, duration: 0.5 }],
				[{ time: 4, duration: 5 }, { time: 9, duration: 1 }]
			])
		})
	})
})
