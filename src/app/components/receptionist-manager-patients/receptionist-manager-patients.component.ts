import { Component, OnInit } from '@angular/core';
import {
  DataService,
  Paciente,
  Consulta,
  Medico,
} from './../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recepcionista-patient-management',
  templateUrl: './receptionist-manager-patients.component.html',
  styleUrls: ['./receptionist-manager-patients.component.css'],
  imports: [CommonModule, FormsModule],
})
export class RecepcionistaPatientManagementComponent implements OnInit {
  pacientes: Paciente[] = [];
  consultas: Consulta[] = [];
  medicos: Medico[] = []; // lista de médicos

  searchTerm: string = '';

  showNewForm = false;
  newPaciente: Partial<Paciente> = {};

  showHistoryModal = false;
  historyList: (Consulta & { medico_nome?: string; especialidade?: string })[] =
    [];

  constructor(public dataService: DataService) {}

  ngOnInit(): void {
    this.loadPacientes();
    this.loadConsultas();
    this.loadMedicos();
  }

  loadPacientes() {
    this.dataService.getPacientes().subscribe((ps) => (this.pacientes = ps));
  }

  loadConsultas() {
    this.dataService.getConsultas().subscribe((cs) => (this.consultas = cs));
  }

  loadMedicos() {
    this.dataService.getMedicos().subscribe((ms) => (this.medicos = ms));
  }

  toggleNewForm() {
    this.showNewForm = !this.showNewForm;
    if (!this.showNewForm) this.newPaciente = {};
  }

  addPaciente() {
    const p = this.newPaciente;
    if (p.nome && p.email && p.CPF && p.telefone && p.data_nascimento) {
      const senhaPadrao = Math.random().toString(36).slice(-8);
      const paciente: Paciente = {
        id_paciente: 0, // O backend deve gerar o id, pode enviar 0 ou omitir se backend suportar
        nome: p.nome,
        email: p.email,
        CPF: p.CPF,
        telefone: p.telefone,
        data_nascimento: new Date(p.data_nascimento),
        sexo: (p.sexo as any) || 'Outro',
        senha: senhaPadrao,
      };
      this.dataService.addPaciente(paciente).subscribe({
        next: (novoPaciente) => {
          alert(
            `Paciente "${novoPaciente.nome}" adicionado com senha: ${senhaPadrao}`
          );
          this.toggleNewForm();
          this.loadPacientes();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao adicionar paciente. Tente novamente.');
        },
      });
    } else {
      alert('Preencha todos os campos obrigatórios.');
    }
  }

  getUltimaConsulta(p: Paciente): Date | null {
    const historico = this.consultas
      .filter((c) => c.id_paciente === p.id_paciente)
      .sort(
        (a, b) =>
          new Date(b.data_consulta).getTime() -
          new Date(a.data_consulta).getTime()
      );
    return historico.length > 0 ? new Date(historico[0].data_consulta) : null;
  }

  get filteredPacientes(): Paciente[] {
    const termo = this.searchTerm.trim().toLowerCase();
    if (!termo) return this.pacientes;
    return this.pacientes.filter(
      (p) => p.nome.toLowerCase().includes(termo) || p.CPF.includes(termo)
    );
  }

  getMedicoById(id: number): Medico | undefined {
    return this.medicos.find((m) => m.id_medico === id);
  }

  viewHistory(p: Paciente) {
    this.historyList = this.consultas
      .filter((c) => c.id_paciente === p.id_paciente)
      .map((c) => {
        const medico = this.getMedicoById(c.id_medico);
        return {
          ...c,
          medico_nome: medico ? medico.nome : '—',
          especialidade: medico ? medico.especialidade : '—',
        };
      })
      .sort(
        (a, b) =>
          new Date(b.data_consulta).getTime() -
          new Date(a.data_consulta).getTime()
      );
    this.showHistoryModal = true;
  }

  closeHistory() {
    this.showHistoryModal = false;
    this.historyList = [];
  }
}
