import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  DataService,
  Consulta,
  Medico,
  Paciente,
  UsuarioLogado,
} from '../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { ReagendarConsultaComponent } from '../ch-appointment.com/ch-appointment.component';

interface ConsultaExibicao {
  consulta: Consulta;
  medico: Medico;
}

@Component({
  selector: 'app-paciente-dashboard',
  templateUrl: './patient-view.component.html',
  styleUrls: ['./patient-view.component.css'],
  imports: [CommonModule, ReagendarConsultaComponent],
})
export class PatientViewComponent implements OnInit {
  pacienteId = 0;
  paciente: Paciente | null = null;

  consultas: Consulta[] = [];
  medicosMap = new Map<number, Medico>();

  proximaConsulta: ConsultaExibicao | null = null;
  diasParaProxima = 0;
  minhasConsultas: ConsultaExibicao[] = [];

  consultaParaReagendar: Consulta | null = null;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    const user = this.dataService.getUsuarioLogado();
    if (!user || user.tipo !== 'paciente') {
      this.router.navigate(['/login']);
      return;
    }
    this.pacienteId = user.id;

    this.dataService
      .getPacienteById(this.pacienteId)
      .subscribe((p) => (this.paciente = p || null));

    this.dataService
      .getMedicos()
      .subscribe((meds) =>
        meds.forEach((m) => this.medicosMap.set(m.id_medico, m))
      );

    this.dataService.getConsultas().subscribe((all) => {
      this.consultas = all.filter((c) => c.id_paciente === this.pacienteId);
      this.definirProximaConsulta();
      this.montarListas();
    });
  }

  private definirProximaConsulta(): void {
    const futuras = this.consultas
      .filter((c) => new Date(c.data_consulta) > new Date())
      .sort(
        (a, b) =>
          new Date(a.data_consulta).getTime() -
          new Date(b.data_consulta).getTime()
      );
    if (futuras.length) {
      const c = futuras[0];
      const m = this.medicosMap.get(c.id_medico);
      if (m) {
        this.proximaConsulta = { consulta: c, medico: m };
        const diff = new Date(c.data_consulta).getTime() - Date.now();
        this.diasParaProxima = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }
    } else {
      this.proximaConsulta = null;
    }
  }

  private montarListas(): void {
    this.minhasConsultas = this.consultas
      .sort(
        (a, b) =>
          new Date(a.data_consulta).getTime() -
          new Date(b.data_consulta).getTime()
      )
      .map((c) => {
        const m = this.medicosMap.get(c.id_medico);
        return m ? { consulta: c, medico: m } : null;
      })
      .filter((x): x is ConsultaExibicao => x !== null);
  }

  novoAgendamento(): void {
    this.router.navigate(['/paciente', this.pacienteId, 'nova-consulta']);
  }

  cancelar(c: Consulta): void {
    const consultaAtualizada: Consulta = {
      ...c,
      status: 'cancelada' as const,
    };

    this.dataService.updateConsulta(consultaAtualizada).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Erro ao cancelar consulta:', err);
      },
    });
  }

  abrirReagendar(c: Consulta): void {
    this.consultaParaReagendar = c;
  }

  onReagendado(): void {
    this.consultaParaReagendar = null;
  }
}
