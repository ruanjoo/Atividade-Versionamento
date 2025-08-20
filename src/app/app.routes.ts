import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login-page/login-page.component';
import { MedicoDashboardComponent } from './components/doctor-view/doctor-view.component';
import { MedicoAgendaComponent } from './components/doctor-schedule/doctor-schedule.component';
import { PatientViewComponent } from './components/patient-view/patient-view.component';
import { PatientNewAppointment } from './components/patient-new-appointment/patient-new-appointment.component';
import { RecepcionistaDashboardComponent } from './components/receptionist-view/receptionist-view.component';
import { RecepcionistaPatientManagementComponent } from './components/receptionist-manager-patients/receptionist-manager-patients.component';
import { RecepcionistaScheduleWizardComponent } from './components/receptionist-new-appointment/receptionist-new-appointment.component';
import { SignInComponent } from './components/sign-in/sign-in.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'medico/:id', component: MedicoDashboardComponent },
  { path: 'medico/:id/agenda', component: MedicoAgendaComponent },
  { path: 'paciente/:id', component: PatientViewComponent },
  { path: 'paciente/:id/nova-consulta', component: PatientNewAppointment },
  { path: 'recepcionista/:id', component: RecepcionistaDashboardComponent },
  { path: 'recepcionista/:id/gerenciar-pacientes', component: RecepcionistaPatientManagementComponent  },
  { path: 'recepcionista/:id/nova-consulta', component: RecepcionistaScheduleWizardComponent},
  {path: 'cadastro', component: SignInComponent}
];
