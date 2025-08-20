import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  DataService,
  UsuarioLogado,
} from '../../services/data-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.css'],
  imports: [CommonModule, RouterModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: UsuarioLogado | null = null;
  dropdownOpen: boolean = false;
  private subscription?: Subscription;

  constructor(private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    this.subscription = this.dataService
      .getUsuarioLogado$()
      .subscribe((user) => {
        this.currentUser = user;
        if (!user) {
          this.dropdownOpen = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.dataService.logout();

    this.router.navigate(['/login']);
  }

  irParaMinhaPagina(): void {
    if (!this.currentUser) return;

    switch (this.currentUser.tipo) {
      case 'paciente':
        this.router.navigate(['/paciente', this.currentUser.id]);
        break;
      case 'medico':
        this.router.navigate(['/medico', this.currentUser.id]);
        break;
      case 'recepcionista':
        this.router.navigate(['/recepcionista', this.currentUser.id]);
        break;
      default:
        this.router.navigate(['/']);
    }
    this.dropdownOpen = false;
  }
}
