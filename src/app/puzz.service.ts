import { Injectable } from '@angular/core';
import { Grid, Orientation, PuzzleState, Value } from './state.service';

class PuzzBuffer {
  // Note that one character maps to one byte
  static readonly encoding = 'latin1';
  readonly buf: Buffer;
  index: number;

  constructor(buf: Uint8Array) {
    this.buf = Buffer.from(buf);
    this.index = 0;
  }

  seekTo(str: string, offset: number): boolean {
    const index = this.buf.indexOf(str, this.index, PuzzBuffer.encoding);
    if (index < 0) {
      this.index = this.buf.length;
      return false;
    }
    this.index = offset + index;
    return true;
  }

  readChar(): number {
    const tmp = this.buf.readUInt8(this.index);
    this.index++;
    return tmp;
  }

  writeChar(char: number): void {
    this.buf.writeUInt8(char, this.index);
    this.index++;
  }

  readShort(): number {
    const tmp = this.buf.readUInt16LE(this.index);
    this.index += 2;
    return tmp;
  }

  writeShort(short: number): void {
    this.buf.writeUInt16LE(short, this.index);
    this.index += 2;
  }

  readBytes(count: number): Uint8Array {
    const tmp = this.buf.slice(this.index, this.index + count);
    this.index += count;
    return tmp;
  }

  writeBytes(arr: Uint8Array): void {
    arr.forEach(v => {
      this.buf[this.index] = v;
      this.index++;
    });
  }

  readStringN(n: number): string {
    const str = this.buf.toString(PuzzBuffer.encoding, this.index, this.index + n);
    this.index = this.index + n;
    return str;
  }

  writeString(str: string): void {
    const written = this.buf.write(str, this.index, PuzzBuffer.encoding);
    this.index = this.index + written;
  }

  writeStringN(str: string, n: number): void {
    this.buf.write(str, this.index, n, PuzzBuffer.encoding);
    this.index = this.index + n;
  }

  readString(): string {
    let i = this.index;
    while (this.buf[i] !== 0) {
      i++;
    }
    const str = this.buf.toString(PuzzBuffer.encoding, this.index, i);
    // Advance past the null terminating character.
    this.index = i + 1;
    return str;
  }

  isFinished(): boolean {
    return this.index === this.buf.length;
  }
}

export class Puzz {
  static readonly magic = 'ACROSS&DOWN';

  preamble: Uint8Array;
  versionString: string;
  reserved1C: Uint8Array;
  scrambledChecksum: number;
  reserved20: Uint8Array;
  width: number;
  height: number;
  puzzleType: number;
  scrambledTag: number;

  puzzle: string;
  state: string;

  title: string;
  author: string;
  copyright: string;
  clues: string[];
  notes: string;

  postscript: Uint8Array;

  constructor() {
    this.preamble = Uint8Array.of();
    this.versionString = '1.3';
    this.reserved1C = new Uint8Array(2);
    this.scrambledChecksum = 0;
    this.reserved20 = new Uint8Array(12);
    this.width = 0;
    this.height = 0;
    this.puzzleType = 0x0001;
    this.scrambledTag = 0x0000;
    this.puzzle = '';
    this.state = '';
    this.title = '';
    this.author = '';
    this.copyright = '';
    this.clues = [];
    this.notes = '';
    this.postscript = Uint8Array.of();
  }

