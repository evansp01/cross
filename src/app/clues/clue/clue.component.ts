import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DisplayClue } from 'src/app/core/display-state.service';
import { PuzzleStateService } from 'src/app/core/puzzle-state.service';

@Component({
  selector: 'app-clue',
  templateUrl: './clue.component.html',
  styleUrls: ['./clue.component.css']
})
export class ClueComponent implements OnInit, OnChanges {
  private puzzleState: PuzzleStateService;
  value!: string;

  @Input() clue!: DisplayClue;
  constructor(puzzleState: PuzzleStateService) {
    this.puzzleState = puzzleState;
  }

  ngOnInit(): void {
    this.value = this.clue.clue;
  }

  commitClue(): void {
    // Make sure no newlines or leading/trailing whitespace sneaks into the clues.
    const cleaned = this.value.replace(/[\r\n]|/g, '').trim();
    if (this.clue.clue !== cleaned) {
      this.puzzleState.setClue(this.clue.cursor, cleaned);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('clue' in changes) {
      this.value = changes.clue.currentValue.clue;
    }
  }

}
