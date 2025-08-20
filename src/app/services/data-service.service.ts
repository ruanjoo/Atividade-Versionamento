import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

export interface UsuarioLogado {
  id: number;
  fullName: string;
  tipo: 'paciente' | 'medico' | 'recepcionista';
}

export interface Paciente {
  id_paciente: number;
  nome: string;
  data_nascimento: Date;
  CPF: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  email: string;
  senha: string;
  telefone: string;
}

export interface Medico {
  id_medico: number;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  especialidade: string;
  CRM: string;
  CPF: string;
}

export interface Recepcionista {
  id_recepcionista: number;
  nome: string;
  email: string;
  senha: string;
}

export type ConsultaStatus =
  | 'agendada'
  | 'em andamento'
  | 'realizada'
  | 'cancelada';

export interface Consulta {
  id_consulta: number;
  id_paciente: number;
  id_medico: number;
  data_consulta: Date;
  status: ConsultaStatus;
}

export interface Historico {
  id_historicoconsulta: number;
  id_consulta: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly USER_KEY = 'usuarioLogado';
  private readonly API_URL = 'http://localhost:3000/api';

  private pacientes$ = new BehaviorSubject<Paciente[]>([]);
  private medicos$ = new BehaviorSubject<Medico[]>([]);
  private recepcionistas$ = new BehaviorSubject<Recepcionista[]>([]);
  private consultas$ = new BehaviorSubject<Consulta[]>([]);
  private historico$ = new BehaviorSubject<Historico[]>([]);
  private usuarioLogado = new BehaviorSubject<UsuarioLogado | null>(
    this.getUsuarioLogadoFromStorage()
  );

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.http
      .get<Paciente[]>(`${this.API_URL}/pacientes`)
      .subscribe((p) => this.pacientes$.next(p));

    this.http
      .get<Medico[]>(`${this.API_URL}/medicos`)
      .subscribe((m) => this.medicos$.next(m));

    this.http
      .get<Recepcionista[]>(`${this.API_URL}/recepcionistas`)
      .subscribe((u) => this.recepcionistas$.next(u));

    this.http
      .get<any[]>(`${this.API_URL}/consultas`)
      .pipe(
        map((raw) =>
          raw.map(
            (c) =>
              ({
                ...c,
                data_consulta: new Date(c.data_consulta.replace(' ', 'T')),
              } as Consulta)
          )
        )
      )
      .subscribe((list) => this.consultas$.next(list));

