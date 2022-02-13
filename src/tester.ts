import { segmentizeMidi, SegmentInfoType } from "./main-module";
import { readFileSync } from "fs";

const midiPath = "./test-midi-files/bomberman 64.mid";
const midiFile = readFileSync(midiPath, "base64");
const infos: SegmentInfoType[] = segmentizeMidi(midiFile);
console.log(infos.length);