  read(buff: Uint8Array): void {
    const buf = new PuzzBuffer(buff);
    if (!buf.seekTo(Puzz.magic, -2)) {
      throw Error('Missing magic string, prob not a thing');
    }
    this.preamble = buf.buf.slice(0, buf.index);
    const fileChecksum = buf.readShort();
    // "ACROSS&DOWN"
    buf.readBytes(12);
    const headerChecksum =  buf.readShort();
    const magicChecksum = buf.readBytes(8);
    // TODO: handle version.
    this.versionString = buf.readStringN(4);
    this.reserved1C = buf.readBytes(2);
    this.scrambledChecksum = buf.readShort();
    this.reserved20 = buf.readBytes(12);
    this.width = buf.readChar();
    this.height = buf.readChar();
    const clueCount = buf.readShort();
    this.puzzleType = buf.readShort();
    this.scrambledTag = buf.readShort();
    this.puzzle = buf.readStringN(this.width * this.height);
    this.state = buf.readStringN(this.width * this.height);
    this.title = buf.readString();
    this.author =  buf.readString();
    this.copyright =  buf.readString();
    this.clues = [];
    for (let i = 0; i < clueCount; i++) {
      this.clues.push(buf.readString());
    }
    this.notes = buf.readString();
    this.postscript = buf.readBytes(buf.buf.length - buf.index);

    if (fileChecksum !== this.computeFileChecksum()) {
      throw Error('Fails file checksum');
    }
    if (headerChecksum !== this.computeHeaderChecksum()) {
      throw Error('Fails header checksum');
    }
    const expectedMagicChecksum = this.computeMagicChecksum();
    for (let i = 0; i < 8; i++) {
      if (expectedMagicChecksum[i] !== magicChecksum[i]) {
        throw Error('Fails magic checksum');
      }
    }
  }

  byteSize(): number {
    const headerSize = 52;
    const gridAndSoln = 2 * this.width * this.height;
    const namedStrings = 4 + this.title.length + this.author.length + this.copyright.length + this.notes.length;
    const clues = this.clues.map(c => c.length + 1).reduce((a, b) => a + b, 0);
    const junk = this.preamble.length + this.postscript.length;
    return headerSize + gridAndSoln + namedStrings + clues + junk;
  }

  write(): Uint8Array {
    const buf = new PuzzBuffer(new Uint8Array(this.byteSize()));
    buf.writeBytes(this.preamble);
    buf.writeShort(this.computeFileChecksum());
    buf.writeString(Puzz.magic + '\0');
    buf.writeShort(this.computeHeaderChecksum());
    buf.writeBytes(this.computeMagicChecksum());
    buf.writeStringN(this.versionString, 4);
    buf.writeBytes(this.reserved1C);
    buf.writeShort(this.scrambledChecksum);
    buf.writeBytes(this.reserved20);
    buf.writeChar(this.width);
    buf.writeChar(this.height);
    buf.writeShort(this.clues.length);
    buf.writeShort(this.puzzleType);
    buf.writeShort(this.scrambledTag);
    buf.writeStringN(this.puzzle, this.width * this.height);
    buf.writeStringN(this.state, this.width * this.height);
    buf.writeString(this.title + '\0');
    buf.writeString(this.author + '\0');
    buf.writeString(this.copyright + '\0');
    for (const clue of this.clues) {
      buf.writeString(clue + '\0');
    }
    buf.writeString(this.notes + '\0');
    buf.writeBytes(this.postscript);
    return new Uint8Array(buf.buf.buffer);
  }

  checksumBuffer(arr: Buffer, checksum: number = 0): number {
    for (const byte of arr) {
      // tslint:disable: no-bitwise
      const lowbit = checksum & 0x0001;
      checksum = (checksum >> 1);
      if (lowbit) {
        checksum = (checksum | 0x8000);
      }
      checksum = (checksum + byte) & 0xffff;
      // tslint:enable: no-bitwise
    }
    return checksum;
  }

  checksumString(str: string, checksum: number = 0): number {
    const buf = new PuzzBuffer(new Uint8Array(str.length));
    buf.writeString(str);
    return this.checksumBuffer(buf.buf, checksum);
  }

  computeHeaderChecksum(checksum: number = 0): number {
    const buf = new PuzzBuffer(new Uint8Array(8));
    buf.writeChar(this.width);
    buf.writeChar(this.height);
    buf.writeShort(this.clues.length);
    buf.writeShort(this.puzzleType);
    buf.writeShort(this.scrambledTag);
    return this.checksumBuffer(buf.buf, checksum);
  }

