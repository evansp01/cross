import { Injectable } from '@angular/core';
import { PuzzleState } from './puzzle-state.service';
import { SerializationService } from './serialization.service';

interface StorageItem {
  blob: string;
  time: number;
}

function stringToStorageItem(json: string | null): StorageItem | null {
  if (json === null) {
    return null;
  }
  try {
    return JSON.parse(json) as StorageItem;
  } catch {
    return null;
  }
}

export class LocalStateStore {
  private key: string;
  private serializationService: SerializationService;

  constructor(serializationService: SerializationService, key: string) {
    this.serializationService = serializationService;
    this.key = key;
  }

  saveState(state: PuzzleState): void {
    const encoded = Buffer.from(this.serializationService.puzFromPuzzleState(state)).toString('base64');
    const item: StorageItem = { blob: encoded, time: Date.now() };
    localStorage.setItem(this.key, JSON.stringify(item));
  }

  locateState(): PuzzleState | null {
    const item = stringToStorageItem(localStorage.getItem(this.key));
    if (item === null) {
      return null;
    }
    return this.serializationService.puzzleStateFromPuz(Buffer.from(item.blob, 'base64'));
  }
}

@Injectable({
  providedIn: 'root'
})
export class LocalStateStoreService {
  private static daysToMillis = 24 * 60 * 60 * 1000;
  private serializationService: SerializationService;

  constructor(serializationService: SerializationService) {
    this.serializationService = serializationService;
    this.pruneOldObjects();
  }

  makeStateStore(key: string): LocalStateStore {
    return new LocalStateStore(this.serializationService, key);
  }

  pruneOldObjects(): void {
    for (const key of Object.keys(localStorage)) {
      console.log(localStorage.getItem(key));
      const item = stringToStorageItem(localStorage.getItem(key));
      if (item === null) {
        localStorage.removeItem(key);
        continue;
      }
      if (Date.now() - item.time < LocalStateStoreService.daysToMillis * 7) {
        localStorage.removeItem(key);
      }
    }
  }
}
