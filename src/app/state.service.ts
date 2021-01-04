import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum Orientation {
  ACROSS,
  DOWN,
}

export type Value = string | null

export interface Location {
  readonly row: number
  readonly column: number
}

export interface Cursor {
  readonly location: Location
  readonly orientation: Orientation
}

export interface Square {
  readonly location: Location
  readonly value: Value
}

export interface WordStart {
  readonly cursor: Cursor
  readonly index: number
}

export interface Clue {
  readonly cursor: Cursor
  readonly value: string
}

export interface WordPosition {
  word: number
  position: number
}

export interface Word {
  readonly cursor: Cursor
  readonly index: number
  readonly squares: Square[]
  readonly clue: Clue
}

export interface WordInfo {
  downWords: Map<number, Word>
  acrossWords: Map<number, Word>
  downGrid: (WordPosition | null)[][]
  acrossGrid: (WordPosition | null)[][]
}

export class Grid {
  public readonly rows: number
  public readonly columns: number
  public readonly squares: ReadonlyArray<ReadonlyArray<Square>>


  static emptyGrid(size: number): Grid {
    var squares: Square[][] = []
    for (var i: number = 0; i < size; i++) {
      squares[i] = []
      for (var j: number = 0; j < size; j++) {
        squares[i][j] = { location: { row: i, column: j }, value: "" }
      }
    }
    return new Grid(squares)
  }

  private constructor(squares: Square[][]) {
    this.rows = squares.length
    this.columns = this.rows == 0 ? 0 : squares[0].length
    this.squares = squares
  }

  setSquare(location: Location, value: Value): Grid {
    if (location.column < 0 || location.column >= this.columns) {
      throw Error("invalid column" + location.column)
    }
    if (location.row < 0 || location.row >= this.rows) {
      throw Error("invalid row" + location.row)
    }
    // Deep copy the array. It's not necessary to copy the inner
    // tuples since they're const.
    var squares = this.squares.map(r => r.slice())
    squares[location.row][location.column] = { location: location, value: value }
    return new Grid(squares)
  }

  getWordStarts(): WordStart[] {
    var words: WordStart[] = []
    var index: number = 1

    for (var i: number = 0; i < this.rows; i++) {
      for (var j: number = 0; j < this.columns; j++) {
        if (this.squares[i][j].value == null) {
          continue
        }
        var currentIndex = index
        var newDown: boolean = i == 0 || this.squares[i - 1][j].value == null
        var newAcross: boolean = j == 0 || this.squares[i][j - 1].value == null
        // If at least one new words starts at this square, reserve this index
        if (newDown || newAcross) {
          index++;
        }
        if (newDown) {
          words.push({
            cursor: { location: { row: i, column: j }, orientation: Orientation.DOWN },
            index: currentIndex
          })
        }
        if (newAcross) {
          words.push({
            cursor: { location: { row: i, column: j }, orientation: Orientation.ACROSS },
            index: currentIndex
          })
        }
      }
    }
    return words
  }
}

export class ClueSet {
  private readonly clues: Map<string, Clue>

  static emptyClueSet(): ClueSet {
    return new ClueSet([]);
  }

  private cursorKey(c: Cursor): string {
    return `${c.location.row},${c.location.column},${c.orientation}`
  }

  private constructor(clues: Clue[]) {
    this.clues = new Map()
    clues.forEach(c => {
      this.clues.set(this.cursorKey(c.cursor), c)
    })
  }

  getClues(): IterableIterator<Clue> {
    return this.clues.values()
  }

  getClue(cursor: Cursor): Clue | undefined {
    return this.clues.get(this.cursorKey(cursor))
  }

  updateFrom(words: WordStart[]): ClueSet {
    var newClues: Clue[] = []
    words.forEach(w => {
      var currentClue = this.clues.get(this.cursorKey(w.cursor))
      if (currentClue == undefined) {
        newClues.push({ cursor: w.cursor, value: "" })
      } else {
        newClues.push(currentClue)
      }
    })
    return new ClueSet(newClues)
  }

