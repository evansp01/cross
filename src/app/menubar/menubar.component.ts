import { Component, OnInit } from '@angular/core';
import { SerializationService } from '../core/serialization.service';
import { PuzzleStateService } from '../core/puzzle-state.service';
import { saveAs } from 'file-saver';
import { DictionaryService } from '../core/dictionary.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit {
  private serializationService: SerializationService;
  private puzzleStateService: PuzzleStateService;
  private dictionaryService: DictionaryService;
  readonly tabs = [
    { link: 'fill', title: 'Fill' },
    { link: 'clues', title: 'Clues' },
    { link: 'info', title: 'Info' },
    { link: 'search', title: 'Search' },
  ];
  route: ActivatedRoute;

  constructor(
    serializationService: SerializationService, puzzleStateService: PuzzleStateService,
    dictionaryService: DictionaryService, route: ActivatedRoute) {
    this.serializationService = serializationService;
    this.puzzleStateService = puzzleStateService;
    this.dictionaryService = dictionaryService;
    this.route = route;
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
        // Reset the file input
        target.value = '';
      });
    }
  }

  handleDictUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0);
    if (file) {
      file.text().then((text) => {
        this.dictionaryService.setDictionary(text.split(/\s+/));
      });
    }
  }

  saveToFile(): void {
    const buf = this.serializationService.puzFromPuzzleState(this.puzzleStateService.getState().value);
    saveAs(new Blob([buf]), 'crossword.puz');
  }

}
