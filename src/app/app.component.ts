import { Component } from '@angular/core';
import { PuzzService } from './puzz.service';
import { StateService } from './state.service';
import { saveAs } from 'file-saver';

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
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0);
    if (file) {
      file.arrayBuffer().then((buffer) => {
        const state = this.puzzService.puzzleStateFromPuz(new Uint8Array(buffer));
        this.stateService.setState(state);
        console.log(state.grid);
        // Reset the file input
        target.value = '';
      });
    }
  }

  saveToFile(): void {
    const buf = this.puzzService.puzFromPuzzleState(this.stateService.getState().value);
    saveAs(new Blob([buf]), 'crossword.puz');
  }
}
