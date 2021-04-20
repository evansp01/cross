import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { DictionaryService } from '../dictionary.service';
import { DisplayWord, GridDisplayService } from '../grid-display.service';

export function invalidRegexValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    try {
      // We're just testing if the regex is well formed.
      // tslint:disable-next-line: no-unused-expression
      new RegExp(control.value, 'i');
      return null;
    } catch (e) {
      return { invalidRegex: { value: control.value } };
    }
  };
}

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css'],
})
export class SuggestionsComponent implements OnInit {
  dictionaryService: DictionaryService;
  gridDisplay: GridDisplayService;

  acrossWord: DisplayWord | null;
  downWord: DisplayWord | null;
  searchStringForm: FormControl;

  constructor(dictionary: DictionaryService, gridDisplay: GridDisplayService) {
    this.dictionaryService = dictionary;
    this.gridDisplay = gridDisplay;
    this.acrossWord = null;
    this.downWord = null;
    this.searchStringForm = new FormControl('', [
      invalidRegexValidator()
    ]);
  }

  setVowel(): void {
    if (this.searchStringForm.enabled) {
      this.searchStringForm.setValue('[aeiou]');
    }
  }

  setConsonant(): void {
    if (this.searchStringForm.enabled) {
      this.searchStringForm.setValue('[^aeiou]');
    }
  }

  private resetCharacter(word: DisplayWord | null): void {
    if (word == null) {
      this.searchStringForm.setValue('');
      this.searchStringForm.disable({ onlySelf: true });
      return;
    }
    this.searchStringForm.setValue(word.characters[word.cursorPosition]);
    if (word.characters[word.cursorPosition] === '') {
      this.searchStringForm.enable({ onlySelf: true });
    } else {
      this.searchStringForm.disable({ onlySelf: true });
    }
  }

  ngOnInit(): void {
    this.gridDisplay.getAcrossWord().subscribe({
      next: w => {
        this.acrossWord = w;
        this.resetCharacter(w);
      }
    });
    this.gridDisplay.getDownWord().subscribe({
      next: w => {
        this.downWord = w;
        this.resetCharacter(w);
      }
    });
  }
}
