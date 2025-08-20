import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/main-header/main-header.component';
import { MainFooterComponent } from "./components/main-footer/main-footer.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MainFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'easy-angular';
}
