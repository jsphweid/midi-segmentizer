import { readFileSync } from 'fs'
import { MIDI, parse as parseMidi, Track, Note } from 'midiconvert'

export const loadMidi = (fullPath: string): MIDI => {
	const midiFile: any = readFileSync(fullPath, 'binary')
	return parseMidi(midiFile)
}

export const getValidTracks = (midi: MIDI) => {
	return midi.tracks.filter((track: Track) => track.notes.length > 0 && track.channelNumber >= 0)
}

export const getSimplePartitioningArray = (arr: number[]): number[] => {
	return arr
		.map((num: number, index: number) => (index === 0 || num !== 0 ? index : 0))
		.filter((num: number, index: number) => index === 0 || num !== 0)
}

export const getPartitioningArrayWithMax = (arr: number[], max: number): number[] => {
	const dividingIndicies: number[] = [0]
	let sum = 0
	for (let i = 0; i < arr.length; i++) {
		sum += arr[i]
		if (sum > max) {
			dividingIndicies.push(i)
			sum = arr[i]
		}
	}
	return dividingIndicies
}
