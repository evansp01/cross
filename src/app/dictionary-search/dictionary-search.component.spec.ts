import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DictionarySearchComponent } from './dictionary-search.component';

describe('DictionarySearchComponent', () => {
  let component: DictionarySearchComponent;
  let fixture: ComponentFixture<DictionarySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DictionarySearchComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DictionarySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
