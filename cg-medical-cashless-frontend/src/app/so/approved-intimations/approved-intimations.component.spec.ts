import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedIntimationsComponent } from './approved-intimations.component';

describe('ApprovedIntimationsComponent', () => {
  let component: ApprovedIntimationsComponent;
  let fixture: ComponentFixture<ApprovedIntimationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedIntimationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovedIntimationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
