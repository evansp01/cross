import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { RedirectComponent } from './redirect.component';
import { CrosswordComponent } from './crossword/crossword.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/puzzle' },
  { path: 'puzzle', pathMatch: 'full', component: RedirectComponent },
  { path: 'puzzle/:id', component: CrosswordComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
