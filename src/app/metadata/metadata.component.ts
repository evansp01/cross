import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PuzzleStateService } from '../core/puzzle-state.service';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private puzzleState: PuzzleStateService;

  title = '';
  author = '';
  copyright = '';
  notes = '';

  constructor(puzzleState: PuzzleStateService) {
    this.puzzleState = puzzleState;
  }

  ngOnInit(): void {
    this.subscriptions.add(this.puzzleState.getState().subscribe(s => {
      this.author = s.data.author;
      this.copyright = s.data.copyright;
      this.title = s.data.title;
      this.notes = s.data.notes;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    console.log(this.puzzleState.setData({
      title: this.title.trim(),
      author: this.author.trim(),
      copyright: this.copyright.trim(),
      notes: this.notes.trim()
    }));
  }

}
