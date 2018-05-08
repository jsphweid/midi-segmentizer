import ArgumentValidator from './program-argument-validator'
import { processMidiFile } from './helpers'

export function segmentizeMidi(midiFile: string) {
	const hasValidArguments = ArgumentValidator.hasValidArguments(midiFile)
	return hasValidArguments ? processMidiFile(midiFile) : null
}
