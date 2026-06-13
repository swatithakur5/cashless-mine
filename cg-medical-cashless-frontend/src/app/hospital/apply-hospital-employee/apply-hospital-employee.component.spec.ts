import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyHospitalEmployeeComponent } from './apply-hospital-employee.component';

describe('ApplyHospitalEmployeeComponent', () => {
  let component: ApplyHospitalEmployeeComponent;
  let fixture: ComponentFixture<ApplyHospitalEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyHospitalEmployeeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApplyHospitalEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
