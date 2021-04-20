import { Component, OnInit } from '@angular/core';
import { GridDisplayService } from '../grid-display.service';
import { Clue, Cursor, Orientation, Square, StateService, Word } from '../state.service';

interface DisplayClue {
  index: number;
  word: string;
  clue: string;
  clean: string;
  cursor: Cursor;
}

function wordToDisplayClue(word: Word): DisplayClue {
  const text =  word.squares.map((s: Square) => {
    if (s.value === '') {
      return '_';
    } else {
      return s.value;
    }
  }).join('');
  return {
    index: word.index,
    clue: word.clue.value,
    clean: word.clue.value,
    word: text,
    cursor: word.clue.cursor,
  };
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

  constructor(stateService: StateService, gridDisplay: GridDisplayService) {
    this.stateService = stateService;
    this.gridDisplay = gridDisplay;
    this.acrossClues = [];
    this.downClues = [];
  }

  commitClue(clue: DisplayClue): void {
    console.log(clue);
    if (clue.clue !== clue.clean) {
      this.stateService.setClue(clue.cursor, clue.clue);
    }
  }

  selectClue(clue: DisplayClue): void {
      this.gridDisplay.moveCursor(clue.cursor);
  }

  ngOnInit(): void {
    this.stateService.getState().subscribe({next: (s) => {
      const info = s.makeWordInfo();
      const acrossClues: DisplayClue[] = [];
      const downClues: DisplayClue[] = [];
      info.acrossWords.forEach(w => acrossClues.push(wordToDisplayClue(w)));
      info.downWords.forEach(w => downClues.push(wordToDisplayClue(w)));
      acrossClues.sort((a, b) => a.index - b.index);
      downClues.sort((a, b) => a.index - b.index);
      this.acrossClues = acrossClues;
      this.downClues = downClues;
    }});
  }

  trackByCursor(index: number, clue: DisplayClue): string {
    return '{clue.cursor.location.row}-{clue.cursor.location.column}-{clue.cursor.orientation}';
  }

}
