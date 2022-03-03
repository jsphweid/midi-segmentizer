import { readFileSync } from "fs";

import { segmentizeMidi } from "./src";

const midiPath = "./test-midi-files/tteor.mid";
const midiFile = readFileSync(midiPath, "base64");
const segments = segmentizeMidi(midiFile);
if (!segments) {
  console.log("didn't work!");
} else {
  console.log("segments", segments.length, segments);
}
