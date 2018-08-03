import ArgumentValidator from './program-argument-validator'
import { processMidiFile } from './helpers'
import { MIDI } from 'midiconvert'

export interface SegmentInfoType {
  offset: number
  midiJson: MIDI
  midiName: string
  centerTime: number
  difficulty: number
}

export function segmentizeMidi(midiFile: string): SegmentInfoType[] {
  const hasValidArguments = ArgumentValidator.hasValidArguments(midiFile)
  return hasValidArguments ? processMidiFile(midiFile) : null
}