    this.http
      .get<Historico[]>(`${this.API_URL}/historico`)
      .subscribe((h) => this.historico$.next(h));
  }

  getPacientes(): Observable<Paciente[]> {
    return this.pacientes$.asObservable();
  }
  getPacienteById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.API_URL}/pacientes/${id}`).pipe(
      tap((p) => {
        const list = this.pacientes$.value;
        if (!list.find((x) => x.id_paciente === p.id_paciente)) {
          this.pacientes$.next([...list, p]);
        }
      })
    );
  }
  addPaciente(p: Paciente): Observable<Paciente> {
    const formatDateOnly = (dt: string | Date): string => {
      const d = typeof dt === 'string' ? new Date(dt) : dt;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const payload = {
      ...p,
      data_nascimento: formatDateOnly(p.data_nascimento),
    };

    return this.http
      .post<Paciente>(`${this.API_URL}/pacientes`, payload)
      .pipe(
        tap((novo) => this.pacientes$.next([...this.pacientes$.value, novo]))
      );
  }

  getMedicos(): Observable<Medico[]> {
    return this.medicos$.asObservable();
  }

  getMedicoById(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.API_URL}/medicos/${id}`).pipe(
      tap((m) => {
        const list = this.medicos$.value;
        if (!list.find((x) => x.id_medico === m.id_medico)) {
          this.medicos$.next([...list, m]);
        }
      })
    );
  }

  addMedico(m: Medico): Observable<Medico> {
    return this.http
      .post<Medico>(`${this.API_URL}/medicos`, m)
      .pipe(tap((novo) => this.medicos$.next([...this.medicos$.value, novo])));
  }

  updateMedico(m: Medico): Observable<Medico> {
    return this.http
      .put<Medico>(`${this.API_URL}/medicos/${m.id_medico}`, m)
      .pipe(
        tap((updated) => {
          const list = this.medicos$.value.map((med) =>
            med.id_medico === updated.id_medico ? updated : med
          );
          this.medicos$.next(list);
        })
      );
  }

  deleteMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/medicos/${id}`).pipe(
      tap(() => {
        const list = this.medicos$.value.filter((m) => m.id_medico !== id);
        this.medicos$.next(list);
      })
    );
  }

  getUsuarios(): Observable<Recepcionista[]> {
    return this.recepcionistas$.asObservable();
  }
  getUsuarioById(id: number): Observable<Recepcionista> {
    return this.http.get<Recepcionista>(`${this.API_URL}/recepcionistas/${id}`).pipe(
      tap((u) => {
        const list = this.recepcionistas$.value;
        if (!list.find((x) => x.id_recepcionista === u.id_recepcionista)) {
          this.recepcionistas$.next([...list, u]);
        }
      })
    );
  }
  addUsuario(u: Recepcionista): Observable<Recepcionista> {
    return this.http
      .post<Recepcionista>(`${this.API_URL}/recepcionistas`, u)
      .pipe(
        tap((novo) => this.recepcionistas$.next([...this.recepcionistas$.value, novo]))
      );
  }

  getConsultas(): Observable<Consulta[]> {
    return this.consultas$.asObservable();
  }
  getConsultaById(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.API_URL}/consultas/${id}`).pipe(
      map(
        (c) =>
          ({
            ...c,
            data_consulta: new Date((c as any).data_consulta.replace(' ', 'T')),
          } as Consulta)
      ),
      tap((c) => {
        const list = this.consultas$.value;
        if (!list.find((x) => x.id_consulta === c.id_consulta)) {
          this.consultas$.next([...list, c]);
        }
      })
    );
  }
  addConsulta(consulta: Consulta): Observable<Consulta> {
    const payload = {
      ...consulta,
      data_consulta: this.formatDate(consulta.data_consulta),
    };
    return this.http.post<Consulta>(`${this.API_URL}/consultas`, payload).pipe(
      map(
        (novo) =>
          ({
            ...novo,
            data_consulta: new Date(
              (novo as any).data_consulta.replace(' ', 'T')
            ),
          } as Consulta)
      ),
      tap((parsed) => this.consultas$.next([...this.consultas$.value, parsed]))
    );
  }
  updateConsulta(consulta: Consulta): Observable<Consulta> {
    const payload = {
      ...consulta,
      data_consulta: this.formatDate(consulta.data_consulta),
    };
    return this.http
      .put<Consulta>(
        `${this.API_URL}/consultas/${consulta.id_consulta}`,
        payload
      )
      .pipe(
        map(
          (u) =>
            ({
              ...u,
              data_consulta: new Date(
                (u as any).data_consulta.replace(' ', 'T')
              ),
            } as Consulta)
        ),
        tap((updated) => {
          const list = this.consultas$.value.map((c) =>
            c.id_consulta === updated.id_consulta ? updated : c
          );
          this.consultas$.next(list);
        })
      );
  }

  registerUser(formData: any): Observable<any> {
    const {
      accountType,
      fullName,
      email,
      password,
      cpf,
      gender,
      phone,
      birthDate,
      crm,
      specialty,
    } = formData;

    if (accountType === 'paciente') {
      const paciente: Paciente = {
        id_paciente: 0,
        nome: fullName,
        email,
        senha: password,
        CPF: cpf,
        sexo: gender,
        telefone: phone,
        data_nascimento: birthDate,
      };
      return this.addPaciente(paciente);
    }

    if (accountType === 'medico') {
      const medico: Medico = {
        id_medico: 0,
        nome: fullName,
        email,
        senha: password,
        telefone: phone,
        CPF: cpf,
        CRM: crm,
        especialidade: specialty,
      };
      return this.addMedico(medico);
    }

    if (accountType === 'recepcionista') {
      const recepcionista: Recepcionista = {
        id_recepcionista: 0,
        nome: fullName,
        email,
        senha: password,
      };
      return this.addUsuario(recepcionista);
    }

    throw new Error('Tipo de conta inválido');
  }

  private formatDate(dt: string | Date): string {
    if (typeof dt === 'string') {
      dt = new Date(dt);
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ` +
      `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
    );
  }

  getHistorico(): Observable<Historico[]> {
    return this.historico$.asObservable();
  }

  private getUsuarioLogadoFromStorage(): UsuarioLogado | null {
    const json = localStorage.getItem(this.USER_KEY);
    return json ? JSON.parse(json) : null;
  }
  getUsuarioLogado$(): Observable<UsuarioLogado | null> {
    return this.usuarioLogado.asObservable();
  }
  getUsuarioLogado(): UsuarioLogado | null {
    return this.usuarioLogado.value;
  }
  setUsuarioLogado(u: UsuarioLogado): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(u));
    this.usuarioLogado.next(u);
  }
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.usuarioLogado.next(null);
  }
  isLogado(): boolean {
    return this.usuarioLogado.value !== null;
  }
}
