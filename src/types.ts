import { Note } from 'midiconvert'

export interface SegmentInfoType {
	notes: Note[]
	channelNumber: number
	instrument: string
	instrumentNumber: number
	instrumentFamily: string
	name: string
	bpm: number
}
