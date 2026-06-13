import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntimationsComponent } from './intimations.component';

describe('IntimationsComponent', () => {
  let component: IntimationsComponent;
  let fixture: ComponentFixture<IntimationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntimationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IntimationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
