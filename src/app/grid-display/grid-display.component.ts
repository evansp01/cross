import { Component, OnInit } from '@angular/core';
import { DisplaySquare, DisplayStateService } from '../core/display-state.service';
import { PuzzleStateService } from '../core/puzzle-state.service';

@Component({
  selector: 'app-grid-display',
  templateUrl: './grid-display.component.html',
  styleUrls: ['./grid-display.component.css']
})
export class GridDisplayComponent implements OnInit {
  private grid: DisplayStateService;
  private state: PuzzleStateService;

  constructor(gridDisplay: DisplayStateService, puzzleStateService: PuzzleStateService) {
    this.grid = gridDisplay;
    this.state = puzzleStateService;
  }

  ngOnInit(): void {
  }

  clicked(square: DisplaySquare): void {
    this.grid.moveCursorToSquareOrToggle(square.location);
  }

  // @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
        case 'Z':
          if (event.ctrlKey && !event.shiftKey) {
            this.state.undo();
            event.preventDefault();
          } else if (event.ctrlKey && event.shiftKey) {
            this.state.redo();
            event.preventDefault();
          }
      }
      // Ignore anything other than z when control/meta is held down
      return;
    }
    // The switch statement handles keypresses with special meaning
    switch (event.key) {
      case 'ArrowLeft':
      case 'Left':
        this.grid.moveAcross(-1);
        event.preventDefault();
        return;
      case 'ArrowRight':
      case 'Right':
        this.grid.moveAcross(1);
        event.preventDefault();
        return;
      case 'ArrowUp':
      case 'Up':
        this.grid.moveDown(-1);
        event.preventDefault();
        return;
      case 'ArrowDown':
      case 'Down':
        this.grid?.moveDown(1);
        event.preventDefault();
        return;
      case 'Tab':
      case 'Enter':
        return;
      case 'Backspace':
        this.grid.mutateAndStep('', -1);
        event.preventDefault();
        return;
      case ' ':
      case 'Spacebar':
        this.grid.mutateAndStep('', 1);
        event.preventDefault();
        return;
      case '.':
        this.grid.mutateAndStep(null, 1);
        event.preventDefault();
        return;
    }
    const code = event.key.charCodeAt(0);
    if (event.key.length === 1 && code >= 32 && code < 127) {
      this.grid.mutateAndStep(event.key.toUpperCase(), 1);
      // event.preventDefault()
    }
  }
}

