import { Injectable } from '@angular/core';

@Injectable({
  providedIn:'root'
})
export class RoleService {

  setRole(role:string){

    localStorage.setItem(
      'currentRole',
      role
    );

  }

  getRole(){

    return localStorage.getItem(
      'currentRole'
    );

  }

}