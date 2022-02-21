import * as React from "react";
import * as ReactDOM from "react-dom";

import { Segment, segmentizeMidi } from ".";
import { Note } from "@tonejs/midi/dist/Note";
import { sample } from "./sample";
import { randomInt } from "crypto";

type Canvas = CanvasRenderingContext2D;

const X_EXPAND = 100; // NOTE: ideally this is based on width

function getRandomColor() {
  const rand = () => Math.floor(Math.random() * 255);
  return `rgb(${rand()}, ${rand()}, ${rand()})`;
}

function renderNote(
  ctx: Canvas,
  note: Note,
  offset: number,
  w: number,
  h: number,
  col: string
) {
  const noteHeight = h / 127;
  const noteStart = offset + note.time;
  const length = note.duration * X_EXPAND;
  const x = noteStart * X_EXPAND;
  const y = (127 - note.midi) * noteHeight;
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.rect(x, y, length, noteHeight);
  ctx.stroke();
  ctx.fill();

  return {
    topLeft: { x, y },
    bottomRight: { x: x + length, y: y + noteHeight },
  };
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

function renderSegment(ctx: Canvas, segment: Segment, w: number, h: number) {
  const notes = segment.midiJson.tracks[0].notes;
  const offset = segment.offset;
  const col = getRandomColor();
  let hi = Infinity;
  let lo = -Infinity;
  let left = Infinity;
  let right = -Infinity;
  for (const note of notes) {
    const { topLeft, bottomRight } = renderNote(ctx, note, offset, w, h, col);
    hi = Math.min(hi, topLeft.y);
    lo = Math.max(lo, bottomRight.y);
    left = Math.min(left, topLeft.x);
    right = Math.max(right, bottomRight.x);
  }

  renderBox(ctx, hi, lo, offset * X_EXPAND, right, col);
}

function renderSegments(
  ctx: Canvas,
  segments: Segment[],
  w: number,
  h: number
) {
  for (const segment of segments) {
    renderSegment(ctx, segment, w, h);
  }
}

function clear(ctx: Canvas, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
}

function App() {
  const ref = React.useRef(null);
  const [data, setData] = React.useState<string>(sample);
  const [height, setHeight] = React.useState(500);
  const [width, setWidth] = React.useState(2000);

  React.useEffect(() => {
    if (data) {
      const segments = segmentizeMidi(data);
      if (ref.current && segments) {
        const current = ref.current as any;
        const ctx: CanvasRenderingContext2D = current.getContext("2d");
        clear(ctx, width, height);
        renderSegments(ctx, segments, width, height);
      }
    }
  }, [data, ref]);

  async function handleFileUpload(file: File) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    setData(base64);
  }

  return (
    <>
      <input
        id="fileupload"
        type="file"
        onChange={(e) => handleFileUpload(e.target.files![0])}
      />
      <canvas
        id="react-midiVisualizer-canvas"
        ref={ref}
        height={height}
        width={width}
      />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
