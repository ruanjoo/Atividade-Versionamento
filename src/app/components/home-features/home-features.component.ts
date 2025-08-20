import { Component } from '@angular/core';
import { FeatureCardComponent } from './feature-card/feature-card.component';

@Component({
  selector: 'app-home-features',
  imports: [FeatureCardComponent],
  templateUrl: './home-features.component.html',
  styleUrl: './home-features.component.css',
})
export class HomeFeaturesComponent {
  features = [
    {
      title: 'Agendamento Online',
      description:
        'Agende consultas a qualquer momento, sem necessidade de ligações ou espera.',
      iconSvg: 'calendar.svg',
    },
    {
      title: 'Horários em Tempo Real',
      description:
        'Veja disponibilidade atualizada de médicos e evite conflitos de horário.',
      iconSvg: 'clock.svg',
    },
    {
      title: 'Lembretes Automáticos',
      description:
        'Receba notificações por e-mail e SMS para nunca mais esquecer sua consulta.',
      iconSvg: 'bell.svg',
    },
    {
      title: 'Gestão para Clínicas',
      description:
        'Ferramentas completas para administrar sua clínica de forma eficiente.',
      iconSvg: 'clinic.svg',
    },
  ];
}
