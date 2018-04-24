import ArgumentValidator from './program-argument-validator'
import { MIDI, Track, Note } from 'midiconvert'
import { loadMidi, getValidTracks } from './helpers'
import NotesProcessor from './notes-processor'
import { MAX_BREATH_SECONDS } from './constants'
import { writeFileSync } from 'fs'
import { SegmentInfoType } from './types'

// validate arguments
const hasValidArguments = ArgumentValidator.hasValidArguments(process.argv)
if (!hasValidArguments) process.exit(1)

// extract basic info
const midi: MIDI = loadMidi(process.argv[2])
const outputPath: string = process.argv[3]
const bpm: number = midi.header.bpm
const tracks: Track[] = getValidTracks(midi)

// segmentize
const allSegments: SegmentInfoType[] = []

tracks.forEach((track: Track) => {
	const notesGroupedOnRests = NotesProcessor.groupNotesOnRests(track.notes)
	const finalDivisons = NotesProcessor.subdivideUnderMaxBreath(notesGroupedOnRests, MAX_BREATH_SECONDS)
	const { instrument, instrumentNumber, instrumentFamily, name, channelNumber } = track
	finalDivisons.forEach((notes: Note[]) => {
		allSegments.push({
			bpm,
			notes,
			channelNumber,
			instrument,
			instrumentNumber,
			instrumentFamily,
			name
		})
	})
})

// write to file
writeFileSync(outputPath, JSON.stringify(allSegments))

// writeFileSync(path: PathLike | number, data: any, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null): void;
