import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataService,
  Paciente,
  Medico,
  Consulta,
  UsuarioLogado,
} from '../../services/data-service.service';

@Component({
  selector: 'app-recepcionista-schedule-wizard',
  templateUrl: './receptionist-new-appointment.component.html',
  styleUrls: ['./receptionist-new-appointment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RecepcionistaScheduleWizardComponent implements OnInit {
  @Input() paciente: Paciente | null = null;

  step = 1;
  pacientes: Paciente[] = [];
  specialties: string[] = [];
  doctors: Medico[] = [];
  consultas: Consulta[] = [];

  selectedPaciente!: Paciente;
  selectedSpecialty: string | null = null;
  selectedDoctorId: number | null = null;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: { date: Date; currentMonth: boolean }[] = [];
  times: string[] = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  showConfirmation = false;

  constructor(public dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.dataService.getPacientes().subscribe((ps) => (this.pacientes = ps));

    this.dataService.getConsultas().subscribe((cs) => (this.consultas = cs));

    this.dataService.getMedicos().subscribe((ms) => {
      this.specialties = Array.from(new Set(ms.map((m) => m.especialidade)));
    });

    if (this.paciente) {
      this.selectedPaciente = this.paciente;
      this.step = 2;
    }
  }

  getStepLabels(): string[] {
    const labels = [
      'Paciente',
      'Especialidade',
      'Médico',
      'Data',
      'Horário',
      'Resumo',
    ];
    return this.paciente ? labels.slice(1) : labels;
  }

  onSelectSpecialty(): void {
    this.dataService.getMedicos().subscribe((ms) => {
      this.doctors = ms.filter(
        (m) => m.especialidade === this.selectedSpecialty
      );
    });
  }

  private buildCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const start = first.getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];

    for (let i = start - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: new Date(year, month, -i),
        currentMonth: false,
      });
    }

    for (let d = 1; d <= lastDay; d++) {
      this.calendarDays.push({
        date: new Date(year, month, d),
        currentMonth: true,
      });
    }
  }

  nextMonth(): void {
    if (!this.selectedDate) this.selectedDate = new Date();
    const m = new Date(this.selectedDate);
    m.setMonth(m.getMonth() + 1);
    this.selectedDate = m;
    this.buildCalendar(m);
  }

  prevMonth(): void {
    if (!this.selectedDate) this.selectedDate = new Date();
    const m = new Date(this.selectedDate);
    m.setMonth(m.getMonth() - 1);
    this.selectedDate = m;
    this.buildCalendar(m);
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  isSelected(date: Date): boolean {
    return (
      this.selectedDate !== null &&
      date.toDateString() === this.selectedDate.toDateString()
    );
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  isTimeAvailable(time: string): boolean {
    if (!this.selectedDoctorId || !this.selectedDate) return false;
    return !this.consultas.some((c) => {
      const dt = new Date(c.data_consulta);
      const hh = dt.getHours().toString().padStart(2, '0');
      const mm = dt.getMinutes().toString().padStart(2, '0');
      return (
        c.id_medico === this.selectedDoctorId &&
        dt.toDateString() === this.selectedDate!.toDateString() &&
        `${hh}:${mm}` === time
      );
    });
  }

  nextStep(): void {
    if ((this.step === 4 || this.step === 5) && !this.selectedDate) {
      return;
    }
    if (this.step === 4 && this.selectedDate) {
      this.buildCalendar(this.selectedDate);
    }
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }

  getDoctorName(): string {
    const doc = this.doctors.find((d) => d.id_medico === this.selectedDoctorId);
    return doc ? doc.nome : '';
  }

  confirmarAgendamento(): void {
    if (
      !this.selectedPaciente ||
      !this.selectedDoctorId ||
      !this.selectedDate ||
      !this.selectedTime
    ) {
      return;
    }
    const [h, m] = this.selectedTime.split(':').map((n) => +n);
    const dt = new Date(this.selectedDate);
    dt.setHours(h, m, 0, 0);

    const nova: Consulta = {
      id_consulta: Date.now(),
      id_paciente: this.selectedPaciente.id_paciente,
      id_medico: this.selectedDoctorId,
      data_consulta: dt,
      status: 'agendada',
    };

    this.dataService.addConsulta(nova).subscribe({
      next: () => {
        this.showConfirmation = true;
        console.log('Consulta agendada com sucesso');
      },
      error: (err) => {
        console.error('Erro ao agendar consulta', err);
      },
    });
  }

  voltarDashboard(): void {
    const user = this.dataService.getUsuarioLogado()!;
    this.router.navigate(['/recepcionista', user.id]);
  }
}
