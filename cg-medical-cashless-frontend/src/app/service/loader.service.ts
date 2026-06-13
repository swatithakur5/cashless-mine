import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // isLoading = new Subject<boolean>();
  // dotLoading = new Subject<boolean>();
  isLoading = new BehaviorSubject<boolean>(false);
  dotLoading = new BehaviorSubject<boolean>(false);
  constructor() { }

  show() {
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
  }

  showLoader() {
    this.dotLoading.next(true);
  }

  hideLoader() {
    this.dotLoading.next(false);
  }
}
