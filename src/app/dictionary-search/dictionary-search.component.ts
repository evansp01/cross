import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { DictionaryService } from '../core/dictionary.service';

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
  selector: 'app-dictionary-search',
  templateUrl: './dictionary-search.component.html',
  styleUrls: ['./dictionary-search.component.css']
})
export class DictionarySearchComponent implements OnInit {

  dictionaryService: DictionaryService;
  searchStringForm: FormControl;
  words: string[];

  constructor(dictionaryService: DictionaryService) {
    this.dictionaryService = dictionaryService;
    this.searchStringForm = new FormControl('', [
      invalidRegexValidator()
    ]);
    this.words = [];
  }

  ngOnInit(): void {
    this.words = this.dictionaryService.getMatches(new RegExp('.'));
    this.searchStringForm.valueChanges.subscribe({
      next: (v: string) => {
        try {
          const regex = new RegExp(v, 'i');
          this.words = this.dictionaryService.getMatches(regex);
        } catch (e) {
          this.words = [];
        }
      }
    });
  }

}
