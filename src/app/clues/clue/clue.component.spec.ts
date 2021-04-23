import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClueComponent } from './clue.component';

describe('ClueComponent', () => {
  let component: ClueComponent;
  let fixture: ComponentFixture<ClueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
