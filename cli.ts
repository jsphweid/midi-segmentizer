import { ParsedPath, parse } from "path";
import { writeFileSync, readFileSync, existsSync } from "fs";

import { processMidiFile } from "./helpers";
import SimpleMidi from "./simple-midi";

if (process.argv.length !== 4) {
  console.error(`
		This program requires 2 arguments:
			1: path to midi file
			2: path of desired output file
	`);
  process.exit(1);
}
const midiPath: string = process.argv[2];

const sourcePathObj: ParsedPath = parse(midiPath);
if (sourcePathObj.ext !== ".mid" || !existsSync(midiPath)) {
  console.error(`
			First argument must be a .mid file that really exists.
		`);
  process.exit(1);
}

const simpleMidi = SimpleMidi.fromBase64(readFileSync(midiPath, "base64"));
if (!simpleMidi) process.exit(1);

const segmentInfos = processMidiFile(simpleMidi);
const outputFile: string = process.argv[3];

writeFileSync(outputFile, JSON.stringify(segmentInfos));
