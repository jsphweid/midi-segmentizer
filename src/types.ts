import { MIDI } from 'midiconvert'

export interface SegmentInfoType {
	offset: number
	midiJson: MIDI
	originalFileName: string
	centerTime: number
	difficulty: number
}
