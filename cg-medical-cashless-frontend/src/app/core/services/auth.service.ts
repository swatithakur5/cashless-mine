import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  setToken(token:string){
    localStorage.setItem('token',token);
  }

  getToken(){
    return localStorage.getItem('token');
  }

  logout(){
    localStorage.clear();
  }

  isLoggedIn(){
    return !!localStorage.getItem('token');
  }

}