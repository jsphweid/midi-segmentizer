import ArgumentValidator from './program-argument-validator'
import { processMidiFile } from './helpers'
import { SegmentInfoType } from './types'

export function segmentizeMidi(midiFile: string): SegmentInfoType[] {
	const hasValidArguments = ArgumentValidator.hasValidArguments(midiFile)
	return hasValidArguments ? processMidiFile(midiFile) : null
}