  computeTextChecksum(checksum: number = 0): number {
    if (this.title) {
      checksum = this.checksumString(this.title + '\0', checksum);
    }
    if (this.author) {
      checksum = this.checksumString(this.author + '\0', checksum);
    }
    if (this.copyright) {
      checksum = this.checksumString(this.copyright + '\0', checksum);
    }
    for (const clue of this.clues) {
      if (clue) {
        checksum = this.checksumString(clue, checksum);
      }
    }
    // TODO: handle version < 1.3
    if (this.notes) {
      checksum = this.checksumString(this.notes + '\0', checksum);
    }
    return checksum;
  }

  computeFileChecksum(checksum: number = 0): number {
    checksum = this.computeHeaderChecksum(checksum);
    checksum = this.checksumString(this.puzzle, checksum);
    checksum = this.checksumString(this.state, checksum);
    checksum = this.computeTextChecksum(checksum);
    return checksum;
  }

  computeMagicChecksum(): Uint8Array {
    const headerChecksum = this.computeHeaderChecksum();
    const solutionChecksum = this.checksumString(this.puzzle);
    const fillChecksum = this.checksumString(this.state);
    const textChecksum = this.computeTextChecksum();
    const magic = new Uint8Array(8);

    // tslint:disable: no-bitwise
    magic[0] = 0x49 ^ (headerChecksum & 0xFF);
    magic[1] = 0x43 ^ (solutionChecksum & 0xFF);
    magic[2] = 0x48 ^ (fillChecksum & 0xFF);
    magic[3] = 0x45 ^ (textChecksum & 0xFF);

    magic[4] = 0x41 ^ ((headerChecksum & 0xFF00) >> 8);
    magic[5] = 0x54 ^ ((solutionChecksum & 0xFF00) >> 8);
    magic[6] = 0x45 ^ ((fillChecksum & 0xFF00) >> 8);
    magic[7] = 0x44 ^ ((textChecksum & 0xFF00) >> 8);
    // tslint:enable: no-bitwise
    return magic;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PuzzService {

  constructor() { }

  puzzleStateFromPuz(arr: Uint8Array): PuzzleState {
    const puz = new Puzz();
    puz.read(arr);
    if (puz.width !== puz.height) {
      throw Error('Only square puzzles are currently supported');
    }

    let grid = Grid.emptyGrid(puz.width);
    for (let i = 0; i < puz.width; i++) {
      for (let j = 0; j < puz.width; j++) {
        let value: Value = puz.puzzle[i * puz.width + j];
        if (value === '.') {
          value = null;
        }
        grid = grid.setSquare({ row: i, column: j}, value);
      }
    }
    let state = PuzzleState.newStateFromGrid(grid);
    let clueIndex = 0;
    for (let row = 0; row < state.grid.rows; row++) {
      for (let column = 0; column < state.grid.columns; column++) {
        for (const orientation of [Orientation.ACROSS, Orientation.DOWN]) {
          const clue = state.clues.getClue({orientation, location: { row, column}});
          if (clue !== undefined) {
            state = state.setClue(clue.cursor, puz.clues[clueIndex]);
            clueIndex++;
          }
        }
      }
    }
    state = state.setData({
      originFile: { file: puz.write(), type: 'puz' },
      title: puz.title,
      author: puz.author,
    });
    return state;
  }

  puzFromPuzzleState(state: PuzzleState): Uint8Array {
    const puz = new Puzz();
    if (state.data.originFile != null && state.data.originFile.type === 'puz') {
      puz.read(state.data.originFile.file);
    }
    puz.width = state.grid.rows;
    puz.height = state.grid.rows;
    puz.author = state.data.author;
    puz.title = state.data.title;
    puz.puzzle = state.grid.squares.map(row => row.map(square => {
      if (square.value === null) {
        return '.';
      } else  {
        return square.value;
      }
    }).join('')).join('');
    console.log(puz.clues);
    puz.clues = [];
    for (let row = 0; row < state.grid.rows; row++) {
      for (let column = 0; column < state.grid.columns; column++) {
        for (const orientation of [Orientation.ACROSS, Orientation.DOWN]) {
          const clue = state.clues.getClue({orientation, location: { row, column}});
          if (clue !== undefined) {
            puz.clues.push(clue.value);
          }
        }
      }
    }
    console.log(puz.clues);
    return puz.write();
  }
}
