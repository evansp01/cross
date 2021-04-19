import { Component } from '@angular/core';
import { PuzzService } from './puzz.service';
import { StateService } from './state.service';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cross';

  private puzzService: PuzzService;
  private stateService: StateService;

  constructor(puzzService: PuzzService, stateService: StateService) {
    this.puzzService = puzzService;
    this.stateService = stateService;
  }

  handleFileInput(event: Event): void {
    if (event.target instanceof HTMLInputElement && event.target.files != null) {
      event.target.files.item(0)?.arrayBuffer().then((f) => {
        const state = this.puzzService.puzzleStateFromPuz(new Uint8Array(f));
        this.stateService.setState(state);
        console.log(state.grid);
      });
    }
  }

  saveToFile(): void {
    const buf = this.puzzService.puzFromPuzzleState(this.stateService.getState().value);
    saveAs(new Blob([buf]), 'crossword.puz');
  }
}
