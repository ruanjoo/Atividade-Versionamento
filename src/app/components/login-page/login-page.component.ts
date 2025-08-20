import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  DataService,
  Paciente,
  Medico,
  Recepcionista,
  UsuarioLogado,
} from './../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  imports: [CommonModule, FormsModule],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  usuarios: Recepcionista[] = [];

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.dataService.getPacientes().subscribe((p) => (this.pacientes = p));
    this.dataService.getMedicos().subscribe((m) => (this.medicos = m));
    this.dataService.getUsuarios().subscribe((u) => (this.usuarios = u));
  }

  onSubmit(): void {
    const paciente = this.pacientes.find(
      (p) => p.email === this.email && p.senha === this.password
    );
    if (paciente) {
      const usuarioLogado: UsuarioLogado = {
        id: paciente.id_paciente,
        fullName: paciente.nome,
        tipo: 'paciente',
      };
      this.dataService.setUsuarioLogado(usuarioLogado);
      this.router.navigate(['/paciente', paciente.id_paciente]);
      return;
    }

    const medico = this.medicos.find(
      (m) => m.email === this.email && m.senha === this.password
    );
    if (medico) {
      const usuarioLogado: UsuarioLogado = {
        id: medico.id_medico,
        fullName: medico.nome,
        tipo: 'medico',
      };
      this.dataService.setUsuarioLogado(usuarioLogado);
      this.router.navigate(['/medico', medico.id_medico]);
      return;
    }

    const usuario = this.usuarios.find(
      (u) => u.email === this.email && u.senha === this.password
    );
    if (usuario) {
      const usuarioLogado: UsuarioLogado = {
        id: usuario.id_recepcionista,
        fullName: usuario.nome,
        tipo: 'recepcionista',
      };
      this.dataService.setUsuarioLogado(usuarioLogado);
      this.router.navigate(['/recepcionista', usuario.id_recepcionista]);
      return;
    }

    alert('Email ou senha inválidos.');
  }
}
