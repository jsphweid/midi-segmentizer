import { Note } from ".";
import { NOTE_HEIGHT, X_EXPAND } from "./develop";

export class DrawableNote implements Note {
  public selected: boolean;
  public time: number;
  public duration: number;
  public midi: number;
  public velocity: number;

  constructor(note: Note) {
    this.selected = false;
    this.time = note.time;
    this.duration = note.duration;
    this.midi = note.midi;
    this.velocity = note.velocity;
  }

  public get x() {
    return this.time * X_EXPAND;
  }

  public get y() {
    return (127 - this.midi) * NOTE_HEIGHT;
  }

  public get width() {
    return this.duration * X_EXPAND;
  }

  public get height() {
    return NOTE_HEIGHT;
  }

  public get topLeft() {
    return { x: this.x, y: this.y };
  }

  public get bottomRight() {
    return { x: this.x + this.width, y: this.y + this.height };
  }
}
