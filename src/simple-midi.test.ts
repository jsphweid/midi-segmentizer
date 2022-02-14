import { readFileSync } from "fs";

import SimpleMidi from "./simple-midi";

describe("simple midi", () => {
  beforeAll(() => {
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  it("happy path is good", () => {
    const midiFile = readFileSync("./test-midi-files/bwv772.mid", "base64");
    expect(SimpleMidi.fromBase64(midiFile)).not.toBeNull();
  });

  it("corrupt midi fails", () => {
    const midiFile = readFileSync(
      "./test-midi-files/corruptMidi.mid",
      "base64"
    );
    expect(SimpleMidi.fromBase64(midiFile)).toBeNull();
  });

  it("midi with polyphony fails", () => {
    const midiFile = readFileSync(
      "./test-midi-files/bwv772-not-monophonic.mid",
      "base64"
    );
    expect(SimpleMidi.fromBase64(midiFile)).toBeNull();
  });

  it("should fail if not a basic time signature", () => {
    const midiFile = readFileSync("./test-midi-files/7-8time.mid", "base64");
    expect(SimpleMidi.fromBase64(midiFile)).toBeNull();
  });
});
