import { Note } from 'midiconvert'
import { getSimplePartitioningArray, getPartitioningArrayWithMax } from './helpers'

export default class NotesProcessor {
	public static getTimeDifferenceArray = (notes: Note[]): number[] => {
		const diffArray: number[] = [0]
		for (let i = 1; i < notes.length; i++) {
			const previousNote = notes[i - 1]
			const diff = notes[i].time - (previousNote.duration + previousNote.time)
			diffArray.push(diff)
		}
		return diffArray
	}

	public static groupNotesOnRests = (notes: Note[]): Note[][] => {
		const diffArray = NotesProcessor.getTimeDifferenceArray(notes)
		const partitioningArray = getSimplePartitioningArray(diffArray)
		const groupedNotes: Note[][] = []

		// refactor
		for (let i = 0; i < partitioningArray.length; i++) {
			const partitionIndex: number = partitioningArray[i]
			const nextPartitionIndex: number = partitioningArray[i + 1]
			groupedNotes.push(notes.slice(partitionIndex, nextPartitionIndex))
		}
		return groupedNotes
	}

	public static subdivideUnderMaxBreath = (noteGroupings: Note[][]): Note[][] => {
		const finalNotes: Note[][] = []
		noteGroupings.forEach((notes: Note[]) => {
			const lengthsOfEachNote = notes.map((note: Note) => note.duration)
			const recommendedSubdivisionIndicies = getPartitioningArrayWithMax(lengthsOfEachNote, MAX_BREATH_SECONDS)

			// refactor
			for (let i = 0; i < recommendedSubdivisionIndicies.length; i++) {
				const partitionIndex: number = recommendedSubdivisionIndicies[i]
				const nextPartitionIndex: number = recommendedSubdivisionIndicies[i + 1]
				finalNotes.push(notes.slice(partitionIndex, nextPartitionIndex))
			}
		})
		return finalNotes
	}
}
