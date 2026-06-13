import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {

  private stateSubject: any = new BehaviorSubject<object | null>(null);
  state$ = this.stateSubject.asObservable();
   public isOpenedFromApi = false;

  updateState(newState: any) {
    const hasNonEmptyKey = Object.keys(newState).some(key => newState[key] !== undefined && newState[key] !== null && newState[key] !== '');
    if (hasNonEmptyKey) {
      this.stateSubject.next(newState);
    }
  }

  resetState() {
    this.stateSubject.next(null);
  }
}
