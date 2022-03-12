import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Note, Segment } from ".";
import {
  base64ToArrayBuffer,
  getBeatLength,
  getSegmentOffset,
  shiftMidi,
} from "./helpers";
import Midi from "./midi";

const X_EXPAND = 100;

type Coord = { x: number; y: number };

interface DrawableNote extends Note, Coord {
  width: number;
  height: number;
  topLeft: Coord;
  bottomRight: Coord;
  selected: boolean;
  offset: number;
}

function buildNote(
  note: Note & { selected?: boolean; offset?: number }
): DrawableNote {
  // NOTE: offset is a unit of time
  const height = 1000 / 127;
  const noteStart = note.time;
  const width = note.duration * X_EXPAND;
  const offset = note.offset ?? 0;
  const x = noteStart * X_EXPAND + offset * X_EXPAND;
  const y = (127 - note.midi) * height;
  const topLeft = { x, y };
  const bottomRight = { x: x + width, y: y + height };
  return {
    ...note,
    x,
    y,
    width,
    height,
    topLeft,
    bottomRight,
    offset,
    selected: note.selected ?? false,
  };
}

interface DrawableSegment {
  id: string;
  notes: DrawableNote[];
  color: string;
  offset: number;
}

function getBars(beatLength: number, width: number): number[] {
  const res = [];
  let i = 0;
  while (i <= width) {
    res.push(i);
    i += beatLength;
  }
  return res;
}

function renderBars(ctx: Canvas, bars: number[], height: number) {
  for (const bar of bars) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    const x = bar * X_EXPAND;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

type Canvas = CanvasRenderingContext2D;

function getRandomColor() {
  const rand = () => Math.floor(Math.random() * 255);
  return `rgb(${rand()}, ${rand()}, ${rand()})`;
}

function renderNote(ctx: Canvas, note: DrawableNote, color?: string) {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = color ?? "#000000";
  ctx.rect(note.x, note.y, note.width, note.height);
  ctx.stroke();
  if (note.selected) {
    ctx.fillStyle = color ?? "#000000";
    ctx.fill();
  }
}

function renderBox(
  ctx: Canvas,
  hi: number,
  lo: number,
  l: number,
  r: number,
  col: string
) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = col;
  ctx.rect(l, hi, r - l, lo - hi);
  ctx.stroke();
}

function renderSegments(ctx: Canvas, segments: DrawableSegment[]) {
  for (const segment of segments) {
    renderSegment(ctx, segment);
  }
}

function renderSegment(ctx: Canvas, segment: DrawableSegment) {
  let hi = Infinity;
  let lo = -Infinity;
  let right = -Infinity;
  for (const note of segment.notes) {
    renderNote(ctx, note, segment.color);
    hi = Math.min(hi, note.topLeft.y);
    lo = Math.max(lo, note.bottomRight.y);
    right = Math.max(right, note.bottomRight.x);
  }
  const left = segment.offset * X_EXPAND;
  renderBox(ctx, hi, lo, left, right, segment.color);
}

function renderNotes(ctx: Canvas, notes: DrawableNote[]) {
  for (const note of notes) {
    renderNote(ctx, note);
  }
}

function clear(ctx: Canvas, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
}

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);
  function downHandler({ key }: any): void {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }
  const upHandler = ({ key }: any): void => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);
  return keyPressed;
}

interface SegmentizerProps {
  data: string; // midi file as base64 string
  onSave: (segments: Segment[]) => void;
}

