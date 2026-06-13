import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingIntimationsComponent } from './pending-intimations.component';

describe('PendingIntimationsComponent', () => {
  let component: PendingIntimationsComponent;
  let fixture: ComponentFixture<PendingIntimationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingIntimationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingIntimationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
