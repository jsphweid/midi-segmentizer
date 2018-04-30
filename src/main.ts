import ArgumentValidator from './program-argument-validator'
import { MIDI, Track, Note, create as createMidi } from 'midiconvert'
import { loadMidi, getValidTracks, determineMeasureLength } from './helpers'
import NotesProcessor from './notes-processor'
import { MAX_BREATH_SECONDS } from './constants'
import { writeFileSync } from 'fs'
import { SegmentInfoType } from './types'

// validate arguments
const hasValidArguments = ArgumentValidator.hasValidArguments(process.argv)
if (!hasValidArguments) process.exit(1)

// extract basic info
const midiPath: string = process.argv[2]
const midi: MIDI = loadMidi(midiPath)
const filename: string = midiPath.replace(/^.*[\\\/]/, '')
const outputFile: string = process.argv[3]
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
			originalFileName: filename,
			centerTime: (lastNoteStartTime - firstNoteStartTime) / 2,
			difficulty: null
		})
	})
})

writeFileSync(outputFile, JSON.stringify(segmentInfos))
