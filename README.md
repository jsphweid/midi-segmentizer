# midi-segmentizer

- break a midi file into monophonic segments
- assume constant tempo and time signature for MVP

# todo

- determine output => experiement with midi, musicXML...
- make PR for midiconvert types - controlChanges should be on Track type... MIDI type...
- write tests to prevent files with tempo changes and mixed meter

idea:

1. command line utility
2. has default process that splits (MVP)
3. has optional gui to allow you to edit
