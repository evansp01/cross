import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { GridComponent } from './grid/grid.component';
import { CharacterSearchComponent } from './character-search/character-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CluesComponent } from './clues/clues.component';
import { QuillModule } from 'ngx-quill';
import { WordSearchComponent } from './word-search/word-search.component';

@NgModule({
  declarations: [
    AppComponent, SuggestionsComponent, GridComponent, CharacterSearchComponent, CluesComponent, WordSearchComponent
  ],
  imports: [
    BrowserModule, ScrollingModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule, NgbModule,
    QuillModule.forRoot({
      modules: {
        syntax: false,
        toolbar: false,
        keyboard: {
          bindings: {
            tab: {
              key: 9,
              handler: () => true
            },
            handleEnter: {
              key: 13,
              handler: () => false
            }
          },
        }
      },
      theme: 'bubble',
      formats: [],
      format: 'text'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