function Segmentizer(props: SegmentizerProps) {
  const ref = useRef(null);
  const [height, setHeight] = useState(800);
  const [width, setWidth] = useState(2000);
  const [notes, setNotes] = useState<DrawableNote[]>([]);
  const [bpm, setBpm] = useState<number | null>();
  const [bars, setBars] = useState<number[]>([]);
  const [segments, setSegments] = useState<DrawableSegment[]>([]);
  const [mouseDown, setMouseDown] = useState<Coord | null>(null);
  const [beatLength, setBeatLength] = useState<number | null>(null);
  const [shift, setShift] = useState<number | null>(null);
  const escapePressed = useKeyPress("Escape");
  const tickPressed = useKeyPress("`");

  useEffect(() => {
    if (escapePressed) {
      handleClearSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escapePressed]);

  useEffect(() => {
    if (tickPressed) {
      handleSaveSegment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickPressed]);

  useEffect(() => {
    if (props.data) {
      const buffer = base64ToArrayBuffer(props.data);
      const midi = Midi.fromBuffer(buffer);
      if (midi) {
        const _beatLength = getBeatLength(midi.simpleBpm);
        const _shift = _beatLength * 2;
        shiftMidi(midi, _shift);
        const notes = midi
          .getAllNotes()
          .map(buildNote)
          .sort((a, b) => (b.time > a.time ? -1 : 1));
        const maxWidth = Math.max(...notes.map((n) => n.x)) + 300;
        setBpm(midi.simpleBpm);
        setBars(getBars(_beatLength, maxWidth));
        setWidth(maxWidth);
        setBeatLength(_beatLength);
        setShift(_shift);
        setSegments([]);
        setTimeout(() => {
          // dumb hack to get rid of weird canvas dimension change display issue
          setNotes(notes);
        }, 100);
      }
    }
  }, [props.data, ref]);

  function handleMouseDown(evt: any) {
    if (ref.current) {
      const rect = (ref.current as any).getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      setMouseDown({ x, y });
    }
  }

  function handleClearSelection() {
    setNotes(
      notes.map((note) => ({
        ...note,
        selected: false,
      }))
    );
  }

  function handleSaveSegment() {
    const remaining: DrawableNote[] = [];
    const segmentNotes: DrawableNote[] = [];
    notes.forEach((note) => {
      if (note.selected) {
        segmentNotes.push(note);
      } else {
        remaining.push(note);
      }
    });
    setNotes(remaining);

    if (segmentNotes.length && beatLength && shift) {
      const color = getRandomColor();
      const offset = getSegmentOffset(segmentNotes[0].time, beatLength, shift);
      const shiftedNotes = segmentNotes.map((n) =>
        // TODO: it's not the most intuitive thing to pass down offset at note level
        buildNote({ ...n, time: n.time - offset, offset })
      );
      setSegments([
        ...segments,
        { id: uuidv4(), color, notes: shiftedNotes, offset },
      ]);
    }
  }

  function handleMouseUp(evt: any) {
    if (ref.current && mouseDown) {
      const rect = (ref.current as any).getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      const left = Math.min(x, mouseDown.x);
      const right = Math.max(x, mouseDown.x);
      const top = Math.min(y, mouseDown.y);
      const bottom = Math.max(y, mouseDown.y);
      setMouseDown(null);
      setNotes(
        notes.map((note) => {
          const { x: noteX, y: noteY, width, height } = note;
          let clicked = false;
          if (
            noteX + width >= left &&
            noteX <= right &&
            noteY + height >= top &&
            noteY <= bottom
          ) {
            clicked = true;
          }
          return {
            ...note,
            selected: clicked ? !note.selected : note.selected,
          };
        })
      );
    }
  }

  if (ref.current && notes) {
    const current = ref.current as any;
    const ctx: CanvasRenderingContext2D = current.getContext("2d");
    clear(ctx, width, height);
    renderNotes(ctx, notes);
    renderBars(ctx, bars, height);
    renderSegments(ctx, segments);
  }

  function deleteSegment(segment: DrawableSegment) {
    if (segments.find((s) => s.id === segment.id)) {
      setSegments(segments.filter((s) => s.id !== segment.id));
      setNotes([
        ...notes,
        ...segment.notes.map((note) => ({
          ...note,
          time: note.offset + note.time,
          selected: false,
          offset: 0,
        })),
      ]);
    }
  }

  function renderButtons() {
    return (
      <div style={{ position: "fixed", maxWidth: "800px" }}>
        {segments.map((segment) => (
          <button
            key={segment.id}
            onClick={() => deleteSegment(segment)}
            style={{
              backgroundColor: segment.color,
              color: "#FFFFFF",
            }}
          >
            delete
          </button>
        ))}
      </div>
    );
  }

  function handleSave() {
    props.onSave(
      segments.map((segment) => {
        const notes = [];
        let lowestNote = Infinity;
        let highestNote = -Infinity;
        for (const note of segment.notes) {
          lowestNote = Math.min(lowestNote, note.midi);
          highestNote = Math.max(highestNote, note.midi);
          notes.push({
            time: note.time,
            midi: note.midi,
            duration: note.duration,
            velocity: 1,
            lyric: null, // TODO: fix
          });
        }
        return {
          bpm: bpm!,
          offset: segment.offset,
          lowestNote,
          highestNote,
          notes,
        };
      })
    );
  }

  return (
    <div>
      <div style={{ position: "fixed" }}>
        <button onClick={handleSaveSegment}>make segment</button>
        <button disabled={!segments.length} onClick={handleSave}>
          save segments
        </button>
      </div>
      <canvas
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        id="react-midiVisualizer-canvas"
        ref={ref}
        height={height}
        width={width}
      />
      {renderButtons()}
    </div>
  );
}

export default Segmentizer;
