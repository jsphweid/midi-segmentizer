import ArgumentValidator from './program-argument-validator'
import { resolve } from 'path'
import { MIDI, Track, Note } from 'midiconvert'
import { loadMidi, getValidTracks } from './helpers'

const hasValidArguments = ArgumentValidator.hasValidArguments(process.argv)
if (!hasValidArguments) process.exit(1)

const midi: MIDI = loadMidi(process.argv[2])
const bpm: number = midi.header.bpm
const validTracks: Track[] = getValidTracks(midi)

const printDiff = (notes: Note[]) => {
	notes.forEach((note: Note, index: number) => {
		if (index > 0) {
			const previousNote = notes[index - 1]
			const diff = note.time - (previousNote.duration + previousNote.time)
			console.log('diff', diff)
		}
	})
}

// console.log('valid tracks', validTracks.map((track: Track) => track.notes))
const zz = validTracks.map((track: Track) => track.notes).forEach(printDiff)
// console.log('ss', zz)
