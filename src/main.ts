import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';

registerLocaleData(ptBr, 'pt-BR');

bootstrapApplication(AppComponent, {
  providers: [...appConfig.providers, provideAnimations()],
}).catch((err) => console.error(err));
