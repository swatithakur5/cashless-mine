import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { CookieService } from 'ngx-cookie-service';
import {
  environment,
  moduleMapping
} from "../../environment/environment";
import { Observable, take } from "rxjs";
import { HttpService } from "./http.service";
import { Router } from '@angular/router';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookie: CookieService, private http: HttpService, private router: Router, private es: EncryptionService) {
  }

  logout() {
    this.http.getData('/security/logout', 'admin').subscribe(() => {
      this.cookie.deleteAll('/');
      // localStorage.clear();
      window.open(moduleMapping.adminModule, '_self');
    })
  }

  isLoggedIn(): boolean {
    const cookie = this.cookie.get('session')
    // return !!cookie;
    return cookie !== undefined && cookie !== null && cookie.trim() !== '';
  }

  decryptCookie(cookie: string) {
    try {
      const bytes = CryptoJS.AES.decrypt(cookie, environment.cookie_secret_key);
      if (bytes.toString()) return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      console.error(e);
    }
  }

  get currentUser() {
    const user_cookie = this.cookie.get('user')
    const cookie = this.cookie.get('session')
    if (user_cookie && cookie) {
      return this.decryptCookie(user_cookie);
    } else {
      // this.logout();
    }
  }

  resetPassword(credentials: any): Observable<any> {
    return this.http.postData('/security/login/changePassword', credentials, 'admin')
  }

  refreshCookie(): void {
    this.http.getData('/security/refreshSession', 'admin').pipe(take(1)).subscribe()
  }

  redirect() {
    // this.cookie.delete('designation_id')
    // let designation_arr = this.currentUser.designation_arr
    // this.setDesignationID(this.currentUser.designation_arr[0]);
    // console.log("this.router.url.includes('user') ", this.router.url.includes('user'));    
    if (this.router.url.includes('user')) {
      this.setModuleID(20);
      this.router.navigate(['/common']).then();
    } else {

    }
  }

  setDesignationID(designation_id: any) {
    this.cookie.set('designation_id', this.es.encrypt(designation_id), { path: '/' })
    if (designation_id) this.cookie.set('is_extra', String(false), { path: '/' });
    else this.cookie.set('is_extra', String(true), { path: '/' });
  }
  setCurrentDesignationID(current_designation_id: any) {
    this.cookie.set('current_designation_id', this.es.encrypt(current_designation_id), { path: '/' })
    if (current_designation_id) this.cookie.set('is_extra', String(false), { path: '/' });
    else this.cookie.set('is_extra', String(true), { path: '/' });
  }
  getDesignationID() {
    return this.es.decrypt(this.cookie.get('designation_id')) || undefined
  }
  getCurrentDesignationID() {
    return this.es.decrypt(this.cookie.get('current_designation_id')) || undefined
  }
  setModuleID(module_id: any) {
    this.cookie.set('module_id', this.es.encrypt(module_id), { path: '/' })
  }
  getModuleID(is_decrypt = true) {
    if (is_decrypt) {
      return this.es.decrypt(this.cookie.get('module_id')) || undefined
    } else {
      return this.cookie.get('module_id') || undefined
    }
  }
}
