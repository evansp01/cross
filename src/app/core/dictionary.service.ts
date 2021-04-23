import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  // Words by length
  wordsDict: Map<number, string[]>;
  dict: string[];

  constructor() {
    this.wordsDict = new Map();
    this.dict = [];
    this.setDictionary(require('./words.json').data.split(' '));
  }

  setDictionary(dict: string[]): void {
    this.dict = dict.sort();
    this.wordsDict = new Map();
    this.dict.forEach(w => {
      let list = this.wordsDict.get(w.length);
      if (list === undefined) {
        list = [];
        this.wordsDict.set(w.length, list);
      }
      list.push(w);
    });
  }

  getMatchingWords(regex: RegExp, length: number): string[] {
    const words = this.wordsDict.get(length);
    if (words === undefined) {
      return [];
    }
    return words.filter(w => regex.test(w));
  }

  getMatches(regex: RegExp): string[] {
    return this.dict.filter(w => regex.test(w));
  }
}
