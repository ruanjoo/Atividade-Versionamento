import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data-service.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  formData = {
    fullName: '',
    email: '',
    accountType: '',
    gender: '',
    phone: '',
    cpf: '',
    birthDate: '',
    crm: '',
    specialty: '',
    password: '',
    confirmPassword: '',
  };

  constructor(private dataService: DataService, private router: Router) {}

  onSubmit() {
    if (this.formData.password !== this.formData.confirmPassword) {
      alert('As senhas não coincidem. Por favor, verifique novamente.');
      return;
    }

    if (!this.formData.accountType) {
      alert('Por favor, selecione um tipo de conta.');
      return;
    }
    console.log(this.formData);
    this.dataService.registerUser(this.formData).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso!');
        console.log('Dados cadastrados:', this.formData);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        alert(
          'Ocorreu um erro no cadastro. Verifique os dados e tente novamente.'
        );
      },
    });
  }
}
