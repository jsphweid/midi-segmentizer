import { Note } from 'midiconvert'

export interface SegmentInfoType {
	channelNumber: number
	instrument: string
	instrumentNumber: number
	instrumentFamily: string
	name: string
	header: Object
	offset: number
	notes: Note[]
}
