import ArgumentValidator from './program-argument-validator'
import { readFileSync } from 'fs'

describe('program-argument-validator', () => {
  beforeAll(() => {
    console.error = str => null
  })

  it('happy path is good', () => {
    const midiFile = readFileSync('./test-midi-files/bwv772.mid', 'base64')
    expect(ArgumentValidator.hasValidArguments(midiFile)).toBe(true)
  })

  // it('if third arg is midi file but junk, it fails', () => {
  // 	const midiFile = readFileSync('./test-midi-files/corruptMidi.mid', 'base64')
  // 	expect(ArgumentValidator.hasValidArguments(midiFile)).toBe(false)
  // })

  // it('if third arg is not a valid midi file, it fails', () => {
  // 	const midiFile = 'fakeAF'
  // 	expect(ArgumentValidator.hasValidArguments(midiFile)).toBe(false)
  // })

  // it('if third arg is valid midi file but contains polyphony, it should stop', () => {
  // 	const midiFile = readFileSync('./test-midi-files/bwv772-not-monophonic.mid', 'base64')
  // 	expect(ArgumentValidator.hasValidArguments(midiFile)).toBe(false)
  // })

  // it('should fail if not a basic time signature', () => {
  // 	const midiFile = readFileSync('./test-midi-files/7-8time.mid', 'base64')
  // 	expect(ArgumentValidator.hasValidArguments(midiFile)).toBe(false)
  // })
})
