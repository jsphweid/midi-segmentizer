import { parse as parseMidi, MIDI, Track, Note } from 'midiconvert'
import { readFileSync, existsSync } from 'fs'
import { ParsedPath, parse, resolve } from 'path'
import { loadMidi, getValidTracks, noteSequenceIsPolyphonic } from './helpers'

export default class ArgumentValidator {
	public static hasValidArguments(argumentList: string[]): boolean {
		const midiPath: string = argumentList[2]
		return (
			ArgumentValidator.numberOfArgumentsIsCorrect(argumentList.length) &&
			ArgumentValidator.isMidiFile(resolve(midiPath)) &&
			ArgumentValidator.isValidMidiFile(resolve(midiPath)) &&
			!ArgumentValidator.isPolyphonicMidiFile(resolve(midiPath))
		)
	}

	private static numberOfArgumentsIsCorrect(numberOfArgs: number): boolean {
		if (numberOfArgs !== 3) {
			console.error(`
                This program requires 1 argument:
                    1: path to midi file
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

	private static isPolyphonicMidiFile(path: string): boolean {
		const midi: MIDI = loadMidi(path)
		return (
			getValidTracks(midi)
				.map((track: Track) => track.notes)
				.map((notes: Note[]) => noteSequenceIsPolyphonic(notes))
				.filter((trackIsPolyphonic: boolean) => trackIsPolyphonic).length > 0
		)
	}
}
