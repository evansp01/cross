import { Component, HostListener } from '@angular/core';
import { GridDisplayService } from './grid-display.service';
import { StateService} from './state.service'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cross';
  grid: GridDisplayService
  state: StateService

  constructor(gridDisplay: GridDisplayService, stateService: StateService) {
    this.grid = gridDisplay
    this.state = stateService
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    console.log("Received event " + event + " with key " + event.key)
    // TODO: Don't hijack keyboard shortcuts
    // The switch statement handles keypresses with special meaning
    switch (event.key) {
      case "ArrowLeft":
      case "Left":
        this.grid.moveAcross(-1)
        event.preventDefault()
        return
      case "ArrowRight":
      case "Right":
        this.grid.moveAcross(1)
        event.preventDefault()
        return
      case "ArrowUp":
      case "Up":
        this.grid.moveDown(-1)
        event.preventDefault()
        return
      case "ArrowDown":
      case "Down":
        this.grid?.moveDown(1)
        event.preventDefault()
        return
      case "Tab":
      case "Enter":
        return
      case "Backspace":
        this.grid.mutateAndStep("", -1)
        event.preventDefault()
        return
      case " ":
      case "Spacebar":
        this.grid.mutateAndStep("", 1)
        event.preventDefault()
        return
      case ".":
        this.grid.mutateAndStep(null, 1)
        event.preventDefault()
        return
      case "z":
      case "Z":
        if (event.ctrlKey && !event.shiftKey) {
          this.state.undo()     
          event.preventDefault()
          return;
        } else if (event.ctrlKey && event.shiftKey) {
          this.state.redo()  
          event.preventDefault()

          return;
        }
      // Don't return and handle like a normal alphanumeric character
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }
    var code = event.key.charCodeAt(0)
    if (event.key.length == 1 && code >= 32 && code < 127) {
      this.grid.mutateAndStep(event.key.toUpperCase(), 1);
      event.preventDefault()
    }
    console.log("Finished handling keyboard event")
  }
}
