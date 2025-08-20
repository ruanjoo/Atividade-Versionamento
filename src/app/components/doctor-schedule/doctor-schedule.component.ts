import { Component, OnInit } from '@angular/core';
import {
  DataService,
  Consulta,
  Paciente,
  Medico,
} from '../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ConsultaExibicao {
  consulta: Consulta;
  paciente: Paciente;
}

@Component({
  selector: 'app-medico-agenda',
  templateUrl: './doctor-schedule.component.html',
  styleUrls: ['./doctor-schedule.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MedicoAgendaComponent implements OnInit {
  medicoId: number = 0;
  medico: Medico | null = null;

  todasConsultas: Consulta[] = [];
  pacientesMap: Map<number, Paciente> = new Map();
  consultaSelecionada: Consulta | null = null;
  acaoPendencia: 'cancelar' | 'confirmar' | null = null;

  selectedDate: Date = new Date();
  displayMonth: string = '';
  displayYear: number = 0;
  weekDays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: { date: Date; currentMonth: boolean }[] = [];

  dailyConsultas: Consulta[] = [];
  dailyExibicao: ConsultaExibicao[] = [];

  consultaParaReagendar: Consulta | null = null;
  novaData: string = '';
  novoHorario: string = '';

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.medicoId = Number(this.route.snapshot.paramMap.get('id'));

    this.dataService.getMedicoById(this.medicoId).subscribe((medico) => {
      this.medico = medico;
    });

    this.dataService.getPacientes().subscribe((pacientes) => {
      pacientes.forEach((p) => this.pacientesMap.set(p.id_paciente, p));
    });

    this.dataService.getConsultas().subscribe((consultas) => {
      this.todasConsultas = consultas.filter(
        (c) => c.id_medico === this.medicoId
      );
      this.buildCalendar(this.selectedDate);
      this.updateDailyConsultas();
    });
  }

  buildCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();

    this.displayMonth = date.toLocaleString('pt-BR', { month: 'long' });
    this.displayYear = year;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    this.calendarDays = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const prev = new Date(year, month, -i);
      this.calendarDays.push({ date: prev, currentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      const current = new Date(year, month, i);
      this.calendarDays.push({ date: current, currentMonth: true });
    }

    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const next = new Date(year, month + 1, i);
      this.calendarDays.push({ date: next, currentMonth: false });
    }
  }

  prevMonth(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.selectedDate = newDate;
    this.buildCalendar(newDate);
    this.updateDailyConsultas();
  }

  nextMonth(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.selectedDate = newDate;
    this.buildCalendar(newDate);
    this.updateDailyConsultas();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.updateDailyConsultas();
  }

  isSelected(date: Date): boolean {
    return date.toDateString() === this.selectedDate.toDateString();
  }

  updateDailyConsultas(): void {
    this.dailyConsultas = this.todasConsultas.filter((c) => {
      const cDate = new Date(c.data_consulta);
      return this.isSameDay(cDate, this.selectedDate);
    });

    this.dailyExibicao = this.dailyConsultas.map((c) => ({
      consulta: c,
      paciente: this.pacientesMap.get(c.id_paciente)!,
    }));
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  abrirConfirmacao(consulta: Consulta, acao: 'cancelar' | 'confirmar'): void {
    this.consultaSelecionada = consulta;
    this.acaoPendencia = acao;
  }

  confirmarAcao(): void {
    if (!this.consultaSelecionada || !this.acaoPendencia) return;

    const novoStatus: 'realizada' | 'cancelada' =
      this.acaoPendencia === 'cancelar' ? 'cancelada' : 'realizada';

    const consultaAtualizada: Consulta = {
      ...this.consultaSelecionada,
      status: novoStatus,
    };

    this.dataService.updateConsulta(consultaAtualizada).subscribe({
      next: () => {
        this.consultaSelecionada!.status = novoStatus;

        this.updateDailyConsultas();

        this.fecharConfirmacao();
      },
      error: (err) => {
        console.error(`Erro ao ${this.acaoPendencia} consulta:`, err);
      },
    });
  }

  fecharConfirmacao(): void {
    this.consultaSelecionada = null;
    this.acaoPendencia = null;
  }

  goBack(): void {
    this.router.navigate(['/medico', this.medicoId]);
  }
}
