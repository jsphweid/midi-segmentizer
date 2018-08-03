import { MIDI, Track, Note, parse as parseMidi } from 'midiconvert'
import { getValidTracks, base64ToBinary } from './helpers'
import NotesProcessor from './notes-processor'

export default class ArgumentValidator {
  public static hasValidArguments(midiFileBuffer: string): boolean {
    return (
      ArgumentValidator.isValidMidiFile(midiFileBuffer) &&
      !ArgumentValidator.isPolyphonicMidiFile(midiFileBuffer) &&
      ArgumentValidator.isSimpleTimeSignature(midiFileBuffer)
    )
  }

  private static isValidMidiFile(midiFileBuffer: string): boolean {
    try {
      parseMidi(base64ToBinary(midiFileBuffer))
      return true
    } catch (e) {
      console.error(`
				Midi file provided is not valid.
				${e}
			`)
      return false
    }
  }

  private static noteSequenceIsPolyphonic = (notes: Note[]): boolean => {
    const timeDiffs = NotesProcessor.getTimeDifferenceArray(notes)
    return timeDiffs.filter((num: number) => num < 0).length > 0
  }

  private static isPolyphonicMidiFile(midiFileBuffer: string): boolean {
    const midi: MIDI = parseMidi(base64ToBinary(midiFileBuffer))
    const containsPolyphonicTrack =
      getValidTracks(midi)
        .map((track: Track) => track.notes)
        .map((notes: Note[]) =>
          ArgumentValidator.noteSequenceIsPolyphonic(notes)
        )
        .filter((trackIsPolyphonic: boolean) => trackIsPolyphonic).length > 0
    if (containsPolyphonicTrack) {
      console.error(`
				Midi file contains polyphony. This isn't supported yet. Please make sure your midi file contains no tracks that have overlapping notes.
			`)
      return true
    }
    return false
  }

  private static isSimpleTimeSignature(midiFileBuffer: string): boolean {
    const midi: MIDI = parseMidi(base64ToBinary(midiFileBuffer))
    return midi.header.timeSignature && midi.header.timeSignature[1] === 4
  }
}
