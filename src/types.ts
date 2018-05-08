import { MIDI } from 'midiconvert'

export interface SegmentInfoType {
	offset: number
	midiJson: MIDI
	midiName: string
	centerTime: number
	difficulty: number
}
