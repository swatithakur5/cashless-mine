import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, Subject } from "rxjs";
import { Router } from '@angular/router';
import { EncryptionService } from 'shared';

export interface Data {
  uf_id: number;
  fs_id: number;
  farmer_code: string,
  farmer_name: string
}

@Injectable({
  providedIn: 'root'
})
export class DataSharedService {
  private keySubject = new BehaviorSubject<Data | null>(null);
  keyData$ = this.keySubject.asObservable();

  private prefetchSubject = new BehaviorSubject<Data | null>(null);
  prefetchData$ = this.prefetchSubject.asObservable();

  private landListSubject = new BehaviorSubject<Data | []>([]);
  landListData$ = this.landListSubject.asObservable();

  private formSubject = new BehaviorSubject<Data | []>([]);
  formSubmissionData$ = this.formSubject.asObservable();


  private varisanSubject = new BehaviorSubject<{}>({});

  // varisanData$ = this.varisanSubject.asObservable();
  constructor(private datePipe: DatePipe, private router: Router, private es: EncryptionService) { }

  updateVarisanData(key: string, value: any) {
    const currentData = this.varisanSubject.value;
    const newData = { ...currentData, [key]: value };
    this.varisanSubject.next(newData);
  }

  getVarisanData(key: string): any {
    return this.varisanSubject.pipe(
      filter(data => !!data),
      map((data: any) => data ? data[key] : null),
      distinctUntilChanged()
    );
  }

  clearVarisanData() {
    this.varisanSubject.next({});
  }

  completeSubject() {
    this.varisanSubject.complete();
  }

  setKeyData(data: Data) {
    this.keySubject.next(data);
  }

  clearKeyData() {
    this.keySubject.next(null);
  }

  setPreFetch(data: Data) {
    this.prefetchSubject.next(data);
  }

  clearPreFetch() {
    this.prefetchSubject.next(null);
  }

  setlandList(data: Data) {
    this.landListSubject.next(data);
  }

  clearlandList() {
    this.landListSubject.next([]);
  }

  setFormDara(data: Data) {
    this.formSubject.next(data);
  }

  clearFormDara() {
    this.formSubject.next([]);
  }

  // get time for every 30 minutes chnages for today attendance
  getSlotTime(date: Date = new Date()): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // Generate slots from 08:00 to 23:30
    const slots: { hour: number, minute: number }[] = [];
    for (let h = 8; h <= 23; h++) {
      slots.push({ hour: h, minute: 0 });
      slots.push({ hour: h, minute: 30 });
    }
    // Add 23:30 explicitly for night slot
    slots.push({ hour: 23, minute: 30 });

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const slotMinutes = slot.hour * 60 + slot.minute;
      const nextSlotMinutes = (i + 1 < slots.length)
        ? (slots[i + 1].hour * 60 + slots[i + 1].minute)
        : (8 * 60); // 08:00 next day

      if (slotMinutes <= currentMinutes && currentMinutes < nextSlotMinutes) {
        const slotDate = new Date();
        slotDate.setHours(slot.hour, slot.minute, 0, 0);
        return this.datePipe.transform(slotDate, 'hh:mm a') || '';
      }
    }

    // If between 23:30 and 08:00
    const lastSlotDate = new Date();
    lastSlotDate.setHours(23, 30, 0, 0);
    return this.datePipe.transform(lastSlotDate, 'hh:mm a') || '';
  }

  getDurationColor(duration: string): string {
    if (!duration) {
      return '';
    }

    const [hoursStr, minutesStr] = duration.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    const totalHours = hours + minutes / 60;
    if (totalHours < 7.5) {
      return 'text-danger'
    } else if (totalHours >= 7.5) {
      return 'text-success';
    } else {
      return ''
    }
  }

  getRemarksColor(remarks: string): string {
    if (!remarks) return '';
    switch (remarks) {
      case 'Absent':
        return 'text-danger';
      case 'Present':
        return 'text-success';
      case 'In Only':
        return 'text-info';
      case 'A':
        return 'text-danger';
      case 'P':
        return 'text-success';
      case 'I':
        return 'text-info';
      default:
        return '';
    }
  }

  getRowTextColor(value: number): any {
    let color = '#28a745'; //green
    if (value >= 50) {
      color = '#dc3545'; //red
    } else if (value >= 30) {
      color = '#ffc107'; // yellow
    }
    return { color, fontWeight: 'bold' };
  }
  navigateToAebasAttendanceDetails(data: any) {
    if (!data) return;
    // normalize payload
    let payload: any = {};
    if (typeof data === 'object') {
      payload.attendance_id = data.attandance_id ?? data.attendance_id ?? null;
      payload.emp_id = data.emp_id ?? data.empId ?? null;
    }
    // nothing to send
    if (!payload.attendance_id && !payload.emp_id) return;
    const encrypted = this.es.encrypt(payload);
    this.router.navigate(['general/aebas-attendancedetails-by-empid'], { queryParams: { q: encrypted } });
  }


  // Dynamic method to get current year-month in { year_code: year, month_code: month }  format
  getCurrentYearMonth(): any {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return { year_code: year, month_code: month };
  }



}
