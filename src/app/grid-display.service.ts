import { Injectable } from '@angular/core';

import { WordInfo, Word, Value, Cursor, Location, PuzzleState, WordPosition, Orientation, StateService } from './state.service'



export enum DisplayState {
  REGULAR,
  HIGHLIGHTED,
  FOCUS,
}

export interface DisplaySquare {
  readonly location: Location
  value: Value
  wordNumber: number | null
  state: DisplayState
}

@Injectable({
  providedIn: 'root'
})
export class GridDisplayService {
  displayState = DisplayState
  stateService: StateService

  cursor!: Cursor
  rows!: number
  columns!: number
  display: DisplaySquare[][]

  wordInfo!: WordInfo;

  constructor(stateService: StateService) {
    this.stateService = stateService
    var state = stateService.getState().value
    this.display = state.grid.squares.map(row => row.map(square => {
      return {
        location: square.location,
        value: square.value,
        wordNumber: null,
        state: DisplayState.REGULAR
      }
    }))
    this.refreshDisplayFromState(state)
    this.stateService.getState().subscribe({next: s => {
      this.refreshDisplayFromState(s)
    }})
  }

  private refreshDisplayFromState(state: PuzzleState) {
    this.cursor = state.cursor
    this.rows = state.grid.rows
    this.columns = state.grid.columns
    this.wordInfo = state.makeWordInfo()
    this.display.forEach(row => row.forEach(square => {
      square.value = state.grid.squares[square.location.row][square.location.column].value
      square.wordNumber = null
    }))
    this.wordInfo.acrossWords.forEach(w => {
      this.display[w.cursor.location.row][w.cursor.location.column].wordNumber = w.index
    })
    this.wordInfo.downWords.forEach(w => {
      this.display[w.cursor.location.row][w.cursor.location.column].wordNumber = w.index
    })
    this.updateDisplayHighlighting()
  }

  private updateDisplayHighlighting() {
    this.display.forEach(row => row.forEach(square => {
      square.state = DisplayState.REGULAR
    }))
    var words: Map<number, Word>
    var wordNum: WordPosition|null;
    if(this.cursor.orientation == Orientation.ACROSS) {
      words = this.wordInfo.acrossWords
      wordNum = this.wordInfo.acrossGrid[this.cursor.location.row][this.cursor.location.column]
    } else {
      words = this.wordInfo.downWords
      wordNum = this.wordInfo.downGrid[this.cursor.location.row][this.cursor.location.column]
    }
    if(wordNum != null) {
      words.get(wordNum.word)?.squares.forEach(s => {
        this.display[s.location.row][s.location.column].state = DisplayState.HIGHLIGHTED
      })
    }
    this.display[this.cursor.location.row][this.cursor.location.column].state = DisplayState.FOCUS
  }

  private currentSquare() {
    return this.display[this.cursor.location.row][this.cursor.location.column];
  }

  moveAcross(step: number) {
    var column = this.cursor.location.column
    if (this.currentSquare().value == null || this.cursor.orientation == Orientation.ACROSS) {
      if (column + step >= 0 && column + step < this.columns) {
        column += step;
      }
    }
    this.cursor = { location: { row: this.cursor.location.row, column: column }, orientation: Orientation.ACROSS }
    this.updateDisplayHighlighting()
  }

  moveDown(step: number) {
    var row = this.cursor.location.row
    if (this.currentSquare().value == null || this.cursor.orientation == Orientation.DOWN) {
      if (row + step >= 0 && row + step < this.rows) {
        row += step;
      }
    }
    this.cursor = { location: { row: row, column: this.cursor.location.column }, orientation: Orientation.DOWN }
    this.updateDisplayHighlighting()
  }

  mutateAndStep(value: Value, step: number) {
    this.stateService.setSquare(this.cursor, value)
    if (this.cursor.orientation == Orientation.ACROSS) {
      this.moveAcross(step)
    }
    if (this.cursor.orientation == Orientation.DOWN) {
      this.moveDown(step)
    }
  }
}
