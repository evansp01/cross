import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum Orientation {
  ACROSS,
  DOWN,
}

export type Value = string | null;

export interface Location {
  readonly row: number;
  readonly column: number;
}

export interface Cursor {
  readonly location: Location;
  readonly orientation: Orientation;
}

export interface Square {
  readonly location: Location;
  readonly value: Value;
}

export interface WordStart {
  readonly cursor: Cursor;
  readonly index: number;
}

export interface Clue {
  readonly cursor: Cursor;
  readonly value: string;
}

export interface WordPosition {
  word: number;
  position: number;
}

export interface Word {
  readonly cursor: Cursor;
  readonly index: number;
  readonly squares: Square[];
  readonly clue: Clue;
}

export interface WordInfo {
  downWords: Map<number, Word>;
  acrossWords: Map<number, Word>;
  downGrid: (WordPosition | null)[][];
  acrossGrid: (WordPosition | null)[][];
}

export interface Data {
  readonly author: string;
  readonly title: string;
  readonly copyright: string;
  readonly notes: string;
}

export class Grid {
  public readonly rows: number;
  public readonly columns: number;
  public readonly squares: ReadonlyArray<ReadonlyArray<Square>>;


  static emptyGrid(size: number): Grid {
    const squares: Square[][] = [];
    for (let i = 0; i < size; i++) {
      squares[i] = [];
      for (let j = 0; j < size; j++) {
        squares[i][j] = { location: { row: i, column: j }, value: '' };
      }
    }
    return new Grid(squares);
  }

  private constructor(squares: Square[][]) {
    this.rows = squares.length;
    this.columns = this.rows === 0 ? 0 : squares[0].length;
    this.squares = squares;
  }

  setSquare(location: Location, value: Value): Grid {
    if (location.column < 0 || location.column >= this.columns) {
      throw Error('invalid column' + location.column);
    }
    if (location.row < 0 || location.row >= this.rows) {
      throw Error('invalid row' + location.row);
    }
    // Deep copy the array. It's not necessary to copy the inner
    // tuples since they're const.
    const squares = this.squares.map(r => r.slice());
    squares[location.row][location.column] = { location, value };
    return new Grid(squares);
  }

  getSquare(location: Location): Square {
    return this.squares[location.row][location.column];
  }

  rotate180(location: Location): Location {
    return {
      row: (this.rows - 1) - location.row,
      column: (this.columns - 1) - location.column,
    };
  }

  getWordStarts(): WordStart[] {
    const words: WordStart[] = [];
    let index = 1;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.squares[i][j].value == null) {
          continue;
        }
        const currentIndex = index;
        const newDown: boolean = i === 0 || this.squares[i - 1][j].value == null;
        const newAcross: boolean = j === 0 || this.squares[i][j - 1].value == null;
        // If at least one new words starts at this square, reserve this index
        if (newDown || newAcross) {
          index++;
        }
        if (newDown) {
          words.push({
            cursor: { location: { row: i, column: j }, orientation: Orientation.DOWN },
            index: currentIndex
          });
        }
        if (newAcross) {
          words.push({
            cursor: { location: { row: i, column: j }, orientation: Orientation.ACROSS },
            index: currentIndex
          });
        }
      }
    }
    return words;
  }
}

export class ClueSet {
  private readonly clues: Map<string, Clue>;

  static emptyClueSet(): ClueSet {
    return new ClueSet([]);
  }

  private cursorKey(c: Cursor): string {
    return `${c.location.row},${c.location.column},${c.orientation}`;
  }

  private constructor(clues: Clue[]) {
    this.clues = new Map();
    clues.forEach(c => {
      this.clues.set(this.cursorKey(c.cursor), c);
    });
  }

  getClues(): IterableIterator<Clue> {
    return this.clues.values();
  }

  getClue(cursor: Cursor): Clue | undefined {
    return this.clues.get(this.cursorKey(cursor));
  }

  updateFrom(words: WordStart[]): ClueSet {
    const newClues: Clue[] = [];
    words.forEach(w => {
      const currentClue = this.clues.get(this.cursorKey(w.cursor));
      if (currentClue === undefined) {
        newClues.push({ cursor: w.cursor, value: '' });
      } else {
        newClues.push(currentClue);
      }
    });
    return new ClueSet(newClues);
  }

  setClue(cursor: Cursor, value: string): ClueSet {
    const clue = this.clues.get(this.cursorKey(cursor));
    if (clue === undefined) {
      throw new Error('Attempted to change clue for a non-existant word');
    }
    const newClues: Clue[] = [];
    this.clues.forEach(c => {
      if (c.cursor !== cursor) {
        newClues.push(c);
      }
    });
    newClues.push({ cursor, value });
    return new ClueSet(newClues);
  }
}

export class PuzzleState {
  public readonly grid: Grid;
  public readonly clues: ClueSet;
  public readonly cursor: Cursor;
  public readonly data: Data;

  static newState(size: number): PuzzleState {
    return PuzzleState.newStateFromGrid(Grid.emptyGrid(size));
  }

