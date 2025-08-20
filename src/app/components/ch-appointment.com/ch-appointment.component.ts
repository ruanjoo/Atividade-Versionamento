import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import {
  DataService,
  Consulta,
  UsuarioLogado,
} from '../../services/data-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reagendar-consulta',
  templateUrl: './ch-appointment.component.html',
  styleUrls: ['./ch-appointment.component.css'],
  imports: [CommonModule],
})
export class ReagendarConsultaComponent implements OnInit {
  @Input() consultaOriginal!: Consulta;
  @Output() done = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  selectedDate = new Date();
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: { date: Date; currentMonth: boolean }[] = [];

  times: string[] = [];
  selectedTime: string | null = null;

  allConsultas: Consulta[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.buildCalendar(this.selectedDate);
    this.generateTimes();
    this.dataService
      .getConsultas()
      .subscribe(
        (cs) =>
          (this.allConsultas = cs.filter(
            (c) => c.id_medico === this.consultaOriginal.id_medico
          ))
      );
  }

  private buildCalendar(d: Date) {
    const y = d.getFullYear(),
      m = d.getMonth();
    const first = new Date(y, m, 1),
      last = new Date(y, m + 1, 0);
    const start = first.getDay(),
      total = last.getDate();

    this.calendarDays = [];
    for (let i = start - 1; i >= 0; i--) {
      this.calendarDays.push({ date: new Date(y, m, -i), currentMonth: false });
    }
    for (let i = 1; i <= total; i++) {
      this.calendarDays.push({ date: new Date(y, m, i), currentMonth: true });
    }
    const rem = 42 - this.calendarDays.length;
    for (let i = 1; i <= rem; i++) {
      this.calendarDays.push({
        date: new Date(y, m + 1, i),
        currentMonth: false,
      });
    }
  }

  selectDate(dt: Date) {
    this.selectedDate = dt;
    this.selectedTime = null;
  }
  isSelected(dt: Date) {
    return dt.toDateString() === this.selectedDate.toDateString();
  }

  prevMonth() {
    this.shiftMonth(-1);
  }
  nextMonth() {
    this.shiftMonth(1);
  }
  private shiftMonth(offset: number) {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() + offset);
    this.selectedDate = d;
    this.buildCalendar(d);
  }

  private generateTimes() {
    for (let h = 8; h < 18; h++) {
      this.times.push(`${h.toString().padStart(2, '0')}:00`);
      this.times.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  isTimeAvailable(t: string) {
    return !this.allConsultas.some((c) => {
      const dt = new Date(c.data_consulta);
      return (
        c.status === 'agendada' &&
        c.id_consulta !== this.consultaOriginal.id_consulta &&
        dt.toDateString() === this.selectedDate.toDateString() &&
        dt.toTimeString().startsWith(t)
      );
    });
  }

  selectTime(t: string) {
    if (this.isTimeAvailable(t)) {
      this.selectedTime = t;
    }
  }

  cancel() {
    this.canceled.emit();
  }

  private formatToMySQL(dt: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
      ` ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
    );
  }

  confirm() {
    const [h, m] = this.selectedTime!.split(':').map(Number);
    const novaData = new Date(this.selectedDate);
    novaData.setHours(h, m, 0, 0);

    const user = this.dataService.getUsuarioLogado()! as UsuarioLogado;

    const originalUpdate: Consulta = {
      ...this.consultaOriginal,
      data_consulta: this.formatToMySQL(
        new Date(this.consultaOriginal.data_consulta)
      ) as any,
      status: 'cancelada',
    };

    this.dataService
      .updateConsulta(originalUpdate)
      .pipe(
        switchMap(() => {
          const nova: Consulta = {
            id_consulta: 0,
            id_medico: this.consultaOriginal.id_medico,
            id_paciente: user.id,
            data_consulta: this.formatToMySQL(novaData) as any,
            status: 'agendada',
          };
          return this.dataService.addConsulta(nova);
        })
      )
      .subscribe({
        next: () => this.done.emit(),
        error: (err) => console.error('Erro no reagendamento', err),
      });
  }
}
