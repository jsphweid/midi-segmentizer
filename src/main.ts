import ArgumentValidator from './program-argument-validator'
import { MIDI, Track, Note, create as createMidi } from 'midiconvert'
import { loadMidi, getValidTracks, determineMeasureLength } from './helpers'
import NotesProcessor from './notes-processor'
import { MAX_BREATH_SECONDS } from './constants'
import { writeFileSync } from 'fs'

// validate arguments
const hasValidArguments = ArgumentValidator.hasValidArguments(process.argv)
if (!hasValidArguments) process.exit(1)

// extract basic info
const midi: MIDI = loadMidi(process.argv[2])
// const outputPath: string = process.argv[3]
const { timeSignature, bpm } = midi.header
const tracks: Track[] = getValidTracks(midi)

const measureLengthInSeconds = determineMeasureLength(bpm, timeSignature)

// test is simple /4 time sig

// segmentize
// const allSegments: SegmentInfoType[] = []

tracks.forEach((track: Track) => {
	const notesGroupedOnRests = NotesProcessor.groupNotesOnRests(track.notes)
	const finalDivisons = NotesProcessor.subdivideUnderMaxBreath(notesGroupedOnRests, MAX_BREATH_SECONDS)
	finalDivisons.forEach((notes: Note[], index: number) => {
		const firstNoteStartTime = notes[0].time
		const offset = firstNoteStartTime - firstNoteStartTime % measureLengthInSeconds
		const name = `t${track.channelNumber}s${index}-output.mid`
		const midiFile = createMidi()
		midiFile.header = midi.header
		const midiTrack = midiFile.track()
		notes.forEach((note: Note) => {
			midiTrack.note(note.midi, note.time - offset, note.duration, note.velocity)
		})
		writeFileSync(name, midiFile.encode(), 'binary')
	})
	// copy over relevant event changes
})

// write to file
// writeFileSync('clone.mid', midi.encode(), 'binary')
// writeFileSync(outputPath, JSON.stringify(allSegments))

// writeFileSync(path: PathLike | number, data: any, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null): void;
