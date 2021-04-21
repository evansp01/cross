import { Component } from '@angular/core';
import { SerializationService } from './core/serialization.service';
import { PuzzleStateService } from './core/puzzle-state.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cross';

  private SerializationService: SerializationService;
  private PuzzleStateService: PuzzleStateService;

  constructor(serializationService: SerializationService, puzzleStateService: PuzzleStateService) {
    this.SerializationService = serializationService;
    this.PuzzleStateService = puzzleStateService;
  }

  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0);
    if (file) {
      file.arrayBuffer().then((buffer) => {
        const state = this.SerializationService.puzzleStateFromPuz(new Uint8Array(buffer));
        this.PuzzleStateService.setState(state);
        console.log(state.grid);
        // Reset the file input
        target.value = '';
      });
    }
  }

  saveToFile(): void {
    const buf = this.SerializationService.puzFromPuzzleState(this.PuzzleStateService.getState().value);
    saveAs(new Blob([buf]), 'crossword.puz');
  }
}
