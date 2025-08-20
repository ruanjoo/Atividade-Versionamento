import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Application } from '@splinetool/runtime';
import { HomeFeaturesComponent } from '../home-features/home-features.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [HomeFeaturesComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('splineCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const app = new Application(this.canvasRef.nativeElement);
    app.load('https://prod.spline.design/yy198WML3m0PhXyj/scene.splinecode');
  }
}
