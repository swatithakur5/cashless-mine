
import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-apply-hospital-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatTooltipModule,

    NgSelectModule
  ],
  templateUrl: './apply-hospital-employee.component.html',
  styleUrl: './apply-hospital-employee.component.scss'
})
export class ApplyHospitalEmployeeComponent {
 constructor(private fb: FormBuilder) {}
}
