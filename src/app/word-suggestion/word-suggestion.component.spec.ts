import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordSuggestionComponent } from './word-suggestion.component';

describe('WordSuggestionComponent', () => {
  let component: WordSuggestionComponent;
  let fixture: ComponentFixture<WordSuggestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WordSuggestionComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
