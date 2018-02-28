import { readFileSync } from 'fs'
import { MIDI, parse as parseMidi, Track, Note } from 'midiconvert'

export const loadMidi = (fullPath: string): MIDI => {
	const midiFile: any = readFileSync(fullPath, 'binary')
	return parseMidi(midiFile)
}

export const getValidTracks = (midi: MIDI) =>
	midi.tracks.filter((track: Track) => track.notes.length > 0 && track.channelNumber >= 0)

export const noteSequenceIsPolyphonic = (notes: Note[]): boolean => {
	for (let i = 1; i < notes.length; i++) {
		const previousNote = notes[i - 1]
		const diff = notes[i].time - (previousNote.duration + previousNote.time)
		if (diff < 0) return true
	}
	return false
}
