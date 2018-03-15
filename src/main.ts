import ArgumentValidator from './program-argument-validator'
import { resolve } from 'path'
import { MIDI, Track, Note } from 'midiconvert'
import { loadMidi, getValidTracks } from './helpers'
import NotesProcessor from './notes-processor'
import { MAX_BREATH_SECONDS } from './constants'

const hasValidArguments = ArgumentValidator.hasValidArguments(process.argv)
if (!hasValidArguments) process.exit(1)

const midi: MIDI = loadMidi(process.argv[2])
const bpm: number = midi.header.bpm
const validTracks: Track[] = getValidTracks(midi)

const processTrack = (track: Track): void => {
	const notesGroupedOnRests = NotesProcessor.groupNotesOnRests(track.notes)
	const finalDivisons = NotesProcessor.subdivideUnderMaxBreath(notesGroupedOnRests, MAX_BREATH_SECONDS)
	console.log('finalDivisons', finalDivisons)
}

validTracks.forEach((track: Track) => processTrack(track))
