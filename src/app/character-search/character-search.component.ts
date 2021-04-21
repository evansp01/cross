import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DictionaryService } from '../dictionary.service';
import { DisplayWord } from '../grid-display.service';

function displayString(squares: string[]): string {
  return squares.map(s => s === '' ? '_' : s).join('');
}

function wordRegex(squares: string[]): RegExp {
  const body = squares.map(s => s === '' ? '.' : s).join('');
  return new RegExp(`^${body}$`, 'i');
}

@Component({
  selector: 'app-character-search',
  templateUrl: './character-search.component.html',
  styleUrls: ['./character-search.component.css']
})
export class CharacterSearchComponent implements OnInit, OnChanges {

  @Input() word!: DisplayWord | null;
  @Input() searchCharacter!: string;
  @Input() label!: string;
  dictionaryService: DictionaryService;

  private candidates: string[];
  filteredCandidates: string[];
  displayString: string;

  constructor(dictionaryService: DictionaryService) {
    this.dictionaryService = dictionaryService;
    this.displayString = '';
    this.candidates = [];
    this.filteredCandidates = [];
  }

  ngOnInit(): void {
  }

  private updateWord(word: DisplayWord | null): void {
    if (word == null) {
      this.displayString = '';
      this.filteredCandidates = [];
      return;
    }
    this.displayString = displayString(word.characters);
    this.candidates = this.dictionaryService.getMatchingWords(
      wordRegex(word.characters), word.characters.length);
    this.updateSearchCharacter(this.searchCharacter, word);
  }

  private updateSearchCharacter(searchCharacter: string, word: DisplayWord): void {
    try {
      const regex = new RegExp(searchCharacter, 'i');
      this.filteredCandidates = this.candidates.filter(w => {
        return regex.test(w[word.cursorPosition]);
      });
    } catch (e) {
      this.filteredCandidates = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('word' in changes) {
      this.updateWord(changes.word.currentValue);
    }
    if ('searchCharacter' in changes && this.word != null) {
      this.updateSearchCharacter(changes.searchCharacter.currentValue, this.word);
    }
  }
}
