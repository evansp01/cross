import { Injectable } from '@angular/core';
import { PuzzleState } from './puzzle-state.service';
import { SerializationService } from './serialization.service';

export class LocalStateStore {
  private key: string;
  private serializationService: SerializationService;

  constructor(serializationService: SerializationService, key: string) {
    this.serializationService = serializationService;
    this.key = key;
  }

  saveState(state: PuzzleState): void {
    const encoded = Buffer.from(this.serializationService.puzFromPuzzleState(state)).toString('base64');
    localStorage.setItem(this.key, encoded);

  }

  locateState(): PuzzleState | null {
    const encoded = localStorage.getItem(this.key);
    if (encoded !== null) {
      return this.serializationService.puzzleStateFromPuz(Buffer.from(encoded, 'base64'));
    } else {
      return null;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class LocalStateStoreService {
  private serializationService: SerializationService;

  constructor(serializationService: SerializationService) {
    this.serializationService = serializationService;
  }

  makeStateStore(key: string): LocalStateStore {
    return new LocalStateStore(this.serializationService, key);

  }


}