  setClue(cursor: Cursor, value: string): ClueSet {
    var clue = this.clues.get(this.cursorKey(cursor))
    if (clue == undefined) {
      throw new Error("Attempted to change clue for a non-existant word")
    }
    var newClues: Clue[] = []
    this.clues.forEach(c => {
      if (c.cursor != cursor) {
        newClues.push(c)
      }
    })
    newClues.push({ cursor: cursor, value: value })
    return new ClueSet(newClues)
  }
}





export class PuzzleState {
  public readonly grid: Grid
  public readonly clues: ClueSet
  public readonly cursor: Cursor

  static newState(size: number) {
    var grid = Grid.emptyGrid(size)
    var clues = ClueSet.emptyClueSet().updateFrom(grid.getWordStarts())
    return new PuzzleState(grid, clues, { location: { row: 0, column: 0 }, orientation: Orientation.ACROSS })
  }

  private constructor(grid: Grid, existingClues: ClueSet, cursor: Cursor) {
    this.grid = grid
    this.cursor = cursor
    var words = grid.getWordStarts()
    this.clues = existingClues.updateFrom(words)
  }

  setClue(cursor: Cursor, value: string): PuzzleState {
    return new PuzzleState(this.grid, this.clues.setClue(cursor, value), cursor)
  }

  setSquare(cursor: Cursor, value: Value): PuzzleState {
    var newGrid = this.grid.setSquare(cursor.location, value)
    return new PuzzleState(newGrid, this.clues.updateFrom(newGrid.getWordStarts()), cursor)
  }


  makeWordInfo(): WordInfo {
    let makeArray = (r: number, c: number) => [...Array<Array<WordPosition | null>>(r)].map(r => Array<WordPosition | null>(c).fill(null))
    var mappings: WordInfo = {
      downWords: new Map(),
      acrossWords: new Map(),
      downGrid: makeArray(this.grid.rows, this.grid.columns),
      acrossGrid: makeArray(this.grid.rows, this.grid.columns),
    }
    this.grid.getWordStarts().forEach(start => {
      var clue = this.clues.getClue(start.cursor)
      if (clue == undefined) {
        throw Error(`Internal: Word has no matching clue`);
      }
      var word = {
        cursor: start.cursor,
        index: start.index,
        squares: Array<Square>(),
        clue: clue,
      }
      if (start.cursor.orientation == Orientation.ACROSS) {
        for (var j: number = start.cursor.location.column; j < this.grid.columns; j++) {
          if (this.grid.squares[start.cursor.location.row][j].value == null) break
          word.squares.push(this.grid.squares[start.cursor.location.row][j])
          mappings.acrossGrid[start.cursor.location.row][j] = {
            word: start.index, position: j - start.cursor.location.column
          }
        }
        mappings.acrossWords.set(start.index, word)
      } else if (start.cursor.orientation == Orientation.DOWN) {
        for (var i: number = start.cursor.location.row; i < this.grid.rows; i++) {
          if (this.grid.squares[i][start.cursor.location.column].value == null) break
          word.squares.push(this.grid.squares[i][start.cursor.location.column])
          mappings.downGrid[i][start.cursor.location.column] = {
            word: start.index, position: i - start.cursor.location.row
          }
        }
        mappings.downWords.set(start.index, word)
      }
    });
    return mappings
  }
}


@Injectable({
  providedIn: 'root'
})
export class StateService {

  private past: PuzzleState[]
  private future: PuzzleState[]
  private state: BehaviorSubject<PuzzleState>

  constructor() {
    this.state = new BehaviorSubject(PuzzleState.newState(15))
    this.past = []
    this.future = []
  }

  getState(): BehaviorSubject<PuzzleState> {
    return this.state
  }

  setState(newState: PuzzleState): PuzzleState{
    this.past.push(this.state.value)
    this.state.next(newState)
    this.future = []
    return newState
  }

  setClue(cursor: Cursor, value: string): PuzzleState {
    return this.setState(this.getState().value.setClue(cursor, value))
  }

  setSquare(cursor: Cursor, value: Value): PuzzleState {
    return this.setState(this.getState().value.setSquare(cursor, value))
  }

  undo() {
    var newState = this.past.pop()
    if (newState == undefined) {
      return
    }
    this.future.push(this.state.value)
    this.state.next(newState)
  }

  redo() {
    var newState = this.future.pop()
    if (newState == undefined) {
      return
    }
    this.past.push(this.state.value)
    this.state.next(newState)
  }
}
