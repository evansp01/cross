import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DisplayStateService } from '../core/display-state.service';
import { LocalStateStore, LocalStateStoreService } from '../core/local-state-store.service';
import { PuzzleState, PuzzleStateService } from '../core/puzzle-state.service';

@Component({
  selector: 'app-crossword',
  templateUrl: './crossword.component.html',
  styleUrls: ['./crossword.component.css'],
  providers: [PuzzleStateService, DisplayStateService]
})
export class CrosswordComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions = new Subscription();
  private route: ActivatedRoute;
  private puzzleState: PuzzleStateService;
  private localStore: LocalStateStoreService;
  tabReady = false;

  constructor(route: ActivatedRoute, puzzleState: PuzzleStateService, localStore: LocalStateStoreService) {
    this.route = route;
    this.puzzleState = puzzleState;
    this.localStore = localStore;
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.tabReady = true; }, 0);
  }

  ngOnInit(): void {
    let subscription: Subscription | null = null;
    this.subscriptions.add(this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id === null) {
        return;
      }
      if (subscription != null) {
        this.subscriptions.remove(subscription);
        subscription.unsubscribe();
      }
      this.puzzleState.setState(PuzzleState.newState(15));
      const storage = this.localStore.makeStateStore(id);
      subscription = storage.attach(this.puzzleState);
      this.subscriptions.add(subscription);
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
