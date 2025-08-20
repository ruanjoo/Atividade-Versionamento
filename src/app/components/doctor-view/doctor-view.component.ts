import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';

import {
  DataService,
  Consulta,
  Paciente,
  Medico,
} from '../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger,
} from '@angular/animations';

interface ConsultaExibicao {
  consulta: Consulta;
  paciente: Paciente;
}

@Component({
  selector: 'app-medico-dashboard',
  templateUrl: './doctor-view.component.html',
  styleUrls: ['./doctor-view.component.css'],
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('cardStagger', [
      transition(':enter', [
        query(
          '.info-card',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('fadeInModal', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class MedicoDashboardComponent implements OnInit {
  medicoId: number = 0;
  todasConsultas: Consulta[] = [];
  pacientesMap: Map<number, Paciente> = new Map();

  consultasHoje: Consulta[] = [];
  consultasAmanha: Consulta[] = [];
  consultasSemana: Consulta[] = [];
  totalPacientes: number = 0;

  consultaMaisProxima: ConsultaExibicao | null = null;
  minhasConsultas: ConsultaExibicao[] = [];

  consultaParaConfirmar: ConsultaExibicao | null = null;
  acaoPendencia: 'confirmar' | 'cancelar' = 'confirmar';

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  medico: Medico | undefined;
  ngOnInit(): void {
    this.medicoId = Number(this.route.snapshot.paramMap.get('id'));

    this.dataService.getMedicos().subscribe((medicos) => {
      this.medico = medicos.find((m) => m.id_medico === this.medicoId);
    });

    combineLatest([
      this.dataService.getPacientes(),
      this.dataService.getConsultas(),
    ]).subscribe(([pacientes, consultas]) => {
      pacientes.forEach((p) => this.pacientesMap.set(p.id_paciente, p));

      this.todasConsultas = consultas.filter(
        (c) => c.id_medico === this.medicoId
      );

      this.definirEstatisticas();
      this.montarListas();
    });
  }

  private definirEstatisticas(): void {
    const agora = new Date();
    const hoje = new Date(agora);
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const fimSemana = new Date(hoje);
    fimSemana.setDate(hoje.getDate() + (7 - hoje.getDay()));

    this.consultasHoje = this.todasConsultas.filter((c) =>
      this.ehMesmoDia(new Date(c.data_consulta), hoje)
    );
    this.consultasAmanha = this.todasConsultas.filter((c) =>
      this.ehMesmoDia(new Date(c.data_consulta), amanha)
    );
    this.consultasSemana = this.todasConsultas.filter((c) => {
      const dt = new Date(c.data_consulta);
      return dt >= hoje && dt <= fimSemana;
    });

    this.totalPacientes = new Set(
      this.todasConsultas
        .filter((c) => c.id_paciente != null)
        .map((c) => c.id_paciente)
    ).size;
  }

  private montarListas(): void {
    const futuras = this.todasConsultas
      .filter((c) => new Date(c.data_consulta) > new Date())
      .sort(
        (a, b) =>
          new Date(a.data_consulta).getTime() -
          new Date(b.data_consulta).getTime()
      );

    if (futuras.length) {
      const c = futuras[0];
      const paciente = this.pacientesMap.get(c.id_paciente)!;
      this.consultaMaisProxima = { consulta: c, paciente };
    } else {
      this.consultaMaisProxima = null;
    }

    this.minhasConsultas = this.todasConsultas.map((c) => ({
      consulta: c,
      paciente: this.pacientesMap.get(c.id_paciente)!,
    }));
  }

  ehMesmoDia(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  abrirConfirmacao(consulta: Consulta, acao: 'confirmar' | 'cancelar'): void {
    const paciente = this.pacientesMap.get(consulta.id_paciente);
    if (paciente) {
      this.consultaParaConfirmar = { consulta, paciente };
      this.acaoPendencia = acao;
    }
  }

  fecharConfirmacao(): void {
    this.consultaParaConfirmar = null;
  }

  confirmarConsulta(): void {
    if (!this.consultaParaConfirmar) return;

    const { consulta } = this.consultaParaConfirmar;
    const novoStatus: 'realizada' | 'cancelada' =
      this.acaoPendencia === 'cancelar' ? 'cancelada' : 'realizada';

    const consultaAtualizada: Consulta = {
      ...consulta,
      status: novoStatus,
    };

    this.dataService.updateConsulta(consultaAtualizada).subscribe({
      next: () => {
        this.consultaParaConfirmar!.consulta.status = novoStatus;
        this.definirEstatisticas();
        this.montarListas();
        this.fecharConfirmacao();
      },
      error: (err) => {
        console.error(`Erro ao ${this.acaoPendencia} consulta:`, err);
      },
    });
  }
}
