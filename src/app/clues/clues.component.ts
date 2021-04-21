import { Component, OnInit } from '@angular/core';
import { GridDisplayService } from '../grid-display.service';
import { Cursor, Orientation, PuzzleState, Square, StateService, Word } from '../state.service';

interface DisplayClue {
  id: string;
  index: number;
  word: string;
  clue: string;
  clean: string;
  cursor: Cursor;
  focus: boolean;
}

function wordToDisplayClue(word: Word): DisplayClue {
  const text = word.squares.map((s: Square) => {
    if (s.value === '') {
      return '_';
    } else {
      return s.value;
    }
  }).join('');
  return {
    id: cursorString(word.clue.cursor),
    index: word.index,
    clue: word.clue.value,
    clean: word.clue.value,
    word: text,
    cursor: word.clue.cursor,
    focus: false,
  };
}

function cursorString(c: Cursor): string {
  return `${c.location.row}-${c.location.column}-${c.orientation}`;
}

function cursorEqual(c1: Cursor | null, c2: Cursor | null): boolean {
  if (c1 === c2) {
    return true;
  } else if (c1 === null || c2 === null) {
    return false;
  } else {
    return c1.orientation === c2.orientation &&
      c1.location.row === c2.location.row &&
      c1.location.column === c2.location.column;
  }
}

@Component({
  selector: 'app-clues',
  templateUrl: './clues.component.html',
  styleUrls: ['./clues.component.css'],
})
export class CluesComponent implements OnInit {
  private stateService: StateService;
  private gridDisplay: GridDisplayService;

  acrossClues: Array<DisplayClue>;
  downClues: Array<DisplayClue>;
  focusedClueCursor: Cursor | null;

  constructor(stateService: StateService, gridDisplay: GridDisplayService) {
    this.stateService = stateService;
    this.gridDisplay = gridDisplay;
    this.acrossClues = [];
    this.downClues = [];
    this.focusedClueCursor = null;
  }

  ngOnInit(): void {
    this.stateService.getState().subscribe({ next: (n) => this.updateCluesFromState(n) });
    this.gridDisplay.getCurrentWord().subscribe(
      {
        next: (n) => {
          if (n === null) {
            this.updateHighlightingFromCursor(null);
          } else if (n.orientation === Orientation.ACROSS) {
            this.updateHighlightingFromCursor({ location: n.across.location, orientation: n.orientation });
          } else if (n.orientation === Orientation.DOWN) {
            this.updateHighlightingFromCursor({ location: n.down.location, orientation: n.orientation });
          }
        }
      });
  }

  commitClue(clue: DisplayClue): void {
    console.log(clue);
    // Make sure no newlines or leading/trailing whitespace sneaks into the clues.
    const cleaned = clue.clue.replace(/[\r\n]|/g, '').trim();
    if (clue.clue !== cleaned) {
      this.stateService.setClue(clue.cursor, cleaned);
    }
  }

  selectClue(clue: DisplayClue): void {
    if (!cursorEqual(this.focusedClueCursor, clue.cursor)) {
      // Highlight the clue before updating the grid display's cursor.
      // This allows us to avoid recentering the clue list when the change
      // in highlighting was prompted by a user action in the clue list.
      this.highlightClue(clue.cursor);
      this.gridDisplay.moveCursor(clue.cursor);
    }
  }

  highlightClue(cursor: Cursor | null): void {
    this.acrossClues.forEach(c => { c.focus = cursorEqual(c.cursor, cursor); });
    this.downClues.forEach(c => { c.focus = cursorEqual(c.cursor, cursor); });
    this.focusedClueCursor = cursor;
  }

  updateHighlightingFromCursor(cursor: Cursor | null): void {
    if (!cursorEqual(this.focusedClueCursor, cursor)) {
      this.highlightClue(cursor);
      if (cursor != null) {
        const elem = document.getElementById(cursorString(cursor));
        elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  updateCluesFromState(state: PuzzleState): void {
    const info = state.makeWordInfo();
    const acrossClues: DisplayClue[] = [];
    const downClues: DisplayClue[] = [];
    info.acrossWords.forEach(w => {
      const clue = wordToDisplayClue(w);
      acrossClues.push(clue);
    });
    info.downWords.forEach(w => {
      const clue = wordToDisplayClue(w);
      downClues.push(clue);
    });
    acrossClues.sort((a, b) => a.index - b.index);
    downClues.sort((a, b) => a.index - b.index);
    this.acrossClues = acrossClues;
    this.downClues = downClues;

    this.updateHighlightingFromCursor(state.cursor);
  }

  trackByCursor(_index: number, clue: DisplayClue): string {
    return `${clue.id}-${clue.focus}`;
  }

}
