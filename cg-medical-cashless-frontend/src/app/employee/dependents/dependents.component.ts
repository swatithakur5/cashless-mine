import { Component } from '@angular/core';

@Component({
  selector: 'app-dependents',
  standalone: true,
  imports: [],
  templateUrl: './dependents.component.html',
  styleUrl: './dependents.component.scss'
})
export class DependentsComponent {
dependents = [

  {
    name:'Ram Sharma',
    relation:'Father',
    dob:'10-05-1960'
  },

  {
    name:'Sita Sharma',
    relation:'Mother',
    dob:'15-08-1965'
  }

];
}
