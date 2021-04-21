import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateDisplayComponent } from './candidate-display.component';

describe('CandidateDisplayComponent', () => {
  let component: CandidateDisplayComponent;
  let fixture: ComponentFixture<CandidateDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CandidateDisplayComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
