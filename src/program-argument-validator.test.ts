import ArgumentValidator from './program-argument-validator'

const defaultArgList: string[] = ['nodepath', 'scriptpath', './test-midi-files/bwv772.mid']

describe('program-argument-validator', () => {
	beforeAll(() => {
		console.error = str => null
	})

	it('happy path is good', () => {
		expect(ArgumentValidator.hasValidArguments(defaultArgList)).toBe(true)
	})

	it('if third arg is midi file but junk, it fails', () => {
		const argList = defaultArgList.slice()
		argList[2] = './test-midi-files/corruptMidi.mid'
		expect(ArgumentValidator.hasValidArguments(argList)).toBe(false)
	})

	it('if third arg is not a valid midi file, it fails', () => {
		const argList = defaultArgList.slice()
		argList[2] = 'fakeAF'
		expect(ArgumentValidator.hasValidArguments(argList)).toBe(false)
	})

	it('if third arg is valid midi file but contains polyphony, it should stop', () => {
		const argList = defaultArgList.slice()
		argList[2] = './test-midi-files/bwv772-not-monophonic.mid'
		expect(ArgumentValidator.hasValidArguments(argList)).toBe(false)
	})
})
