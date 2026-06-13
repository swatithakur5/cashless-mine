import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private es: EncryptionService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  removeItem(key: string) {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }
   setEmpId(emp_id: any) {
    localStorage.setItem('emp_id', this.es.encrypt(emp_id));
    // this.cookie.set('module_id', this.es.encrypt(module_id), {path: '/'})
  }
}
