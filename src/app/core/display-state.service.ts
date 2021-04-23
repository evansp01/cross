import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { WordInfo, Word, Value, Cursor, Location, PuzzleState, Orientation, PuzzleStateService, WordPosition, Square, cursorEqual } from './puzzle-state.service';

function wordToDisplay(word: Word, pos: WordPosition): DisplayWord {
  return {
    location: word.squares[0].location,
    // Note: value cannot be null within a word.
    characters: word.squares.map(s => s.value == null ? '' : s.value.toLowerCase()),
    wordNumber: pos.word,
    cursorPosition: pos.position,
    clue: word.clue.value,
  };
}

function wordsToDisplayClues(words: IterableIterator<Word>): DisplayClue[] {
  const clues = [];
  for (const word of words) {
    const text = word.squares.map((s: Square) => {
      if (s.value === '') {
        return '_';
      } else {
        return s.value;
      }
    }).join('');
    clues.push({
      index: word.index,
      clue: word.clue.value,
      word: text,
      cursor: word.clue.cursor,
      focus: false,
    });
  }
  return clues;
}

function switchOrientation(orientation: Orientation): Orientation {
  switch (orientation) {
    case Orientation.ACROSS:
      return Orientation.DOWN;
    case Orientation.DOWN:
      return Orientation.ACROSS;
  }
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
  readonly location: Location;
  readonly characters: string[];
  readonly wordNumber: number;
  readonly cursorPosition: number;
  readonly clue: string;
}

export interface DisplayClue {
  readonly index: number;
  readonly word: string;
  readonly clue: string;
  readonly cursor: Cursor;
  focus: boolean;
}

export interface CurrentWord {
  readonly cursor: Cursor;
  readonly across: DisplayWord;
  readonly down: DisplayWord;
}

@Injectable({
  providedIn: 'root'
})
export class DisplayStateService implements OnDestroy {
  private subscriptions = new Subscription();
  private puzzleStateService: PuzzleStateService;
  private display: DisplaySquare[][];
  private acrossClues: DisplayClue[];
  private downClues: DisplayClue[];

  private rows!: number;
  private columns!: number;
  private wordInfo!: WordInfo;
  private cursor!: Cursor;

  private currentWord: BehaviorSubject<CurrentWord | null>;

  constructor(puzzleStateService: PuzzleStateService) {
    this.puzzleStateService = puzzleStateService;
    const state = puzzleStateService.getState().value;
    this.display = state.grid.squares.map(row => row.map(square => {
      return {
        location: square.location,
        value: square.value,
        wordNumber: null,
        state: DisplayState.REGULAR
      };
    }));
    this.acrossClues = [];
    this.downClues = [];
    this.currentWord = new BehaviorSubject<CurrentWord | null>(null);
    this.refreshDisplayFromState(state);
    this.subscriptions.add(this.puzzleStateService.getState().subscribe({
      next: s => {
        this.refreshDisplayFromState(s);
      },
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private refreshDisplayFromState(state: PuzzleState): void {
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

    this.acrossClues = wordsToDisplayClues(
      this.wordInfo.acrossWords.values()).sort((a, b) => a.index - b.index);
    this.downClues = wordsToDisplayClues(
      this.wordInfo.downWords.values()).sort((a, b) => a.index - b.index);

    this.updateDisplayHighlighting(state.cursor);
  }


  private updateDisplayHighlighting(cursor: Cursor): void {
    this.cursor = cursor;
    this.display.forEach(row => row.forEach(square => {
      square.state = DisplayState.REGULAR;
    }));
    const acrossWordNum = this.wordInfo.acrossGrid[cursor.location.row][cursor.location.column];
    const downWordNum = this.wordInfo.downGrid[cursor.location.row][cursor.location.column];

    let nextWord: CurrentWord | null = null;
    if (acrossWordNum != null && downWordNum != null) {
      const acrossWord = this.wordInfo.acrossWords.get(acrossWordNum.word);
      const downWord = this.wordInfo.downWords.get(downWordNum.word);
      if (acrossWord === undefined || downWord === undefined) {
        throw Error('internal state broken');
      }
      const focus = cursor.orientation === Orientation.ACROSS ? acrossWord : downWord;
      focus.squares.forEach(s => {
        this.display[s.location.row][s.location.column].state = DisplayState.HIGHLIGHTED;
      });
      nextWord = {
        cursor: focus.cursor,
        across: wordToDisplay(acrossWord, acrossWordNum),
        down: wordToDisplay(downWord, downWordNum),
      };
    }
    const focusCursor = nextWord !== null ? nextWord.cursor : null;
    this.acrossClues.forEach(c => { c.focus = cursorEqual(c.cursor, focusCursor); });
    this.downClues.forEach(c => { c.focus = cursorEqual(c.cursor, focusCursor); });
    this.display[cursor.location.row][cursor.location.column].state = DisplayState.FOCUS;
    this.currentWord.next(nextWord);
  }

  private currentSquare(): Square {
    return this.display[this.cursor.location.row][this.cursor.location.column];
  }

  getDisplay(): DisplaySquare[][] {
    return this.display;
  }

  getAcrossClues(): DisplayClue[] {
    return this.acrossClues;
  }

  getDownClues(): DisplayClue[] {
    return this.downClues;
  }

  getCurrentWord(): Observable<CurrentWord | null> {
    return this.currentWord;
  }

  moveAcross(step: number): void {
    const cursor = this.cursor;
    let column = cursor.location.column;
    if (this.currentSquare().value == null || cursor.orientation === Orientation.ACROSS) {
      if (column + step >= 0 && column + step < this.columns) {
        column += step;
      }
    }
    this.updateDisplayHighlighting({
      location: { row: cursor.location.row, column },
      orientation: Orientation.ACROSS
    });
  }

  moveCursorToSquareOrToggle(location: Location): void {
    let cursor = this.cursor;
    if (location === cursor.location) {
      cursor = {
        location: cursor.location,
        orientation: switchOrientation(cursor.orientation)
      };
    } else {
      cursor = { location, orientation: cursor.orientation };
    }
    this.updateDisplayHighlighting(cursor);
  }

  moveCursor(cursor: Cursor): void {
    this.updateDisplayHighlighting(cursor);
  }

  moveDown(step: number): void {
    const cursor = this.cursor;
    let row = cursor.location.row;
    if (this.currentSquare().value == null || cursor.orientation === Orientation.DOWN) {
      if (row + step >= 0 && row + step < this.rows) {
        row += step;
      }
    }
    this.updateDisplayHighlighting({
      location: { row, column: cursor.location.column },
      orientation: Orientation.DOWN
    });
  }

  mutateAndStep(value: Value, step: number): void {
    const cursor = this.cursor;
    this.puzzleStateService.setSquare(cursor, value);
    if (cursor.orientation === Orientation.ACROSS) {
      this.moveAcross(step);
    }
    if (cursor.orientation === Orientation.DOWN) {
      this.moveDown(step);
    }
  }
}
