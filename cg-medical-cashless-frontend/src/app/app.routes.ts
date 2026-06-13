import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { OtpVerificationComponent } from './auth/otp-verification/otp-verification.component';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { DashboardComponent } from './employee/dashboard/dashboard.component';
import { ProfileComponent } from './employee/profile/profile.component';
import { DependentsComponent } from './employee/dependents/dependents.component';
import { IntimationsComponent } from './employee/intimations/intimations.component';

import { authGuard } from './core/guards/auth.guard';
import { HospitalLoginComponent } from './auth/hospital-login/hospital-login.component';
import { HospitalDashboardComponent } from './hospital/hospital-dashboard/hospital-dashboard.component';
import { ApplyHospitalEmployeeComponent } from './hospital/apply-hospital-employee/apply-hospital-employee.component';

export const routes: Routes = [

  // {
  //   path: '',
  //   redirectTo: 'login',
  //   pathMatch: 'full'
  // },

  {
    path: '',
    redirectTo: 'hospital-login',
    pathMatch: 'full'
  },
  {
    path: 'hospital-login',
    component: HospitalLoginComponent
  },
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },

  {
    path: 'otp-verification',
    component: OtpVerificationComponent
  },
    // Hospital Routes
  {
    path: 'hospital/hospital-dashboard',
    component: HospitalDashboardComponent
  },
    {
    path: 'hospital/apply-hospital-employee',
    component: ApplyHospitalEmployeeComponent
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [

      {
        path: 'employee/dashboard',
        component: DashboardComponent
      },

      {
        path: 'employee/profile',
        component: ProfileComponent
      },

      {
        path: 'employee/dependents',
        component: DependentsComponent
      },

      {
        path: 'employee/intimations',
        component: IntimationsComponent
      },
       { path: 'dashboard', 
        component: DashboardComponent 
      },
     

    ]
  }

];