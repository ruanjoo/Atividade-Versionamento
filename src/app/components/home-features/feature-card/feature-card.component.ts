import { Component, input } from '@angular/core';

@Component({
  selector: 'app-feature-card',
  imports: [],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.css',
})
export class FeatureCardComponent {
  title = input<string>();
  description = input<string>();
  iconSvg = input<string>();
}
