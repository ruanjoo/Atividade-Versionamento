import { Component, OnInit } from '@angular/core';
import {
  DataService,
  Consulta,
  Paciente,
  Medico,
  UsuarioLogado,
} from '../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ConsultaExibicao {
  consulta: Consulta;
  paciente: Paciente;
  medico: Medico;
}

@Component({
  selector: 'app-recepcionista-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: 'receptionist-view.component.html',
  styleUrl: 'receptionist-view.component.css',
})
export class RecepcionistaDashboardComponent implements OnInit {
  currentUser: UsuarioLogado | null = null;
  allConsultas: Consulta[] = [];
  pacientes: Paciente[] = [];
  medicos: Medico[] = [];

  view: 'hoje' | 'amanha' | 'semana' = 'hoje';
  searchTerm: string = '';

  consultasHoje = 0;
  totalPacientes = 0;
  totalMedicos = 0;
  totalAgendados = 0;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.currentUser = this.dataService.getUsuarioLogado();

    this.dataService.getPacientes().subscribe((ps) => {
      this.pacientes = ps;
      this.totalPacientes = ps.length;
    });

    this.dataService.getMedicos().subscribe((ms) => {
      this.medicos = ms;
      this.totalMedicos = ms.length;
    });

    this.dataService.getConsultas().subscribe((cs) => {
      this.allConsultas = cs.filter((c) => c.status === 'agendada');
      this.totalAgendados = this.allConsultas.length;
      this.calcularHoje();
      this.view = 'hoje';
    });
  }

  calcularHoje() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    this.consultasHoje = this.allConsultas.filter((c) => {
      const d = new Date(c.data_consulta);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === hoje.getTime();
    }).length;
  }

  get filtradas(): ConsultaExibicao[] {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const fimSemana = new Date(hoje);
    fimSemana.setDate(hoje.getDate() + (7 - hoje.getDay()));

    const list = this.allConsultas.filter((c) => {
      const d = new Date(c.data_consulta);
      if (this.view === 'hoje') return this.mesmoDia(d, hoje);
      if (this.view === 'amanha') return this.mesmoDia(d, amanha);
      return d >= hoje && d <= fimSemana;
    });

    return list
      .filter((item) => {
        const paciente = this.pacientes.find(
          (p) => p.id_paciente === item.id_paciente
        );
        const medico = this.medicos.find((m) => m.id_medico === item.id_medico);
        const termo = this.searchTerm.toLowerCase();
        return (
          paciente?.nome.toLowerCase().includes(termo) ||
          paciente?.CPF.includes(termo)
        );
      })
      .map((c) => ({
        consulta: c,
        paciente: this.pacientes.find((p) => p.id_paciente === c.id_paciente)!,
        medico: this.medicos.find((m) => m.id_medico === c.id_medico)!,
      }));
  }

  private mesmoDia(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  reagendar(c: Consulta) {}

  cancelar(c: Consulta) {
    c.status = 'cancelada';
  }
}
