import { MIDI, Track, Note } from 'midiconvert'
import { existsSync } from 'fs'
import { ParsedPath, parse, resolve } from 'path'
import { loadMidi, getValidTracks } from './helpers'
import NotesProcessor from './notes-processor'

export default class ArgumentValidator {
	public static hasValidArguments(argumentList: string[]): boolean {
		const midiPath: string = argumentList[2]
		return (
			ArgumentValidator.numberOfArgumentsIsCorrect(argumentList.length) &&
			ArgumentValidator.isMidiFile(resolve(midiPath)) &&
			ArgumentValidator.isValidMidiFile(resolve(midiPath)) &&
			!ArgumentValidator.isPolyphonicMidiFile(resolve(midiPath)) &&
			ArgumentValidator.isSimpleTimeSignature(resolve(midiPath))
		)
	}

	private static numberOfArgumentsIsCorrect(numberOfArgs: number): boolean {
		if (numberOfArgs !== 4) {
			console.error(`
                This program requires 2 arguments:
					1: path to midi file
					2: path of desired output file
			`)
			return false
		}
		return true
	}

	private static isMidiFile(path: string): boolean {
		const sourcePathObj: ParsedPath = parse(path)
		if (sourcePathObj.ext !== '.mid' || !existsSync(path)) {
			console.error(`
				First argument must be a .mid file that really exists.
			`)
			return false
		}
		return true
	}

	private static isValidMidiFile(path: string): boolean {
		try {
			loadMidi(path)
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

	private static isPolyphonicMidiFile(path: string): boolean {
		const midi: MIDI = loadMidi(path)
		const containsPolyphonicTrack =
			getValidTracks(midi)
				.map((track: Track) => track.notes)
				.map((notes: Note[]) => ArgumentValidator.noteSequenceIsPolyphonic(notes))
				.filter((trackIsPolyphonic: boolean) => trackIsPolyphonic).length > 0
		if (containsPolyphonicTrack) {
			console.error(`
				Midi file contains polyphony. This isn't supported yet. Please make sure your midi file contains no tracks that have overlapping notes.
			`)
			return true
		}
		return false
	}

	private static isSimpleTimeSignature(path: string): boolean {
		const midi: MIDI = loadMidi(path)
		return midi.header.timeSignature && midi.header.timeSignature[1] === 4
	}
}
