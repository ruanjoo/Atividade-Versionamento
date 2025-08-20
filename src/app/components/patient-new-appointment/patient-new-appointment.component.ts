import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  DataService,
  Medico,
  Consulta,
  UsuarioLogado,
} from '../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-nova-consulta',
  templateUrl: './patient-new-appointment.component.html',
  styleUrls: ['./patient-new-appointment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8)' })
        ),
      ]),
    ]),
  ],
})
export class PatientNewAppointment implements OnInit {
  step = 1;

  specialties: string[] = [];
  selectedSpecialty: string | null = null;

  doctors: Medico[] = [];
  selectedDoctorId: number | null = null;
  get selectedDoctor(): Medico | undefined {
    return this.doctors.find((d) => d.id_medico === this.selectedDoctorId!);
  }

  selectedDate: Date = new Date();
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: { date: Date; currentMonth: boolean }[] = [];

  times: string[] = [];
  selectedTime: string | null = null;

  showConfirmation = false;

  allDoctors: Medico[] = [];
  allConsultas: Consulta[] = [];

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.dataService.getMedicos().subscribe((meds) => {
      this.allDoctors = meds;
      this.specialties = Array.from(new Set(meds.map((d) => d.especialidade)));
    });

    this.dataService.getConsultas().subscribe((c) => {
      this.allConsultas = c;
      this.buildCalendar(new Date());
    });

    this.generateTimes();
  }

  nextStep(): void {
    if (this.step < 5) this.step++;
  }
  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  onSelectSpecialty(): void {
    this.doctors = this.allDoctors.filter(
      (d) => d.especialidade === this.selectedSpecialty
    );
    this.selectedDoctorId = null;
  }

  buildCalendar(date: Date): void {
    const year = date.getFullYear(),
      month = date.getMonth();
    const first = new Date(year, month, 1),
      last = new Date(year, month + 1, 0);
    const start = first.getDay(),
      total = last.getDate();

    this.calendarDays = [];

    for (let i = start - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: new Date(year, month, -i),
        currentMonth: false,
      });
    }

    for (let i = 1; i <= total; i++) {
      this.calendarDays.push({
        date: new Date(year, month, i),
        currentMonth: true,
      });
    }

    const rem = 42 - this.calendarDays.length;
    for (let i = 1; i <= rem; i++) {
      this.calendarDays.push({
        date: new Date(year, month + 1, i),
        currentMonth: false,
      });
    }
  }

  prevMonth(): void {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() - 1);
    this.selectedDate = d;
    this.buildCalendar(d);
  }
  nextMonth(): void {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() + 1);
    this.selectedDate = d;
    this.buildCalendar(d);
  }
  selectDate(date: Date): void {
    this.selectedDate = date;
  }
  isSelected(date: Date): boolean {
    return date.toDateString() === this.selectedDate.toDateString();
  }

  generateTimes(): void {
    for (let h = 8; h < 18; h++) {
      this.times.push(`${h.toString().padStart(2, '0')}:00`);
      this.times.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  isTimeAvailable(time: string): boolean {
    if (!this.selectedDoctorId) return false;
    return !this.allConsultas.some(
      (c) =>
        c.id_medico === this.selectedDoctorId &&
        new Date(c.data_consulta).toDateString() ===
          this.selectedDate.toDateString() &&
        new Date(c.data_consulta).toTimeString().startsWith(time)
    );
  }

  selectTime(time: string): void {
    if (this.isTimeAvailable(time)) {
      this.selectedTime = time;
    }
  }

  /** Confirma e persiste o agendamento no backend */
  confirmarAgendamento(): void {
    const [hours, minutes] = this.selectedTime!.split(':').map(Number);
    const dt = new Date(this.selectedDate);
    dt.setHours(hours, minutes, 0, 0);

    const doctorId = Number(this.selectedDoctorId);
    const currentUser = this.dataService.getUsuarioLogado() as UsuarioLogado;

    const novaConsulta: Consulta = {
      id_consulta: 0,
      id_medico: doctorId,
      id_paciente: currentUser.id,
      data_consulta: this.formatToMySQL(dt) as any,
      status: 'agendada',
    };

    this.dataService.addConsulta(novaConsulta).subscribe({
      next: () => {
        this.showConfirmation = true;
      },
      error: (err) => {
        console.error('Erro ao criar nova consulta', err);
      },
    });
  }

  voltarDashboard(): void {
    const user = this.dataService.getUsuarioLogado()!;
    this.router.navigate(['/paciente', user.id]);
  }

  /** Serializa Date em string MySQL `YYYY-MM-DD HH:MM:SS` */
  private formatToMySQL(dt: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
      ` ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
    );
  }
}
