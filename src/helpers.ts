import { MIDI, parse as parseMidi, Track } from 'midiconvert'
import NotesProcessor from './notes-processor'
import { MAX_BREATH_SECONDS } from './constants'
import { SegmentInfoType } from './types'
import { Note, create as createMidi } from 'midiconvert'

export const getValidTracks = (midi: MIDI) => {
	return midi.tracks.filter((track: Track) => track.notes.length > 0 && track.channelNumber >= 0)
}

export const getSimplePartitioningArray = (arr: number[]): number[] => {
	return arr
		.map((num: number, index: number) => (index === 0 || num !== 0 ? index : 0))
		.filter((num: number, index: number) => index === 0 || num !== 0)
}

export const getPartitioningArrayWithMax = (arr: number[], max: number): number[] => {
	const dividingIndicies: number[] = []
	let sum = 0
	for (let i = 0; i < arr.length; i++) {
		sum += arr[i]
		if (sum > max || i === 0) {
			dividingIndicies.push(i)
			sum = arr[i]
		}
	}
	return dividingIndicies
}

export const sliceAndDice = <T>(arr: T[], indicesToSliceAt: number[]): T[][] => {
	let ret: T[][] = []
	for (let i = 0; i < indicesToSliceAt.length; i++) {
		const partitionIndex: number = indicesToSliceAt[i]
		const nextPartitionIndex: number = indicesToSliceAt[i + 1]
		ret.push(arr.slice(partitionIndex, nextPartitionIndex))
	}
	return ret
}

export const determineMeasureLength = (bpm: number, timeSignature: number[]): number => {
	const secondsPerBeat = 1 / (bpm / 60)
	return timeSignature[0] * secondsPerBeat
}

export const base64ToBinary = (base64String: string): ArrayBuffer =>
	Buffer.from(base64String, 'base64').toString('binary') as any

export const processMidiFile = (midiFile: string): SegmentInfoType[] => {
	const midi: MIDI = parseMidi(base64ToBinary(midiFile))

	const { timeSignature, bpm } = midi.header
	const tracks: Track[] = getValidTracks(midi)

	const measureLengthInSeconds = determineMeasureLength(bpm, timeSignature)

	const segmentInfos: SegmentInfoType[] = []

	// segmentize
	tracks.forEach((track: Track) => {
		const notesGroupedOnRests = NotesProcessor.groupNotesOnRests(track.notes)
		const finalDivisons = NotesProcessor.subdivideUnderMaxBreath(notesGroupedOnRests, MAX_BREATH_SECONDS)

		finalDivisons.forEach((notes: Note[]) => {
			const firstNoteStartTime = notes[0].time
			const lastNoteStartTime = notes[notes.length - 1].time
			const offset = firstNoteStartTime - firstNoteStartTime % measureLengthInSeconds

			const midiJson: MIDI = createMidi()
			midiJson.header = midi.header
			const midiTrack = midiJson.track()
			midiTrack.channelNumber = track.channelNumber
			midiTrack.instrument = track.instrument
			midiTrack.instrumentNumber = track.instrumentNumber
			notes.forEach((note: Note) => {
				midiTrack.note(note.midi, note.time - offset, note.duration, note.velocity)
			})

			segmentInfos.push({
				offset,
				midiJson,
				midiName: midi.header.name,
				centerTime: (lastNoteStartTime - firstNoteStartTime) / 2,
				difficulty: null
			})
		})
	})

	return segmentInfos
}
