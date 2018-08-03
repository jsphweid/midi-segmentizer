import ArgumentValidator from './program-argument-validator'
import { writeFileSync, readFileSync } from 'fs'
import { processMidiFile } from './helpers'
import { existsSync } from 'fs'
import { ParsedPath, parse } from 'path'

if (process.argv.length !== 4) {
  console.error(`
		This program requires 2 arguments:
			1: path to midi file
			2: path of desired output file
	`)
  process.exit(1)
}
const midiPath: string = process.argv[2]

const sourcePathObj: ParsedPath = parse(midiPath)
if (sourcePathObj.ext !== '.mid' || !existsSync(midiPath)) {
  console.error(`
			First argument must be a .mid file that really exists.
		`)
  process.exit(1)
}

// extract basic info
const midiFile: string = readFileSync(midiPath, 'base64')

// validate arguments
const hasValidArguments = ArgumentValidator.hasValidArguments(midiFile)
if (!hasValidArguments) process.exit(1)

const segmentInfos = processMidiFile(midiFile)
const outputFile: string = process.argv[3]

writeFileSync(outputFile, JSON.stringify(segmentInfos))