  static newStateFromGrid(grid: Grid): PuzzleState {
    const clues = ClueSet.emptyClueSet().updateFrom(grid.getWordStarts());
    return new PuzzleState(
      grid, clues,
      { location: { row: 0, column: 0 }, orientation: Orientation.ACROSS },
      { title: '', author: '', copyright: '', notes: '' });
  }

  private constructor(grid: Grid, existingClues: ClueSet, cursor: Cursor, data: Data) {
    this.grid = grid;
    this.cursor = cursor;
    const words = grid.getWordStarts();
    this.clues = existingClues.updateFrom(words);
    this.data = data;
  }

  setClue(cursor: Cursor, value: string): PuzzleState {
    return new PuzzleState(this.grid, this.clues.setClue(cursor, value), this.cursor, this.data);
  }

  setSquare(location: Location, value: Value): PuzzleState {
    const newGrid = this.grid.setSquare(location, value);
    return new PuzzleState(newGrid, this.clues.updateFrom(newGrid.getWordStarts()), this.cursor, this.data);
  }

  setCursor(cursor: Cursor): PuzzleState {
    return new PuzzleState(this.grid, this.clues, cursor, this.data);
  }

  setData(data: Data): PuzzleState {
    return new PuzzleState(this.grid, this.clues, this.cursor, data);
  }

  makeWordInfo(): WordInfo {
    const makeArray = (r: number, c: number) => {
      return [...Array<Array<WordPosition | null>>(r)].map(
        _ => Array<WordPosition | null>(c).fill(null));
    };
    const mappings: WordInfo = {
      downWords: new Map(),
      acrossWords: new Map(),
      downGrid: makeArray(this.grid.rows, this.grid.columns),
      acrossGrid: makeArray(this.grid.rows, this.grid.columns),
    };
    this.grid.getWordStarts().forEach(start => {
      const clue = this.clues.getClue(start.cursor);
      if (clue === undefined) {
        throw Error(`Internal: Word has no matching clue`);
      }
      const word = {
        cursor: start.cursor,
        index: start.index,
        squares: Array<Square>(),
        clue,
      };
      if (start.cursor.orientation === Orientation.ACROSS) {
        for (let j: number = start.cursor.location.column; j < this.grid.columns; j++) {
          if (this.grid.squares[start.cursor.location.row][j].value == null) { break; }
          word.squares.push(this.grid.squares[start.cursor.location.row][j]);
          mappings.acrossGrid[start.cursor.location.row][j] = {
            word: start.index, position: j - start.cursor.location.column
          };
        }
        mappings.acrossWords.set(start.index, word);
      } else if (start.cursor.orientation === Orientation.DOWN) {
        for (let i: number = start.cursor.location.row; i < this.grid.rows; i++) {
          if (this.grid.squares[i][start.cursor.location.column].value == null) { break; }
          word.squares.push(this.grid.squares[i][start.cursor.location.column]);
          mappings.downGrid[i][start.cursor.location.column] = {
            word: start.index, position: i - start.cursor.location.row
          };
        }
        mappings.downWords.set(start.index, word);
      }
    });
    return mappings;
  }
}


@Injectable({
  providedIn: 'root'
})
export class PuzzleStateService {

  private past: PuzzleState[];
  private future: PuzzleState[];
  private state: BehaviorSubject<PuzzleState>;

  constructor() {
    this.state = new BehaviorSubject(PuzzleState.newState(15));
    this.past = [];
    this.future = [];
  }

  getState(): BehaviorSubject<PuzzleState> {
    return this.state;
  }

  setState(newState: PuzzleState): PuzzleState {
    this.past.push(this.state.value);
    this.state.next(newState);
    this.future = [];
    return newState;
  }

  setClue(cursor: Cursor, value: string): PuzzleState {
    const state = this.getState().value;
    return this.setState(state.setClue(cursor, value)).setCursor(cursor);
  }

  setSquare(cursor: Cursor, value: Value): PuzzleState {
    const state = this.getState().value;
    const square = state.grid.getSquare(cursor.location).value;
    // If the current square is black, setting it black again will toggle.
    if (square === null && value === null) {
      value = '';
    }
    let newState: PuzzleState;
    if (square === null && value !== null) {
      const rotated = state.grid.rotate180(cursor.location);
      newState = state.setSquare(cursor.location, value).setSquare(rotated, '').setCursor(cursor);
    } else if (value === null && square !== null) {
      const rotated = state.grid.rotate180(cursor.location);
      newState = state.setSquare(cursor.location, null).setSquare(rotated, null).setCursor(cursor);
    } else {
      newState = state.setSquare(cursor.location, value).setCursor(cursor);
    }
    return this.setState(newState);
  }

  undo(): void {
    const newState = this.past.pop();
    if (newState === undefined) {
      return;
    }
    this.future.push(this.state.value);
    this.state.next(newState);
  }

  redo(): void {
    const newState = this.future.pop();
    if (newState === undefined) {
      return;
    }
    this.past.push(this.state.value);
    this.state.next(newState);
  }
}
