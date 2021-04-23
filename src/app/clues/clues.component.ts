import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DisplayStateService, DisplayClue } from '../core/display-state.service';
import { Cursor, cursorString, cursorEqual } from '../core/puzzle-state.service';

@Component({
  selector: 'app-clues',
  templateUrl: './clues.component.html',
  styleUrls: ['./clues.component.css'],
})
export class CluesComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  gridDisplay: DisplayStateService;

  acrossClues: Array<DisplayClue>;
  downClues: Array<DisplayClue>;
  focusedClueCursor: Cursor | null;

  constructor(gridDisplay: DisplayStateService) {
    this.gridDisplay = gridDisplay;
    this.acrossClues = [];
    this.downClues = [];
    this.focusedClueCursor = null;
  }

  ngOnInit(): void {
    this.subscriptions.add(this.gridDisplay.getCurrentWord().subscribe({
      next: (n) => {
        if (n !== null && !cursorEqual(this.focusedClueCursor, n.cursor)) {
          const elem = document.getElementById(cursorString(n.cursor));
          elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectClue(clue: DisplayClue): void {
    this.focusedClueCursor = clue.cursor;
    this.gridDisplay.moveCursor(clue.cursor);
  }

  id(clue: DisplayClue): string {
    return cursorString(clue.cursor);
  }

  trackByCursor(_index: number, clue: DisplayClue): string {
    return cursorString(clue.cursor);
  }

}
