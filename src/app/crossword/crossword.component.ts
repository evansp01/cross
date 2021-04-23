import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalStateStore, LocalStateStoreService } from '../core/local-state-store.service';
import { PuzzleState, PuzzleStateService } from '../core/puzzle-state.service';

@Component({
  selector: 'app-crossword',
  templateUrl: './crossword.component.html',
  styleUrls: ['./crossword.component.css']
})
export class CrosswordComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions = new Subscription();
  private route: ActivatedRoute;
  private puzzleState: PuzzleStateService;
  private localStore: LocalStateStoreService;
  private storage: LocalStateStore | null;
  tabReady = false;

  constructor(route: ActivatedRoute, puzzleState: PuzzleStateService, localStore: LocalStateStoreService) {
    this.route = route;
    this.puzzleState = puzzleState;
    this.localStore = localStore;
    this.storage = null;
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.tabReady = true; }, 0);
  }

  ngOnInit(): void {
    this.subscriptions.add(this.puzzleState.getState().subscribe(s => {
      if (this.storage !== null) {
        this.storage.saveState(s);
      }
    }));
    this.subscriptions.add(this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id === null) {
        return;
      }
      this.storage = null;
      const storage = this.localStore.makeStateStore(id);
      const state = storage.locateState();
      if (state !== null) {
        this.puzzleState.setState(state);
      } else {
        this.puzzleState.setState(PuzzleState.newState(15));
      }
      this.storage = storage;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
