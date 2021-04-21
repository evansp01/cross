import { TestBed } from '@angular/core/testing';

import { SerializationService, Puzz } from './serialization.service';

function createRequest(filePath: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', 'base/' + filePath, true);
    request.responseType = 'arraybuffer'; // maybe also 'text'
    request.onload = (e) => resolve(new Uint8Array(request.response));
    request.onerror = () => reject(request.status);
    request.send();
  });
}

describe('SerializationService', () => {
  let service: SerializationService;
  const filesList = [
    'testdata/washpost.puz',
    'testdata/Feb0308_oddnumbering.puz',
    'testdata/nyt_diagramless.puz',
    'testdata/nyt_rebus_with_notes_and_shape.puz',
    'testdata/nyt_with_shape.puz',
    'testdata/av110622.puz',
    'testdata/nyt_locked.puz',
    'testdata/nyt_sun_rebus.puz',
    'testdata/washpost.puz',
    'testdata/cs080904.puz',
    'testdata/nyt_partlyfilled.puz',
    'testdata/nyt_weekday_with_notes.puz',
    'testdata/wsj110624.puz',
  ];
  const files: Map<string, Uint8Array> = new Map();

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SerializationService);
  });
  beforeAll((done) => {
    const requests = filesList.map(async f => {
      const arr = await createRequest(f);
      files.set(f, arr);
    });
    Promise.all(requests).then(done);
  });

  it('should roundtrip files', () => {
    for (const fileName of filesList) {
      // tslint:disable-next-line: no-non-null-assertion
      const file = files.get(fileName)!;
      const puzz = new Puzz();
      puzz.read(file);
      expect(puzz.write()).toEqual(file);
    }
  });

  it('should roundtrip files to PuzzleState', () => {
    for (const fileName of filesList) {
      if (fileName === 'testdata/nyt_diagramless.puz') {
        // We lack support for diagramless puzzles.
        continue;
      }
      // tslint:disable-next-line: no-non-null-assertion
      const file = files.get(fileName)!;

      const puzz1 = new Puzz();
      puzz1.read(file);

      const roundtrip = service.puzFromPuzzleState(service.puzzleStateFromPuz(file));

      const puzz2 = new Puzz();
      puzz2.read(roundtrip);

      console.log(puzz1.puzzle);
      console.log(puzz1.state);
      expect(puzz2.width).toEqual(puzz1.width);
      expect(puzz2.height).toEqual(puzz1.height);
      expect(puzz2.puzzle).toEqual(puzz1.puzzle);
      expect(puzz2.title).toEqual(puzz1.title);
      expect(puzz2.author).toEqual(puzz1.author);
      expect(puzz2.copyright).toEqual(puzz1.copyright);
      expect(puzz2.notes).toEqual(puzz1.notes);
      expect(puzz2.state.length).toEqual(puzz1.state.length);
      expect(puzz2.clues).toEqual(puzz1.clues);
    }
  });
});
