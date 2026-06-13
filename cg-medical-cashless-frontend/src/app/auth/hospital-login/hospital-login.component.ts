import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../service/http.service';

@Component({
  selector: 'app-hospital-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './hospital-login.component.html',
  styleUrl: './hospital-login.component.scss'
})
export class HospitalLoginComponent {

  employeeCode = '';
  mobileNumber = '';
  loading = false;
  errorMessage = '';

  constructor(private router: Router, private http: HttpService) {}

  login() {

    if (!this.employeeCode) {
      this.errorMessage = 'Enter Employee Code';
      return;
    }

    if (!this.mobileNumber || this.mobileNumber.length !== 10) {
      this.errorMessage = 'Enter a valid 10-digit Mobile Number';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.postData('/hospital/login', {
      employee_code: this.employeeCode,
      mobile_number: this.mobileNumber
    }, 'admin').subscribe({

      next: (res: any) => {
        this.loading = false;
        const body = res.body || res;

        if (body?.success) {
          // Store JWT — interceptor attaches it as Authorization: Bearer <token> on every request
          localStorage.setItem('token', body.token);
          localStorage.setItem('hospital_emp_code', this.employeeCode);
          this.router.navigate(['/hospital/hospital-dashboard']);
        } else {
          this.errorMessage = body?.message || 'Login Failed';
        }
      },

      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Login Failed';
      }

    });
  }
}
