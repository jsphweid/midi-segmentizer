import { readFileSync } from 'fs'
import { MIDI, parse as parseMidi, Track } from 'midiconvert'

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
