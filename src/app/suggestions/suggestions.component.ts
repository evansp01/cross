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

  private clearSearchCharacter(): void {
    this.searchStringForm.setValue('');
    this.searchStringForm.disable({ onlySelf: true });
  }

  private setSearchCharacter(character: string): void {
    this.searchStringForm.setValue(character);
    if (character === '') {
      this.searchStringForm.enable({ onlySelf: true });
    } else {
      this.searchStringForm.disable({ onlySelf: true });
    }
  }

  ngOnInit(): void {
    this.gridDisplay.getCurrentWord().subscribe({
      next: (w) => {
        this.acrossWord = w === null ? null : w.across;
        this.downWord = w === null ? null : w.down;
        if (w !== null) {
          this.setSearchCharacter(w.across.characters[w.across.cursorPosition]);
        } else {
          this.clearSearchCharacter();
        }
      }
    });
  }
}
