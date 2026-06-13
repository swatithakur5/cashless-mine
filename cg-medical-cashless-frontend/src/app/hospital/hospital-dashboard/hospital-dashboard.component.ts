import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../service/http.service';

@Component({
  selector: 'app-hospital-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './hospital-dashboard.component.html',
  styleUrl: './hospital-dashboard.component.scss'
})
export class HospitalDashboardComponent implements OnInit {

  requests: any[] = [];
  otp = '';
  showOtpModal = false;
  selectedRow: any = null;
  loading = false;

  constructor(
    private http: HttpService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const empCode = localStorage.getItem('hospital_emp_code');
      if (empCode) {
        this.loadDashboardData(empCode);
      }
    }
  }

  loadDashboardData(empCode: string) {
    this.loading = true;
    // Auto framework API — no backend function written, resolved from mas_api + mas_custom_queries
    this.http.getParam('/list/get/getAuthRequests', { employee_code: empCode }, 'admin').subscribe({
      next: (res: any) => {
        this.loading = false;
        const body = res.body || res;
        const rows = body?.data || [];
        this.requests = rows.map((item: any, index: number) => ({
          sno: index + 1,
          empId: item.employee_code,
          hospitalName: item.hospital_name,
          relation: item.relation_name,
          fromDate: item.from_date,
          toDate: item.to_date,
          amount: item.amount,
          status: item.status
        }));
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Dashboard load error', err);
      }
    });
  }

  openOtpModal(row: any) {
    this.selectedRow = row;
    this.showOtpModal = true;
  }

  closeModal() {
    this.showOtpModal = false;
    this.otp = '';
  }

  verifyOtp() {
    this.http.postData('/hospital/verify-otp', { otp: this.otp }, 'admin').subscribe({
      next: (res: any) => {
        const body = res.body || res;
        if (body?.success) {
          alert('OTP Verified Successfully');
          this.closeModal();
          this.router.navigate(['/hospital/apply-hospital-employee']);
        }
      },
      error: () => alert('Backend Error')
    });
  }

  reject(row: any) {
    row.status = 'Rejected';
  }

  viewDetails(row: any) {
    this.router.navigate(['/hospital/authorization-details']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('hospital_emp_code');
    this.router.navigate(['/hospital-login']);
  }
}
