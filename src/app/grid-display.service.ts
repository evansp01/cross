import { Injectable } from '@angular/core';
import { BehaviorSubject, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { WordInfo, Word, Value, Cursor, Location, PuzzleState, Orientation, StateService, WordPosition, Square } from './state.service';

function displayWordComparitor(): MonoTypeOperatorFunction<DisplayWord|null> {
  return distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b));
}

function wordToDisplay(word: Word, pos: WordPosition): DisplayWord {
  return {
    characters: word.squares.map(s => s.value == null ? ' ' : s.value.toLowerCase()),
    wordNumber: pos.word,
    cursorPosition: pos.position,
    clue: word.clue.value,
  };
}

export enum DisplayState {
  REGULAR,
  HIGHLIGHTED,
  FOCUS,
}

export interface DisplaySquare {
  readonly location: Location;
  value: Value;
  wordNumber: number | null;
  state: DisplayState;
}

export interface DisplayWord {
  characters: string[];
  wordNumber: number;
  cursorPosition: number;
  clue: string;
}

@Injectable({
  providedIn: 'root'
})
export class GridDisplayService {
  displayState = DisplayState;

  private stateService: StateService;
  private display: DisplaySquare[][];

  private cursor!: Cursor;
  private rows!: number;
  private columns!: number;
  private wordInfo!: WordInfo;

  private acrossWord: BehaviorSubject<DisplayWord | null>;
  private downWord: BehaviorSubject<DisplayWord | null>;

  constructor(stateService: StateService) {
    this.stateService = stateService;
    const state = stateService.getState().value;
    this.display = state.grid.squares.map(row => row.map(square => {
      return {
        location: square.location,
        value: square.value,
        wordNumber: null,
        state: DisplayState.REGULAR
      };
    }));
    this.acrossWord = new BehaviorSubject<DisplayWord | null>(null);
    this.downWord = new BehaviorSubject<DisplayWord | null>(null);
    this.refreshDisplayFromState(state);
    this.stateService.getState().subscribe({
      next: s => {
        this.refreshDisplayFromState(s);
      },
    });
  }

  private refreshDisplayFromState(state: PuzzleState): void {
    this.cursor = state.cursor;
    this.rows = state.grid.rows;
    this.columns = state.grid.columns;
    this.wordInfo = state.makeWordInfo();
    this.display.forEach(row => row.forEach(square => {
      square.value = state.grid.squares[square.location.row][square.location.column].value;
      square.wordNumber = null;
    }));
    this.wordInfo.acrossWords.forEach(w => {
      this.display[w.cursor.location.row][w.cursor.location.column].wordNumber = w.index;
    });
    this.wordInfo.downWords.forEach(w => {
      this.display[w.cursor.location.row][w.cursor.location.column].wordNumber = w.index;
    });
    this.updateDisplayHighlighting();
  }

  private updateDisplayHighlighting(): void {
    this.display.forEach(row => row.forEach(square => {
      square.state = DisplayState.REGULAR;
    }));
    const acrossWordNum = this.wordInfo.acrossGrid[this.cursor.location.row][this.cursor.location.column];
    const downWordNum = this.wordInfo.downGrid[this.cursor.location.row][this.cursor.location.column];
    if (acrossWordNum != null && downWordNum != null) {
      const acrossWord = this.wordInfo.acrossWords.get(acrossWordNum.word);
      const downWord = this.wordInfo.downWords.get(downWordNum.word);
      if (acrossWord === undefined || downWord === undefined) {
        throw Error('internal state broken');
      }
      const toHighlight = this.cursor.orientation === Orientation.ACROSS ? acrossWord : downWord;
      toHighlight.squares.forEach(s => {
        this.display[s.location.row][s.location.column].state = DisplayState.HIGHLIGHTED;
      });
      this.acrossWord.next(wordToDisplay(acrossWord, acrossWordNum));
      this.downWord.next(wordToDisplay(downWord, downWordNum));
    } else {
      this.downWord.next(null);
      this.acrossWord.next(null);
    }
    this.display[this.cursor.location.row][this.cursor.location.column].state = DisplayState.FOCUS;
  }

  private currentSquare(): Square {
    return this.display[this.cursor.location.row][this.cursor.location.column];
  }

  getDisplay(): DisplaySquare[][] {
    return this.display;
  }

  getAcrossWord(): Observable<DisplayWord | null> {
    return this.acrossWord.pipe(displayWordComparitor());
  }

  getDownWord(): Observable<DisplayWord | null> {
    return this.downWord.pipe(displayWordComparitor());
  }

  moveAcross(step: number): void {
    let column = this.cursor.location.column;
    if (this.currentSquare().value == null || this.cursor.orientation === Orientation.ACROSS) {
      if (column + step >= 0 && column + step < this.columns) {
        column += step;
      }
    }
    this.cursor = {
      location: { row: this.cursor.location.row, column },
      orientation: Orientation.ACROSS
    };
    this.updateDisplayHighlighting();
  }

  moveDown(step: number): void {
    let row = this.cursor.location.row;
    if (this.currentSquare().value == null || this.cursor.orientation === Orientation.DOWN) {
      if (row + step >= 0 && row + step < this.rows) {
        row += step;
      }
    }
    this.cursor = {
      location: { row, column: this.cursor.location.column },
      orientation: Orientation.DOWN
    };
    this.updateDisplayHighlighting();
  }

  mutateAndStep(value: Value, step: number): void {
    this.stateService.setSquare(this.cursor, value);
    if (this.cursor.orientation === Orientation.ACROSS) {
      this.moveAcross(step);
    }
    if (this.cursor.orientation === Orientation.DOWN) {
      this.moveDown(step);
    }
  }
}
 