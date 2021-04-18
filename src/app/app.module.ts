import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { GridComponent } from './grid/grid.component';
import { CharacterSearchComponent } from './character-search/character-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent, SuggestionsComponent, GridComponent, CharacterSearchComponent
  ],
  imports: [
    BrowserModule, ScrollingModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
