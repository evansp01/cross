import { Component, OnInit, ViewChild } from '@angular/core';
import { SerializationService } from '../core/serialization.service';
import { PuzzleStateService } from '../core/puzzle-state.service';
import { saveAs } from 'file-saver';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit {
  @ViewChild('nav') tab!: NgbNav;
  private serializationService: SerializationService;
  private puzzleStateService: PuzzleStateService;

  constructor(serializationService: SerializationService, puzzleStateService: PuzzleStateService) {
    this.serializationService = serializationService;
    this.puzzleStateService = puzzleStateService;
  }

  ngOnInit(): void {
  }

  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0);
    if (file) {
      file.arrayBuffer().then((buffer) => {
        const state = this.serializationService.puzzleStateFromPuz(new Uint8Array(buffer));
        this.puzzleStateService.setState(state);
        console.log(state.grid);
        // Reset the file input
        target.value = '';
      });
    }
  }

  saveToFile(): void {
    const buf = this.serializationService.puzFromPuzzleState(this.puzzleStateService.getState().value);
    saveAs(new Blob([buf]), 'crossword.puz');
  }

}
