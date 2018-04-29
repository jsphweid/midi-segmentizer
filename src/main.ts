import ArgumentValidator from './program-argument-validator'
import { MIDI, Track, Note } from 'midiconvert'
import { loadMidi, getValidTracks, determineMeasureLength } from './helpers'
import NotesProcessor from './notes-processor'
import { MAX_BREATH_SECONDS } from './constants'
import { writeFileSync } from 'fs'
import { SegmentInfoType } from './types'

// validate arguments
const hasValidArguments = ArgumentValidator.hasValidArguments(process.argv)
if (!hasValidArguments) process.exit(1)

// extract basic info
const midi: MIDI = loadMidi(process.argv[2])
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
		const offset = firstNoteStartTime - firstNoteStartTime % measureLengthInSeconds

		segmentInfos.push({
			offset,
			notes,
			header: midi.header,
			channelNumber: track.channelNumber,
			instrument: track.instrument,
			instrumentNumber: track.instrumentNumber,
			instrumentFamily: track.instrumentFamily,
			name: track.name
		})
	})
})

writeFileSync(outputFile, JSON.stringify(segmentInfos))
